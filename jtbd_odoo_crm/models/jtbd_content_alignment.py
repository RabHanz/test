# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError

class JtbdContentAlignment(models.Model):
    _name = 'jtbd.content.alignment'
    _description = 'JTBD Content Alignment Analysis'
    _order = 'create_date desc'

    name = fields.Char(compute='_compute_name', store=True, readonly=False) # Allow manual override

    # Link to the Job Pattern or potentially the Lead/Opportunity
    job_pattern_id = fields.Many2one(
        'jtbd.job.pattern', string='Job Pattern', index=True, ondelete='set null',
        help="The specific job pattern this content is evaluated against."
    )
    lead_id = fields.Many2one(
         'crm.lead', string='Opportunity/Lead', index=True, ondelete='cascade',
        help="The specific opportunity this content analysis relates to (optional)."
    )

    # Link to the Content Itself
    # Using ir.attachment allows linking various file types or URLs easily initially
    content_attachment_id = fields.Many2one(
        'ir.attachment', string='Content Attachment', ondelete='set null',
        help="Link to the specific content piece (e.g., proposal, webpage screenshot, blog post PDF)."
    )
    content_url = fields.Char(string='Content URL') # Alternative for web content
    content_description = fields.Text(string='Content Description') # Manual description

    # Analysis Fields (Populated manually or via AI/Automation later)
    alignment_score = fields.Float(
        string='Alignment Score (%)', digits=(16, 1), # Use digits for precision
        help="Score (0-100) indicating how well the content addresses the target job pattern."
    )
    improvement_suggestions = fields.Text(
        string='Improvement Suggestions',
        help="Specific suggestions on how to improve the content's alignment."
    )
    analysis_date = fields.Date(string='Analysis Date', default=fields.Date.context_today)
    analyst_id = fields.Many2one('res.users', string='Analyst', default=lambda self: self.env.user)

    # Performance Link (Placeholder - requires more complex model/integration later)
    # performance_metric_ids = fields.One2many('jtbd.content.performance', 'alignment_id', 'Performance Metrics')
    performance_notes = fields.Text(string="Performance Notes (Manual)")

    company_id = fields.Many2one('res.company', compute='_compute_company_id', store=True, readonly=True)

    @api.depends('job_pattern_id', 'content_attachment_id', 'content_url', 'lead_id', 'create_date')
    def _compute_name(self):
        for record in self:
            name_parts = [_("Content Align")]
            if record.job_pattern_id: name_parts.append(record.job_pattern_id.name)
            elif record.lead_id: name_parts.append(record.lead_id.name)
            content_ref = record.content_attachment_id.name or record.content_url or _("Unknown Content")
            name_parts.append(content_ref)
            if record.create_date: name_parts.append(record.create_date.strftime('%Y-%m-%d'))
            record.name = " - ".join(name_parts)

    @api.depends('lead_id.company_id')
    def _compute_company_id(self):
         for record in self:
             record.company_id = record.lead_id.company_id or self.env.company

    # --- Validation Constraint ---
    @api.constrains('alignment_score')
    def _check_alignment_score(self):
        for record in self:
             # Float check (0.0-1.0)
             if record.alignment_score is not None and not (0.0 <= record.alignment_score <= 1.0):
                 raise ValidationError(_("Alignment Score percentage must be between 0%% and 100%%."))
    # --- End Validation Constraint ---

# Placeholder for performance metric model if needed later
# class JtbdContentPerformance(models.Model):
#     _name = 'jtbd.content.performance'
#     _description = 'Content Performance Metric'
#     alignment_id = fields.Many2one('jtbd.content.alignment', required=True, ondelete='cascade')
#     metric_name = fields.Char(required=True)
#     metric_value = fields.Float()
#     metric_date = fields.Date()