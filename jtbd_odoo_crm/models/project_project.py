# -*- coding: utf-8 -*-
from odoo import models, fields

class ProjectProject(models.Model):
    _inherit = 'project.project'

    # Field to mark project as a template (from previous steps)
    jtbd_is_template = fields.Boolean(
        string="Is JTBD Template",
        default=False,
        copy=False,
        index=True,
        help="Mark this project as a template for JTBD-driven creation."
    )

    # --- Onboarding Status Field (Aligns with PRD2 Phase 2 Req.) ---
    jtbd_onboarding_status = fields.Selection(
        [('not_started', 'Not Started'),
         ('kickoff_scheduled', 'Kickoff Scheduled'),
         ('in_progress', 'In Progress'),
         ('on_hold', 'On Hold'),
         ('completed', 'Completed'),
         ('cancelled', 'Cancelled')],
        string="JTBD Onboarding Status",
        default='not_started',
        tracking=True, # Enable chatter tracking
        index=True,
        copy=False, # Don't copy status on duplication
        help="High-level status of the project implementation/client onboarding phase."
    )
    # --- END NEW FIELD ---
    
    # --- Knowledge Transfer Relation (PRD3 Phase 3) ---
    jtbd_knowledge_transfer_ids = fields.One2many(
        'jtbd.knowledge.transfer', # Related model
        'project_id', # Inverse field on the related model
        string="Knowledge Transfers",
        help="Knowledge transfer records associated with this project."
    )
    jtbd_knowledge_transfer_count = fields.Integer(
    compute='_compute_jtbd_knowledge_transfer_count',
    string="# Knowledge Transfers"
    )
    # --- End Knowledge Transfer Relation ---

    # Fields like 'sale_line_id', 'sale_order_id' are inherited from 'sale_project' module.
    
    def _compute_jtbd_knowledge_transfer_count(self):
        # Read group is better for performance
        data = self.env['jtbd.knowledge.transfer']._read_group(
            [('project_id', 'in', self.ids)],
            ['project_id'], ['project_id:count']
        )
        count_map = {item['project_id'][0]: item['project_id_count'] for item in data}
        for project in self:
            project.jtbd_knowledge_transfer_count = count_map.get(project.id, 0)

    def action_open_knowledge_transfers(self):
        self.ensure_one()
        action = self.env['ir.actions.act_window']._for_xml_id('jtbd_odoo_crm.action_jtbd_knowledge_transfer')
        action['domain'] = [('project_id', '=', self.id)]
        action['context'] = {'default_project_id': self.id, 'search_default_project_id': self.id}
        # If lead is linked to project, pass it too
        if self.lead_id:
            action['context']['default_lead_id'] = self.lead_id.id
        return action