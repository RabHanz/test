# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import UserError
from datetime import timedelta
import logging

_logger = logging.getLogger(__name__)

class JtbdSuggestedItem(models.TransientModel):
    """ Intermediate model for displaying suggestions in the wizard's one2many field. """
    _name = 'jtbd.suggested.item'
    _description = 'JTBD Suggested Item (Transient)'

    wizard_id = fields.Many2one('jtbd.outcome.suggestion.wizard', string='Wizard', required=True, ondelete='cascade')
    name = fields.Char(string='Item', required=True, readonly=True)
    description = fields.Text(string='Details', readonly=True)
    # Make 'selected' editable by the user
    selected = fields.Boolean(string='Select', default=True) # Default to selected

class JtbdOutcomeSuggestionWizard(models.TransientModel):
    _name = 'jtbd.outcome.suggestion.wizard'
    _description = 'JTBD Outcome Suggestion Wizard'

    mapping_id = fields.Many2one(
        'jtbd.outcome.mapping', string='Outcome Mapping', required=True, readonly=True
    )
    suggestion_type = fields.Selection(
        [('outcomes', 'Additional Outcomes'),
         ('milestones', 'Milestones'),
         ('white_space', 'White Space')],
        string='Suggestion Type', required=True, readonly=True
    )
    # One2many field to hold the suggested items for selection
    suggested_items = fields.One2many(
        'jtbd.suggested.item', 'wizard_id', string='Suggested Items'
    )

    @api.model
    def default_get(self, fields_list):
        """ Fetch defaults and populate suggested_items based on context. """
        defaults = super().default_get(fields_list)
        mapping_id = defaults.get('mapping_id') or self.env.context.get('default_mapping_id')
        suggestion_type = defaults.get('suggestion_type') or self.env.context.get('default_suggestion_type')

        if mapping_id and suggestion_type:
            mapping = self.env['jtbd.outcome.mapping'].browse(mapping_id)
            suggestions = self._get_suggestions(mapping, suggestion_type)
            # Create transient suggested_item records
            defaults['suggested_items'] = [(0, 0, item) for item in suggestions]

        return defaults

    def _get_suggestions(self, mapping, suggestion_type):
        """ Get relevant suggestions based on mapping and type. """
        suggestions = []
        job_category = mapping.job_category
        patterns = self.env['jtbd.outcome.pattern'].search([
            ('job_category', '=', job_category),
            ('active', '=', True)
        ], limit=1) # Find the first matching pattern

        if not patterns:
            _logger.warning(f"No outcome pattern found for job category '{job_category}' to generate suggestions.")
            return suggestions # Return empty if no pattern found

        pattern = patterns[0]

        if suggestion_type == 'outcomes':
            existing_metrics = mapping.additional_outcome_ids.mapped('metric')
            if pattern.additional_metrics:
                metrics = [m.strip() for m in pattern.additional_metrics.splitlines() if m.strip()]
                for metric in metrics:
                    if metric not in existing_metrics:
                        suggestions.append({
                            'name': metric, # Use metric name as the primary item name
                            'description': _("Suggested metric based on '%s' pattern.") % pattern.name,
                        })
        elif suggestion_type == 'milestones':
             existing_milestones = mapping.milestone_ids.mapped('name')
             milestone_templates = [
                 pattern.typical_milestone_1,
                 pattern.typical_milestone_2,
                 pattern.typical_milestone_3
             ]
             for ms_name in milestone_templates:
                 if ms_name and ms_name not in existing_milestones:
                    suggestions.append({
                        'name': ms_name,
                        'description': _("Common milestone for '%s' pattern.") % pattern.name,
                    })
        elif suggestion_type == 'white_space':
             # Suggest white space ideas if field is empty
             if pattern.white_space_suggestions and not mapping.white_space:
                 # Split suggestions, assuming one per line or structured text
                 ideas = [idea.strip() for idea in pattern.white_space_suggestions.splitlines() if idea.strip()]
                 for idea in ideas:
                     suggestions.append({
                         'name': idea[:80] + ('...' if len(idea) > 80 else ''), # Truncate name
                         'description': idea,
                     })

        return suggestions

    def action_apply_suggestions(self):
        """Apply the selected suggestions to the parent Outcome Mapping record."""
        self.ensure_one()
        mapping = self.mapping_id
        selected_items = self.suggested_items.filtered('selected')

        if not selected_items:
             return {'type': 'ir.actions.act_window_close'} # Nothing to do

        try:
            vals_to_write = {}
            new_additional_outcomes = []
            new_milestones = []
            white_space_text = mapping.white_space or "" # Start with existing text

            if self.suggestion_type == 'outcomes':
                existing_metrics = mapping.additional_outcome_ids.mapped('metric')
                for i, item in enumerate(selected_items):
                     if item.name not in existing_metrics: # Double check existence
                        # Basic assumption: name is the metric
                        is_percentage = '%' in item.name or '%' in item.description
                        metric = item.name
                        new_additional_outcomes.append((0, 0, {
                            'name': f"{metric} (Suggested)", # Indicate source
                            'metric': metric,
                            'is_percentage': is_percentage,
                            'priority': 'medium',
                            'sequence': (len(mapping.additional_outcome_ids) + i + 1) * 10
                        }))
                if new_additional_outcomes:
                     vals_to_write['additional_outcome_ids'] = new_additional_outcomes

            elif self.suggestion_type == 'milestones':
                existing_milestones = mapping.milestone_ids.mapped('name')
                today = fields.Date.context_today(self)
                for i, item in enumerate(selected_items):
                     if item.name not in existing_milestones: # Double check existence
                         target_date = today + timedelta(days=(len(mapping.milestone_ids) + i + 1) * 30) # Stagger dates
                         new_milestones.append((0, 0, {
                             'name': item.name,
                             'notes': item.description,
                             'target_date': target_date,
                             'sequence': (len(mapping.milestone_ids) + i + 1) * 10
                         }))
                if new_milestones:
                    vals_to_write['milestone_ids'] = new_milestones

            elif self.suggestion_type == 'white_space':
                # Append selected suggestions to existing text
                if white_space_text: white_space_text += "\n\n" # Add separator if needed
                white_space_text += "\n".join([f"- {item.description or item.name}" for item in selected_items])
                vals_to_write['white_space'] = white_space_text.strip()

            # Apply changes if any
            if vals_to_write:
                 mapping.write(vals_to_write)

        except Exception as e:
            _logger.error("Error applying suggestions from wizard %s: %s", self.id, str(e))
            raise UserError(_("Failed to apply suggestions: %s") % str(e))

        # Return action to reload the parent view (Outcome Mapping Form)
        # This requires the calling button to handle the reload if needed,
        # or we rely on Odoo's default behavior after closing a wizard.
        # For simplicity, we just close.
        return {'type': 'ir.actions.act_window_close'}