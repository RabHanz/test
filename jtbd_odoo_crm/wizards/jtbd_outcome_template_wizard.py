# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import UserError
from datetime import timedelta
import logging

_logger = logging.getLogger(__name__)

class JtbdOutcomeTemplateWizard(models.TransientModel):
    _name = 'jtbd.outcome.template.wizard'
    _description = 'JTBD Outcome Template Selection Wizard'

    mapping_id = fields.Many2one(
        'jtbd.outcome.mapping', string='Outcome Mapping', required=True, readonly=True
    )
    # Store job category from mapping for domain filtering
    mapping_job_category_id = fields.Many2one(
        'jtbd.job.category', string='Job Category (from Mapping)',
        related='mapping_id.job_category_id', # Related to new M2O field
        readonly=True,
        store=False, # No need to store
    )
    template_id = fields.Many2one(
        'jtbd.outcome.pattern', string='Template', required=True,
        # Update domain to use ID
        domain="[('job_category_id', '=', mapping_job_category_id), ('active', '=', True)]",
    )

    def action_apply_template(self):
        """Apply the selected template to the outcome mapping."""
        self.ensure_one()
        template = self.template_id
        mapping = self.mapping_id

        if not template or not mapping:
            raise UserError(_("Template or Outcome Mapping not found."))

        vals_to_write = {}
        new_additional_outcomes = []
        new_milestones = []

        # Update primary outcome fields if template has values
        if template.primary_metric:
            vals_to_write['outcome_metric'] = template.primary_metric
        if template.metric_unit_template:
             vals_to_write['metric_unit'] = template.metric_unit_template
        # Only set boolean if explicitly defined, otherwise leave as is
        if template.is_percentage_template is not None:
            vals_to_write['is_percentage'] = template.is_percentage_template

        # Add additional metrics if they exist and aren't already present (simple name check)
        existing_metrics = mapping.additional_outcome_ids.mapped('metric')
        if template.additional_metrics:
            try:
                # Split by newline, strip whitespace, filter empty lines
                metrics = [m.strip() for m in template.additional_metrics.splitlines() if m.strip()]
                for i, metric_name in enumerate(metrics):
                     if metric_name not in existing_metrics:
                        # Set priority to Medium ('2') and append sequence
                        new_additional_outcomes.append((0, 0, {
                            'name': f"{metric_name} (Template)", # Indicate source
                            'metric': metric_name,
                            'priority': '2', # Use '2' for Medium
                            'sequence': (len(mapping.additional_outcome_ids) + i + 1) * 10 # Append sequence
                        }))
            except Exception as e:
                _logger.error("Error parsing or creating additional metrics from template %s: %s", template.id, str(e))

        # Add milestones if they exist and aren't already present (simple name check)
        existing_milestones = mapping.milestone_ids.mapped('name')
        # Use filter + list comprehension for cleaner check
        milestones_to_add = [
            name for name in [template.typical_milestone_1, template.typical_milestone_2, template.typical_milestone_3]
            if isinstance(name, str) and name.strip() and name.strip() not in existing_milestones
        ]

        today = fields.Date.context_today(self)
        for i, milestone_name in enumerate(milestones_to_add):
             # Calculate target date (30/60/90 days from today as example)
             target_date = today + timedelta(days=(i + 1) * 30)
             new_milestones.append((0, 0, {
                 'name': milestone_name,
                 'target_date': target_date,
                 'sequence': (len(mapping.milestone_ids) + i + 1) * 10 # Append sequence
             }))

        # Add white space suggestions if field is empty or template has content
        if template.white_space_suggestions and not mapping.white_space:
            vals_to_write['white_space'] = template.white_space_suggestions

        # Prepare update dictionary for mapping.write()
        if new_additional_outcomes:
             vals_to_write['additional_outcome_ids'] = new_additional_outcomes
        if new_milestones:
             vals_to_write['milestone_ids'] = new_milestones

        # Perform the write operation if there are changes
        if vals_to_write:
            try:
                mapping.write(vals_to_write)
            except Exception as e:
                 _logger.error("Error applying outcome template %s to mapping %s: %s", template.id, mapping.id, str(e))
                 raise UserError(_("Failed to apply template: %s") % str(e))

        # No explicit return needed to close wizard, unless reload is desired
        return {'type': 'ir.actions.act_window_close'}