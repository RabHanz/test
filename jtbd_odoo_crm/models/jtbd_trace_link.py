# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class JtbdTraceLink(models.Model):
    _name = 'jtbd.trace.link'
    _description = 'JTBD Traceability Link'
    _order = 'sequence, id'

    # --- Source Record Identification ---
    source_model_id = fields.Many2one('ir.model', string='Source Model', index=True, required=True, ondelete='cascade')
    source_res_id = fields.Integer(string='Source Record ID', index=True, required=True)

    # --- Target Identification ---
    name = fields.Char(string="Link Description / Name", required=True, help="Short description of the target.")
    target_link_type = fields.Selection( [('url', 'URL / Web Link'), ('attachment', 'Odoo Attachment'), ('odoo_record', 'Odoo Record Reference'), ('document_repo', 'Document Repository (e.g., GDrive/Sharepoint ID)'), ('code_commit', 'Code Commit/Branch'), ('requirement', 'Requirement ID'), ('test_case', 'Test Case ID'), ('other', 'Other Reference')], string='Target Type', required=True, default='url')
    target_url = fields.Char(string='URL')
    target_attachment_id = fields.Many2one('ir.attachment', string='Odoo Attachment', ondelete='set null')
    target_record_ref = fields.Reference( lambda self: [(m.model, m.name) for m in self.env['ir.model'].search([])], string="Target Odoo Record" )
    target_external_ref = fields.Char( string='Target External/Text Reference', help="Identifier for targets not directly linkable (e.g., GDrive ID, Requirement ID, Commit SHA)." )

    # --- Link Metadata ---
    link_relationship = fields.Selection( [('addresses', 'Addresses / Fulfills (Job/Outcome)'), ('mitigates', 'Mitigates / Addresses (Force)'), ('amplifies', 'Amplifies / Supports (Force)'), ('measures', 'Measures / Tracks (Outcome)'), ('implemented_by', 'Implemented By (Feature/Task)'), ('tested_by', 'Tested By (Test Case)'), ('documented_by', 'Documented By (Wiki/Doc)'), ('depends_on', 'Depends On'), ('related_to', 'Related To (General)'), ('derived_from', 'Derived From')], string='Relationship', required=True, index=True )
    description = fields.Text(string='Notes / Context')
    sequence = fields.Integer(default=10)
    active = fields.Boolean(default=True)

    # --- NEW: default_get method ---
    @api.model
    def default_get(self, fields_list):
        """ Explicitly read source model/id from context. """
        defaults = super().default_get(fields_list)
        if 'default_source_model_id' in self.env.context and 'source_model_id' in fields_list:
            defaults['source_model_id'] = self.env.context['default_source_model_id']
        if 'default_source_res_id' in self.env.context and 'source_res_id' in fields_list:
             defaults['source_res_id'] = self.env.context['default_source_res_id']
        return defaults