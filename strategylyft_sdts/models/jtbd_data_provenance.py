# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class JtbdDataProvenance(models.Model):
    _name = 'jtbd.data.provenance'
    _description = 'JTBD Data Provenance Record'
    _order = 'record_write_date desc, id desc' # Order by when the linked record was last updated

    name = fields.Char(compute='_compute_name', store=True)

    # Link to the record this provenance applies to
    res_model_id = fields.Many2one('ir.model', string='Source Model', index=True, required=True, ondelete='cascade')
    res_id = fields.Integer(string='Source Record ID', index=True, required=True)
    # Optional: Generic Reference field for easier linking in UI
    # source_record = fields.Reference(lambda self: [(m.model, m.name) for m in self.env['ir.model'].search([])], string="Source Record", compute='_compute_source_record', store=False)

    # Provenance Details
    data_source_label = fields.Selection(
        [ # Align with PRD3 Enhanced Flow Diagram + common types
         ('funnel_1', 'Funnel 1: Webinar'),
         ('funnel_2', 'Funnel 2: Quiz'),
         ('funnel_3', 'Funnel 3: Ad Response'),
         ('scraped_web', 'Scraped - Web Forum'),
         ('scraped_social', 'Scraped - Social Media'),
         ('scraped_other', 'Scraped - Other'),
         ('manual_crm', 'Manual CRM Entry'),
         ('manual_discovery', 'Manual Discovery Call'),
         ('survey', 'Survey Data'),
         ('partner', 'Partner Referral'),
         ('support_ticket', 'Support Ticket'),
         ('website_behavior', 'Website Behavior'),
         ('email_engagement', 'Email Engagement'),
         ('outbound_research', 'Outbound Research'),
         ('unknown', 'Unknown Origin'),
         ('other', 'Other Source')],
        string='Data Source Label', index=True, required=True
    )
    source_reference = fields.Char(string='Source Specific Ref', help="e.g., URL, Ticket ID, Campaign Name, File Name")
    ingestion_datetime = fields.Datetime(string='Ingestion Time', default=fields.Datetime.now)
    source_confidence_score = fields.Float(
        string='Source Confidence Score', digits=(3, 2), # e.g., 0.95
        help="Confidence score (0.0 to 1.0) based on the reliability of the source label."
    )
    # Optional: Link to the specific integration setting if ingested automatically
    integration_setting_id = fields.Many2one('jtbd.integration.settings', string='Ingested Via', ondelete='set null')

    # Keep track of when the source record was last known updated for this provenance info
    record_write_date = fields.Datetime(string='Record Last Updated Ref', index=True)

    # Helper to link back for easier navigation
    # This assumes only one provenance record per Odoo record, which might be too simple.
    # A Many2one from the Odoo record to the *latest* provenance might be better.
    # For now, let's keep it simple.

    @api.depends('res_model_id', 'res_id', 'data_source_label')
    def _compute_name(self):
        for record in self:
            name = _("Provenance")
            if record.res_model_id and record.res_id:
                 name += f" [{record.res_model_id.model} ID:{record.res_id}]"
            if record.data_source_label:
                 label_display = dict(self._fields['data_source_label'].selection).get(record.data_source_label, record.data_source_label)
                 name += f" ({label_display})"
            record.name = name

    # Compute source_record helper if needed
    # @api.depends('res_model_id', 'res_id')
    # def _compute_source_record(self):
    #    for record in self:
    #        if record.res_model_id and record.res_id and record.res_model_id.model in self.env:
    #            record.source_record = f"{record.res_model_id.model},{record.res_id}"
    #        else:
    #            record.source_record = False