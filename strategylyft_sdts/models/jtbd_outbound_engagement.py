# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class JtbdOutboundEngagement(models.Model):
    _name = 'jtbd.outbound.engagement'
    _description = 'JTBD Outbound Engagement Log'
    _order = 'engagement_datetime desc'

    lead_id = fields.Many2one('crm.lead', string='Opportunity/Lead', required=True, ondelete='cascade', index=True)
    # Optional: Link to specific sequence/step that triggered this
    # sequence_id = fields.Many2one('jtbd.outbound.sequence', string='Sequence Template')
    # step_id = fields.Many2one('jtbd.outbound.step', string='Step Template')
    channel = fields.Selection([('email', 'Email'), ('linkedin', 'LinkedIn'), ('call', 'Call'), ('meeting', 'Meeting'), ('other', 'Other')], string='Channel', required=True, index=True)
    engagement_datetime = fields.Datetime(string='Engagement Time', default=fields.Datetime.now, required=True, index=True)
    summary = fields.Char(string='Engagement Summary', required=True, help="e.g., Sent Connection Request, Left Voicemail, Email Opened")
    response_type = fields.Selection([('none', 'No Response'), ('opened', 'Opened'), ('clicked', 'Clicked'), ('replied_pos', 'Replied (Positive)'), ('replied_neg', 'Replied (Negative)'), ('meeting_booked', 'Meeting Booked'), ('unsubscribed', 'Unsubscribed'), ('other', 'Other')], string='Response Type', index=True)
    response_details = fields.Text(string='Response Details')
    user_id = fields.Many2one('res.users', string='Performed By', default=lambda self: self.env.user)

    # Link outbound engagement back to the unified journey log eventually
    
    @api.model_create_multi
    def create(self, vals_list):
        engagements = super().create(vals_list)
        # Create corresponding Journey Event
        journey_event_model = self.env['jtbd.unified.journey.event']
        for eng in engagements:
            try:
                journey_event_model.create({
                    'lead_id': eng.lead_id.id,
                    'event_datetime': eng.engagement_datetime,
                    'event_type': 'outbound_touch' if not eng.response_type or eng.response_type == 'none' else 'outbound_response',
                    'source_system': 'outbound_seq', # Assuming created by external system
                    'channel': eng.channel,
                    'description': f"Outbound {eng.channel}: {eng.summary or eng.name}",
                    'related_record_ref': f'{eng._name},{eng.id}',
                    'details_json': eng.response_details,
                })
            except Exception as e:
                 _logger.error(f"Failed to create Journey Event for Outbound Engagement {eng.id}: {e}", exc_info=True)
        return engagements