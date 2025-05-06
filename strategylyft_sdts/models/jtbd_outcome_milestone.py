# -*- coding: utf-8 -*-

from odoo import models, fields, api, _

class JtbdOutcomeMilestone(models.Model):
    _name = 'jtbd.outcome.milestone'
    _description = 'JTBD Outcome Milestone'
    _order = 'sequence, target_date, id' # Order by sequence, then date

    mapping_id = fields.Many2one(
        'jtbd.outcome.mapping', string='Outcome Mapping', required=True, ondelete='cascade',
        index=True
    )
    sequence = fields.Integer(string='Sequence', default=10)
    name = fields.Char(string='Milestone', required=True)
    target_date = fields.Date(string='Target Date', index=True)
    target_value = fields.Float(
        string='Target Value at Milestone',
        help="Expected value of the primary outcome metric at this milestone."
    )
    achieved = fields.Boolean(string='Achieved', index=True)
    actual_date = fields.Date(
        string='Actual Date', readonly=True, # Set when achieved toggled
        help="Date the milestone was actually achieved."
    )
    actual_value = fields.Float(
        string='Actual Value at Milestone', readonly=True, # Set when achieved toggled
        help="Actual value of the primary outcome metric when achieved."
    )
    notes = fields.Text(string='Notes')
    
    # --- Fields for Value Realization Context ---
    verification_method = fields.Selection(
        [('report', 'Report/Dashboard Screenshot'),
         ('client_confirmation', 'Client Confirmation (Email/Doc)'),
         ('system_data', 'System Data Extract'),
         ('demo', 'Live Demo/Walkthrough'),
         ('other', 'Other')],
        string="Verification Method",
        help="How was the achievement of this milestone verified?"
    )
    verification_attachment_ids = fields.Many2many(
        'ir.attachment',
        'jtbd_milestone_verification_attachment_rel', # Relation table
        'milestone_id', 'attachment_id', # Column names
        string="Verification Evidence",
        help="Upload documents, screenshots, or links supporting milestone achievement."
    )
    # --- End Value Realization Context ---

    # Override write to set actual_date/value when achieved is toggled
    def write(self, vals):
        if 'achieved' in vals:
            today = fields.Date.context_today(self)
            primary_metric_val = self.mapping_id.current_value # Get current value at time of completion
            for record in self:
                if vals['achieved']: # If marking as achieved
                    vals['actual_date'] = vals.get('actual_date', today)
                    vals['actual_value'] = vals.get('actual_value', primary_metric_val)
                else: # If unchecking achieved
                    vals['actual_date'] = False
                    vals['actual_value'] = False
        return super().write(vals)