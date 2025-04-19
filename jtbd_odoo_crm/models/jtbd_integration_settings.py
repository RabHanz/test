# -*- coding: utf-8 -*-

from odoo import models, fields

class JtbdIntegrationSettings(models.Model):
    _name = 'jtbd.integration.settings'
    _description = 'JTBD Integration Settings (Placeholder)'

    name = fields.Char(string='Integration Name', required=True)
    active = fields.Boolean(default=True)
    # Add more fields later as per Phase 5 requirements
    notes = fields.Text(string="Configuration Notes")

    # This is a placeholder model for Phase 1.
    # Full implementation will be in a later phase.