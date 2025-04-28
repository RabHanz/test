# -*- coding: utf-8 -*-
from odoo import models, fields, api

class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    # --- JTBD Privacy Settings ---
    jtbd_enable_pii_scan = fields.Boolean(
        string="Enable PII Scanning (Future)",
        config_parameter='jtbd_odoo_crm.enable_pii_scan', # Store as system parameter
        default=False,
        help="Placeholder: Enable automatic scanning for PII in JTBD text fields (Requires Phase 4+ AI/Integration)."
    )
    jtbd_anonymization_level = fields.Selection(
        [('none', 'None'), ('mask', 'Masking'), ('remove', 'Removal')],
        string="Default Anonymization Level (Future)",
        config_parameter='jtbd_odoo_crm.anonymization_level',
        default='none',
        help="Placeholder: Default strategy for handling detected PII (Requires Phase 4+)."
    )
    jtbd_default_consent_level = fields.Selection(
         selection=[('none', 'None Provided'), ('basic', 'Basic Usage'), ('analytics', 'Analytics Allowed'), ('ai_processing', 'AI Processing Allowed')],
         string="Default Consent Level",
         config_parameter='jtbd_odoo_crm.default_consent_level',
         default='basic', # Default to basic usage? Adjust as needed
         help="Default privacy consent level assumed if not explicitly set."
    )
    jtbd_data_retention_days = fields.Integer(
         string="JTBD Data Retention (Days)",
         config_parameter='jtbd_odoo_crm.data_retention_days',
         default=0, # 0 means keep indefinitely by default
         help="Placeholder: Default retention period in days for detailed JTBD analysis data (0=Indefinite). Requires Phase 4+ Automation."
    )

    # --- JTBD Resilience Settings ---
    jtbd_resilience_ai_fallback_mode = fields.Selection(
         [('error', 'Error / Manual Intervention'),
          ('rule_based', 'Use Rules-Based Fallback'),
          ('cached', 'Use Last Known Good (Cached)')],
         string="AI Service Fallback Mode",
         config_parameter='jtbd_odoo_crm.resilience_ai_fallback',
         default='error',
         help="Placeholder: How to handle failures when calling external AI services (Requires Phase 4+)."
     )
    jtbd_resilience_integration_retry_count = fields.Integer(
         string="Integration Retry Attempts",
         config_parameter='jtbd_odoo_crm.resilience_integration_retry_count',
         default=3,
         help="Placeholder: Default number of retry attempts for failed external integrations."
     )