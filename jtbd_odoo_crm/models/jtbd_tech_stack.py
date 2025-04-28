# -*- coding: utf-8 -*-
from odoo import models, fields

class JtbdTechStack(models.Model):
    _name = 'jtbd.tech.stack'
    _description = 'JTBD Technology Stack Item'
    _order = 'name'

    name = fields.Char(string='Technology/Tool Name', required=True)
    description = fields.Text(string='Description')
    category = fields.Selection([ # Optional categorization
        ('crm', 'CRM'), ('marketing_auto', 'Marketing Automation'), ('pm', 'Project Management'),
        ('analytics', 'Analytics'), ('dev', 'Development'), ('design', 'Design'), ('other', 'Other')
    ], string='Category')
    active = fields.Boolean(default=True)
    # Add relation back to patterns if needed
    # job_pattern_ids = fields.Many2many('jtbd.job.pattern', 'jtbd_job_pattern_tech_stack_rel', 'tech_stack_id', 'pattern_id', string='Applicable Job Patterns')