# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import UserError # Added for raising errors
import logging # Added for logging
from datetime import timedelta # Added for milestone date calc
# Import selections from the models where they are defined
from .jtbd_job_pattern import JOB_CATEGORIES # Reuse job categories

_logger = logging.getLogger(__name__) # Initialize logger

class JtbdOutcomeMapping(models.Model):
    _name = 'jtbd.outcome.mapping'
    _description = 'JTBD Outcome Mapping'
    _inherit = ['mail.thread', 'mail.activity.mixin'] # Add chatter
    _order = 'create_date desc' # Default order by creation date

    lead_id = fields.Many2one(
        'crm.lead', string='Opportunity', required=True, ondelete='cascade',
        index=True, tracking=True
    )
    name = fields.Char(string='Mapping Name', required=True, tracking=True)
    company_id = fields.Many2one('res.company', related='lead_id.company_id', store=True)

    # Link to Job Definition
    job_category = fields.Selection(
        selection=JOB_CATEGORIES, string='Job Category', index=True, tracking=True,
        help="Job category this outcome map relates to."
    )
    job_statement = fields.Text(
        string='Job Statement', readonly=True, compute='_compute_job_statement', store=False,
        help="The job statement from the related opportunity."
    )

    # Primary Outcome Fields
    outcome_metric = fields.Char(
        string='Primary Outcome Metric', tracking=True, required=True,
        help="The main metric used to measure success for this job (e.g., 'Client Retention Rate')."
    )
    current_value = fields.Float(
        string='Current Value', tracking=True,
        help="The current baseline value of the primary metric."
    )
    target_value = fields.Float(
        string='Target Value', tracking=True,
        help="The desired target value for the primary metric."
    )
    metric_unit = fields.Char(
        string='Unit of Measure', tracking=True,
        help="The unit for the primary metric (e.g., '%', 'Days', '$')."
    )
    is_percentage = fields.Boolean(
        string='Is Percentage', tracking=True,
        help="Check if the primary metric is expressed as a percentage."
    )
    primary_outcome_progress = fields.Float(
        string='Progress (%)', compute='_compute_primary_outcome_progress', store=True, digits=(16, 1),
        help="Calculated progress towards the target value.", group_operator='avg'
    )

    # Related Items (One2many)
    additional_outcome_ids = fields.One2many(
        'jtbd.additional.outcome', 'mapping_id', string='Additional Outcomes'
    )
    milestone_ids = fields.One2many(
        'jtbd.outcome.milestone', 'mapping_id', string='Milestones'
    )

    # White Space & Notes
    white_space = fields.Text(
        string='White Space Opportunities', tracking=True,
        help="Identify additional untapped areas for future expansion related to this job."
    )
    notes = fields.Html(
        string='Notes',
        help="Additional context about the outcomes and measurement approach."
    )

    # --- Default Get Method ---
    @api.model
    def default_get(self, fields_list):
        defaults = super(JtbdOutcomeMapping, self).default_get(fields_list)
        lead_id_from_context = self.env.context.get('default_lead_id') or self.env.context.get('active_id')
        if lead_id_from_context:
            if 'lead_id' in fields_list:
                defaults['lead_id'] = lead_id_from_context
            lead = self.env['crm.lead'].browse(lead_id_from_context).exists()
            if lead:
                if 'job_category' in fields_list and lead.jtbd_job_category:
                    defaults['job_category'] = lead.jtbd_job_category
                if 'name' in fields_list and not defaults.get('name'):
                    try:
                        defaults['name'] = _('Outcome Map for %s') % lead.name
                    except Exception: # Fallback default name
                        defaults['name'] = _('New Outcome Map')
        if 'name' in fields_list and not defaults.get('name'):
            defaults['name'] = _('New Outcome Map')
        return defaults

    # --- Compute Methods ---
    @api.depends('lead_id.jtbd_job_statement')
    def _compute_job_statement(self):
        for record in self:
            if record.lead_id:
                record.job_statement = record.lead_id.jtbd_job_statement or _('No job statement defined on opportunity.')
            else:
                record.job_statement = _('No related opportunity.')

    @api.depends('current_value', 'target_value')
    def _compute_primary_outcome_progress(self):
        """ Calculate progress, assuming baseline is 0 if not otherwise defined. """
        for record in self:
            current_val = record.current_value
            target_val = record.target_value
            if isinstance(current_val, (int, float)) and isinstance(target_val, (int, float)):
                if target_val != 0:
                    # Simple ratio progress
                    progress = (current_val / target_val) * 100.0
                    record.primary_outcome_progress = max(0.0, min(100.0, progress))
                elif current_val == target_val: # Both are 0
                    record.primary_outcome_progress = 100.0
                else: # Target is 0, current is not
                    record.primary_outcome_progress = 0.0
            else:
                record.primary_outcome_progress = 0.0

    # --- Action Methods ---
    def action_apply_template(self):
        """Open the template selection wizard."""
        self.ensure_one()
        return {
            'name': _('Select Outcome Template'),
            'type': 'ir.actions.act_window',
            'view_mode': 'form',
            'res_model': 'jtbd.outcome.template.wizard',
            'target': 'new',
            'context': {
                'default_mapping_id': self.id,
                'default_mapping_job_category': self.job_category,
            }
        }

    def _check_and_open_suggestion_wizard(self, suggestion_type, title):
        """Checks for suggestions, creates the wizard with items,
           and returns action to open the specific wizard record."""
        self.ensure_one()
        # 1. Get suggestions first
        # Need a wizard instance to call its methods, even if temporary
        temp_wizard = self.env['jtbd.outcome.suggestion.wizard'].new({
             'mapping_id': self.id, 'suggestion_type': suggestion_type
        })
        suggestions_list_of_dicts = temp_wizard._get_suggestions(self, suggestion_type)

        if not suggestions_list_of_dicts:
            # No suggestions, show notification and stop
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('No Suggestions'),
                    'message': _('No new %s found based on the current outcome map and patterns.') % suggestion_type.replace('_', ' '),
                    'sticky': False,
                    'type': 'warning'
                }
            }
        else:
            # 2. Suggestions exist, create the wizard record.
            # The overridden create method will handle creating the suggested items.
            try:
                wizard = self.env['jtbd.outcome.suggestion.wizard'].create({
                    'mapping_id': self.id,
                    'suggestion_type': suggestion_type,
                })
                _logger.info(f"Created suggestion wizard record ID: {wizard.id} for mapping {self.id}")
            except Exception as e:
                 _logger.error(f"Failed to create suggestion wizard for mapping {self.id}: {e}", exc_info=True)
                 raise UserError(_("Could not create the suggestion wizard. Please check logs."))

            # 3. Return action to open the SPECIFIC wizard record just created
            return {
                'name': title,
                'type': 'ir.actions.act_window',
                'view_mode': 'form',
                'res_model': 'jtbd.outcome.suggestion.wizard',
                'res_id': wizard.id, # Target the specific record
                'target': 'new',
            }

    def action_update_opportunity(self):
        """Update the related opportunity with key outcome mapping data."""
        self.ensure_one()
        if not self.lead_id:
            raise UserError(_("No related opportunity found for this mapping."))
        vals_to_write = {
            'jtbd_outcome_metric': self.outcome_metric,
            'jtbd_white_space': self.white_space if self.white_space else False
        }
        try:
            self.lead_id.write(vals_to_write)
            body = _(
                "Outcome Mapping '%(map_name)s' updated Opportunity:<br/>"
                "- Primary Metric: <strong>%(metric)s</strong><br/>"
                "- Current Value: %(current)s %(unit)s<br/>"
                "- Target Value: %(target)s %(unit)s<br/>"
                "- Milestones Defined: %(milestones_count)s"
            ) % {
                'map_name': self.name,
                'metric': self.outcome_metric or _('Not Set'),
                'current': self.current_value or '0',
                'target': self.target_value or '0',
                'unit': self.metric_unit or '',
                'milestones_count': len(self.milestone_ids),
            }
            if self.white_space: body += _("<br/>- White Space Opportunities noted.")
            self.lead_id.message_post(body=body, subtype_id=self.env.ref('mail.mt_note').id)
            return self._notify_success(_('Opportunity fields updated successfully from Outcome Map.'))
        except Exception as e:
            _logger.error("Error updating opportunity from Outcome Mapping %s: %s", self.id, str(e))
            raise UserError(_("Failed to update opportunity fields: %s") % str(e))

    def action_view_opportunity(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': _('Opportunity'),
            'res_model': 'crm.lead',
            'res_id': self.lead_id.id,
            'view_mode': 'form',
            'target': 'current',
        }

    def action_suggest_additional_outcomes(self):
        return self._check_and_open_suggestion_wizard('outcomes', _('Suggested Additional Outcomes'))

    def action_suggest_milestones(self):
        return self._check_and_open_suggestion_wizard('milestones', _('Suggested Milestones'))

    def action_suggest_white_space(self):
        return self._check_and_open_suggestion_wizard('white_space', _('Suggested White Space Opportunities'))

    # Notification helper
    def _notify_success(self, message):
        self.ensure_one()
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Action Status'),
                'message': message,
                'sticky': False,
                'type': 'success'
            }
        }