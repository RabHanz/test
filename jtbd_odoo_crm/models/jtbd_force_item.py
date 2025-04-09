# -*- coding: utf-8 -*-

from odoo import models, fields, api, _

class JtbdForceItem(models.Model):
    _name = 'jtbd.force.item'
    _description = 'JTBD Force Item'
    _order = 'sequence, id' # Ensure consistent ordering

    analysis_id = fields.Many2one(
        'jtbd.force.analysis', string='Analysis', required=True, ondelete='cascade',
        index=True
    )
    name = fields.Char(string='Force Description', required=True)
    force_type = fields.Selection(
        [('push', 'Push Force'),
         ('pull', 'Pull Force'),
         ('inertia', 'Inertia Force')],
        string='Force Type', required=True, index=True
    )
    strength = fields.Integer(
        string='Strength', default=5, required=True, # Default to neutral strength
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
         ('personal', 'Personal'), # e.g., individual goals, reputation
         ('strategic', 'Strategic'), # e.g., long-term goals, market position
         ('risk', 'Risk/Compliance'), # Added
         ('other', 'Other')],
        string='Impact Area', index=True,
        help="The primary area affected by this force."
    )
    sequence = fields.Integer(string='Sequence', default=10)

    # Validate strength is within 1-10
    @api.constrains('strength')
    def _check_strength(self):
        for record in self:
            if not (1 <= record.strength <= 10):
                raise models.ValidationError(_("Force strength must be between 1 and 10."))