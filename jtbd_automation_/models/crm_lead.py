# models/crm_lead.py
from odoo import models, fields, api

class CrmLead(models.Model):
    _inherit = 'crm.lead'
    
    # JTBD Fields
    x_job_category = fields.Selection([
        ('Agency Growth', 'Agency Growth'),
        ('Reporting Automation', 'Reporting Automation'),
        ('Campaign Scaling', 'Campaign Scaling'),
        ('Margin Improvement', 'Margin Improvement'),
        ('Client Retention', 'Client Retention')
    ], string='Job Category')
    x_job_statement = fields.Text(string='Job Statement')
    x_current_solution = fields.Text(string='Current Solution')
    x_job_complexity = fields.Integer(string='Job Complexity', default=3)
    x_outcome_target = fields.Char(string='Outcome Target')
    x_outcome_metric = fields.Selection([
        ('reporting_time', 'Reporting Time'),
        ('onboarding_time', 'Onboarding Time'),
        ('campaign_roas', 'Campaign ROAS'),
        ('retention_rate', 'Retention Rate'),
        ('conversion_rate', 'Conversion Rate'),
        ('aov_increase', 'AOV Increase'),
        ('cac_reduction', 'CAC Reduction')
    ], string='Outcome Metric')
    x_target_value = fields.Float(string='Target Value')
    x_current_value = fields.Float(string='Current Value')
    x_outcome_status = fields.Selection([
        ('Not Started', 'Not Started'),
        ('Initial Setup', 'Initial Setup'),
        ('First Outcome', 'First Outcome')
    ], string='Outcome Status', default='Not Started')
    x_economic_impact = fields.Float(string='Economic Impact')
    x_mrr = fields.Float(string='MRR')
    x_contract_length = fields.Integer(string='Contract Length (Months)')
    x_implementation_hours = fields.Integer(string='Implementation Hours')
    x_support_hours = fields.Integer(string='Support Hours')
    x_risk_level = fields.Selection([
        ('Low Risk', 'Low Risk'),
        ('Medium Risk', 'Medium Risk'),
        ('High Risk', 'High Risk')
    ], string='Risk Level', default='Low Risk')
    
    # Computed fields
    x_outcome_gap = fields.Float(string='Outcome Gap', compute='_compute_outcome_gap')
    
    @api.depends('x_target_value', 'x_current_value')
    def _compute_outcome_gap(self):
        for lead in self:
            lead.x_outcome_gap = lead.x_target_value - lead.x_current_value if lead.x_target_value and lead.x_current_value else 0