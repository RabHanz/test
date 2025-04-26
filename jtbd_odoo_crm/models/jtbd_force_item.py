# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
import logging # Import logging

_logger = logging.getLogger(__name__) # Initialize logger

class JtbdForceItem(models.Model):
    _name = 'jtbd.force.item'
    _description = 'JTBD Force Item'
    _order = 'sequence, id'

    analysis_id = fields.Many2one( 'jtbd.force.analysis', string='Analysis', required=True, ondelete='cascade', index=True )
    name = fields.Char(string='Force Description', required=True)
    force_type = fields.Selection( [('push', 'Push (Away from Status Quo)'), ('pull', 'Pull (Towards New Solution)'), ('anxiety', 'Anxiety (About New Solution)'), ('habit', 'Habit (Attachment to Status Quo)')], string='Force Type', required=True, index=True )
    strength = fields.Integer( string='Strength', default=5, required=True, help="Strength of the force (1-10 scale)." )
    evidence = fields.Text( string='Evidence', help="Observations, quotes, or data supporting this force assessment." )
    impact_area = fields.Selection( [('financial', 'Financial'), ('operational', 'Operational'), ('competitive', 'Competitive'), ('personal', 'Personal'), ('strategic', 'Strategic'), ('risk', 'Risk/Compliance'), ('other', 'Other')], string='Impact Area', index=True, help="The primary area affected by this force." )
    sequence = fields.Integer(string='Sequence', default=10)


    # --- Counter Field (Using search_count loop) ---
    # Removed depends decorator - let ORM handle invalidation for non-stored compute
    def _compute_trace_link_count(self):
        """ Computes the number of trace links using search_count loop (more robust). """
        _logger.debug(f"Computing trace link count for Force Item IDs: {self.ids}")
        TraceLink = self.env['jtbd.trace.link']
        # Find the ir.model ID once
        trace_link_model_id = self.env['ir.model']._get_id(self._name)
        if not trace_link_model_id:
             _logger.error("Could not find ir.model ID for jtbd.force.item")
             for record in self: record.jtbd_trace_link_count = 0
             return

        for record in self:
            try:
                count = TraceLink.search_count([
                    ('source_model_id', '=', trace_link_model_id),
                    ('source_res_id', '=', record.id)
                ])
                record.jtbd_trace_link_count = count
                # _logger.debug(f"Force Item {record.id}: Trace Link Count = {count}")
            except Exception as e:
                 _logger.error(f"Error counting trace links for Force Item {record.id}: {e}", exc_info=True)
                 record.jtbd_trace_link_count = 0 # Default to 0 on error
        _logger.debug(f"Finished computing trace link count.")


    jtbd_trace_link_count = fields.Integer(
        compute='_compute_trace_link_count',
        string="Links" # Shorter string for list view header
    )
    # --- END Counter Field ---

    # Action method for the button/link (Unchanged)
    def action_open_trace_links(self):
        """ Opens the WIZARD to CREATE a new trace link for this force item. """
        self.ensure_one()
        # Get the ir.model ID for the SOURCE model (jtbd.force.item)
        source_model_id = self.env['ir.model']._get_id(self._name)
        if not source_model_id:
            _logger.error("Could not find ir.model ID for %s", self._name)
            raise UserError(_("Cannot determine source model for trace link."))

        # Open the dedicated creation wizard
        return {
            'name': _('Create Trace Link for Force Item'),
            'type': 'ir.actions.act_window',
            'res_model': 'jtbd.create.trace.link.wizard', # <-- TARGET THE WIZARD MODEL
            'view_mode': 'form',
            'target': 'new', # Open in a dialog/popup
            'context': {
                # Pass the source info clearly in the context for the wizard's default_get or create
                'default_source_model_id': source_model_id,
                'default_source_res_id': self.id,
                'default_name': f'Link for Force: {self.name[:100]}...' # Suggest a default name
            }
        }

    # Strength constraint (Unchanged)
    @api.constrains('strength')
    def _check_strength(self):
         for record in self:
             if not (1 <= record.strength <= 10):
                 raise ValidationError(_("Force strength must be between 1 and 10."))