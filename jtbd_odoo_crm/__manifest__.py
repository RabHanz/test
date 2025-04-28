# -*- coding: utf-8 -*-
{
    'name': "JTBD/ODI for Agency Consulting",
    'summary': """Complete JTBD/ODI framework integration for Odoo CRM, enabling job-driven sales, analysis, and delivery.""",
    'description': """Phase 1-4 Complete: Implements the full Odoo-specific scope outlined in PRD3. Includes core JTBD fields, Job Statement Builder, comprehensive Force Analysis (Push/Pull/Anxiety/Habit), Outcome Mapping tool, Project Creation w/ templating & milestone tasks, numerous CRM fields for profiling/economics/decision/health/content/etc., foundational models for Evolution/Portfolio/Content/Transfer/Integration/Traceability/Analytics, placeholder AI/Automation triggers, basic feedback mechanisms, and related views/wizards/security.""",
    'author': "StrategyLyft-RH",
    'website': "https://strategylyft.com",
    'category': 'CRM',
    'version': '18.0.4.0.0', # Version for P4 completion
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
        'http_routing', # For webhook controller
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
        'wizards/jtbd_create_trace_link_wizard_views.xml',

        # Model Views (Order influences menu appearance slightly)
        'views/jtbd_job_pattern_views.xml',
        'views/jtbd_outcome_pattern_views.xml',
        'views/jtbd_common_force_description_views.xml',
        'views/jtbd_integration_settings_views.xml', # Includes log views/action
        'views/jtbd_code_snippet_views.xml', # Add Integration Code Snippets
        'views/jtbd_settings_views.xml', # Config settings view
        'views/jtbd_force_analysis_views.xml',
        'views/jtbd_outcome_mapping_views.xml',
        'views/jtbd_intent_signal_views.xml',
        'views/jtbd_job_evolution_views.xml',
        'views/jtbd_content_alignment_views.xml',
        'views/jtbd_job_portfolio_views.xml',
        'views/jtbd_knowledge_transfer_views.xml',
        'views/jtbd_trace_link_views.xml',
        'views/jtbd_analytics_report_views.xml', # Reporting view
        'views/project_views.xml', # Inherited view
        'views/res_partner_views.xml', # Inherited view
        'views/crm_lead_views.xml', # Inherited view (Load last among model views)

        # Data files & Automation Rules
        'data/jtbd_job_pattern_data.xml',
        'data/jtbd_outcome_pattern_data.xml',
        'data/jtbd_common_force_data.xml',
        'data/jtbd_server_actions_data.xml',
        'data/jtbd_base_automation_data.xml',
    ],

    'installable': True,
    'application': True,
    'auto_install': False,
}