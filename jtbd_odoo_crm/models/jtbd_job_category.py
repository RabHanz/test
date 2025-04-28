# -*- coding: utf-8 -*-
from odoo import models, fields

class JtbdJobCategory(models.Model):
    _name = 'jtbd.job.category'
    _description = 'JTBD Job Category'
    _order = 'sequence, name'

    name = fields.Char(string='Category Name', required=True, translate=True)
    description = fields.Text(string='Description', translate=True)
    sequence = fields.Integer(default=10)
    active = fields.Boolean(default=True)
    # Add related job patterns if needed for navigation/reporting
    # job_pattern_ids = fields.One2many('jtbd.job.pattern', 'job_category_id', string='Job Patterns')