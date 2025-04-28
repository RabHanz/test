# -*- coding: utf-8 -*-

from odoo import models, fields, api

class JtbdOutcomePattern(models.Model):
    _name = 'jtbd.outcome.pattern'
    _description = 'JTBD Outcome Pattern'
    _order = 'sequence, name'

    name = fields.Char(string='Pattern Name', required=True)
    sequence = fields.Integer(default=10)
    active = fields.Boolean(default=True)

    job_category_id = fields.Many2one(
        'jtbd.job.category', string='Job Category', required=True, index=True,
        ondelete='restrict',
        help="The job category this outcome pattern typically applies to."
    )
    primary_metric = fields.Char(
        string='Primary Metric Template', required=True,
        help="Template for the primary outcome metric (e.g., 'Lead Conversion Rate')."
    )
    metric_unit_template = fields.Char(
        string='Metric Unit Template',
        help="Template for the unit of measure (e.g., '%', 'Days', '$')."
    )
    is_percentage_template = fields.Boolean(
        string='Is Percentage Template',
        help="Is the primary metric typically a percentage?"
    )
    additional_metrics = fields.Text(
        string='Additional Metric Templates',
        help="Templates for additional metrics, one per line (e.g., 'Lead Volume\nCost Per Lead')."
    )
    typical_milestone_1 = fields.Char(
        string='Typical First Milestone Template',
        help="Template description for a common first milestone."
    )
    typical_milestone_2 = fields.Char(
        string='Typical Second Milestone Template',
        help="Template description for a common second milestone."
    )
    typical_milestone_3 = fields.Char(
        string='Typical Third Milestone Template',
        help="Template description for a common third milestone."
    )
    white_space_suggestions = fields.Text(
        string='White Space Suggestion Templates',
        help="Templates for potential white space opportunities related to this pattern."
    )
    notes = fields.Text(string='Notes')