# -*- coding: utf-8 -*-

from odoo import models, fields

class ProductTemplate(models.Model):
    _inherit = 'product.template'

    # No new fields needed here for Phase 2 basic linking.
    # Fields like 'project_id', 'project_template_id', 'service_policy'
    # are typically added by the 'sale_project' or related modules.
    # Inheriting ensures we can modify behaviour later if needed.
    pass