# -*- coding: utf-8 -*-

from odoo import models, fields

class ProjectTask(models.Model):
    _inherit = 'project.task'

    # No new fields needed here for Phase 2 basic linking.
    # Fields like 'sale_line_id', 'sale_order_id' are added by 'sale_project'.
    # Inheriting ensures we can access/modify related logic.
    pass