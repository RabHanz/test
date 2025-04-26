# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import UserError
import logging # <-- Import logging

# Re-import selections needed for the wizard form
# It's generally better practice to define selections in one place
# or import them from the definitive model if stable.
# from odoo.addons.jtbd_odoo_crm.models.jtbd_trace_link import JtbdTraceLink

# --- ADD LOGGER INITIALIZATION ---
_logger = logging.getLogger(__name__)
# --- END LOGGER INITIALIZATION ---

class JtbdCreateTraceLinkWizard(models.TransientModel):
    _name = 'jtbd.create.trace.link.wizard'
    _description = 'Wizard to Create JTBD Trace Link'

    # --- Source Info (Set from context, hidden) ---
    source_model_id = fields.Many2one('ir.model', string='Source Model', readonly=True)
    source_res_id = fields.Integer(string='Source Record ID', readonly=True)
    # Display field for user confirmation (optional)
    source_display_name = fields.Char(string="Source Record", compute='_compute_source_display_name')

    # --- Target Info (User Input) ---
    name = fields.Char(string="Link Description / Name", required=True, help="Short description of the target.")
    # Use lambda function to dynamically get selection from the target model
    target_link_type = fields.Selection(
         selection=lambda self: self.env['jtbd.trace.link']._fields['target_link_type'].selection,
         string='Target Type', required=True, default='url'
    )
    target_url = fields.Char(string='URL')
    target_attachment_id = fields.Many2one('ir.attachment', string='Odoo Attachment', ondelete='set null')
    target_record_ref = fields.Reference(
        lambda self: [(m.model, m.name) for m in self.env['ir.model'].search([])],
        string="Target Odoo Record"
    )
    target_external_ref = fields.Char(
        string='Target External/Text Reference',
        help="Identifier for targets not directly linkable (e.g., GDrive ID, Req ID)."
    )
    # Use lambda function to dynamically get selection from the target model
    link_relationship = fields.Selection(
        selection=lambda self: self.env['jtbd.trace.link']._fields['link_relationship'].selection,
        string='Relationship', required=True,
        help="Describes how the source relates to the target."
    )
    description = fields.Text(string='Notes / Context')

    @api.depends('source_model_id', 'source_res_id')
    def _compute_source_display_name(self):
        for wizard in self:
             if wizard.source_model_id and wizard.source_res_id:
                 try:
                     # Use exists() for safety when browsing
                     record = self.env[wizard.source_model_id.model].browse(wizard.source_res_id).exists()
                     # Check if record exists before accessing display_name
                     wizard.source_display_name = record.display_name if record else f"{wizard.source_model_id.model} ID {wizard.source_res_id} (Not Found)"
                 except Exception as e:
                     # Catch potential errors during browse/display_name access
                     _logger.error(f"Error computing source display name for {wizard.source_model_id.model},{wizard.source_res_id}: {e}")
                     wizard.source_display_name = f"{wizard.source_model_id.model} ID {wizard.source_res_id} (Error)"
             else:
                 wizard.source_display_name = _("Source Not Set")

    def action_create_link(self):
        """ Creates the jtbd.trace.link record """
        self.ensure_one()
        if not self.source_model_id or not self.source_res_id:
             raise UserError(_("Source information is missing in the wizard."))

        vals = {
            'source_model_id': self.source_model_id.id,
            'source_res_id': self.source_res_id,
            'name': self.name,
            'target_link_type': self.target_link_type,
            'link_relationship': self.link_relationship,
            'description': self.description,
            'active': True,
            # Add target fields based on type
            'target_url': self.target_url if self.target_link_type == 'url' else False,
            'target_attachment_id': self.target_attachment_id.id if self.target_link_type == 'attachment' else False,
            # Correctly format Reference field value before creating
            'target_record_ref': f"{self.target_record_ref._name},{self.target_record_ref.id}" if self.target_link_type == 'odoo_record' and self.target_record_ref else False,
            'target_external_ref': self.target_external_ref if self.target_link_type in ('document_repo', 'code_commit', 'requirement', 'test_case', 'other') else False,
        }
        # Clean False values from vals dictionary
        vals = {k: v for k, v in vals.items() if v is not False}

        try:
            new_link = self.env['jtbd.trace.link'].create(vals)
            _logger.info(f"Created Trace Link {new_link.id} from wizard for {self.source_model_id.model},{self.source_res_id}")
        except Exception as e:
             _logger.error(f"Failed to create trace link from wizard: {e}", exc_info=True)
             raise UserError(_("Failed to create the trace link: %s") % str(e))

        return {'type': 'ir.actions.act_window_close'}