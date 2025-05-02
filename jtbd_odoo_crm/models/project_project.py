# -*- coding: utf-8 -*-
from odoo import models, fields, api, _ # Add api, _
import logging # Import logging
from datetime import datetime # Import datetime

_logger = logging.getLogger(__name__) # Add logger

class ProjectProject(models.Model):
    _inherit = 'project.project'

    # Field to mark project as a template
    jtbd_is_template = fields.Boolean(
        string="Is JTBD Template", default=False, copy=False, index=True,
        help="Mark this project as a template for JTBD-driven creation."
    )

    # Onboarding Status Field
    jtbd_onboarding_status = fields.Selection(
        [('not_started', 'Not Started'), ('kickoff_scheduled', 'Kickoff Scheduled'),
         ('in_progress', 'In Progress'), ('on_hold', 'On Hold'),
         ('completed', 'Completed'), ('cancelled', 'Cancelled')],
        string="JTBD Onboarding Status", default='not_started', tracking=True, index=True, copy=False,
        help="High-level status of the project implementation/client onboarding phase."
    )

    # Knowledge Transfer Relation
    jtbd_knowledge_transfer_ids = fields.One2many( 'jtbd.knowledge.transfer', 'project_id', string="Knowledge Transfers", help="Knowledge transfer records associated with this project." )
    jtbd_knowledge_transfer_count = fields.Integer( compute='_compute_jtbd_knowledge_transfer_count', string="# Knowledge Transfers" )

    # --- NEW: Service Quality Fields (PRD3 Delivery/Expansion - Add in P3 for completeness) ---
    jtbd_service_satisfaction = fields.Float(
        string="Service Satisfaction Score", tracking=True, copy=False,
        help="Overall client satisfaction score for this project/delivery (e.g., 1-5, NPS result)."
    )
    jtbd_scope_adherence = fields.Selection(
        [('on_track', 'On Track'),
         ('minor_deviation', 'Minor Deviation'),
         ('major_deviation', 'Major Deviation'),
         ('re_scoped', 'Re-Scoped')],
         string="Scope Adherence Status", tracking=True, copy=False, default='on_track',
         help="Status regarding adherence to the originally defined project scope."
    )
    # --- End Service Quality Fields ---

    # --- NEW: Gap Resolution Fields (PRD3 Delivery/Implementation - Add in P3) ---
    jtbd_gap_detected_datetime = fields.Datetime(
        string="Gap Detected On", tracking=True, copy=False,
        help="Timestamp when a significant gap or issue was identified during delivery."
    )
    jtbd_gap_resolved_datetime = fields.Datetime(
        string="Gap Resolved On", tracking=True, copy=False,
        help="Timestamp when the identified gap/issue was confirmed as resolved."
    )
    jtbd_gap_resolution_time = fields.Float(
        string="Gap Resolution Time (Hours)",
        compute='_compute_jtbd_gap_resolution_time', store=True, readonly=True, digits=(16, 2),
        help="Calculated time taken to resolve the latest identified gap."
    )
    # --- End Gap Resolution Fields ---

    # --- NEW: Advanced Implementation Field (PRD3 Implementation - Add in P3) ---
    jtbd_accelerator_path = fields.Selection(
        [('standard', 'Standard Path'),
         ('accelerated', 'Accelerated Path'),
         ('custom', 'Custom Path'),
         ('tbd', 'To Be Determined')],
        string="Implementation Path",
        tracking=True, default='standard', copy=False,
        help="Indicates if a specific implementation methodology/speed is being used."
    )
    # --- End Advanced Implementation Field ---

    # --- Client Operations Field ---
    jtbd_iteration_path = fields.Text(
        string="Iteration Path / Phasing", tracking=True, copy=False,
        help="Notes on the planned iteration path, phased rollout, or specific implementation approach for this project."
    )
    # --- End Client Operations Field ---

    # --- Compute Methods ---
    def _compute_jtbd_knowledge_transfer_count(self):
        """ Compute the number of related Knowledge Transfer records using search_count. """
        knowledge_transfer_model = self.env['jtbd.knowledge.transfer']
        for project in self:
            try:
                project.jtbd_knowledge_transfer_count = knowledge_transfer_model.search_count(
                    [('project_id', '=', project.id)]
                )
            except Exception as e:
                _logger.error(f"Error counting knowledge transfers for project {project.id}: {e}", exc_info=True)
                project.jtbd_knowledge_transfer_count = 0

    @api.depends('jtbd_gap_detected_datetime', 'jtbd_gap_resolved_datetime')
    def _compute_jtbd_gap_resolution_time(self):
        """ Calculate resolution time in hours. """
        for project in self:
            if project.jtbd_gap_resolved_datetime and project.jtbd_gap_detected_datetime:
                time_diff = project.jtbd_gap_resolved_datetime - project.jtbd_gap_detected_datetime
                # Calculate difference in hours
                project.jtbd_gap_resolution_time = time_diff.total_seconds() / 3600.0
            else:
                project.jtbd_gap_resolution_time = 0.0

    # --- Action Methods ---
    def action_open_knowledge_transfers(self):
        self.ensure_one()
        action = self.env['ir.actions.act_window']._for_xml_id('jtbd_odoo_crm.action_jtbd_knowledge_transfer')
        action['domain'] = [('project_id', '=', self.id)]
        action['context'] = {'default_project_id': self.id, 'search_default_project_id': self.id}
        if self.sale_order_id and self.sale_order_id.opportunity_id: # Check if SO and Opportunity exist
            action['context']['default_lead_id'] = self.sale_order_id.opportunity_id.id
        return action