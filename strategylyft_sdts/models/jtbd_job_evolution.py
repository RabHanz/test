# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class JtbdJobEvolution(models.Model):
    _name = 'jtbd.job.evolution'
    _description = 'JTBD Job Evolution Tracking'
    _order = 'change_date desc, id desc'

    # Link to the primary CRM record (Lead/Opportunity)
    lead_id = fields.Many2one(
        'crm.lead', string='Opportunity/Lead', index=True, ondelete='cascade',
        help="The opportunity whose job evolution is being tracked."
    )
    # Could also link to a specific job pattern if tracking evolution of specific patterns
    job_pattern_id = fields.Many2one(
        'jtbd.job.pattern', string='Job Pattern (Optional)', index=True, ondelete='set null',
         help="Specific job pattern this evolution relates to, if applicable."
    )
    change_date = fields.Datetime(
        string='Change Date', default=fields.Datetime.now, required=True, index=True,
        help="When this change or observation occurred."
    )
    previous_state_description = fields.Text(
        string='Previous State/Job Description',
        help="Description of the job or situation before this change."
    )
    new_state_description = fields.Text(
        string='New State/Job Description',
        help="Description of the job or situation after this change."
    )
    transition_trigger = fields.Text( # Using Text for simplicity now
        string='Transition Trigger(s)',
        help="What event(s) or insight(s) triggered this evolution?"
    )
    maturity_indicator = fields.Text( # Using Text for simplicity now
        string='Maturity Indicator(s)',
        help="Indicators suggesting a change in job maturity level."
    )
    user_id = fields.Many2one(
        'res.users', string='Logged By', default=lambda self: self.env.user,
        help="User who recorded this evolution entry."
    )
    notes = fields.Text(string='Notes')

    # Future fields could include linking previous/next evolution records (previous_states/evolution_timeline in PRD)
    # previous_evolution_id = fields.Many2one('jtbd.job.evolution', 'Previous State')
    # next_evolution_ids = fields.One2many('jtbd.job.evolution', 'previous_evolution_id', 'Next States')