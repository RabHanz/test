# -*- coding: utf-8 -*-
{
    'name': "JTBD/ODI for Agency Consulting",
    'summary': """Implements the JTBD/ODI framework within Odoo CRM, tailored for agency consulting businesses.""",
    'description': """Phase 1 & 2 Complete: Core JTBD fields, Job Statement Builder, Force Analysis (Push/Pull/Anxiety/Habit), Outcome Mapping, basic Project Creation from Sale based on JTBD category.""",
    'author': "Odoo CRM Specialist (AI)",
    'website': "https://onnyx.cloud",
    'category': 'CRM',
    'version': '18.0.2.5.0',
    'license': 'OPL-1',
    'depends': [
        'base',
        'crm',
        'web',
        'mail',
        'sale',
        'project',
        'sale_project', # Dependency needed for project integration
    ],
    'data': [
        # Security files first
        'security/jtbd_security.xml',
        'security/ir.model.access.csv', # Standard loading

        # Wizard views
        'wizards/jtbd_job_statement_builder_views.xml',
        'wizards/jtbd_common_force_wizard_views.xml',
        'wizards/jtbd_outcome_template_wizard_views.xml',
        'wizards/jtbd_outcome_suggestion_wizard_views.xml',

        # View files (Order matters less here, but logical grouping helps)
        'views/jtbd_job_pattern_views.xml',
        'views/jtbd_outcome_pattern_views.xml',
        'views/jtbd_force_analysis_views.xml',
        'views/jtbd_outcome_mapping_views.xml',
        'views/jtbd_integration_settings_views.xml', # Placeholder views
        'views/project_views.xml', # Adds jtbd_is_template & jtbd_onboarding_status
        'views/crm_lead_views.xml', # Adds JTBD tab and buttons

        # Data files last
        'data/jtbd_job_pattern_data.xml',
        'data/jtbd_outcome_pattern_data.xml',
        'data/jtbd_common_force_data.xml',
    ],

    'installable': True,
    'application': True,
    'auto_install': False,
}