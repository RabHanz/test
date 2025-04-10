# -*- coding: utf-8 -*-
from odoo import models, fields

# Define selections here for consistency
IMPACT_AREAS = [
    ('financial', 'Financial'), ('operational', 'Operational'),
    ('competitive', 'Competitive'), ('personal', 'Personal'),
    ('strategic', 'Strategic'), ('risk', 'Risk/Compliance'),
    ('other', 'Other')
]
FORCE_TYPES = [
    ('push', 'Push Force'), ('pull', 'Pull Force'), ('inertia', 'Inertia Force')
]

class JtbdCommonForceDescription(models.Model):
    """ Helper model to store predefined force descriptions. """
    _name = 'jtbd.common.force.description'
    _description = 'Common Force Description'
    _order = 'sequence, name'

    name = fields.Char(string="Force Description", required=True, translate=True)
    force_type = fields.Selection(FORCE_TYPES, string="Force Type", required=True, index=True)
    impact_area = fields.Selection(IMPACT_AREAS, string="Impact Area", required=True, index=True)
    sequence = fields.Integer(default=10)
    active = fields.Boolean(default=True)