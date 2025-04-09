# -*- coding: utf-8 -*-
{
    'name': "JTBD/ODI for Agency Consulting",
    'summary': """Implements the JTBD/ODI framework within Odoo CRM, tailored for agency consulting businesses.""",
    'description': """This module provides a structured approach to capturing client jobs, analyzing buying forces, mapping outcomes, and integrating insights across the customer lifecycle using modern, guided tools. 
    Key features include:
      - Job Statement Builder Wizard
      - Force Analysis Tool (Planned)
      - Outcome Mapping (Planned)
      - Ecosystem Integration Framework (Planned)
      - JTBD Analytics Dashboard (Planned)""",
    'author': "Odoo CRM Specialist (AI)",
    'website': "http://www.example.com",
    'category': 'CRM',
    'version': '18.0.2.0.0', # Increment version for Phase 2
    'license': 'OPL-1',
    'depends': [
        'base',
        'crm',
        'web',
        'mail', # Keep mail dependency
    ],
    'data': [
        # Security files first
        'security/jtbd_security.xml',
        'security/ir.model.access.csv',

        # Wizard views
        'wizards/jtbd_job_statement_builder_views.xml',
        'wizards/jtbd_common_force_wizard_views.xml', # New
        'wizards/jtbd_outcome_template_wizard_views.xml', # New
        'wizards/jtbd_outcome_suggestion_wizard_views.xml', # New

        # View files
        'views/jtbd_job_pattern_views.xml',
        'views/jtbd_integration_settings_views.xml',
        'views/jtbd_force_analysis_views.xml', # New
        'views/jtbd_outcome_mapping_views.xml', # New
        'views/jtbd_outcome_pattern_views.xml', # New
        'views/crm_lead_views.xml', # Contains modifications

        # Data files last
        'data/jtbd_job_pattern_data.xml',
        'data/jtbd_outcome_pattern_data.xml', # New
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
}