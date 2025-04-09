# -*- coding: utf-8 -*-
import logging
from odoo import models, fields, api, _
from odoo.tools.safe_eval import safe_eval

_logger = logging.getLogger(__name__) # Add logger

class JtbdForceAnalysis(models.Model):
    _name = 'jtbd.force.analysis'
    _description = 'JTBD Force Analysis'
    _inherit = ['mail.thread', 'mail.activity.mixin'] # Add chatter
    _order = 'date desc, name'

    # Link to Opportunity
    lead_id = fields.Many2one(
        'crm.lead', string='Opportunity', required=True, ondelete='cascade',
        index=True, tracking=True
    )
    name = fields.Char(string='Analysis Name', required=True, tracking=True, default=lambda self: _('New Force Analysis'))
    date = fields.Date(string='Analysis Date', default=fields.Date.context_today, tracking=True, index=True)
    user_id = fields.Many2one(
        'res.users', string='Analyst', default=lambda self: self.env.user,
        tracking=True, index=True
    )
    company_id = fields.Many2one('res.company', related='lead_id.company_id', store=True) # Added company_id

    # Triggers & Context
    trigger_window = fields.Selection(
        [('immediate', 'Immediate (0-30 days)'),
         ('short', 'Short-term (1-3 months)'),
         ('medium', 'Medium-term (3-6 months)'),
         ('long', 'Long-term (6+ months)'),
         ('undefined', 'Undefined')],
        string='Decision Window', tracking=True, index=True,
        help="Estimated timeframe for the client's decision based on urgency."
    )
    intensity_score = fields.Integer(
        string='Pain Intensity', tracking=True,
        help="Overall intensity of pain/need on 1-10 scale, based on discovery."
    )
    contract_loss = fields.Boolean(
        string='Recent Contract Loss?', tracking=True,
        help="Did the agency recently lose a significant client or contract?"
    )
    contract_loss_details = fields.Text(
        string='Contract Loss Details',
        help="Details about the contract loss, if applicable."
    )

    # Force Items (One2many relations)
    push_force_ids = fields.One2many(
        'jtbd.force.item', 'analysis_id', string='Push Forces',
        domain=[('force_type', '=', 'push')],
        context={'default_force_type': 'push'} # Context for default type on creation
    )
    pull_force_ids = fields.One2many(
        'jtbd.force.item', 'analysis_id', string='Pull Forces',
        domain=[('force_type', '=', 'pull')],
        context={'default_force_type': 'pull'}
    )
    inertia_force_ids = fields.One2many(
        'jtbd.force.item', 'analysis_id', string='Inertia Forces',
        domain=[('force_type', '=', 'inertia')],
        context={'default_force_type': 'inertia'}
    )

    # Calculated Scores
    push_score = fields.Integer(
        string='Push Score', compute='_compute_scores', store=True,
        help="Aggregated strength of forces pushing away from the status quo (Max 50)."
    )
    pull_score = fields.Integer(
        string='Pull Score', compute='_compute_scores', store=True,
        help="Aggregated strength of forces pulling towards the new solution (Max 50)."
    )
    inertia_score = fields.Integer(
        string='Inertia Score', compute='_compute_scores', store=True,
        help="Aggregated strength of forces maintaining the status quo (Max 50)."
    )
    momentum_score = fields.Integer(
        string='Momentum Score', compute='_compute_momentum', store=True,
        help="Overall momentum towards adopting the solution (0-100)."
    )
    signal_strength = fields.Integer(
        string='Signal Strength', compute='_compute_signal_strength', store=True,
        help="Combined score (0-100) reflecting buying intent and decision urgency."
    )

    # Analysis Notes
    notes = fields.Html(
        string='Analysis Notes',
        help="Observations, recommendations, or additional context based on this analysis."
    )

    # --- Compute Methods ---
    @api.depends('push_force_ids.strength', 'pull_force_ids.strength', 'inertia_force_ids.strength')
    def _compute_scores(self):
        """Calculate aggregated scores for push, pull, and inertia forces."""
        for record in self:
            record.push_score = min(sum(record.push_force_ids.mapped('strength')), 50)
            record.pull_score = min(sum(record.pull_force_ids.mapped('strength')), 50)
            record.inertia_score = min(sum(record.inertia_force_ids.mapped('strength')), 50)

    @api.depends('push_score', 'pull_score', 'inertia_score')
    def _compute_momentum(self):
        """Calculate the momentum score based on the balance of forces."""
        for record in self:
            combined_force = record.push_score + record.pull_score
            total_resistance = record.inertia_score

            if combined_force == 0 and total_resistance == 0:
                record.momentum_score = 50 # Neutral if no forces identified
                continue

            # Calculate momentum based on the ratio of driving forces to total forces
            if (combined_force + total_resistance) > 0:
                momentum_ratio = combined_force / (combined_force + total_resistance)
                record.momentum_score = int(round(momentum_ratio * 100))
            else: # Should not happen if above condition works, but safety net
                record.momentum_score = 50

    @api.depends('momentum_score', 'trigger_window', 'intensity_score', 'contract_loss')
    def _compute_signal_strength(self):
        """Calculate signal strength based on momentum, urgency, intensity, and triggers."""
        window_adjustments = {
            'immediate': 20, # Boost for immediate need
            'short': 10,
            'medium': 0,
            'long': -10, # Reduce for long-term
            'undefined': -5, # Slight reduction for uncertainty
            False: 0 # Handle case where trigger_window is not set
        }
        for record in self:
            # Start with momentum
            signal = record.momentum_score

            # Adjust for trigger window urgency
            signal += window_adjustments.get(record.trigger_window, 0)

            # Adjust for pain intensity (scaled from 1-10)
            if record.intensity_score:
                # Scale intensity (1-10) to a range like -15 to +15
                intensity_adjustment = (record.intensity_score - 5.5) * 3
                signal += intensity_adjustment

            # Boost for significant trigger event
            if record.contract_loss:
                signal += 15 # Significant boost for contract loss

            # Ensure signal is within 0-100 range
            record.signal_strength = max(0, min(100, int(round(signal))))

    # --- Action Methods ---
    def action_share_analysis(self):
        """ Placeholder for sharing analysis (e.g., generating PDF/link). """
        self.ensure_one()
        # In a real scenario, this would trigger a report generation or sharing mechanism.
        # For now, just show a notification.
        _logger.info("Sharing action triggered for Force Analysis %s", self.id)
        return self._notify_success(_('Sharing feature is not implemented in this phase.'))

    def action_update_opportunity(self):
        """Update the related opportunity with key force analysis data."""
        self.ensure_one()
        if not self.lead_id:
            raise UserError(_("No related opportunity found for this analysis."))

        # Calculate risk level based on momentum
        risk_level = 'undefined'
        if self.momentum_score < 30:
            risk_level = 'high'
        elif self.momentum_score < 60:
            risk_level = 'medium'
        elif self.momentum_score >= 60:
            risk_level = 'low'

        vals_to_write = {
            'jtbd_momentum_score': self.momentum_score,
            'jtbd_signal_strength': self.signal_strength,
            'jtbd_trigger_window': self.trigger_window or 'undefined', # Ensure a value is set
            'jtbd_contract_loss': self.contract_loss,
            'jtbd_risk_level': risk_level,
        }

        try:
            self.lead_id.write(vals_to_write)

            # Post a note in the opportunity chatter
            trigger_window_display = dict(self._fields['trigger_window'].selection).get(self.trigger_window or 'undefined', _('Undefined'))
            risk_level_display = dict(self.lead_id._fields['jtbd_risk_level'].selection).get(risk_level, _('Undefined'))

            body = _(
                "Force Analysis '%(analysis_name)s' updated Opportunity:<br/>"
                "- Momentum Score: <strong>%(momentum)s</strong><br/>"
                "- Signal Strength: <strong>%(signal)s</strong><br/>"
                "- Decision Window: %(window)s<br/>"
                "- Risk Assessment: %(risk)s"
            ) % {
                'analysis_name': self.name,
                'momentum': self.momentum_score,
                'signal': self.signal_strength,
                'window': trigger_window_display,
                'risk': risk_level_display,
            }
            self.lead_id.message_post(body=body, subtype_id=self.env.ref('mail.mt_note').id)

            return self._notify_success(_('Opportunity fields updated successfully.'))

        except Exception as e:
            _logger.error("Error updating opportunity from Force Analysis %s: %s", self.id, str(e))
            raise UserError(_("Failed to update opportunity fields: %s") % str(e))

    def action_add_common_force(self):
        # This action will open the 'Common Force Wizard'
        self.ensure_one()
        # Wizard opening logic will be implemented later
        pass

    def _notify_success(self, message):
        """ Helper method to return a success notification. """
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
        
    def _prepare_common_force_wizard_action(self, force_type, force_options):
        """ Helper method to generate the action dictionary for the wizard. """
        self.ensure_one()
        return {
            'name': _('Add Common %s Force') % force_type.capitalize(),
            'type': 'ir.actions.act_window',
            'view_mode': 'form',
            'res_model': 'jtbd.common.force.wizard',
            'target': 'new',
            'context': {
                'default_analysis_id': self.id,
                'default_force_type': force_type,
                # Pass the options dictionary as a string in the context
                'force_options': str(force_options)
            }
        }

    def action_add_common_push_force(self):
        """ Opens the wizard to add common push forces. """
        self.ensure_one()
        common_push_forces = {
            'financial': [
                'Increasing costs with current approach',
                'Revenue loss due to inefficiency',
                'Cash flow pressure requiring change'
            ],
            'operational': [
                'Process bottlenecks causing delays',
                'Team burnout from manual work',
                'Quality issues with current approach'
            ],
            'competitive': [
                'Competitors gaining market share',
                'Industry changes demanding adaptation',
                'Client expectations evolving'
            ],
            'personal': [
                'Leadership frustration with status quo',
                'Stakeholder pressure for improvement',
                'Team dissatisfaction with tools'
            ],
            'strategic': [
                'Strategic pivot requiring new capabilities',
                'Growth targets impossible with current approach',
                'New market opportunity demanding change'
            ],
            'risk': [
                'Compliance failure risk',
                'Security vulnerabilities in current system',
                'Data integrity concerns'
            ],
            'other': [] # Allow adding custom ones later
        }
        return self._prepare_common_force_wizard_action('push', common_push_forces)

    def action_add_common_pull_force(self):
        """ Opens the wizard to add common pull forces. """
        self.ensure_one()
        common_pull_forces = {
            'financial': [
                'Potential to increase profit margins',
                'Reduced operational costs',
                'Improved revenue forecasting'
            ],
            'operational': [
                'Streamlined workflow efficiency',
                'Better resource allocation',
                'Reduced administrative overhead'
            ],
            'competitive': [
                'Enhanced competitive positioning',
                'Ability to serve more clients',
                'Differentiated service offering'
            ],
            'personal': [
                'Less stress for team members',
                'More time for strategic work',
                'Improved client relationships'
            ],
            'strategic': [
                'Alignment with long-term vision',
                'Platform for future growth',
                'New capability development'
            ],
            'risk': [
                'Improved compliance posture',
                'Enhanced data security',
                'Better audit trails'
            ],
            'other': []
        }
        return self._prepare_common_force_wizard_action('pull', common_pull_forces)

    def action_add_common_inertia_force(self):
        """ Opens the wizard to add common inertia forces. """
        self.ensure_one()
        common_inertia_forces = {
            'financial': [
                'Budget constraints limiting change',
                'Sunk costs in existing solutions',
                'Fear of implementation costs'
            ],
            'operational': [
                'Disruption concern during transition',
                'Limited implementation bandwidth',
                'Team change fatigue'
            ],
            'competitive': [
                'Current approach "good enough"',
                'Uncertainty about competitive advantage',
                'Other priorities taking precedence'
            ],
            'personal': [
                'Team resistance to new processes',
                'Comfort with existing systems',
                'Learning curve concerns'
            ],
            'strategic': [
                'Previous failed initiatives',
                'Leadership alignment issues',
                'Risk aversion culture'
            ],
            'risk': [
                'Uncertainty about new compliance requirements',
                'Fear of data migration risks',
                'Existing vendor relationship'
            ],
            'other': []
        }
        return self._prepare_common_force_wizard_action('inertia', common_inertia_forces)