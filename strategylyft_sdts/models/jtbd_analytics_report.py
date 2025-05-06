# -*- coding: utf-8 -*-

from odoo import models, fields, api, tools, _
from odoo.exceptions import UserError, ValidationError
import logging
try:
    import psycopg2 # Import for catching SQL errors
except ImportError:
    psycopg2 = None

_logger = logging.getLogger(__name__)

# --- Define Selection Lists Locally ---
JOB_QUADRANTS_LOCAL = [ ('functional', 'Functional Job'), ('emotional', 'Emotional Job'), ('social', 'Social Job'), ('strategic', 'Strategic Job'), ('other', 'Other') ]
PROGRESSION_STATUS_SELECTION = [ ('outbound_prospect', 'Outbound Prospect'), ('outbound_engaging', 'Outbound Engaging'), ('inbound_lead', 'Inbound Lead'), ('inbound_mql', 'Inbound MQL'), ('sales_working', 'Sales Working (SQL/Opportunity)'), ('customer', 'Customer'), ('dormant', 'Dormant'), ('disqualified', 'Disqualified'), ('unknown', 'Unknown / Not Set') ]
DATA_SOURCE_LABEL_SELECTION = [ ('funnel_1', 'Funnel 1: Webinar'), ('funnel_2', 'Funnel 2: Quiz'), ('funnel_3', 'Funnel 3: Ad Response'), ('scraped_web', 'Scraped - Web Forum'), ('scraped_social', 'Scraped - Social Media'), ('scraped_other', 'Scraped - Other'), ('manual_crm', 'Manual CRM Entry'), ('manual_discovery', 'Manual Discovery Call'), ('survey', 'Survey Data'), ('partner', 'Partner Referral'), ('support_ticket', 'Support Ticket'), ('website_behavior', 'Website Behavior'), ('email_engagement', 'Email Engagement'), ('outbound_research', 'Outbound Research'), ('unknown', 'Unknown Origin'), ('other', 'Other Source') ]
AUTOMATION_SOURCE_SELECTION = [ ('inbound', 'Inbound'), ('outbound', 'Outbound'), ('referral', 'Referral'), ('partner', 'Partner'), ('other', 'Other'), ('unknown', 'Unknown') ]
RISK_LEVEL_SELECTION = [('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('undefined', 'Undefined')]
TRIGGER_WINDOW_SELECTION = [('immediate', 'Immediate'), ('short', 'Short-term'), ('medium', 'Medium-term'), ('long', 'Long-term'), ('undefined', 'Undefined')]
OUTCOME_STATUS_SELECTION = [('no_data', 'No Data'), ('on_baseline', 'On Baseline'), ('negative', 'Regressed'), ('improving', 'Improving'), ('achieved', 'Achieved'), ('exceeded', 'Exceeded')]
ACCOUNT_TIER_SELECTION = [('strategic', 'Strategic'), ('target', 'Target'), ('watch', 'Watch'), ('other', 'Other')]
# --- End Local Selection Definitions ---


class JtbdPipelineAnalysis(models.Model):
    _name = 'jtbd.pipeline.analysis'
    _description = 'JTBD Pipeline Analysis (Read-Only)'
    _auto = False
    _rec_name = 'lead_id'
    _order = 'create_date desc'

    # --- Field Definitions ---
    lead_id = fields.Many2one('crm.lead', string='Opportunity/Lead', readonly=True) # Removed key=True, managed by SQL
    lead_name = fields.Char(string="Lead Name", readonly=True)
    stage_id = fields.Many2one('crm.stage', string='Stage', readonly=True)
    team_id = fields.Many2one('crm.team', string='Sales Team', readonly=True)
    user_id = fields.Many2one('res.users', string='Salesperson', readonly=True)
    company_id = fields.Many2one('res.company', string='Company', readonly=True)
    partner_id = fields.Many2one('res.partner', string='Customer', readonly=True)
    create_date = fields.Datetime(string='Creation Date', readonly=True)
    date_closed = fields.Datetime(string='Close Date', readonly=True)
    active = fields.Boolean(string="Lead Active", readonly=True)
    probability = fields.Float(string="Probability", readonly=True, aggregator='avg')
    currency_id = fields.Many2one('res.currency', string='Currency', readonly=True) # Defined in model
    expected_revenue = fields.Monetary(string="Expected Revenue", readonly=True, aggregator='sum', currency_field='currency_id')
    est_mrr = fields.Monetary(string='Est. MRR/Value', readonly=True, aggregator='sum', currency_field='currency_id')
    job_category_id = fields.Many2one('jtbd.job.category', string='Job Category', readonly=True)
    job_quadrant = fields.Selection(selection=JOB_QUADRANTS_LOCAL, string='Job Quadrant', readonly=True)
    job_clarity_score = fields.Integer(string='Job Clarity Score', readonly=True, aggregator='avg')
    momentum_score = fields.Integer(string='Momentum Score', readonly=True, aggregator='avg')
    signal_strength = fields.Integer(string='Signal Strength', readonly=True, aggregator='avg')
    risk_level = fields.Selection(selection=RISK_LEVEL_SELECTION, string='Risk Level', readonly=True)
    trigger_window = fields.Selection(selection=TRIGGER_WINDOW_SELECTION, string='Decision Window', readonly=True)
    primary_outcome_metric = fields.Char(string='Primary Outcome Metric', readonly=True)
    primary_outcome_progress = fields.Float(string='Outcome Progress (%)', readonly=True, aggregator='avg', digits=(16,1))
    outcome_status = fields.Selection(selection=OUTCOME_STATUS_SELECTION, string="Outcome Status", readonly=True)
    ltv_cac_ratio = fields.Float(string='LTV:CAC Ratio', readonly=True, aggregator='avg')
    agency_size = fields.Integer(string='Agency Size', readonly=True, aggregator='avg')
    account_tier = fields.Selection(selection=ACCOUNT_TIER_SELECTION, string="Account Tier", readonly=True)
    data_source_label = fields.Selection(selection=DATA_SOURCE_LABEL_SELECTION, string='Primary Data Source', readonly=True)
    source_confidence_score = fields.Float(string='Source Confidence', readonly=True, digits=(3, 2), aggregator='avg')
    contact_progression_status = fields.Selection(selection=PROGRESSION_STATUS_SELECTION, string='Progression Status', readonly=True)
    automation_source = fields.Selection(selection=AUTOMATION_SOURCE_SELECTION, string="Lead Source Type", readonly=True)

    # --- _auto_init using direct SQL check ---
    @api.model
    def _auto_init(self):
        """ Override to defer view creation until dependent columns exist. """
        res = super(JtbdPipelineAnalysis, self)._auto_init()
        required_lead_columns = [ 'jtbd_mrr', 'jtbd_job_category_id', 'jtbd_job_quadrant', 'jtbd_job_clarity_score', 'jtbd_momentum_score', 'jtbd_signal_strength', 'jtbd_risk_level', 'jtbd_trigger_window', 'jtbd_ltv_cac_ratio', 'jtbd_agency_size', 'jtbd_account_tier', 'jtbd_data_source_label', 'jtbd_source_confidence_score', 'jtbd_contact_progression_status', 'jtbd_automation_source' ]
        all_columns_exist = True
        missing_cols = []

        # --- Use direct SQL query to information_schema ---
        # This avoids relying on potentially unavailable tools.column_exists or connection info attributes
        check_query = """
            SELECT column_name FROM information_schema.columns
            WHERE table_name = 'crm_lead' AND column_name = %s
        """
        _logger.debug(f"Checking existence of columns in crm_lead for {self._table} view: {required_lead_columns}")
        try:
            for col in required_lead_columns:
                self.env.cr.execute(check_query, (col,))
                if self.env.cr.fetchone() is None:
                    all_columns_exist = False
                    missing_cols.append(col)
                    # Optional: Break early if one is missing
                    # break
            _logger.debug(f"Column existence check complete. Missing: {missing_cols}")

        except (psycopg2.Error, Exception) if psycopg2 else Exception as e:
            _logger.error(f"Error performing SQL column existence check for crm_lead: {e}", exc_info=True)
            all_columns_exist = False # Assume failure if query fails
            missing_cols = required_lead_columns

        # --- Conditional View Creation ---
        if all_columns_exist:
            _logger.info(f"Dependent columns found in crm_lead. Proceeding with SQL view creation for {self._table}.")
            self._create_or_replace_view() # Call the view creation method
        else:
            _logger.warning(f"Deferring SQL view creation for {self._table}: Missing columns in crm_lead: {missing_cols}. View will be created on next update/restart.")

        return res

    def _create_or_replace_view(self):
        """ Creates or replaces the SQL view for pipeline analysis. """
        _logger.info(f"Creating/Replacing SQL View: {self._table}")
        query = """
            CREATE OR REPLACE VIEW %(table_name)s AS (
                SELECT
                    l.id as id, l.id as lead_id, l.name as lead_name, l.stage_id, l.team_id,
                    l.user_id, l.company_id, l.partner_id, l.create_date, l.date_closed, l.active, l.probability,
                    rc.currency_id as currency_id, l.expected_revenue, l.jtbd_mrr as est_mrr,
                    l.jtbd_job_category_id as job_category_id, l.jtbd_job_quadrant as job_quadrant,
                    l.jtbd_job_clarity_score as job_clarity_score, l.jtbd_momentum_score as momentum_score,
                    l.jtbd_signal_strength as signal_strength, l.jtbd_risk_level as risk_level,
                    l.jtbd_trigger_window as trigger_window, om.outcome_metric as primary_outcome_metric,
                    om.primary_outcome_progress, om.jtbd_outcome_status as outcome_status,
                    l.jtbd_ltv_cac_ratio as ltv_cac_ratio, l.jtbd_agency_size as agency_size,
                    l.jtbd_account_tier as account_tier, l.jtbd_data_source_label as data_source_label,
                    l.jtbd_source_confidence_score as source_confidence_score,
                    l.jtbd_contact_progression_status as contact_progression_status,
                    l.jtbd_automation_source as automation_source
                FROM
                    crm_lead l
                LEFT JOIN res_company rc ON l.company_id = rc.id
                LEFT JOIN LATERAL (
                    SELECT om_sub.outcome_metric, om_sub.primary_outcome_progress, om_sub.jtbd_outcome_status
                    FROM jtbd_outcome_mapping om_sub
                    WHERE om_sub.lead_id = l.id ORDER BY om_sub.create_date DESC, om_sub.id DESC LIMIT 1
                ) om ON true
                WHERE l.type = 'opportunity'
            )
        """
        params = {'table_name': self._table}
        # Use odoo.tools.sql.drop_view_if_exists for better cross-DB compatibility if needed
        tools.drop_view_if_exists(self.env.cr, self._table)
        try:
            self.env.cr.execute(query % params)
            _logger.info(f"Successfully created/replaced SQL View: {self._table}")
        except Exception as e:
            _logger.error(f"CRITICAL FAILURE: Failed to create/replace SQL View {self._table}: {e}", exc_info=True)
            raise UserError(_("Database View creation failed for JTBD Pipeline Analysis. Module cannot be installed/upgraded correctly. Please check server logs for details. Error: %s") % str(e)) from e