# models/project.py
from odoo import models, fields, api

class Project(models.Model):
    _inherit = 'project.project'
    # Project Profitability Fields
    x_cac = fields.Float(string='Customer Acquisition Cost')
    x_gross_margin = fields.Float(string='Gross Margin')

    # JTBD Fields
    x_opportunity_id = fields.Many2one('crm.lead', string='Related Opportunity')
    x_job_category = fields.Selection([
        ('Agency Growth', 'Agency Growth'),
        ('Reporting Automation', 'Reporting Automation'),
        ('Campaign Scaling', 'Campaign Scaling'),
        ('Margin Improvement', 'Margin Improvement'),
        ('Client Retention', 'Client Retention')
    ], string='Job Category')
    x_job_statement = fields.Text(string='Job Statement')
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
        ('In Progress', 'In Progress'),
        ('Complete', 'Complete')
    ], string='Outcome Status', default='Not Started')
    x_risk_level = fields.Selection([
        ('Low Risk', 'Low Risk'),
        ('Medium Risk', 'Medium Risk'),
        ('High Risk', 'High Risk')
    ], string='Risk Level', default='Low Risk')
    x_implementation_hours = fields.Integer(string='Implementation Hours')
    x_support_hours = fields.Integer(string='Support Hours')
    
    # Computed fields
    x_outcome_gap = fields.Float(string='Outcome Gap', compute='_compute_outcome_gap')
    x_progress_percentage = fields.Float(string='Progress Percentage', compute='_compute_progress_percentage')
    
    @api.depends('x_target_value', 'x_current_value')
    def _compute_outcome_gap(self):
        for project in self:
            project.x_outcome_gap = project.x_target_value - project.x_current_value if project.x_target_value and project.x_current_value else 0
    
    @api.depends('task_ids.stage_id')
    def _compute_progress_percentage(self):
        for project in self:
            total_tasks = len(project.task_ids)
            if total_tasks:
                completed_tasks = sum(1 for task in project.task_ids if task.stage_id.is_closed)
                project.x_progress_percentage = (completed_tasks / total_tasks) * 100
            else:
                project.x_progress_percentage = 0