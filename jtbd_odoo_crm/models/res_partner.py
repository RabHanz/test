# -*- coding: utf-8 -*-
from odoo import models, fields

class ResPartner(models.Model):
    _inherit = 'res.partner'

    # --- Add Partner Extension/Growth Field ---
    # Using Text initially, could be O2M later
    jtbd_client_portfolio = fields.Text(
        string="Client Portfolio Overview (Agency)",
        help="Notes describing the composition and nature of this agency's (if partner/client is an agency) own client portfolio."
    )
    # --- End Partner Extension/Growth Field ---