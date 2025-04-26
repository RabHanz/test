# -*- coding: utf-8 -*-
{
    'name': "JTBD/ODI for Agency Consulting",
    'summary': """Implements the JTBD/ODI framework within Odoo CRM, tailored for agency consulting businesses.""",
    'description': """Phase 1, 2 & 3 Complete: Core JTBD fields, Wizards (Job Statement, Force Add, Outcome Suggest/Template, Trace Link Create), Analysis Tools (Force, Outcome), Foundational Models (Patterns, Integration, Evolution, Content, Portfolio, Transfer, Trace Link, Analytics, Config), Project Integration (Template + Milestone Tasks), Basic Feedback Triggers, Enhanced CRM Views with all P3 fields.""",
    'author': "StrategyLyft-RH",
    'website': "https://strategylyft.com",
    'category': 'CRM',
    'version': '18.0.3.0.0', # Version for P3 completion
    'license': 'OPL-1',
    'depends': [
        'base',
        'crm',
        'web',
        'mail',
        'sale',
        'project',
        'sale_project',
        'base_automation', # Dependency for automation rules
        'http_routing', # Often useful for webhooks/controllers
    ],
    'data': [
        # Security files first
        'security/jtbd_security.xml',
        'security/ir.model.access.csv',

        # Wizard views
        'wizards/jtbd_job_statement_builder_views.xml',
        'wizards/jtbd_common_force_wizard_views.xml',
        'wizards/jtbd_outcome_template_wizard_views.xml',
        'wizards/jtbd_outcome_suggestion_wizard_views.xml',
        'wizards/jtbd_create_trace_link_wizard_views.xml', # Added in P3

        # Model Views
        'views/jtbd_job_pattern_views.xml',
        'views/jtbd_outcome_pattern_views.xml',
        'views/jtbd_common_force_description_views.xml',
        'views/jtbd_force_analysis_views.xml',
        'views/jtbd_outcome_mapping_views.xml',
        'views/jtbd_intent_signal_views.xml', # Added in P3
        'views/jtbd_job_evolution_views.xml', # Added in P3
        'views/jtbd_content_alignment_views.xml', # Added in P3
        'views/jtbd_job_portfolio_views.xml', # Added in P3
        'views/jtbd_knowledge_transfer_views.xml', # Added in P3
        'views/jtbd_trace_link_views.xml', # Added in P3
        'views/jtbd_integration_settings_views.xml', # Enhanced in P3
        'views/jtbd_analytics_report_views.xml', # Added in P3
        'views/jtbd_settings_views.xml', # Added in P3
        'views/project_views.xml', # Includes jtbd fields
        'views/crm_lead_views.xml', # Includes all JTBD fields/tabs

        # Data files & Automation Rules (Load after models/views they depend on)
        'data/jtbd_job_pattern_data.xml',
        'data/jtbd_outcome_pattern_data.xml',
        'data/jtbd_common_force_data.xml',
        'data/jtbd_server_actions_data.xml', # Added in P3
        'data/jtbd_base_automation_data.xml', # Added in P3
    ],

    'installable': True,
    'application': True,
    'auto_install': False,
}