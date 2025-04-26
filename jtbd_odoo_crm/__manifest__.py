# -*- coding: utf-8 -*-
{
    'name': "JTBD/ODI for Agency Consulting",
    'summary': """Implements the JTBD/ODI framework within Odoo CRM, tailored for agency consulting businesses.""",
    'description': """JTBD/ODI Foundation (PRD3 Phase 1 & 2) Complete: Core JTBD data fields, Job Statement Builder, Force Analysis (Push/Pull/Anxiety/Habit types), Outcome Mapping tool foundation (including wizards & basic viz), basic Project Creation link from Sales Order (using JTBD category for template selection), foundational models/views for Patterns & Integration settings, relevant security. Deferred P1 fields included. Missing PRD3 P1/P2 items: Anonymization, Privacy Fwk, Resilience Fwk, Trace Link Fwk, full Onboarding Flow, ML Attribution foundation.""",
    'author': "StrategyLyft-RH)",
    'website': "https://strategylyft.com",
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
        'sale_project',
        'base_automation',
        'http_routing',
    ],
    'data': [
        # 1. Security First
        'security/jtbd_security.xml',
        'security/ir.model.access.csv',

        # 2. Base Model Views (creating views for NEW models first)
        'views/jtbd_job_pattern_views.xml',
        'views/jtbd_outcome_pattern_views.xml',
        'views/jtbd_force_analysis_views.xml', # Includes list/form for analysis & item
        'views/jtbd_outcome_mapping_views.xml', # Includes list/form for mapping, additional, milestone
        'views/jtbd_integration_settings_views.xml', # Includes list/form for settings & mapping
        'views/jtbd_intent_signal_views.xml', # Includes list/form/search
        'views/jtbd_job_evolution_views.xml', # Includes list/form
        'views/jtbd_job_portfolio_views.xml', # Includes list/form
        'views/jtbd_knowledge_transfer_views.xml', # Includes list/form
        'views/jtbd_trace_link_views.xml',
        'views/jtbd_settings_views.xml',
        'views/jtbd_analytics_report_views.xml',
        # Add views for helper models if created (e.g., common force description)
        # 'views/jtbd_common_force_description_views.xml',

        # 3. Wizard Views
        'wizards/jtbd_job_statement_builder_views.xml',
        'wizards/jtbd_common_force_wizard_views.xml',
        'wizards/jtbd_outcome_template_wizard_views.xml',
        'wizards/jtbd_outcome_suggestion_wizard_views.xml',
        'wizards/jtbd_create_trace_link_wizard_views.xml',

        # 4. Inherited Views (modifying existing models like crm.lead, project.project)
        'views/crm_lead_views.xml', # THIS FILE (should load after base model views)
        'views/project_views.xml',
        
        # 5. Server Actions before Automation Rules
        'data/jtbd_server_actions_data.xml',

        # 6. Data Files Last
        'data/jtbd_job_pattern_data.xml',
        'data/jtbd_outcome_pattern_data.xml',
        'data/jtbd_common_force_data.xml',
        'data/jtbd_base_automation_data.xml',
    ],

    'installable': True,
    'application': True,
    'auto_install': False,
}