# models/project_task.py
from odoo import models, fields, api

class ProjectTask(models.Model):
    _inherit = 'project.task'
    
    # JTBD Fields
    x_task_type = fields.Selection([
        ('Assessment', 'Assessment'),
        ('Implementation', 'Implementation'),
        ('Training', 'Training'),
        ('Review', 'Review'),
        ('Milestone', 'Milestone')
    ], string='Task Type')
    x_task_phase = fields.Selection([
        ('Discovery', 'Discovery'),
        ('Setup', 'Setup'),
        ('Training', 'Training'),
        ('Optimization', 'Optimization'),
        ('Verification', 'Verification')
    ], string='Task Phase')
    x_estimated_hours = fields.Float(string='Estimated Hours')
    x_jtbd_context = fields.Html(string='JTBD Context')
    x_deliverables = fields.Html(string='Deliverables')
    x_definition_of_done = fields.Html(string='Definition of Done')
    
    # Computed fields
    x_hours_variance = fields.Float(string='Hours Variance', compute='_compute_hours_variance')
    
    @api.depends('effective_hours', 'x_estimated_hours')
    def _compute_hours_variance(self):
        for task in self:
            task.x_hours_variance = task.effective_hours - task.x_estimated_hours if task.effective_hours and task.x_estimated_hours else 0