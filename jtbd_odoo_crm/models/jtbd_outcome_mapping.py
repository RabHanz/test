# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError
import logging
from datetime import timedelta
# Import selections from the models where they are defined
from .jtbd_job_pattern import JOB_CATEGORIES # Reuse job categories

_logger = logging.getLogger(__name__)

class JtbdOutcomeMapping(models.Model):
    _name = 'jtbd.outcome.mapping'
    _description = 'JTBD Outcome Mapping'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'

    # Core Fields
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
        help="The main metric used to measure success (e.g., 'Client Retention Rate')."
    )
    baseline_value = fields.Float(
        string='Baseline Value', tracking=True,
        help="The value of the metric when this target was initially set."
    )
    current_value = fields.Float(
        string='Current Value', tracking=True,
        help="The current actual value of the primary metric."
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
    # Progress field for the progress bar (capped 0-100)
    primary_outcome_progress = fields.Float(
        string='Progress (%) Bar', # Renamed label slightly for clarity
        compute='_compute_outcome_progress_values', # Renamed compute method
        store=True, digits=(16, 1),
        help="Progress towards the target value relative to baseline (capped 0-100%).",
        group_operator='avg'
    )
    # NEW field for raw/uncapped progress
    jtbd_outcome_raw_progress = fields.Float(
        string='Raw Progress (%)',
        compute='_compute_outcome_progress_values', # Same compute method
        store=True, digits=(16, 1),
        help="Actual calculated progress percentage relative to baseline (can be <0 or >100)."
        # No group_operator needed typically for raw value display
    )
    # Status field
    jtbd_outcome_status = fields.Selection(
        [('no_data', 'No Data'), ('on_baseline', 'On Baseline'),
         ('negative', 'Regressed'), ('improving', 'Improving'),
         ('achieved', 'Achieved'), ('exceeded', 'Exceeded')],
        string="Outcome Status", compute='_compute_jtbd_outcome_status', store=True,
        help="Progress status relative to baseline and target."
    )

    # Related Items (One2many)
    additional_outcome_ids = fields.One2many('jtbd.additional.outcome', 'mapping_id', string='Additional Outcomes')
    milestone_ids = fields.One2many('jtbd.outcome.milestone', 'mapping_id', string='Milestones')

    # White Space & Notes
    white_space = fields.Text(string='White Space Opportunities', tracking=True)
    notes = fields.Html(string='Notes')

    # --- Default Get Method ---
    @api.model
    def default_get(self, fields_list):
        defaults = super(JtbdOutcomeMapping, self).default_get(fields_list)
        lead_id_from_context = self.env.context.get('default_lead_id') or self.env.context.get('active_id')
        if lead_id_from_context:
            if 'lead_id' in fields_list: defaults['lead_id'] = lead_id_from_context
            lead = self.env['crm.lead'].browse(lead_id_from_context).exists()
            if lead:
                if 'job_category' in fields_list and lead.jtbd_job_category: defaults['job_category'] = lead.jtbd_job_category
                if 'name' in fields_list and not defaults.get('name'):
                    try: defaults['name'] = _('Outcome Map for %s') % lead.name
                    except Exception: defaults['name'] = _('New Outcome Map')
        if 'name' in fields_list and not defaults.get('name'): defaults['name'] = _('New Outcome Map')
        return defaults

    # --- Compute Methods ---
    @api.depends('lead_id.jtbd_job_statement')
    def _compute_job_statement(self):
        for record in self:
            record.job_statement = record.lead_id.jtbd_job_statement if record.lead_id else _('No related opportunity.')

    # Compute method for BOTH progress fields
    @api.depends('baseline_value', 'current_value', 'target_value')
    def _compute_outcome_progress_values(self):
        """ Calculate both capped progress (for bar) and raw progress (for display). """
        for record in self:
            baseline = record.baseline_value
            current = record.current_value
            target = record.target_value

            # Default values
            raw_progress = 0.0
            capped_progress = 0.0

            if all(isinstance(v, (int, float)) for v in [baseline, current, target]):
                desired_change = target - baseline
                change_achieved = current - baseline

                if desired_change == 0:
                    # If target equals baseline, progress is 100% only if current also equals target/baseline
                    raw_progress = 100.0 if current == target else 0.0
                    capped_progress = max(0.0, min(100.0, raw_progress)) # Cap anyway for consistency
                else:
                    # Calculate raw progress ratio
                    try:
                        raw_progress = (change_achieved / desired_change) * 100.0
                    except ZeroDivisionError:
                        raw_progress = 0.0 # Should be caught by desired_change == 0 check
                    # Calculate capped progress for the bar (0-100)
                    capped_progress = max(0.0, min(100.0, raw_progress))

            record.jtbd_outcome_raw_progress = raw_progress
            record.primary_outcome_progress = capped_progress # Field for progressbar widget

    # Status calculation depends on the actual values, not the capped progress
    @api.depends('baseline_value', 'current_value', 'target_value')
    def _compute_jtbd_outcome_status(self):
        """ Determine the status based on baseline, current, and target values. """
        for record in self:
            baseline = record.baseline_value
            current = record.current_value
            target = record.target_value

            if not all(isinstance(v, (int, float)) for v in [baseline, current, target]):
                record.jtbd_outcome_status = 'no_data'
                continue

            # Use a small tolerance for float comparisons if needed, e.g.,
            # tolerance = 1e-6
            # if abs(current - target) < tolerance:

            if current == target: record.jtbd_outcome_status = 'achieved'; continue
            # If current equals baseline but not target, it's 'on_baseline'
            if current == baseline: record.jtbd_outcome_status = 'on_baseline'; continue

            increasing_goal = target > baseline
            decreasing_goal = target < baseline
            status = 'improving'

            if increasing_goal:
                if current > target: status = 'exceeded'
                elif current < baseline: status = 'negative' # Moved backwards from baseline
                # else: status remains False ('improving')
            elif decreasing_goal:
                if current < target: status = 'exceeded' # Exceeded target by going lower
                elif current > baseline: status = 'negative' # Increased when goal was to decrease
                # else: status remains False ('improving')
            else: # target == baseline (but current != target/baseline)
                 # This case means desired_change is 0, should be handled by checks above
                 # But as fallback, mark as no_data or determine if negative/exceeded based on current vs baseline
                 status = 'negative' if current < baseline else 'exceeded' # Or 'no_data'

            record.jtbd_outcome_status = status

    # --- Action Methods ---
    def action_apply_template(self):
        self.ensure_one()
        return {
            'name': _('Select Outcome Template'), 'type': 'ir.actions.act_window',
            'view_mode': 'form', 'res_model': 'jtbd.outcome.template.wizard',
            'target': 'new',
            'context': {'default_mapping_id': self.id, 'default_mapping_job_category': self.job_category}
        }

    def _check_and_open_suggestion_wizard(self, suggestion_type, title):
        self.ensure_one()
        temp_wizard = self.env['jtbd.outcome.suggestion.wizard'].new({
             'mapping_id': self.id, 'suggestion_type': suggestion_type
        })
        suggestions_list_of_dicts = temp_wizard._get_suggestions(self, suggestion_type)
        if not suggestions_list_of_dicts:
            return { 'type': 'ir.actions.client', 'tag': 'display_notification',
                     'params': {'title': _('No Suggestions'),
                                'message': _('No new %s found.') % suggestion_type.replace('_', ' '),
                                'sticky': False, 'type': 'warning'} }
        else:
            try:
                wizard = self.env['jtbd.outcome.suggestion.wizard'].create({
                    'mapping_id': self.id, 'suggestion_type': suggestion_type,
                })
            except Exception as e:
                 _logger.error(f"Failed to create suggestion wizard: {e}", exc_info=True)
                 raise UserError(_("Could not create suggestion wizard."))
            return { 'name': title, 'type': 'ir.actions.act_window', 'view_mode': 'form',
                     'res_model': 'jtbd.outcome.suggestion.wizard', 'res_id': wizard.id,
                     'target': 'new', }

    def action_update_opportunity(self):
        self.ensure_one()
        if not self.lead_id: raise UserError(_("No related opportunity found."))
        vals_to_write = {
            'jtbd_outcome_metric': self.outcome_metric,
            'jtbd_white_space': self.white_space if self.white_space else False
        }
        try:
            self.lead_id.write(vals_to_write)
            status_display = dict(self._fields['jtbd_outcome_status'].selection).get(self.jtbd_outcome_status, '')
            body = _(
                "Outcome Map '%(map_name)s' updated Opportunity:<br/>"
                "- Metric: <strong>%(metric)s</strong><br/>"
                "- Base: %(base)s %(unit)s | Current: %(current)s %(unit)s | Target: %(target)s %(unit)s<br/>"
                "- Progress: %(progress).1f%% (Status: %(status)s)<br/>" # Show raw progress
                "- Milestones: %(milestones_count)s"
            ) % { 'map_name': self.name, 'metric': self.outcome_metric or _('N/A'),
                  'base': self.baseline_value if isinstance(self.baseline_value, (int, float)) else 'N/A',
                  'current': self.current_value or '0', 'target': self.target_value or '0',
                  'unit': self.metric_unit or '',
                  'progress': self.jtbd_outcome_raw_progress, # Use raw progress
                  'status': status_display,
                  'milestones_count': len(self.milestone_ids), }
            if self.white_space: body += _("<br/>- White Space Opportunities noted.")
            self.lead_id.message_post(body=body, subtype_id=self.env.ref('mail.mt_note').id)
            return self._notify_success(_('Opportunity updated.'))
        except Exception as e:
            _logger.error(f"Error updating opportunity from Outcome Map {self.id}: {e}")
            raise UserError(_("Failed to update opportunity: %s") % str(e))

    def action_view_opportunity(self):
        self.ensure_one()
        return { 'type': 'ir.actions.act_window', 'name': _('Opportunity'),
                 'res_model': 'crm.lead', 'res_id': self.lead_id.id,
                 'view_mode': 'form', 'target': 'current', }

    def action_suggest_additional_outcomes(self):
        return self._check_and_open_suggestion_wizard('outcomes', _('Suggested Additional Outcomes'))

    def action_suggest_milestones(self):
        return self._check_and_open_suggestion_wizard('milestones', _('Suggested Milestones'))

    def action_suggest_white_space(self):
        return self._check_and_open_suggestion_wizard('white_space', _('Suggested White Space Opportunities'))

    def _notify_success(self, message):
        self.ensure_one()
        return { 'type': 'ir.actions.client', 'tag': 'display_notification',
                 'params': {'title': _('Success'), 'message': message, 'sticky': False, 'type': 'success'} }