# -*- coding: utf-8 -*-
from odoo import models, fields, api

class JtbdIntentSignal(models.Model):
    _name = 'jtbd.intent.signal'
    _description = 'JTBD Intent Signal Record'
    _order = 'timestamp desc, id desc' # Show newest first

    lead_id = fields.Many2one(
        'crm.lead', string='Opportunity/Lead', required=True, ondelete='cascade',
        index=True
    )
    signal_type = fields.Selection(
        [('content', 'Content Engagement'),
         ('website', 'Website Activity'),
         ('email', 'Email Engagement'),
         ('social', 'Social Media'),
         ('partner', 'Partner Activity'),
         ('search', 'Search Behavior'),
         ('event', 'Event Interaction'), # Added
         ('manual', 'Manual Entry/Observation'), # Added
         ('other', 'Other')],
        string='Signal Type', required=True, index=True
    )
    source = fields.Char(
        string='Source System/Detail', required=True, index=True,
        help="The specific source, e.g., 'Website Pricing Page', 'HubSpot Email Click', 'LinkedIn Comment', 'G2 Review'."
    )
    timestamp = fields.Datetime(
        string='Timestamp', required=True, default=fields.Datetime.now, index=True,
         help="Date and time the signal occurred or was recorded."
    )
    activity = fields.Char(
        string='Activity Description', required=True,
        help="Brief description of the action, e.g., 'Downloaded Whitepaper', 'Visited Page 3 Times', 'Opened Email'."
    )
    score = fields.Integer(
        string='Signal Score', default=5,
        help="Assigned strength/relevance score for this specific signal (e.g., 1-10)."
    )
    topic = fields.Char(
        string='Topic/Category', index=True,
        help="Keyword or category related to the signal content, e.g., 'Pricing', 'Team Efficiency'."
    )
    details = fields.Text(
        string='Details',
        help="Additional context or raw data associated with the signal."
    )
    # Link back to job category on the lead at the time signal was created? Optional.
    # related_job_category = fields.Selection(related='lead_id.jtbd_job_category', string="Lead's Job Category", store=False)

    # Could add user_id who logged it if manual
    # user_id = fields.Many2one('res.users', string='Logged By', default=lambda self: self.env.user)
    
    @api.model_create_multi
    def create(self, vals_list):
        signals = super().create(vals_list)
        # Create corresponding Journey Event
        journey_event_model = self.env['jtbd.unified.journey.event']
        for signal in signals:
            try:
                journey_event_model.create({
                    'lead_id': signal.lead_id.id,
                    'event_datetime': signal.timestamp,
                    'event_type': 'intent_signal',
                    'source_system': 'odoo_jtbd', # Or derive from signal.source if more granular
                    'channel': signal.signal_type, # Use signal type as channel? Or source?
                    'description': f"Intent Signal: {signal.activity or signal.name}",
                    'related_record_ref': f'{signal._name},{signal.id}',
                    'details_json': signal.details, # Pass details
                })
            except Exception as e:
                 _logger.error(f"Failed to create Journey Event for Intent Signal {signal.id}: {e}", exc_info=True)
        return signals

    # Optional: Override write? More complex - need to track changes.
    # Optional: Override unlink? Delete corresponding journey event?