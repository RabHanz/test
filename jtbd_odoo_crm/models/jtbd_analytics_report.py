# -*- coding: utf-8 -*-

from odoo import models, fields, api, tools, _
from .jtbd_job_pattern import JOB_CATEGORIES
from .crm_lead import JOB_QUADRANTS

class JtbdPipelineAnalysis(models.Model):
    _name = 'jtbd.pipeline.analysis'
    _description = 'JTBD Pipeline Analysis (Read-Only)'
    _auto = False
    _rec_name = 'lead_id'

    # Lead/Opp Fields
    lead_id = fields.Many2one('crm.lead', string='Opportunity/Lead', readonly=True)
    lead_name = fields.Char(string="Lead Name", readonly=True) # Removed related=, fetch in SQL
    stage_id = fields.Many2one('crm.stage', string='Stage', readonly=True)
    team_id = fields.Many2one('crm.team', string='Sales Team', readonly=True)
    user_id = fields.Many2one('res.users', string='Salesperson', readonly=True)
    company_id = fields.Many2one('res.company', string='Company', readonly=True)
    partner_id = fields.Many2one('res.partner', string='Customer', readonly=True)
    create_date = fields.Datetime(string='Creation Date', readonly=True)
    date_closed = fields.Datetime(string='Close Date', readonly=True)
    active = fields.Boolean(string="Lead Active", readonly=True) # Removed related=, fetch in SQL
    probability = fields.Float(string="Probability", readonly=True, aggregator='avg') # Removed related=, fetch in SQL

    # --- ADD Currency Field ---
    currency_id = fields.Many2one('res.currency', string='Currency', readonly=True)
    # --- END Currency Field ---

    # --- Monetary Fields - ADD currency_field attribute ---
    expected_revenue = fields.Monetary(
        string="Expected Revenue", readonly=True, aggregator='sum',
        currency_field='currency_id' # Specify the currency field
    )
    est_mrr = fields.Monetary(
        string='Est. MRR/Value', readonly=True, aggregator='sum',
        currency_field='currency_id' # Specify the currency field
    )
    # --- END Monetary Fields ---

    # JTBD Core Fields
    job_category = fields.Selection(selection=JOB_CATEGORIES, string='Job Category', readonly=True)
    job_quadrant = fields.Selection(selection=JOB_QUADRANTS, string='Job Quadrant', readonly=True)
    job_clarity_score = fields.Integer(string='Job Clarity Score', readonly=True, aggregator='avg')

    # Force Analysis Summary
    momentum_score = fields.Integer(string='Momentum Score', readonly=True, aggregator='avg')
    signal_strength = fields.Integer(string='Signal Strength', readonly=True, aggregator='avg')
    risk_level = fields.Selection([('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('undefined', 'Undefined')], string='Risk Level', readonly=True)
    trigger_window = fields.Selection([('immediate', 'Immediate'), ('short', 'Short-term'), ('medium', 'Medium-term'), ('long', 'Long-term'), ('undefined', 'Undefined')], string='Decision Window', readonly=True)

    # Outcome Mapping Summary
    primary_outcome_metric = fields.Char(string='Primary Outcome Metric', readonly=True)
    primary_outcome_progress = fields.Float(string='Outcome Progress (%)', readonly=True, aggregator='avg')
    outcome_status = fields.Selection([('no_data', 'No Data'), ('on_baseline', 'On Baseline'), ('negative', 'Regressed'), ('improving', 'Improving'), ('achieved', 'Achieved'), ('exceeded', 'Exceeded')], string="Outcome Status", readonly=True)

    # Economic Analysis
    ltv_cac_ratio = fields.Float(string='LTV:CAC Ratio', readonly=True, aggregator='avg')

    # Other Profile Fields
    agency_size = fields.Integer(string='Agency Size', readonly=True, aggregator='avg')
    account_tier = fields.Selection([('strategic', 'Strategic'), ('target', 'Target'), ('watch', 'Watch'), ('other', 'Other')], string="Account Tier", readonly=True)

    # Define SQL View Creation
    def init(self):
        """ Create the SQL view on module install/update """
        # Use self.env.company.id to ensure correct context
        # Ensure all fields selected exist on the source tables
        query = """
            DROP VIEW IF EXISTS %(table_name)s;
            CREATE OR REPLACE VIEW %(table_name)s AS (
                SELECT
                    l.id as id,
                    l.id as lead_id,
                    l.name as lead_name,
                    l.stage_id,
                    l.team_id,
                    l.user_id,
                    l.company_id,
                    l.partner_id,
                    l.create_date,
                    l.date_closed,
                    l.active,
                    l.probability,
                    -- Select the currency ID directly from the company table
                    c.currency_id as currency_id,
                    -- Monetary fields
                    l.expected_revenue,
                    l.jtbd_mrr as est_mrr,
                    -- Core JTBD
                    l.jtbd_job_category as job_category,
                    l.jtbd_job_quadrant as job_quadrant,
                    l.jtbd_job_clarity_score as job_clarity_score,
                    -- Force Analysis Summary FROM LEAD
                    l.jtbd_momentum_score as momentum_score,
                    l.jtbd_signal_strength as signal_strength,
                    l.jtbd_risk_level as risk_level,
                    l.jtbd_trigger_window as trigger_window,
                    -- Outcome Mapping Summary (latest if multiple)
                    om.outcome_metric as primary_outcome_metric,
                    om.primary_outcome_progress,
                    om.jtbd_outcome_status as outcome_status,
                    -- Economic Analysis
                    l.jtbd_ltv_cac_ratio as ltv_cac_ratio,
                    -- Other Profile Fields
                    l.jtbd_agency_size as agency_size,
                    l.jtbd_account_tier as account_tier

                FROM
                    crm_lead l
                -- Use LEFT JOIN in case company_id is NULL on lead, fallback to env company
                LEFT JOIN res_company c ON l.company_id = c.id
                LEFT JOIN LATERAL (
                    SELECT om_sub.lead_id, om_sub.outcome_metric, om_sub.primary_outcome_progress, om_sub.jtbd_outcome_status
                    FROM jtbd_outcome_mapping om_sub
                    WHERE om_sub.lead_id = l.id ORDER BY om_sub.create_date DESC, om_sub.id DESC LIMIT 1
                ) om ON true
                WHERE l.type = 'opportunity'
                  -- Ensure we only select leads from the current company context or without company
                  AND (l.company_id IS NULL OR l.company_id = %(company_id)s)
            )
        """
        params = {'table_name': self._table, 'company_id': self.env.company.id}
        # Drop before create for cleaner updates
        tools.drop_view_if_exists(self.env.cr, self._table)
        self.env.cr.execute(query % params)