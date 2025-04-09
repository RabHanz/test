# -*- coding: utf-8 -*-
import logging
_logger = logging.getLogger(__name__)
from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError
from odoo.tools.safe_eval import safe_eval

IMPACT_AREAS = [
    ('financial', 'Financial'),
    ('operational', 'Operational'),
    ('competitive', 'Competitive'),
    ('personal', 'Personal'),
    ('strategic', 'Strategic'),
    ('risk', 'Risk/Compliance'),
    ('other', 'Other')
]

FORCE_TYPES = [
    ('push', 'Push Force'),
    ('pull', 'Pull Force'),
    ('inertia', 'Inertia Force')
]

class JtbdCommonForceWizard(models.TransientModel):
    _name = 'jtbd.common.force.wizard'
    _description = 'JTBD Common Force Selection Wizard'

    analysis_id = fields.Many2one(
        'jtbd.force.analysis', string='Analysis', required=True, readonly=True,
        help="The Force Analysis this force will be added to."
    )
    force_type = fields.Selection(
        selection=FORCE_TYPES, string='Force Type', required=True, readonly=True,
        help="The type of force to add (Push, Pull, or Inertia)."
    )
    impact_area = fields.Selection(
        selection=IMPACT_AREAS, string='Impact Area', required=True,
        help="Select the primary area impacted by the common force."
    )
    # This field will store the index/key of the selected description from the dynamic list
    force_description_key = fields.Selection(
        selection='_get_force_descriptions', string='Force Description', required=True,
        help="Select a common force description for the chosen impact area."
    )
    strength = fields.Integer(
        string='Strength', default=5, required=True,
        help="Strength of the force (1-10 scale)."
    )
    evidence = fields.Text(
        string='Evidence',
        help="Initial evidence or notes supporting this force assessment."
    )
    # Hidden field to pass the dictionary of options from the context
    force_options_str = fields.Text(string='Force Options (Internal)', readonly=True)

    @api.model
    def default_get(self, fields_list):
        """ Get defaults from context, especially the force options string. """
        defaults = super().default_get(fields_list)
        if 'force_options_str' in fields_list and 'force_options' in self.env.context:
            # Store the string representation from context
            defaults['force_options_str'] = self.env.context.get('force_options')
        return defaults

    @api.depends('impact_area', 'force_options_str')
    def _get_force_descriptions(self):
        """Dynamically populate force descriptions based on impact area and context."""
        selections = []
        if not self.impact_area or not self.force_options_str:
            return selections # Return empty list if dependencies not met

        try:
            # Safely evaluate the string dictionary from context/defaults
            force_options = safe_eval(self.force_options_str or '{}')
            if not isinstance(force_options, dict):
                 raise ValueError("Force options did not evaluate to a dictionary.")

            # Get options for selected impact area
            area_options = force_options.get(self.impact_area, [])

            # Generate selection list: key is index string, value is description text
            selections = [(str(i), option) for i, option in enumerate(area_options)]

        except Exception as e:
            # Log error but don't raise UI error during selection generation
            _logger.error("Error generating force descriptions for wizard: %s", str(e))
            selections = [('error', _('Error loading options'))]

        return selections

    @api.constrains('strength')
    def _check_strength(self):
        """ Validate strength is within 1-10. """
        for record in self:
            if not (1 <= record.strength <= 10):
                raise ValidationError(_("Force strength must be between 1 and 10."))

    def action_add_force(self):
        """Add the selected common force to the parent analysis."""
        self.ensure_one()

        if not self.force_description_key or self.force_description_key == 'error':
             raise UserError(_("Please select a valid force description."))

        try:
            # Retrieve the full description text using the key (index)
            force_options = safe_eval(self.force_options_str or '{}')
            if not isinstance(force_options, dict):
                raise ValueError("Force options could not be parsed.")

            area_options = force_options.get(self.impact_area, [])
            selected_index = int(self.force_description_key)

            if selected_index >= len(area_options):
                raise ValueError("Selected description index is out of bounds.")

            description = area_options[selected_index]

            # Create the force item
            self.env['jtbd.force.item'].create({
                'analysis_id': self.analysis_id.id,
                'name': description, # Use the full text description
                'force_type': self.force_type,
                'impact_area': self.impact_area,
                'strength': self.strength,
                'evidence': self.evidence,
                # Sequence will use default
            })

            # No return needed for TransientModel action, closes automatically
            # If you wanted to reload the underlying view, you'd return {'type': 'ir.actions.client', 'tag': 'reload'}
            # but in this case, closing the wizard is usually sufficient.

        except Exception as e:
            _logger.error("Error adding common force from wizard: %s", str(e))
            raise UserError(_("Error adding force: %s") % str(e))

        return {'type': 'ir.actions.act_window_close'} # Explicitly close