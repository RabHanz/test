# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError

class JtbdKnowledgeTransferComponent(models.Model):
    """ Line item for a piece of knowledge or asset being transferred. """
    _name = 'jtbd.knowledge.transfer.component'
    _description = 'JTBD Knowledge Transfer Component'
    _order = 'sequence, name'

    transfer_id = fields.Many2one('jtbd.knowledge.transfer', string='Transfer Record', required=True, ondelete='cascade')
    name = fields.Char(string='Component/Artifact', required=True, help="e.g., Job Statement, Force Analysis Summary, Outcome Metrics")
    description = fields.Text(string='Details/Location', help="Notes on the component or link to its location.")
    status = fields.Selection([('pending', 'Pending'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('verified', 'Verified')], string='Status', default='pending')
    verification_notes = fields.Text(string='Verification Notes')
    sequence = fields.Integer(default=10)

class JtbdKnowledgeTransfer(models.Model):
    _name = 'jtbd.knowledge.transfer'
    _description = 'JTBD Knowledge Transfer Record'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'
    _rec_name = 'name'

    name = fields.Char(string='Transfer Reference', required=True, default=lambda self: _('New Knowledge Transfer'))
    project_id = fields.Many2one(
        'project.project', string='Related Project', index=True, ondelete='cascade',
        help="Project this knowledge transfer relates to."
    )
    lead_id = fields.Many2one(
        'crm.lead', string='Related Opportunity', index=True, ondelete='set null',
         help="Original opportunity related to this transfer (optional)."
    )
    # Using standard crm.team for now
    source_team_id = fields.Many2one(
        'crm.team', string='Source Team', index=True,
         help="Team transferring the knowledge (e.g., Sales)."
    )
    target_team_id = fields.Many2one(
        'crm.team', string='Target Team', index=True,
        help="Team receiving the knowledge (e.g., Delivery)."
    )
    # Link to relevant patterns for context
    job_pattern_ids = fields.Many2many(
        'jtbd.job.pattern', string='Relevant Job Patterns',
        help="Job patterns relevant to this transfer."
    )
    # One2many for detailed components/checklist
    component_ids = fields.One2many(
        'jtbd.knowledge.transfer.component', 'transfer_id', string='Transfer Components / Checklist'
    )
    # Overall status and completion
    completion_status = fields.Float(
        string='Completion (%)', compute='_compute_completion_status', store=True, digits=(16, 1),
        help="Percentage of components marked as completed or verified."
    )
    transfer_status = fields.Selection(
        [('draft', 'Draft'),
         ('in_progress', 'In Progress'),
         ('pending_verification', 'Pending Verification'),
         ('completed', 'Completed'),
         ('cancelled', 'Cancelled')],
        string='Overall Status', default='draft', tracking=True, index=True
    )
    notes = fields.Html(string='General Notes')
    company_id = fields.Many2one('res.company', compute='_compute_company_id', store=True, readonly=True)

    @api.depends('component_ids.status')
    def _compute_completion_status(self):
        for record in self:
            total_components = len(record.component_ids)
            if not total_components:
                record.completion_status = 0.0
                continue
            # Consider 'completed' and 'verified' as done for percentage calculation
            completed_components = len(record.component_ids.filtered(lambda c: c.status in ('completed', 'verified')))
            record.completion_status = (completed_components / total_components) * 100.0 if total_components > 0 else 0.0

    @api.depends('project_id.company_id', 'lead_id.company_id')
    def _compute_company_id(self):
         for record in self:
             record.company_id = record.project_id.company_id or record.lead_id.company_id or self.env.company
             
    # --- Validation Constraint ---
    @api.constrains('completion_status')
    def _check_completion_status(self):
        # This is computed, but good to validate range just in case
        for record in self:
             if not (0 <= record.completion_status <= 100):
                 _logger.error(f"Knowledge Transfer {record.id} computed completion status out of range: {record.completion_status}")
                 # Don't raise validation error on computed field, just log
                 # raise ValidationError(_("Completion Status must be between 0 and 100."))
    # --- End Validation Constraint ---