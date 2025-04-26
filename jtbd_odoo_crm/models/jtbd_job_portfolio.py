# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class JtbdJobPortfolioLine(models.Model):
    """ Represents a single Job Pattern within a Portfolio, with weighting """
    _name = 'jtbd.job.portfolio.line'
    _description = 'JTBD Job Portfolio Line'
    _order = 'priority_weight desc, id'

    portfolio_id = fields.Many2one('jtbd.job.portfolio', string='Portfolio', required=True, ondelete='cascade')
    job_pattern_id = fields.Many2one('jtbd.job.pattern', string='Job Pattern', required=True, ondelete='cascade')
    # Simple weighting for now, could be more complex (e.g., percentage)
    priority_weight = fields.Integer(
        string='Priority Weight', default=5,
        help="Relative importance or priority of this job within the portfolio (e.g., 1-10)."
    )
    notes = fields.Text(string='Notes')

    # Add constraint to ensure unique job pattern per portfolio
    _sql_constraints = [
        ('job_pattern_portfolio_uniq', 'unique(portfolio_id, job_pattern_id)',
         'Each Job Pattern can only appear once in a portfolio!')
    ]

class JtbdJobPortfolio(models.Model):
    _name = 'jtbd.job.portfolio'
    _description = 'JTBD Job Portfolio Analysis'
    _order = 'create_date desc'
    _rec_name = 'display_name' # Use a computed display name

    display_name = fields.Char(compute='_compute_display_name', store=True)
    lead_id = fields.Many2one(
        'crm.lead', string='Opportunity/Lead', required=True, index=True, ondelete='cascade',
        help="The opportunity this job portfolio analysis relates to."
    )
    # Using One2many to a line model for weights and potentially other attributes
    portfolio_line_ids = fields.One2many(
        'jtbd.job.portfolio.line', 'portfolio_id', string='Job Patterns in Portfolio'
    )
    # Text fields for initial simplicity, could become relational later
    interrelationships = fields.Text(
        string='Job Interrelationships',
        help="Describe how the different jobs in this portfolio relate to or influence each other (e.g., dependencies, synergies)."
    )
    conflicts = fields.Text(
        string='Potential Conflicts',
        help="Describe any potential conflicts or trade-offs between the different jobs in the portfolio."
    )
    analysis_date = fields.Date(string='Analysis Date', default=fields.Date.context_today)
    analyst_id = fields.Many2one('res.users', string='Analyst', default=lambda self: self.env.user)
    company_id = fields.Many2one('res.company', compute='_compute_company_id', store=True, readonly=True)

    @api.depends('lead_id.name', 'create_date')
    def _compute_display_name(self):
        for record in self:
            name = _("Job Portfolio")
            if record.lead_id:
                name += f" - {record.lead_id.name}"
            if record.create_date:
                 name += f" ({record.create_date.strftime('%Y-%m-%d')})"
            record.display_name = name

    @api.depends('lead_id.company_id')
    def _compute_company_id(self):
         for record in self:
             record.company_id = record.lead_id.company_id or self.env.company