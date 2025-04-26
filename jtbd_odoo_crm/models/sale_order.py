# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import UserError
from odoo.tools import format_date # For formatting dates in task names
import logging
from datetime import timedelta # Used in _copy_project_template_data -> milestones (if added later)

_logger = logging.getLogger(__name__)

class SaleOrder(models.Model):
    _inherit = 'sale.order'

    def _find_jtbd_template_project(self):
        """
        Searches for an active, billable project.project marked as a JTBD template
        (via jtbd_is_template=True and specific naming convention) that matches
        the linked Opportunity's jtbd_job_category.

        Returns:
            recordset: A project.project recordset (empty if no match found).
        """
        self.ensure_one()
        opportunity = self.opportunity_id
        if not opportunity or not hasattr(opportunity, 'jtbd_job_category') or not opportunity.jtbd_job_category:
            _logger.info(f"SO {self.name}: No linked opportunity or JTBD category found for template search.")
            return self.env['project.project'] # Return empty recordset

        job_category = opportunity.jtbd_job_category
        try:
            # Fetch the display name for the category key to match project name
            job_category_display = dict(self.env['crm.lead']._fields['jtbd_job_category'].selection).get(job_category)
        except Exception as e:
             _logger.error(f"SO {self.name}: Error getting display name for job category key '{job_category}': {e}")
             return self.env['project.project']

        if not job_category_display:
             _logger.warning(f"SO {self.name}: Could not find display name for job category key: {job_category}. Cannot search for JTBD template.")
             return self.env['project.project']

        # Define the naming convention for JTBD template projects
        template_name_pattern = f"JTBD: {job_category_display}"
        _logger.info(f"SO {self.name}: Searching for JTBD template project named like '{template_name_pattern}'.")

        # Search project.project model
        project_template = self.env['project.project'].search([
            ('name', '=ilike', template_name_pattern),  # Case-insensitive search by name
            ('jtbd_is_template', '=', True),           # Must be flagged as a JTBD template
            ('allow_billable', '=', True),             # Template must be billable (Odoo requirement)
            '|', ('company_id', '=', False), ('company_id', '=', self.company_id.id) # Company check
        ], limit=1, order='id desc') # Get the latest matching one if multiple exist

        if project_template:
            _logger.info(f"SO {self.name}: Found JTBD template project '{project_template.name}' (ID: {project_template.id}).")
        else:
            _logger.info(f"SO {self.name}: No matching JTBD template project found.")
        return project_template

    def _copy_project_template_data(self, template_project, new_project):
        """
        Manually copies stages (project.task.type) and tasks (project.task)
        from a template project to a newly created project.
        Handles basic stage/task fields and attempts to map stages.

        Args:
            template_project (recordset): The project.project record to copy from.
            new_project (recordset): The newly created project.project record to copy into.

        Returns:
            bool: True if copy succeeded (or no copy needed), False if a critical error occurred.
        """
        self.ensure_one() # Ensure this method is called on a single SO record contextually
        if not template_project or not new_project:
            _logger.warning(f"COPY TEMPLATE: Skipping copy for new project {new_project.id if new_project else 'N/A'} - Template Project or New Project is missing.")
            return False
        _logger.info(f"COPY TEMPLATE: Starting manual copy from '{template_project.name}' (ID:{template_project.id}) to '{new_project.name}' (ID:{new_project.id})")

        # --- Clear Existing Stages/Tasks from the new project FIRST ---
        # This prevents conflicts if super() created default items or used a product template
        try:
            _logger.debug(f"COPY TEMPLATE: Clearing existing tasks & stages from project {new_project.id} before copy.")
            # Use sudo() for unlink/write if standard user might lack permissions on project/task/type
            # This might be necessary if the SO confirmation runs as a specific user
            # Be cautious with sudo() and ensure it's truly required.
            new_project.task_ids.sudo().unlink()
            stages_to_detach = self.env['project.task.type'].search([('project_ids', '=', new_project.id)])
            if stages_to_detach:
                 stages_to_detach.sudo().write({'project_ids': [(3, new_project.id)]}) # Detach stages from project
            _logger.debug(f"COPY TEMPLATE: Cleared tasks and detached {len(stages_to_detach)} stages from project {new_project.id}.")
        except Exception as clear_e:
            _logger.error(f"COPY TEMPLATE: Failed to clear existing tasks/stages from project {new_project.id} before copy: {clear_e}", exc_info=True)
            # Depending on requirements, might want to return False or raise UserError here
            # For now, we proceed, but the project might contain old+new stages if clearing fails.

        # --- Copy Stages ---
        stage_mapping = {} # Store mapping: {old_stage_id: new_stage_id}
        try:
            template_stages = template_project.type_ids.sorted('sequence')
            _logger.debug(f"COPY TEMPLATE: Found {len(template_stages)} stages in template project {template_project.id}.")
            if not template_stages: _logger.warning(f"COPY TEMPLATE: Template project {template_project.id} has no stages defined.")

            for stage in template_stages:
                _logger.debug(f"COPY TEMPLATE: Copying stage '{stage.name}' (ID: {stage.id})")
                # Prepare values for the new stage, linking *only* to the new project
                stage_copy_vals = {'project_ids': [(6, 0, [new_project.id])]}
                new_stage = stage.copy(default=stage_copy_vals)
                stage_mapping[stage.id] = new_stage.id
                _logger.debug(f"COPY TEMPLATE: Copied to New Stage ID: {new_stage.id}")
        except Exception as e:
             _logger.error(f"COPY TEMPLATE: Error during STAGE copy for project {new_project.id}: {e}", exc_info=True)
             return False # Abort copy on stage error

        # --- Copy Tasks ---
        try:
            # Ensure we only search for tasks directly within the template project
            tasks_to_copy = self.env['project.task'].search([('project_id', '=', template_project.id)])
            _logger.debug(f"COPY TEMPLATE: Found {len(tasks_to_copy)} tasks in template project {template_project.id}.")
            if not tasks_to_copy:
                 _logger.info(f"COPY TEMPLATE: Template project {template_project.id} has no tasks to copy.")
                 return True # Stage copy might have succeeded, no tasks needed

            task_mapping = {} # Store mapping: {old_task_id: new_task_id} for dependency linking
            for task in tasks_to_copy.sorted('sequence'):
                _logger.debug(f"COPY TEMPLATE: Preparing to copy task '{task.name}' (ID: {task.id})")
                # Map to the corresponding new stage ID
                new_stage_id = stage_mapping.get(task.stage_id.id, False)
                if not new_stage_id and task.stage_id:
                    _logger.warning(f"COPY TEMPLATE: Could not map old stage ID {task.stage_id.id} for task '{task.name}'. Task will use project's default stage.")

                # Prepare values for the new task
                task_vals = {
                    'project_id': new_project.id,
                    'stage_id': new_stage_id,
                    'user_ids': [(5, 0, 0)], # Clear assignees, let project manager assign
                    'partner_id': new_project.partner_id.id, # Link to project customer
                    'sale_line_id': new_project.sale_line_id.id if new_project.sale_line_id else False,
                    'sale_order_id': new_project.sale_order_id.id if new_project.sale_order_id else False,
                    'parent_id': False, # Avoid copying parent link directly; handle hierarchy separately if needed
                    'depend_on_ids': [(5, 0, 0)], # Clear dependencies initially; recreate later
                    'name': task.name, # Copy name
                    'description': task.description, # Copy description
                    'sequence': task.sequence,
                    'priority': task.priority if hasattr(task, 'priority') else False, # Copy priority if exists
                    'tag_ids': [(6, 0, task.tag_ids.ids)] if hasattr(task, 'tag_ids') else False, # Copy tags if exist
                    # Add other fields to copy as needed, check for existence with hasattr()
                }
                # Remove keys with False values to prevent issues during create
                task_vals_clean = {k: v for k, v in task_vals.items() if v is not False}

                try:
                    new_task = self.env['project.task'].create(task_vals_clean)
                    task_mapping[task.id] = new_task.id
                    _logger.debug(f"COPY TEMPLATE: Copied task '{task.name}' (ID: {task.id}) to New Task ID: {new_task.id}")
                except Exception as task_create_e:
                    _logger.error(f"COPY TEMPLATE: Error creating copied task '{task.name}' for project {new_project.id}: {task_create_e}", exc_info=True)
                    # Decide if failure to copy one task should halt the process
                    # continue # Or raise UserError?

            # --- Post-Process Dependencies (Optional but recommended if templates use them) ---
            _logger.debug(f"COPY TEMPLATE: Starting dependency post-processing for project {new_project.id}")
            for old_task_id, new_task_id in task_mapping.items():
               old_task = self.env['project.task'].browse(old_task_id).exists()
               # Check existence and attribute before accessing
               if old_task and hasattr(old_task, 'depend_on_ids') and old_task.depend_on_ids:
                   # Find IDs of new tasks corresponding to old dependencies
                   new_dependency_ids = [task_mapping.get(dep.id) for dep in old_task.depend_on_ids if task_mapping.get(dep.id)]
                   if new_dependency_ids:
                        try:
                            # Use write with the mapped new dependency IDs
                            self.env['project.task'].browse(new_task_id).write({'depend_on_ids': [(6, 0, new_dependency_ids)]})
                            _logger.debug(f"COPY TEMPLATE: Set dependencies for new task {new_task_id}: {new_dependency_ids}")
                        except Exception as dep_e:
                            _logger.error(f"COPY TEMPLATE: Error setting dependencies for new task {new_task_id}: {dep_e}", exc_info=True)

        except Exception as e:
             _logger.error(f"COPY TEMPLATE: Error during TASK copy or dependency processing for project {new_project.id}: {e}", exc_info=True)
             return False # Indicate task copy phase failed

        _logger.info(f"COPY TEMPLATE: Successfully finished copying stages and tasks for project {new_project.id}")
        return True # Indicate overall copy succeeded

    # --- Override action_confirm (Post-Super Manual Copy Conditional) ---
    def action_confirm(self):
        _logger.info(f"SO {self.ids}: Entering JTBD action_confirm OVERRIDE v6 (Milestone Task Creation).")
        if not self: return True

        # --- Call Super First ---
        _logger.debug(f"SO {self.ids}: Calling super().action_confirm()...")
        result = super(SaleOrder, self).action_confirm()
        _logger.debug(f"SO {self.ids}: Finished super().action_confirm(). Result: {result}")

        # --- Post-processing: Correct project template AND Create Milestone Tasks ---
        try:
            # Use sudo() for broader access during post-processing if necessary
            # env_sudo = self.env(sudo=True)
            ProjectTask = self.env['project.task'] # Define once

            for order in self.filtered(lambda so: so.state == 'sale'):
                _logger.info(f"SO {order.name}: Post-confirmation JTBD/Fallback/Milestone processing v6.")

                intended_jtbd_template_project = order._find_jtbd_template_project()
                lines_with_project_link = order.order_line.filtered(
                    lambda sol: sol.product_id.service_tracking == 'project_only' and sol.project_id
                )

                if not lines_with_project_link:
                    _logger.debug(f"SO {order.name}: No 'project_only' lines with linked projects found.")
                    continue

                # Find related Outcome Map (assuming one primary map per SO for now)
                outcome_map = self.env['jtbd.outcome.mapping'].search([('lead_id', '=', order.opportunity_id.id)], limit=1, order='create_date desc')
                milestones_to_create_tasks_for = outcome_map.milestone_ids if outcome_map else False

                if outcome_map:
                    _logger.debug(f"SO {order.name}: Found Outcome Map {outcome_map.id} with {len(milestones_to_create_tasks_for)} milestones.")
                else:
                    _logger.debug(f"SO {order.name}: No related Outcome Map found.")


                projects_processed = set()
                for line in lines_with_project_link:
                    project = line.project_id
                    if project.id in projects_processed: continue

                    _logger.debug(f"SO {order.name}, Line {line.id}: Evaluating project {project.id} ('{project.name}') for template and milestone tasks.")

                    template_to_apply = False
                    template_source = "None"

                    # --- Template Application Logic (Same as before) ---
                    if intended_jtbd_template_project:
                        template_to_apply = intended_jtbd_template_project
                        template_source = "JTBD"
                    elif line.product_id.project_template_id:
                        product_template = line.product_id.project_template_id.exists()
                        if product_template and product_template.allow_billable:
                            template_to_apply = product_template
                            template_source = "Product"

                    if template_to_apply:
                        _logger.info(f"SO {order.name}: Applying {template_source} template '{template_to_apply.name}' to project {project.id}.")
                        try:
                            base_name = f"{order.name} - {line.product_id.name}"
                            project.name = f"{base_name} ({template_to_apply.name})"
                        except Exception as name_e: _logger.error(f"Error setting name for project {project.id}: {name_e}")
                        copy_success = order._copy_project_template_data(template_to_apply, project)
                        if not copy_success: _logger.error(f"SO {order.name}: Manual template copy FAILED for project {project.id}.")
                        else: _logger.info(f"SO {order.name}: Manual template copy SUCCEEDED for project {project.id}.")
                    else:
                        _logger.info(f"SO {order.name}: No applicable template for project {project.id}. Leaving as created by super().")
                        base_name = f"{order.name} - {line.product_id.name}"
                        try:
                            if project.name != base_name: project.name = base_name # Set basic name if needed
                        except Exception as name_e: _logger.error(f"Error setting default name for project {project.id}: {name_e}")
                    # --- End Template Application Logic ---


                    # --- NEW: Create tasks from milestones ---
                    if milestones_to_create_tasks_for:
                        _logger.info(f"SO {order.name}: Creating tasks in Project {project.id} from Outcome Map {outcome_map.id} milestones.")
                        tasks_created_count = 0
                        for milestone in milestones_to_create_tasks_for.sorted('sequence'):
                            task_name = f"Milestone: {milestone.name}"
                            if milestone.target_date:
                                task_name += f" (Target: {format_date(self.env, milestone.target_date)})"

                            task_vals = {
                                'name': task_name,
                                'project_id': project.id,
                                'partner_id': project.partner_id.id,
                                'sale_line_id': line.id, # Link task to the specific SO line that created project
                                'sale_order_id': order.id,
                                # Set deadline based on milestone target date
                                'date_deadline': milestone.target_date,
                                # Add description linking back to milestone
                                'description': _("This task represents the achievement of Outcome Milestone: '%s'.\nTarget Value (Primary Metric): %s") % (milestone.name, milestone.target_value or '-'),
                                # Assign to project manager or leave unassigned?
                                # 'user_ids': [(6, 0, [project.user_id.id])] if project.user_id else False,
                                'sequence': milestone.sequence, # Use milestone sequence for task order
                            }
                            try:
                                ProjectTask.create(task_vals)
                                tasks_created_count += 1
                            except Exception as task_e:
                                _logger.error(f"SO {order.name}: Failed to create task for milestone '{milestone.name}' in project {project.id}: {task_e}", exc_info=True)
                        _logger.info(f"SO {order.name}: Created {tasks_created_count} tasks from milestones for project {project.id}.")
                    # --- End Create tasks from milestones ---

                    projects_processed.add(project.id) # Mark project as processed

        except Exception as e:
            _logger.error(f"SO {self.ids}: Error during JTBD post-confirmation processing: {e}", exc_info=True)
            pass

        return result

# Keep SaleOrderLine inheritance
class SaleOrderLine(models.Model):
    _inherit = 'sale.order.line'
    # No changes needed
    pass