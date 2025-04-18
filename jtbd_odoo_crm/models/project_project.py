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

    # --- NEW FIELD for PRD2 Phase 2 Alignment ---
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

    # Other fields like 'sale_line_id', 'sale_order_id' are inherited from 'sale_project'.