# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import UserError
import logging
from datetime import timedelta

_logger = logging.getLogger(__name__)

class SaleOrder(models.Model):
    _inherit = 'sale.order'

    # --- _find_jtbd_template_project method remains the same ---
    def _find_jtbd_template_project(self):
        """ Find the project.project marked as a JTBD template. """
        self.ensure_one()
        opportunity = self.opportunity_id
        if not opportunity or not hasattr(opportunity, 'jtbd_job_category') or not opportunity.jtbd_job_category:
            return self.env['project.project']

        job_category = opportunity.jtbd_job_category
        try:
            job_category_display = dict(self.env['crm.lead']._fields['jtbd_job_category'].selection).get(job_category)
        except Exception: job_category_display = None
        if not job_category_display: return self.env['project.project']

        template_name_pattern = f"JTBD: {job_category_display}"
        _logger.debug(f"SO {self.name}: Searching for template project named like '{template_name_pattern}' AND jtbd_is_template=True")

        project_template = self.env['project.project'].search([
            ('name', '=ilike', template_name_pattern),
            ('jtbd_is_template', '=', True),
            ('allow_billable', '=', True),
            '|', ('company_id', '=', False), ('company_id', '=', self.company_id.id)
        ], limit=1, order='id desc')

        _logger.debug(f"SO {self.name}: Search returned: {project_template.name if project_template else 'None'}")
        return project_template

    # --- _copy_project_template_data method remains the same (with logging) ---
    def _copy_project_template_data(self, template_project, new_project):
        """ Manually copies stages and tasks from template to new project. """
        if not template_project or not new_project:
            _logger.warning(f"COPY TEMPLATE: Skipping copy - Template Project or New Project is missing.")
            return False
        _logger.info(f"COPY TEMPLATE: Starting copy from '{template_project.name}' (ID:{template_project.id}) to '{new_project.name}' (ID:{new_project.id})")

        # --- Clear Existing Stages/Tasks FIRST ---
        try:
            _logger.debug(f"COPY TEMPLATE: Clearing existing tasks/stages from project {new_project.id} before copy.")
            new_project.task_ids.sudo().unlink()
            # Search for stages linked ONLY to this project before detaching, be careful in multi-project stages
            stages_to_detach = self.env['project.task.type'].search([('project_ids', '=', new_project.id)])
            stages_to_detach.sudo().write({'project_ids': [(3, new_project.id)]})
            _logger.debug(f"COPY TEMPLATE: Cleared tasks and detached {len(stages_to_detach)} stages.")
        except Exception as clear_e:
            _logger.error(f"COPY TEMPLATE: Failed to clear existing tasks/stages from project {new_project.id}: {clear_e}", exc_info=True)
            # Proceed with copy attempt anyway? Or return False? Let's proceed.
            # return False

        # --- Copy Stages ---
        stage_mapping = {}
        try:
            template_stages = template_project.type_ids.sorted('sequence')
            _logger.debug(f"COPY TEMPLATE: Found {len(template_stages)} stages in template project.")
            if not template_stages: _logger.warning(f"COPY TEMPLATE: Template project {template_project.id} has no stages defined.")

            for stage in template_stages:
                _logger.debug(f"COPY TEMPLATE: Attempting to copy stage '{stage.name}' (ID: {stage.id})")
                stage_copy_vals = {'project_ids': [(6, 0, [new_project.id])]}
                new_stage = stage.copy(default=stage_copy_vals)
                stage_mapping[stage.id] = new_stage.id
                _logger.debug(f"COPY TEMPLATE: Copied stage '{stage.name}' to New Stage ID: {new_stage.id}")
        except Exception as e:
             _logger.error(f"COPY TEMPLATE: Error during STAGE copy for project {new_project.id}: {e}", exc_info=True)
             return False

        # --- Copy Tasks ---
        try:
            tasks_to_copy = self.env['project.task'].search([('project_id', '=', template_project.id)])
            _logger.debug(f"COPY TEMPLATE: Found {len(tasks_to_copy)} tasks in template project {template_project.id}.")
            if not tasks_to_copy:
                 _logger.info(f"COPY TEMPLATE: Template project {template_project.id} has no tasks to copy.")
                 return True # Stage copy succeeded

            task_mapping = {}
            for task in tasks_to_copy.sorted('sequence'):
                new_stage_id = stage_mapping.get(task.stage_id.id, False)
                task_vals = {
                    'project_id': new_project.id,
                    'stage_id': new_stage_id,
                    'user_ids': [(5, 0, 0)],
                    'partner_id': new_project.partner_id.id,
                    'sale_line_id': new_project.sale_line_id.id if new_project.sale_line_id else False,
                    'sale_order_id': new_project.sale_order_id.id if new_project.sale_order_id else False,
                    'parent_id': False, # Simple copy, no parent linking for now
                    'depend_on_ids': [(5, 0, 0)], # Clear dependencies initially
                    'name': f"{task.name}",
                    'description': task.description,
                    'sequence': task.sequence,
                    'priority': task.priority if hasattr(task, 'priority') else False,
                    'tag_ids': [(6, 0, task.tag_ids.ids)] if hasattr(task, 'tag_ids') else False,
                }
                task_vals = {k: v for k, v in task_vals.items() if v is not False}

                try:
                    new_task = self.env['project.task'].create(task_vals)
                    task_mapping[task.id] = new_task.id
                except Exception as task_create_e:
                    _logger.error(f"COPY TEMPLATE: Error creating copied task '{task.name}' for project {new_project.id}: {task_create_e}", exc_info=True)

            # --- Post-Process Dependencies ---
            _logger.debug(f"COPY TEMPLATE: Starting dependency post-processing for project {new_project.id}")
            for old_task_id, new_task_id in task_mapping.items():
               old_task = self.env['project.task'].browse(old_task_id).exists()
               if old_task and hasattr(old_task, 'depend_on_ids') and old_task.depend_on_ids:
                   new_dependency_ids = [task_mapping.get(dep.id) for dep in old_task.depend_on_ids if task_mapping.get(dep.id)]
                   if new_dependency_ids:
                        try:
                            self.env['project.task'].browse(new_task_id).write({'depend_on_ids': [(6, 0, new_dependency_ids)]})
                        except Exception as dep_e:
                            _logger.error(f"COPY TEMPLATE: Error setting dependencies for new task {new_task_id}: {dep_e}", exc_info=True)
        except Exception as e:
             _logger.error(f"COPY TEMPLATE: Error during TASK copy for project {new_project.id}: {e}", exc_info=True)
             return False

        _logger.info(f"COPY TEMPLATE: Successfully finished copying template data for project {new_project.id}")
        return True

    # --- Override action_confirm (Final FINAL Approach) ---
    def action_confirm(self):
        _logger.info(f"SO {self.ids}: Entering JTBD action_confirm OVERRIDE v5 (Post-Super Manual Copy Conditional).")
        if not self: return True

        # --- Call Super First ---
        _logger.debug(f"SO {self.ids}: Calling super().action_confirm()...")
        # Use self.env context to avoid potential issues with `self` context across calls
        result = super(SaleOrder, self.with_context(self.env.context)).action_confirm()
        _logger.debug(f"SO {self.ids}: Finished super().action_confirm(). Result: {result}")

        # --- Post-processing: Correct project template if needed ---
        try:
            # Use sudo() for broader access during post-processing if necessary, but apply carefully
            # env_sudo = self.env(sudo=True) # Use if permission issues arise accessing projects/tasks
            for order in self.filtered(lambda so: so.state == 'sale'):
                _logger.info(f"SO {order.name}: Post-confirmation JTBD/Fallback processing v5.")

                # Find the intended JTBD template project for this order
                intended_jtbd_template_project = order._find_jtbd_template_project()

                # Process lines that should have created a project
                lines_with_project_link = order.order_line.filtered(
                    lambda sol: sol.product_id.service_tracking == 'project_only' and sol.project_id
                )

                if not lines_with_project_link:
                    _logger.debug(f"SO {order.name}: No 'project_only' lines with linked projects found after confirm.")
                    continue

                projects_processed = set() # Track processed projects

                for line in lines_with_project_link:
                    project = line.project_id
                    if project.id in projects_processed: continue

                    _logger.debug(f"SO {order.name}, Line {line.id}: Evaluating project {project.id} ('{project.name}')")

                    template_to_apply = False
                    template_source = "None"

                    if intended_jtbd_template_project:
                        # CASE 1: JTBD template should be used
                        template_to_apply = intended_jtbd_template_project
                        template_source = "JTBD"
                    elif line.product_id.project_template_id:
                        # CASE 2: No JTBD template, fallback to Product template
                        product_template = line.product_id.project_template_id.exists()
                        if product_template and product_template.allow_billable:
                            template_to_apply = product_template
                            template_source = "Product"
                        else:
                            _logger.warning(f"SO {order.name}, Line {line.id}: Product template '{product_template.name if product_template else 'ID '+str(line.product_id.project_template_id.id)}' not found or not billable.")

                    # Check if the currently linked project already matches the intended template
                    # (This is tricky - maybe check name suffix or a copied tag?)
                    # For simplicity, let's assume we *always* apply our chosen template if one is found
                    # This overwrites whatever `super()` did.

                    if template_to_apply:
                         _logger.info(f"SO {order.name}: Applying {template_source} template '{template_to_apply.name}' to project {project.id}.")
                         # Update project name FIRST
                         try:
                            base_name = f"{order.name} - {line.product_id.name}"
                            project.name = f"{base_name} ({template_to_apply.name})"
                         except Exception as name_e:
                             _logger.error(f"Error setting name for project {project.id}: {name_e}")

                         # Perform manual copy (clears existing tasks/stages inside)
                         copy_success = order._copy_project_template_data(template_to_apply, project)
                         if not copy_success:
                             _logger.error(f"SO {order.name}: Manual template copy FAILED for project {project.id}.")
                         else:
                             _logger.info(f"SO {order.name}: Manual template copy SUCCEEDED for project {project.id}.")
                    else:
                         # CASE 3: No template should be applied
                         _logger.info(f"SO {order.name}: No applicable template (JTBD or Product) for project {project.id}. Leaving as is.")
                         # Ensure name is simple if no template was used
                         base_name = f"{order.name} - {line.product_id.name}"
                         if f" ({_('No Template Specified')})" not in project.name: # Avoid redundant updates
                             try: project.name = base_name
                             except Exception as name_e: _logger.error(f"Error setting default name for project {project.id}: {name_e}")


                    projects_processed.add(project.id)

        except Exception as e:
             _logger.error(f"SO {self.ids}: Error during JTBD post-confirmation processing: {e}", exc_info=True)
             pass

        return result

# Keep SaleOrderLine inheritance
class SaleOrderLine(models.Model):
    _inherit = 'sale.order.line'

    # --- REMOVE jtbd_intended_template_id compute field ---
    # We now calculate it directly in the SO action_confirm override

    # --- REMOVE _prepare_project_values override ---

    pass # No other changes needed here