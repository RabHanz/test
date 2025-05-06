# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class JtbdOutboundSequence(models.Model):
    _name = 'jtbd.outbound.sequence'
    _description = 'JTBD Outbound Engagement Sequence Template'
    _order = 'name'

    name = fields.Char(string='Sequence Name', required=True, index=True)
    description = fields.Text(string='Description')
    active = fields.Boolean(default=True)
    # Link to steps
    step_ids = fields.One2many('jtbd.outbound.step', 'sequence_id', string='Sequence Steps')
    # Optional: Link to target criteria (e.g., Job Category, Tier)
    target_job_category_ids = fields.Many2many('jtbd.job.category', string='Target Job Categories')
    target_account_tier = fields.Selection([('strategic', 'Strategic'), ('target', 'Target')], string='Target Account Tier')

    # Count leads currently using this sequence (for reporting)
    active_lead_count = fields.Integer(compute='_compute_active_lead_count')

    def _compute_active_lead_count(self):
        # Placeholder: Real count might need linking lead back to sequence instance, not just template ID
        for seq in self:
            seq.active_lead_count = 0 # Update later if lead tracks active sequence

class JtbdOutboundStep(models.Model):
    _name = 'jtbd.outbound.step'
    _description = 'JTBD Outbound Sequence Step Template'
    _order = 'sequence, id'

    sequence_id = fields.Many2one('jtbd.outbound.sequence', string='Sequence', required=True, ondelete='cascade')
    name = fields.Char(string='Step Name', required=True)
    sequence = fields.Integer(default=10)
    channel = fields.Selection([('email', 'Email'), ('linkedin', 'LinkedIn Message/Connect'), ('call', 'Phone Call'), ('other', 'Other')], string='Channel', required=True)
    delay_days = fields.Integer(string='Delay (Days)', default=3, help="Delay in days after previous step (or sequence start).")
    template_subject = fields.Char(string='Subject/Headline Template')
    template_body = fields.Text(string='Body/Script Template')
    notes = fields.Text(string='Internal Notes')