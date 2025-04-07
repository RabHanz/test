# -*- coding: utf-8 -*-
{
    'name': "JTBD/ODI for Agency Consulting",
    'summary': """
        Implements the Jobs-to-be-Done (JTBD) and Outcome-Driven Innovation (ODI)
        framework within Odoo CRM, tailored for agency consulting businesses.""",
    'description': """
        This module provides a structured approach to capturing client jobs,
        analyzing buying forces, mapping outcomes, and integrating insights
        across the customer lifecycle using modern, guided tools.
        Key features include:
        - Job Statement Builder Wizard
        - Force Analysis Tool (Planned)
        - Outcome Mapping (Planned)
        - Ecosystem Integration Framework (Planned)
        - JTBD Analytics Dashboard (Planned)
    """,
    'author': "Odoo CRM Specialist (AI)",
    'website': "http://www.example.com", # Replace with your website if desired
    'category': 'CRM',
    'version': '18.0.1.0.0', # Updated Version
    'license': 'OPL-1', # Or 'LGPL-3' or other appropriate license

    # any module necessary for this one to work correctly
    'depends': [
        'base',
        'crm',
        'web', # Needed for UI elements like statusbar, etc.
        'mail', # Needed for chatter integration
        ],

    # always loaded
    'data': [
        'security/jtbd_security.xml',
        'security/ir.model.access.csv',
        'wizards/jtbd_job_statement_builder_views.xml',
        'views/crm_lead_views.xml',
        'views/jtbd_job_pattern_views.xml',
        'views/jtbd_integration_settings_views.xml',
        'data/jtbd_job_pattern_data.xml',
    ],
    # only loaded in demonstration mode
    'demo': [
        # 'demo/demo.xml', # Can add demo data later if needed
    ],
    'installable': True,
    'application': True, # Set to True if this is a standalone application
    'auto_install': False,
}