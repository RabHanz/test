# -*- coding: utf-8 -*-
import logging
from odoo import models, fields, api, _
from odoo.tools.safe_eval import safe_eval # Keep if common force wizard uses it
from odoo.exceptions import UserError # Keep

_logger = logging.getLogger(__name__)

class JtbdForceAnalysis(models.Model):
    _name = 'jtbd.force.analysis'
    _description = 'JTBD Force Analysis'
    _inherit = ['mail.thread', 'mail.activity.mixin'] # Keep chatter
    _order = 'date desc, name'

    # --- Core Fields ---
    lead_id = fields.Many2one( 'crm.lead', string='Opportunity', required=True, ondelete='cascade', index=True, tracking=True)
    name = fields.Char(string='Analysis Name', required=True, tracking=True, default=lambda self: _('New Force Analysis'))
    date = fields.Date(string='Analysis Date', default=fields.Date.context_today, tracking=True, index=True)
    user_id = fields.Many2one('res.users', string='Analyst', default=lambda self: self.env.user, tracking=True, index=True)
    company_id = fields.Many2one('res.company', related='lead_id.company_id', store=True)

    # --- Triggers & Context Fields ---
    trigger_window = fields.Selection( [('immediate', 'Immediate (0-30 days)'), ('short', 'Short-term (1-3 months)'), ('medium', 'Medium-term (3-6 months)'), ('long', 'Long-term (6+ months)'), ('undefined', 'Undefined')], string='Decision Window', tracking=True, index=True)
    intensity_score = fields.Integer(string='Pain Intensity', tracking=True, help="Overall intensity of pain/need on 1-10 scale.")
    contract_loss = fields.Boolean(string='Recent Contract Loss?', tracking=True)
    contract_loss_details = fields.Text(string='Contract Loss Details')

    # --- Force Item Relations (Refactored) ---
    push_force_ids = fields.One2many('jtbd.force.item', 'analysis_id', string='Push Forces', domain=[('force_type', '=', 'push')], context={'default_force_type': 'push'})
    pull_force_ids = fields.One2many('jtbd.force.item', 'analysis_id', string='Pull Forces', domain=[('force_type', '=', 'pull')], context={'default_force_type': 'pull'})
    anxiety_force_ids = fields.One2many('jtbd.force.item', 'analysis_id', string='Anxiety Forces', domain=[('force_type', '=', 'anxiety')], context={'default_force_type': 'anxiety'})
    habit_force_ids = fields.One2many('jtbd.force.item', 'analysis_id', string='Habit Forces', domain=[('force_type', '=', 'habit')], context={'default_force_type': 'habit'})

    # --- Calculated Scores (Based on Force Items) ---
    push_score = fields.Integer( string='Push Score', compute='_compute_scores', store=True, help="Aggregated push force strength (Max 50).")
    pull_score = fields.Integer( string='Pull Score', compute='_compute_scores', store=True, help="Aggregated pull force strength (Max 50).")
    anxiety_score = fields.Integer( string='Anxiety Score', compute='_compute_scores', store=True, help="Aggregated anxiety force strength (Max 50).")
    habit_score = fields.Integer( string='Habit Score', compute='_compute_scores', store=True, help="Aggregated habit force strength (Max 50).")
    momentum_score = fields.Integer( string='Momentum Score', compute='_compute_momentum', store=True, help="Overall momentum towards change (0-100).")
    signal_strength = fields.Integer( string='Signal Strength', compute='_compute_signal_strength', store=True, help="Combined intent score (0-100).")

    # --- Add Field for PRD3 Enhanced Flow ---
    jtbd_source_confidence_weighting = fields.Float(
        string="Source Confidence Weight", compute='_compute_source_confidence_weighting',
        store=True, digits=(3, 2), # e.g., 0.95
        help="Overall confidence weighting (0.0-1.0) for this analysis, potentially based on the source confidence of the linked lead."
    )
    # --- End PRD3 Enhanced Flow Field ---

    # --- Notes ---
    notes = fields.Html(string='Analysis Notes')

    # --- Compute Methods (Refactored) ---
    @api.depends('push_force_ids.strength', 'pull_force_ids.strength',
                 'anxiety_force_ids.strength', 'habit_force_ids.strength',
                 'jtbd_source_confidence_weighting') # Keep dependency
    def _compute_scores(self):
        """Calculate aggregated scores, applying confidence weighting."""
        _logger.debug(f"Computing scores for FA IDs: {self.ids} with confidence")
        for record in self:
            # Get confidence, default to 0.75 if not set (avoids zeroing out everything)
            confidence = record.jtbd_source_confidence_weighting if record.jtbd_source_confidence_weighting is not None else 0.75

            # Apply confidence weighting directly to the sum, then cap
            record.push_score = min(int(round(sum(record.push_force_ids.mapped('strength')) * confidence)), 50)
            record.pull_score = min(int(round(sum(record.pull_force_ids.mapped('strength')) * confidence)), 50)
            record.anxiety_score = min(int(round(sum(record.anxiety_force_ids.mapped('strength')) * confidence)), 50)
            record.habit_score = min(int(round(sum(record.habit_force_ids.mapped('strength')) * confidence)), 50)
            _logger.debug(f"FA {record.id}: Weighted Scores (Conf: {confidence:.2f}) - P={record.push_score}, Pl={record.pull_score}, A={record.anxiety_score}, H={record.habit_score}")


    # Depends now includes confidence indirectly via scores, and explicitly for potential adjustments
    @api.depends('push_score', 'pull_score', 'anxiety_score', 'habit_score', 'jtbd_source_confidence_weighting')
    def _compute_momentum(self):
        """Calculate momentum score based on confidence-weighted driving vs. resisting forces."""
        _logger.debug(f"Computing momentum for FA IDs: {self.ids}")
        for record in self:

            change_forces = record.push_score + record.pull_score
            resistance_forces = record.anxiety_score + record.habit_score

            momentum = 50 # Default neutral

            if change_forces == 0 and resistance_forces == 0:
                pass
            elif (change_forces + resistance_forces) > 0:
                momentum_ratio = change_forces / (change_forces + resistance_forces)
                momentum = int(round(momentum_ratio * 100))
            else:
                pass

            # Assign the calculated momentum
            record.momentum_score = max(0, min(100, momentum))
            _logger.debug(f"FA {record.id}: Momentum = {record.momentum_score} (Based on weighted scores)")
                    
    # --- Ensure compute method for confidence itself exists ---
    @api.depends('lead_id.jtbd_source_confidence_score')
    def _compute_source_confidence_weighting(self):
        for analysis in self:
            # Default to 0.75 if lead score is missing or zero
            analysis.jtbd_source_confidence_weighting = analysis.lead_id.jtbd_source_confidence_score or 0.75
            
    @api.depends('momentum_score', 'trigger_window', 'intensity_score', 'contract_loss') # Remove confidence dependency here
    def _compute_signal_strength(self):
        """ Calculate signal strength using confidence-adjusted momentum. """
        window_adjustments = {'immediate': 20, 'short': 10, 'medium': 0, 'long': -10, 'undefined': -5, False: 0}
        for record in self:
            signal = record.momentum_score # Momentum score already reflects weighted forces
            signal += window_adjustments.get(record.trigger_window, 0)
            if record.intensity_score: signal += (record.intensity_score - 5.5) * 3
            if record.contract_loss: signal += 15
            record.signal_strength = max(0, min(100, int(round(signal)))) # Use direct signal
            # _logger.debug(f"FA {record.id}: Final Signal Strength = {record.signal_strength}")
            
    # --- Action Methods ---
    def action_share_analysis(self): # Unchanged
        self.ensure_one()
        _logger.info("Sharing action triggered for Force Analysis %s", self.id)
        # Placeholder for sharing (e.g., PDF report). Full implementation in later phase.
        return self._notify_success(_('Sharing feature not fully implemented in this phase.'))

    def action_update_opportunity(self): # Logic uses refactored scores (push, pull, anxiety, habit) for momentum/risk
        self.ensure_one()
        if not self.lead_id: raise UserError(_("No related opportunity found."))
        risk_level = 'undefined'
        if self.momentum_score < 30: risk_level = 'high'
        elif self.momentum_score < 60: risk_level = 'medium'
        elif self.momentum_score >= 60: risk_level = 'low'
        vals_to_write = {
            'jtbd_momentum_score': self.momentum_score,
            'jtbd_signal_strength': self.signal_strength,
            'jtbd_trigger_window': self.trigger_window or 'undefined',
            'jtbd_contract_loss': self.contract_loss,
            'jtbd_risk_level': risk_level,
        }
        try:
            self.lead_id.write(vals_to_write)
            trigger_window_display = dict(self._fields['trigger_window'].selection).get(self.trigger_window or 'undefined', _('Undefined'))
            risk_level_display = dict(self.lead_id._fields['jtbd_risk_level'].selection).get(risk_level, _('Undefined'))
            body = _("Force Analysis '%(analysis_name)s' updated Opportunity:<br/>- Momentum Score: <strong>%(momentum)s</strong><br/>- Signal Strength: <strong>%(signal)s</strong><br/>- Decision Window: %(window)s<br/>- Risk Assessment: %(risk)s") % {
                'analysis_name': self.name, 'momentum': self.momentum_score, 'signal': self.signal_strength,
                'window': trigger_window_display, 'risk': risk_level_display,
            }
            self.lead_id.message_post(body=body, subtype_id=self.env.ref('mail.mt_note').id)
            return self._notify_success(_('Opportunity fields updated successfully.'))
        except Exception as e:
            _logger.error("Error updating opportunity from Force Analysis %s: %s", self.id, str(e))
            raise UserError(_("Failed to update opportunity fields: %s") % str(e))

    # --- Actions to Launch Common Force Wizard ---
    def _prepare_common_force_wizard_action(self, force_type):
        self.ensure_one()
        return {
            'name': _('Add Common %s Force') % force_type.capitalize(),
            'type': 'ir.actions.act_window',
            'view_mode': 'form',
            'res_model': 'jtbd.common.force.wizard',
            'target': 'new',
            'context': {'default_analysis_id': self.id, 'default_force_type': force_type,}}

    def action_add_common_push_force(self): return self._prepare_common_force_wizard_action('push')
    def action_add_common_pull_force(self): return self._prepare_common_force_wizard_action('pull')
    def action_add_common_anxiety_force(self): return self._prepare_common_force_wizard_action('anxiety')
    def action_add_common_habit_force(self): return self._prepare_common_force_wizard_action('habit')

    # --- Helper Methods ---
    def _notify_success(self, message): # Helper method to display a success notification toast
        return { 'type': 'ir.actions.client', 'tag': 'display_notification',
                 'params': {'title': _('Action Status'), 'message': message, 'sticky': False, 'type': 'success'}}
        
    def action_get_ai_force_suggestions(self):
        """ Action to get AI suggestions for potential forces. """
        self.ensure_one()
        _logger.info(f"AI Force Suggestion requested for Analysis {self.id} linked to Lead {self.lead_id.name if self.lead_id else 'None'}")

        if not self.lead_id:
            raise UserError(_("Cannot generate suggestions without a linked Opportunity."))

        # --- Phase 4: Prepare Context for AI ---
        context_data = {
            'lead_id': self.lead_id.id,
            'lead_name': self.lead_id.name,
            'job_statement': self.lead_id.jtbd_job_statement or '',
            'job_category': self.lead_id.jtbd_job_category_id.name if self.lead_id.jtbd_job_category_id else '',
            'job_quadrant': self.lead_id.jtbd_job_quadrant or '',
            'agency_size': self.lead_id.jtbd_agency_size or '',
            'current_tools': self.lead_id.jtbd_current_tools or '',
            'analysis_notes': self.notes or '',
            # Include existing forces to avoid duplicates?
            'existing_push': [f.name for f in self.push_force_ids],
            'existing_pull': [f.name for f in self.pull_force_ids],
            'existing_anxiety': [f.name for f in self.anxiety_force_ids],
            'existing_habit': [f.name for f in self.habit_force_ids],
        }
        _logger.debug(f"AI Force Suggestion Context Data: {context_data}")

        # --- Phase 4: Placeholder for API Call ---
        # Call n8n/AI service, passing context_data.
        # Expect response like: {'suggestions': [{'type': 'push', 'name': 'Suggested push force', 'impact': 'operational'}, ...]}
        # Process response and potentially:
        #  - Create new jtbd.force.item records directly? (Risky without review)
        #  - Display suggestions in chatter?
        #  - Open a wizard pre-filled with suggestions for user selection? (Most flexible)
        # For now, just notify.
        ai_suggestions = [ # Simulate some basic suggestions
            {'type': 'push', 'name': 'AI Suggested: Missed Revenue Opportunities?', 'impact': 'financial'},
            {'type': 'anxiety', 'name': 'AI Suggested: Team Training Time Concern?', 'impact': 'operational'}
        ]
        # --- End Placeholder ---

        # For now, post suggestions to chatter (replace with wizard/display later)
        if ai_suggestions:
            suggestion_html = "<ul>"
            for sug in ai_suggestions:
                suggestion_html += f"<li><b>{sug.get('type','?').capitalize()}:</b> {sug.get('name','?')} <i>({sug.get('impact','?')})</i></li>"
            suggestion_html += "</ul>"
            self.message_post(
                body=_("AI suggestions for potential forces:<br/>%s") % suggestion_html,
                message_type='comment', subtype_id=self.env.ref('mail.mt_comment').id
            )
            message = _("AI suggestions posted to chatter (Simulation).")
            msg_type = 'success'
        else:
            message = _("No AI suggestions generated (Simulation).")
            msg_type = 'warning'

        return { 'type': 'ir.actions.client', 'tag': 'display_notification',
                'params': {'title': _('AI Force Suggestions'), 'message': message, 'sticky': False, 'type': msg_type}}
