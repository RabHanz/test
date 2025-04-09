# -*- coding: utf-8 -*-
import logging
from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError

_logger = logging.getLogger(__name__)

# Import selections from the helper model
from odoo.addons.jtbd_odoo_crm.models.jtbd_common_force_description import IMPACT_AREAS, FORCE_TYPES

class JtbdCommonForceWizard(models.TransientModel):
    _name = 'jtbd.common.force.wizard'
    _description = 'JTBD Common Force Selection Wizard'

    analysis_id = fields.Many2one(
        'jtbd.force.analysis', string='Analysis', required=True, readonly=True
    )
    force_type = fields.Selection(
        selection=FORCE_TYPES, string='Force Type', required=True, readonly=True
    )
    impact_area = fields.Selection(
        selection=IMPACT_AREAS, string='Impact Area', required=True
    )
    force_description_id = fields.Many2one(
        'jtbd.common.force.description', string='Force Description',
        required=True,
        # Domain is primarily handled by the onchange now for clarity
        # Keeping it here helps initial filtering if possible
        domain="[('force_type', '=', force_type), ('impact_area', '=', impact_area), ('active', '=', True)]"
    )
    strength = fields.Integer(
        string='Strength', default=5, required=True
    )
    evidence = fields.Text(string='Evidence')

    @api.onchange('impact_area', 'force_type')
    def _onchange_impact_or_type(self):
        """ When impact area or force type changes, update the domain and reset selection if needed. """
        # Construct the domain based on current values
        domain = [('active', '=', True)]
        if self.force_type:
            domain.append(('force_type', '=', self.force_type))
        if self.impact_area:
            domain.append(('impact_area', '=', self.impact_area))
        else:
            # If impact area is cleared, force description must also be cleared
            self.force_description_id = False
            # Return an empty domain if impact area is not set
            return {'domain': {'force_description_id': [('id', '=', 0)]}} # Domain likely to yield nothing

        # Check if the current selection is still valid within the new domain
        if self.force_description_id:
            # More robust check: Evaluate if current selection meets the new domain criteria
            is_valid = True
            if self.force_description_id.force_type != self.force_type:
                is_valid = False
            if self.force_description_id.impact_area != self.impact_area:
                 is_valid = False

            if not is_valid:
                self.force_description_id = False # Reset the selection

        # Return the updated domain for the Many2one field
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
            if not description: # Final check
                raise ValueError("Selected force description text is empty.")

            self.env['jtbd.force.item'].create({
                'analysis_id': self.analysis_id.id,
                'name': description, # Required
                'force_type': self.force_type,
                'impact_area': self.impact_area,
                'strength': self.strength,
                'evidence': self.evidence or '',
            })
        except Exception as e:
            _logger.error("Error adding common force from wizard: %s", str(e), exc_info=True)
            raise UserError(_("Error adding force: %s") % str(e))
        return {'type': 'ir.actions.act_window_close'}

    # Note: Removed _get_force_descriptions as it's not needed with Many2one/domain approach
    # Note: Removed force_options_str as it's not needed
    # Note: No default_get needed unless pre-selecting based on context (unlikely here)