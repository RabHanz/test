# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError

class JtbdForceItem(models.Model):
    _name = 'jtbd.force.item'
    _description = 'JTBD Force Item'
    _order = 'sequence, id'

    analysis_id = fields.Many2one(
        'jtbd.force.analysis', string='Analysis', required=True, ondelete='cascade', index=True
    )
    name = fields.Char(string='Force Description', required=True)
    # --- UPDATED SELECTION ---
    force_type = fields.Selection(
        [('push', 'Push (Away from Status Quo)'),
         ('pull', 'Pull (Towards New Solution)'),
         ('anxiety', 'Anxiety (About New Solution)'),
         ('habit', 'Habit (Attachment to Status Quo)')],
        string='Force Type', required=True, index=True
    )
    # --- END UPDATED SELECTION ---
    strength = fields.Integer(
        string='Strength', default=5, required=True,
        help="Strength of the force (1-10 scale)."
    )
    evidence = fields.Text(
        string='Evidence',
        help="Observations, quotes, or data supporting this force assessment."
    )
    impact_area = fields.Selection(
        [('financial', 'Financial'),
         ('operational', 'Operational'),
         ('competitive', 'Competitive'),
         ('personal', 'Personal'),
         ('strategic', 'Strategic'),
         ('risk', 'Risk/Compliance'),
         ('other', 'Other')],
        string='Impact Area', index=True,
        help="The primary area affected by this force."
    )
    sequence = fields.Integer(string='Sequence', default=10)

    # --- REMOVED jtbd_inertia_subtype ---

    @api.constrains('strength')
    def _check_strength(self):
        for record in self:
            if not (1 <= record.strength <= 10):
                raise ValidationError(_("Force strength must be between 1 and 10."))

    # --- REMOVED _check_inertia_subtype constraint ---