# -*- coding: utf-8 -*-
import logging
from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError

_logger = logging.getLogger(__name__)

# Import updated selections from the description model
from odoo.addons.jtbd_odoo_crm.models.jtbd_common_force_description import IMPACT_AREAS, FORCE_TYPES

class JtbdCommonForceWizard(models.TransientModel):
    _name = 'jtbd.common.force.wizard'
    _description = 'JTBD Common Force Selection Wizard'

    analysis_id = fields.Many2one('jtbd.force.analysis', string='Analysis', required=True, readonly=True)
    force_type = fields.Selection(selection=FORCE_TYPES, string='Force Type', required=True, readonly=True)
    impact_area = fields.Selection(selection=IMPACT_AREAS, string='Impact Area', required=True)
    force_description_id = fields.Many2one(
        'jtbd.common.force.description', string='Force Description', required=True,
        domain="[('force_type', '=', force_type), ('impact_area', '=', impact_area), ('active', '=', True)]"
    )
    strength = fields.Integer(string='Strength', default=5, required=True)
    evidence = fields.Text(string='Evidence')

    # Removed jtbd_inertia_subtype and is_inertia_force

    @api.onchange('impact_area', 'force_type')
    def _onchange_impact_or_type(self):
        # Logic remains the same
        domain = [('active', '=', True)]
        if self.force_type: domain.append(('force_type', '=', self.force_type))
        if self.impact_area: domain.append(('impact_area', '=', self.impact_area))
        else: return {'domain': {'force_description_id': [('id', '=', 0)]}}

        if self.force_description_id and (self.force_description_id.force_type != self.force_type or self.force_description_id.impact_area != self.impact_area):
            self.force_description_id = False
        return {'domain': {'force_description_id': domain}}

    @api.constrains('strength')
    def _check_strength(self):
        for record in self:
            if not (1 <= record.strength <= 10):
                raise ValidationError(_("Force strength must be between 1 and 10."))

    def action_add_force(self):
        self.ensure_one()
        if not self.force_description_id:
             raise UserError(_("Please select a valid force description."))
        try:
            description = self.force_description_id.name
            if not description: raise ValueError("Selected force description text is empty.")
            vals = {
                'analysis_id': self.analysis_id.id,
                'name': description,
                'force_type': self.force_type,
                'impact_area': self.impact_area,
                'strength': self.strength,
                'evidence': self.evidence or '',
            }
            self.env['jtbd.force.item'].create(vals)
        except Exception as e:
            _logger.error("Error adding common force from wizard: %s", str(e), exc_info=True)
            raise UserError(_("Error adding force: %s") % str(e))
        return {'type': 'ir.actions.act_window_close'}