# __manifest__.py
{
    'name': 'JTBD Project Automation',
    'version': '1.0',
    'category': 'CRM',
    'summary': 'Automatically create projects and tasks from CRM opportunities based on Jobs-to-be-Done framework',
    'description': """
        This module extends Odoo CRM and Project to implement Jobs-to-be-Done framework:
        
        - Custom fields for JTBD in CRM
        - Project templates by job category
        - Automated project and task creation
        - Client outcome tracking
        - JTBD dashboards for sales, project managers, and executives
    """,
    'author': 'Onnyx Cloud',
    'website': 'https://www.onnyx.cloud',
    'depends': [
        'base',
        'crm',
        'project',
        'mail',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/crm_lead_views.xml',
        'views/project_views.xml',
        'views/project_task_views.xml',
        'views/dashboard_views.xml',
        'views/menu_actions.xml',
        'data/project_templates.xml',
        'data/task_templates.xml',
        'data/automated_actions.xml',
    ],
    'demo': [],
    'installable': True,
    'application': False,
    'auto_install': False,
    'license': 'LGPL-3',
}