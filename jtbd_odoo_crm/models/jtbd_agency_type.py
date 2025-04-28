# -*- coding: utf-8 -*-
from odoo import models, fields

class JtbdAgencyType(models.Model):
    _name = 'jtbd.agency.type'
    _description = 'JTBD Agency Type'
    _order = 'name'

    name = fields.Char(string='Agency Type', required=True, translate=True)
    description = fields.Text(string='Description', translate=True)
    active = fields.Boolean(default=True)
    # Add relation back to patterns if needed
    # job_pattern_ids = fields.Many2many('jtbd.job.pattern', 'jtbd_job_pattern_agency_type_rel', 'agency_type_id', 'pattern_id', string='Applicable Job Patterns')