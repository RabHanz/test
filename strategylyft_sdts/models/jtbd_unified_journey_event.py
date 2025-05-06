# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class JtbdUnifiedJourneyEvent(models.Model):
    _name = 'jtbd.unified.journey.event'
    _description = 'Unified Customer Journey Event Log'
    _order = 'event_datetime desc, id desc'

    name = fields.Char(compute='_compute_name', store=True) # Auto-generated name

    lead_id = fields.Many2one(
        'crm.lead', string='Opportunity/Lead', index=True, ondelete='cascade',
        help="The primary lead/opportunity this event relates to."
    )
    partner_id = fields.Many2one(
        'res.partner', string='Contact/Company', index=True, ondelete='set null',
        related='lead_id.partner_id', store=True, # Store related partner for easier querying
        help="Contact or Company associated with the event."
    )
    event_datetime = fields.Datetime(
        string='Event Timestamp', default=fields.Datetime.now, required=True, index=True
    )
    event_type = fields.Selection(
        [('intent_signal', 'Intent Signal'),
         ('outbound_touch', 'Outbound Touch'),
         ('outbound_response', 'Outbound Response'),
         ('website_visit', 'Website Visit'), # Future
         ('content_view', 'Content View/Download'), # Future
         ('form_submission', 'Form Submission'), # Future
         ('crm_activity', 'CRM Activity Logged'), # e.g., Call, Meeting
         ('stage_change', 'CRM Stage Change'),
         ('status_change', 'Progression Status Change'), # Link to jtbd_contact_progression_status
         ('other', 'Other System Event')],
        string='Event Type', required=True, index=True
    )
    source_system = fields.Selection(
        [('odoo_crm', 'Odoo CRM'),
         ('odoo_jtbd', 'Odoo JTBD Module'), # e.g., Force Analysis update
         ('web_scrape', 'Web Scraper'), # From JTBD Radar
         ('social_listen', 'Social Listening'), # From JTBD Radar
         ('funnel_1', 'Funnel 1: Webinar'), # Example Funnel
         ('funnel_2', 'Funnel 2: Quiz'), # Example Funnel
         ('funnel_3', 'Funnel 3: Ad Response'), # Example Funnel
         ('outbound_seq', 'Outbound Sequencer'), # External Tool
         ('marketing_auto', 'Marketing Automation'), # External Tool
         ('website', 'Website Analytics'), # External Tool
         ('manual', 'Manual Entry'),
         ('other', 'Other')],
        string='Source System', index=True,
        help="The system or process that originated this event log."
    )
    channel = fields.Char( # More flexible than selection for varied sources
        string='Channel/Sub-Source', index=True,
        help="Specific channel or sub-source, e.g., 'Email', 'LinkedIn', 'Pricing Page', 'PPC Campaign XYZ'."
    )
    description = fields.Text(
        string='Event Description', required=True,
        help="Description of the specific event or interaction."
    )
    # Link to related Odoo records if applicable
    related_record_ref = fields.Reference(
         lambda self: [(m.model, m.name) for m in self.env['ir.model'].search([])],
         string="Related Odoo Record",
         help="Link to a specific Odoo record (e.g., Intent Signal, Outbound Engagement, Mail Message, Project Task)."
    )
    # Link to external data if needed
    external_data_ref = fields.Char(string="External Data Reference")
    details_json = fields.Text(string="Details (JSON)", help="Store additional structured data if needed.")

    company_id = fields.Many2one('res.company', related='lead_id.company_id', store=True, readonly=True)

    @api.depends('lead_id.name', 'event_type', 'event_datetime')
    def _compute_name(self):
        for record in self:
             type_display = dict(self._fields['event_type'].selection).get(record.event_type, record.event_type)
             name = f"{type_display}"
             if record.lead_id: name += f" - {record.lead_id.name}"
             if record.event_datetime: name += f" ({record.event_datetime.strftime('%Y-%m-%d %H:%M')})"
             record.name = name