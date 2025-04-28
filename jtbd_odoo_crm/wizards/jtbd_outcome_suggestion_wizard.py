# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError
from datetime import timedelta
import logging

_logger = logging.getLogger(__name__)

class JtbdSuggestedItem(models.TransientModel):
    _name = 'jtbd.suggested.item'
    _description = 'JTBD Suggested Item (Transient)'

    wizard_id = fields.Many2one('jtbd.outcome.suggestion.wizard', string='Wizard', required=True, ondelete='cascade')
    name = fields.Char(string='Item', required=True, readonly=True)
    description = fields.Text(string='Details', readonly=True)
    selected = fields.Boolean(string='Select', default=True)

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
    suggested_items = fields.One2many(
        'jtbd.suggested.item', 'wizard_id', string='Suggested Items'
    )

    # Override create to populate suggested_items based on context passed to create()
    @api.model_create_multi
    def create(self, vals_list):
        wizards = super().create(vals_list)
        suggested_item_obj = self.env['jtbd.suggested.item']
        for wizard in wizards:
            if wizard.mapping_id and wizard.suggestion_type:
                try:
                    suggestions_list_of_dicts = wizard._get_suggestions(wizard.mapping_id, wizard.suggestion_type)
                    items_to_create = []
                    for s_dict in suggestions_list_of_dicts:
                        if isinstance(s_dict, dict) and s_dict.get('name') and isinstance(s_dict['name'], str) and s_dict['name'].strip():
                            s_dict['wizard_id'] = wizard.id
                            items_to_create.append(s_dict)
                        else: _logger.warning(f"Skipping creation of invalid suggestion: {s_dict}")
                    if items_to_create: suggested_item_obj.create(items_to_create)
                except Exception as e: _logger.error(f"Error creating suggested items: {e}", exc_info=True)
            else: _logger.warning(f"Wizard {wizard.id} missing data.")
        return wizards


    def _get_suggestions(self, mapping, suggestion_type):
        """ Get relevant suggestions based on outcome pattern for the mapping's job category. """

        suggestions = []
        if not mapping or not mapping.job_category: return suggestions
        job_category_id = mapping.job_category_id.id
        patterns = self.env['jtbd.outcome.pattern'].search([('job_category_id', '=', job_category_id), ('active', '=', True)], limit=1)
        if not patterns: return suggestions
        pattern = patterns[0]
        def _add_suggestion(name_val, desc_val):
            name_str = str(name_val or '').strip()
            if name_str: suggestions.append({'name': name_str, 'description': str(desc_val or '').strip()})
        try:
            if suggestion_type == 'outcomes':
                existing_metrics = mapping.additional_outcome_ids.mapped('metric')
                if pattern.additional_metrics and isinstance(pattern.additional_metrics, str):
                    metrics = [m.strip() for m in pattern.additional_metrics.splitlines() if m.strip()]
                    for metric in metrics:
                        if metric and metric not in existing_metrics: _add_suggestion(metric, _("Suggested metric."))
            elif suggestion_type == 'milestones':
                 existing_milestones = mapping.milestone_ids.mapped('name')
                 milestone_templates = filter(None, [pattern.typical_milestone_1, pattern.typical_milestone_2, pattern.typical_milestone_3])
                 for ms_name in milestone_templates:
                     if isinstance(ms_name, str) and ms_name.strip() and ms_name not in existing_milestones: _add_suggestion(ms_name.strip(), _("Suggested milestone."))
            elif suggestion_type == 'white_space':
                 if pattern.white_space_suggestions and isinstance(pattern.white_space_suggestions, str) and not mapping.white_space:
                     ideas = [idea.strip() for idea in pattern.white_space_suggestions.splitlines() if idea.strip()]
                     for idea in ideas:
                         if idea:
                              truncated_name = idea[:80] + ('...' if len(idea) > 80 else '')
                              if truncated_name: _add_suggestion(truncated_name, idea)
        except Exception as e:
             _logger.error(f"Error occurred within _get_suggestions logic: {e}", exc_info=True)
             return []
        return suggestions


    # action_apply_suggestions applies selected items
    def action_apply_suggestions(self):
        self.ensure_one()
        mapping = self.mapping_id
        selected_items = self.suggested_items.exists().filtered('selected')

        if not selected_items: return {'type': 'ir.actions.act_window_close'}

        try:
            vals_to_write = {}
            additional_outcome_vals_list = []
            milestone_vals_list = []
            white_space_parts = [mapping.white_space] if mapping.white_space else []

            if self.suggestion_type == 'outcomes':
                existing_metrics = mapping.additional_outcome_ids.mapped('metric')
                for i, item in enumerate(selected_items):
                     item_name = item.name or ''
                     if item_name.strip() and item_name not in existing_metrics:
                        metric = item_name.strip()
                        is_percentage = '%' in metric or '(%)' in metric.lower() or (item.description and '%' in item.description)
                        metric_unit = '%' if is_percentage else None
                        name_display = f"{metric} (Suggested)"
                        vals = {
                            'name': name_display,
                            'metric': metric,
                            'is_percentage': is_percentage,
                            'metric_unit': metric_unit,
                            # Set priority to Medium ('2')
                            'priority': '2',
                            'sequence': (len(mapping.additional_outcome_ids) + i + 1) * 10
                        }
                        additional_outcome_vals_list.append((0, 0, vals))
                if additional_outcome_vals_list: vals_to_write['additional_outcome_ids'] = additional_outcome_vals_list
            elif self.suggestion_type == 'milestones':
                # ... (milestone logic remains the same) ...
                existing_milestones = mapping.milestone_ids.mapped('name')
                today = fields.Date.context_today(self)
                for i, item in enumerate(selected_items):
                     item_name = item.name or ''
                     if item_name.strip() and item_name not in existing_milestones:
                         target_date = today + timedelta(days=(len(mapping.milestone_ids) + i + 1) * 30)
                         vals = { 'name': item_name.strip(), 'notes': item.description or '',
                                 'target_date': target_date,
                                 'sequence': (len(mapping.milestone_ids) + i + 1) * 10 }
                         milestone_vals_list.append((0, 0, vals))
                if milestone_vals_list: vals_to_write['milestone_ids'] = milestone_vals_list

            elif self.suggestion_type == 'white_space':
                # ... (white_space logic remains the same) ...
                for item in selected_items:
                     text_to_add = (item.description or item.name or '').strip()
                     if text_to_add: white_space_parts.append(f"- {text_to_add}")
                if len(white_space_parts) > (1 if mapping.white_space else 0):
                     vals_to_write['white_space'] = "\n".join(white_space_parts).strip()


            if vals_to_write:
                 mapping.write(vals_to_write)

        except Exception as e:
            _logger.error(f"Error applying suggestions from wizard {self.id}: {e}", exc_info=True)
            error_msg = _("Failed to apply suggestions. Please check logs for details.")
            if isinstance(e, (ValidationError, UserError)): error_msg = str(e)
            raise UserError(error_msg)

        return {'type': 'ir.actions.act_window_close'}