# -*- coding: utf-8 -*-

from odoo import models, fields, api, _

class JtbdAdditionalOutcome(models.Model):
    _name = 'jtbd.additional.outcome'
    _description = 'JTBD Additional Outcome'
    _order = 'sequence, id'

    mapping_id = fields.Many2one(
        'jtbd.outcome.mapping', string='Outcome Mapping', required=True, ondelete='cascade',
        index=True
    )
    sequence = fields.Integer(string='Sequence', default=10)
    name = fields.Char(string='Outcome Description', required=True)
    metric = fields.Char(
        string='Metric', required=True,
        help="The metric used to measure this outcome."
    )
    current_value = fields.Float(string='Current Value')
    target_value = fields.Float(string='Target Value')
    metric_unit = fields.Char(string='Unit of Measure')
    is_percentage = fields.Boolean(string='Is Percentage')
    priority = fields.Selection(
        [('high', 'High'), ('medium', 'Medium'), ('low', 'Low')],
        string='Priority', default='medium', index=True
    )
    notes = fields.Text(string='Notes') # Added notes field