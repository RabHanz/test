# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError

class JtbdIntegrationFieldMapping(models.Model):
    _name = 'jtbd.integration.field.mapping'
    _description = 'JTBD Integration Field Mapping'
    _order = 'sequence, id'
    # Add constraint to ensure unique mapping per integration/field/direction
    _sql_constraints = [
        ('integration_odoo_field_direction_uniq',
         'unique(integration_id, odoo_field_id, direction)',
         'A mapping for this Odoo Field and Direction already exists for this Integration!'),
        ('integration_external_field_direction_uniq',
         'unique(integration_id, external_field, direction)',
         'A mapping for this External Field and Direction already exists for this Integration!'),
    ]

    integration_id = fields.Many2one(
        'jtbd.integration.settings', string='Integration Setting', required=True, ondelete='cascade',
        index=True
    )
    sequence = fields.Integer(default=10)
    active = fields.Boolean(default=True)

    # Odoo Side
    odoo_model_id = fields.Many2one(
        'ir.model', string='Odoo Model',
        # Widen domain or make configurable? For now, keep common JTBD models
        domain=[('model', 'in', ['crm.lead', 'project.project', 'project.task', 'res.partner',
                                 'jtbd.force.analysis', 'jtbd.outcome.mapping'])],
        ondelete='cascade', # If model deleted, mapping is invalid
        help="The Odoo model containing the field to map."
    )
    odoo_field_id = fields.Many2one(
        'ir.model.fields', string='Odoo Field',
        # Domain filtering primarily handled by onchange now
        domain="[('model_id', '=', odoo_model_id), ('store', '=', True)]", # Basic filter
        ondelete='cascade',
        help="The specific Odoo field to map (filtered by selected model)."
    )
    odoo_field_name = fields.Char(related='odoo_field_id.name', string='Odoo Field Name', readonly=True, store=True) # Store for searching/grouping
    odoo_field_ttype = fields.Selection(related='odoo_field_id.ttype', string='Odoo Field Type', readonly=True) # Show type

    # External Side
    external_field = fields.Char(
        string='External System Field Name', required=True,
        help="The corresponding field name or key in the external system (case-sensitive)."
    )
    external_field_type_hint = fields.Selection(
        [('string', 'Text/String'), ('integer', 'Integer'), ('float', 'Number/Float'),
         ('boolean', 'Boolean'), ('date', 'Date'), ('datetime', 'DateTime'),
         ('selection', 'Selection/Picklist'), ('json', 'JSON/Object'), ('list', 'List/Array'),
         ('id', 'External ID'), ('other', 'Other')],
         string="External Type (Hint)", help="Helps with transformation logic."
    )

    # Mapping Details
    direction = fields.Selection(
        [('odoo_to_external', 'Odoo → External'),
         ('external_to_odoo', 'External → Odoo'),
         ('bidirectional', 'Bidirectional')],
        string='Sync Direction', default='bidirectional', required=True
    )
    is_key = fields.Boolean(
        string='Is Key Field?', default=False, index=True,
        help="Is this field used as a primary identifier for matching records between systems (e.g., Email, External ID)? At least one key is usually needed per model."
    )
    sync_on_create = fields.Boolean(string="Sync on Create", default=True)
    sync_on_update = fields.Boolean(string="Sync on Update", default=True)

    # Transformation (Placeholder - logic implemented externally or via server action/code)
    transformation_notes = fields.Text( # Renamed from transformation
        string='Transformation Notes',
        help="Describe any logic needed (e.g., mapping selection values 'draft'->'D', formatting dates 'YYYY-MM-DD'->'MM/DD/YYYY'). Implementation in Phase 4+."
    )
    # Optional: Link to specific transformation logic (Server Action, Python Code, n8n Workflow ID)
    transformation_ref = fields.Reference(
        [('ir.actions.server', 'Server Action'), ('python.code', 'Python Snippet ID')], # Add more types later
        string="Transformation Logic Ref",
        help="Reference to executable logic handling this transformation (Phase 4+)."
    )
    default_value = fields.Char(string="Default Value", help="Default value to use if source is empty/null during sync.")

    # --- Methods ---
    @api.onchange('odoo_model_id')
    def _onchange_odoo_model_id(self):
         """ Clear odoo_field_id when model changes and return the filtered domain. """
         domain = [('id', '=', -1)]
         if self.odoo_model_id:
             # Exclude non-stored, relational technical fields, audit fields
             domain = [
                 ('model_id', '=', self.odoo_model_id.id),
                 ('store', '=', True),
                 ('ttype', 'not in', ['one2many', 'many2many', 'reference', 'binary']), # Exclude relations/binary for simple mapping
                 ('name', 'not like', 'audit_trail%'),
                 ('name', 'not like', '%_ids'), # Exclude typical relational suffix
                 ('name', 'not like', '%_id') # Optionally exclude M2O - adjust based on need
             ]
         self.odoo_field_id = False
         return {'domain': {'odoo_field_id': domain}}

    @api.constrains('odoo_model_id', 'odoo_field_id')
    def _check_required_fields_on_save(self):
        # Keep constraint for required fields
        for record in self:
            if not record.odoo_model_id: raise ValidationError(_("Odoo Model cannot be empty."))
            if not record.odoo_field_id: raise ValidationError(_("Odoo Field cannot be empty."))

    @api.constrains('odoo_field_id', 'external_field_type_hint')
    def _check_type_compatibility_hint(self):
         # Basic type compatibility warning (can be enhanced)
         type_map = { 'char': 'string', 'text': 'string', 'html': 'string', 'integer': 'integer', 'float': 'float', 'monetary': 'float', 'boolean': 'boolean', 'date': 'date', 'datetime': 'datetime', 'selection': 'selection', }
         for record in self:
             if record.odoo_field_id and record.external_field_type_hint:
                 odoo_type_group = type_map.get(record.odoo_field_id.ttype)
                 if odoo_type_group and odoo_type_group != record.external_field_type_hint and record.external_field_type_hint != 'other':
                      # This is just a log warning, not a validation error, as transformations can handle it
                      _logger.warning(f"Potential type mismatch for mapping '{record.odoo_field_name}' <-> '{record.external_field}': Odoo type '{record.odoo_field_id.ttype}' ({odoo_type_group}) vs External hint '{record.external_field_type_hint}'. Ensure transformation logic handles this.")