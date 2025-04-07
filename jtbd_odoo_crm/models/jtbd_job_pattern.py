# -*- coding: utf-8 -*-

from odoo import models, fields, api

# Define selection values here to avoid duplication
JOB_CATEGORIES = [
    ('client_acquisition', 'Client Acquisition/Lead Generation'),
    ('positioning', 'Agency Positioning/Differentiation'),
    ('pricing_strategy', 'Pricing Strategy/Optimization'),
    ('team_efficiency', 'Team Efficiency/Workflows'),
    ('service_expansion', 'Service Expansion/Development'),
    ('client_retention', 'Client Retention/Satisfaction'),
    ('agency_scaling', 'Agency Scaling/Growth'),
    ('reporting_systems', 'Reporting/Analytics Systems'),
    ('other', 'Other'), # Added an 'Other' option
]

class JtbdJobPattern(models.Model):
    _name = 'jtbd.job.pattern'
    _description = 'JTBD Pattern'
    _order = 'sequence, name' # Added default order

    name = fields.Char(
        string='Pattern Name',
        required=True,
        help="A concise name for this JTBD pattern (e.g., 'Client Acquisition - Digital Marketing Agency')."
    )
    sequence = fields.Integer(default=10) # For ordering patterns
    active = fields.Boolean(default=True) # To easily activate/deactivate patterns

    job_category = fields.Selection(
        selection=JOB_CATEGORIES,
        string='Job Category',
        help="Select the primary job category this pattern relates to."
    )
    situation_template = fields.Text(
        string='Situation Template',
        help="Template text for the 'When...' part of the job statement."
    )
    motivation_template = fields.Text(
        string='Motivation Template',
        help="Template text for the 'I want to...' part of the job statement."
    )
    outcome_template = fields.Text(
        string='Outcome Template',
        help="Template text for the 'So I can...' part of the job statement."
    )
    # Renamed agency size fields for clarity based on Odoo 18 field names (avoiding x_)
    agency_size_min = fields.Integer(
        string='Min Agency Size',
        help="Minimum agency size (number of employees) this pattern typically applies to. 0 for no minimum."
    )
    agency_size_max = fields.Integer(
        string='Max Agency Size',
        help="Maximum agency size (number of employees) this pattern typically applies to. 0 for no maximum."
    )
    # Instead of linking directly to tools (which might not exist or change),
    # let's use tags or keywords for tech stack relevance.
    tech_stack_keywords = fields.Char(
        string='Related Tech Stack Keywords',
        help="Comma-separated keywords related to technology stacks (e.g., 'HubSpot, Salesforce, SEO Tools')."
    )
    # Added description/notes field
    notes = fields.Text(
        string='Notes',
        help="Internal notes or further details about this pattern."
    )