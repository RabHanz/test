# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError
import logging
from datetime import timedelta

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
    job_category_id = fields.Many2one(
        'jtbd.job.category', string='Job Category', index=True, tracking=True,
        ondelete='restrict',
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
        aggregator='avg'
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

    # --- Economic Impact Placeholder (PRD3 Phase 3) ---
    jtbd_economic_impact_value = fields.Monetary(
        string="Est. Economic Impact",
        currency_field='company_currency_id', # Ensure company_currency_id exists
        tracking=True,
        help="Estimated total economic value (e.g., annual savings, revenue increase) expected from achieving the target outcomes. Calculated via external tool or analysis."
    )
    # Helper field for currency
    company_currency_id = fields.Many2one('res.currency', related='company_id.currency_id', store=True, string="Company Currency")

    jtbd_trace_link_count = fields.Integer(
        compute='_compute_trace_link_count',
        string="# Trace Links"
    )

    # --- Default Get Method ---
    @api.model
    def default_get(self, fields_list):
        defaults = super(JtbdOutcomeMapping, self).default_get(fields_list)
        lead_id_from_context = self.env.context.get('default_lead_id') or self.env.context.get('active_id')
        if lead_id_from_context:
            if 'lead_id' in fields_list: defaults['lead_id'] = lead_id_from_context
            lead = self.env['crm.lead'].browse(lead_id_from_context).exists()
            if lead:
                # Pass ID for M2O field
                if 'job_category_id' in fields_list and lead.jtbd_job_category_id:
                     defaults['job_category_id'] = lead.jtbd_job_category_id.id
                if 'name' in fields_list and not defaults.get('name'):
                    try: defaults['name'] = _('Outcome Map for %s') % lead.name
                    except Exception: defaults['name'] = _('New Outcome Map')
        if 'name' in fields_list and not defaults.get('name'): defaults['name'] = _('New Outcome Map')
        return defaults

    # --- Validation Constraints ---
    @api.constrains('outcome_metric')
    def _check_outcome_metric(self):
        # Basic check, can be enhanced with NLP/AI later
        for record in self.filtered('outcome_metric'):
             if len(record.outcome_metric.split()) < 2: # Require at least two words? Very basic.
                 _logger.warning("Outcome Metric '%s' might lack measurable component.", record.outcome_metric)
                 # Not raising ValidationError as it's subjective without AI

    @api.constrains('primary_outcome_progress', 'jtbd_outcome_raw_progress')
    def _check_progress_percentage(self):
        # Check calculated percentages - mainly for sanity check, shouldn't be directly user-editable
        for record in self:
            # Raw progress can be outside 0-100, but capped progress should be within
            if not (0 <= record.primary_outcome_progress <= 100):
                 # This should ideally not happen due to the compute logic capping
                 _logger.error(f"Capped Progress for Outcome Map {record.id} is outside 0-100: {record.primary_outcome_progress}. Check computation.")
                 # Raise ValidationError("Progress (%) Bar must be between 0 and 100.")

    @api.constrains('jtbd_economic_impact_value')
    def _check_economic_impact(self):
         for record in self:
            if record.jtbd_economic_impact_value is not None and record.jtbd_economic_impact_value < 0:
                 raise ValidationError(_("Estimated Economic Impact cannot be negative."))
    # --- End Validation Constraints ---

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
            'context': {'default_mapping_id': self.id, 'default_mapping_job_category_id': self.job_category_id.id}
        }

    # --- ADD Trace Link Counter and Action ---
    def _compute_trace_link_count(self):
        """ Computes the number of trace links using search_count loop. """
        TraceLink = self.env['jtbd.trace.link']
        trace_link_model_id = self.env['ir.model']._get_id(self._name)
        if not trace_link_model_id:
            for record in self: record.jtbd_trace_link_count = 0
            return
        for record in self:
            try:
                count = TraceLink.search_count([ ('source_model_id', '=', trace_link_model_id), ('source_res_id', '=', record.id) ])
                record.jtbd_trace_link_count = count
            except Exception as e:
                 _logger.error(f"Error counting trace links for Outcome Map {record.id}: {e}", exc_info=True)
                 record.jtbd_trace_link_count = 0

    def action_open_trace_links(self):
        """ Opens a wizard to CREATE a new trace link for this Outcome Map. """
        self.ensure_one()
        source_model_id = self.env['ir.model']._get_id(self._name)
        return {
            'name': _('Create Trace Link for Outcome Map'),
            'type': 'ir.actions.act_window',
            'res_model': 'jtbd.create.trace.link.wizard', # Target the wizard
            'view_mode': 'form',
            'target': 'new',
            'context': {
                'default_source_model_id': source_model_id,
                'default_source_res_id': self.id,
                'default_name': f'Link for Outcome Map: {self.name[:30]}...'
            }
        }
    # --- END Trace Link Counter and Action ---

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

    def action_suggest_white_space(self):
        """ Action to get AI suggestions for White Space opportunities. """
        self.ensure_one()
        _logger.info(f"AI White Space Suggestion requested for Outcome Map {self.id}")

        if not self.lead_id:
            raise UserError(_("Cannot generate suggestions without a linked Opportunity."))

        # --- Phase 4: Prepare Context for AI ---
        context_data = {
            'lead_id': self.lead_id.id,
            'lead_name': self.lead_id.name,
            'job_statement': self.job_statement or '',
            'job_category' : self.job_category_id.name if self.job_category_id else '',
            'primary_outcome': self.outcome_metric or '',
            'target_value': self.target_value or '',
            'current_value': self.current_value or '',
            'additional_outcomes': [{'name': o.name, 'metric': o.metric} for o in self.additional_outcome_ids],
            'milestones': [{'name': m.name, 'target_date': str(m.target_date)} for m in self.milestone_ids],
            'agency_size': self.lead_id.jtbd_agency_size or '',
            'current_tools': self.lead_id.jtbd_current_tools or '',
            'existing_white_space': self.white_space or '',
        }
        _logger.debug(f"AI White Space Suggestion Context Data: {context_data}")

        # --- Phase 4: Placeholder for API Call ---
        # Call n8n/AI service, passing context_data.
        # Expect response like: {'suggestions': ["Suggestion 1 text...", "Suggestion 2 text..."]}
        # Process response and append to the white_space field or display in wizard/chatter.
        ai_suggestions = [ # Simulate some basic suggestions
            "AI Suggestion: Offer add-on service for 'Advanced Reporting Automation'.",
            "AI Suggestion: Develop training module based on achieved outcome.",
            "AI Suggestion: Explore adjacent job 'Improving Team Collaboration Tools'."
        ]
        # --- End Placeholder ---

        # For now, append suggestions to the field and notify (or use chatter)
        if ai_suggestions:
            new_white_space_parts = [self.white_space] if self.white_space else []
            new_white_space_parts.append("\n--- AI Suggestions ---")
            new_white_space_parts.extend(ai_suggestions)
            try:
                self.write({'white_space': "\n".join(filter(None, new_white_space_parts)).strip()})
                message = _("AI suggestions added to the White Space Opportunities field (Simulation).")
                msg_type = 'success'
            except Exception as write_e:
                _logger.error(f"Error writing AI suggestions to white space field for map {self.id}: {write_e}", exc_info=True)
                message = _("AI suggested but failed to update field. Check logs.")
                msg_type = 'warning'
        else:
            message = _("No AI white space suggestions generated (Simulation).")
            msg_type = 'warning'

        # Option 1: Notify user
        # return { 'type': 'ir.actions.client', 'tag': 'display_notification',
        #          'params': {'title': _('AI White Space Suggestions'), 'message': message, 'sticky': False, 'type': msg_type}}

        # Option 2: Reload the form view to show the updated field (more user friendly)
        return {
            'type': 'ir.actions.act_window',
            'name': _('Outcome Mapping'), # Title of the view window
            'res_model': self._name,
            'res_id': self.id,
            'view_mode': 'form',
            'target': 'current', # Reload in the main content area
    }
    
    def _notify_success(self, message):
        self.ensure_one()
        return { 'type': 'ir.actions.client', 'tag': 'display_notification',
                 'params': {'title': _('Success'), 'message': message, 'sticky': False, 'type': 'success'} }