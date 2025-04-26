# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
import logging

_logger = logging.getLogger(__name__)

# --- Model for Integration Logs ---
class JtbdIntegrationLog(models.Model):
    _name = 'jtbd.integration.log'
    _description = 'JTBD Integration Log'
    _order = 'timestamp desc, id desc'

    integration_id = fields.Many2one(
        'jtbd.integration.settings', string='Integration Setting', required=True, ondelete='cascade', index=True
    )
    timestamp = fields.Datetime(string='Timestamp', default=fields.Datetime.now, required=True, index=True)
    operation = fields.Selection(
        [('sync', 'Sync'), ('push', 'Push'), ('pull', 'Pull'),
         ('webhook', 'Webhook Received'), ('test', 'Connection Test'),
         ('auth', 'Authentication'), ('action', 'Automated Action'),
         ('cron', 'Scheduled Job'), # Added Cron
         ('error', 'Error Processing')],
        string='Operation', required=True, index=True
    )
    status = fields.Selection(
        [('success', 'Success'), ('warning', 'Warning'), ('error', 'Error')],
        string='Status', required=True, index=True
    )
    # Optional: Link to specific Odoo record involved, if applicable
    related_res_model = fields.Char(string="Related Model")
    related_res_id = fields.Integer(string="Related Record ID")
    related_record_ref = fields.Reference( # Use Reference for better display if model/id known
         lambda self: [(m.model, m.name) for m in self.env['ir.model'].search([])],
         compute='_compute_related_record_ref', store=False, string="Related Record"
    )

    message = fields.Text(string='Summary Message', required=True)
    details = fields.Text(string='Detailed Information / Payload')
    company_id = fields.Many2one('res.company', related='integration_id.company_id', store=True, readonly=True) # Added company_id

    @api.depends('related_res_model', 'related_res_id')
    def _compute_related_record_ref(self):
        for log in self:
             # Check if model exists in registry before creating reference string
             if log.related_res_model and log.related_res_id and log.related_res_model in self.env:
                 log.related_record_ref = f"{log.related_res_model},{log.related_res_id}"
             else:
                 log.related_record_ref = False # Set to False if model doesn't exist or IDs are missing