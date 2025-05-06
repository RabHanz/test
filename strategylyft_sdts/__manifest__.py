# -*- coding: utf-8 -*-
{
    'name': "StrategyLyft (SDTS)",
    'summary': """Complete JTBD/ODI framework integration for Odoo CRM, enabling job-driven sales, analysis, and delivery. Strategy Design Transformation System""",
    'description': """Phase 1-4 Complete & Aligned with PRD3 Enhanced Flow (Inbound/Outbound/Provenance): Implements the full Odoo-specific scope. Includes core JTBD fields, Wizards, Force Analysis, Outcome Mapping, Project Integration, CRM fields (incl. Data Source/Confidence/Progression/Outbound context), foundational models (Patterns, Integration, Evolution, Content, Portfolio, Transfer, Trace Links, Provenance, Analytics, Config, Outbound Seq/Eng/Step, Unified Journey), placeholder AI/Automation triggers, feedback mechanisms, and related views/wizards/security.""",
    'author': "Rabea Hanzla",
    'website': "https://strategylyft.com",
    'category': 'CRM',
    'version': '18.0.4.3.0', # Version reflects P4 + V4 Refactor completion
    'license': 'OPL-1',
    'depends': [
        'base', 'crm', 'web', 'mail', 'sale', 'project', 'sale_project',
        'base_automation', 'http_routing',
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

        # Model Views (Order for menu generation, then dependencies)
        'views/jtbd_job_pattern_views.xml',
        'views/jtbd_job_category_views.xml',
        'views/jtbd_agency_type_views.xml',
        'views/jtbd_tech_stack_views.xml',

        'views/jtbd_outcome_pattern_views.xml',
        'views/jtbd_common_force_description_views.xml',
        'views/jtbd_integration_settings_views.xml',
        'views/jtbd_code_snippet_views.xml',
        'views/jtbd_settings_views.xml',
        'views/jtbd_outbound_views.xml', # New V4 Views
        'views/jtbd_intent_signal_views.xml',
        'views/jtbd_job_evolution_views.xml',
        'views/jtbd_content_alignment_views.xml',
        'views/jtbd_job_portfolio_views.xml',
        'views/jtbd_knowledge_transfer_views.xml',
        'views/jtbd_trace_link_views.xml',
        'views/jtbd_analytics_report_views.xml',
        'views/jtbd_data_provenance_views.xml', # New V4 Views
        'views/jtbd_unified_journey_views.xml', # New V4 Views

        'views/jtbd_force_analysis_views.xml', # Core tool view
        'views/jtbd_outcome_mapping_views.xml',# Core tool view

        # Inherited Model Views (Load Last)
        'views/project_views.xml',
        'views/res_partner_views.xml',
        'views/crm_lead_views.xml', # Includes ALL fields

        # Data files & Automation Rules
        'data/jtbd_job_category_data.xml',
        'data/jtbd_agency_type_data.xml',
        'data/jtbd_tech_stack_data.xml',
        'data/jtbd_job_pattern_data.xml',
        'data/jtbd_outcome_pattern_data.xml',
        'data/jtbd_common_force_data.xml', # Refactored data
        'data/jtbd_server_actions_data.xml', # Includes outbound placeholders
        'data/jtbd_base_automation_data.xml', # Includes outbound triggers
    ],

    'installable': True,
    'application': True,
    'auto_install': False,
}