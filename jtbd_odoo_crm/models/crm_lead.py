# -*- coding: utf-8 -*-

import re
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
import logging # Import logging

_logger = logging.getLogger(__name__) # Initialize logger

# Define selection values here to avoid duplication
JOB_QUADRANTS = [
    ('functional', 'Functional Job'),
    ('emotional', 'Emotional Job'),
    ('social', 'Social Job'),
    ('strategic', 'Strategic Job'),
    ('other', 'Other'),
]

# Define minimum length for validation in score calculation
MIN_TEXT_LENGTH_SCORE = 10

class CrmLead(models.Model):
    _inherit = 'crm.lead'

    # --- Core JTBD Framework Fields (Phase 1) ---
    jtbd_job_category_id = fields.Many2one( # Renamed and changed type
        'jtbd.job.category', string='Job Category', index=True, tracking=True,
        ondelete='restrict',
        help="Primary Job-to-be-Done category identified for this opportunity."
    )
    jtbd_job_statement = fields.Text(
        string='Job Statement', tracking=True,
        help="Full Job Statement in 'When... I want... So I can...' format."
    )
    jtbd_job_quadrant = fields.Selection(
        selection=JOB_QUADRANTS, string='Job Quadrant', tracking=True,
        help="Classification of the primary job (Functional, Emotional, Social, Strategic)."
    )
    jtbd_job_clarity_score = fields.Integer(
        string='Job Clarity Score', compute='_compute_job_clarity_score', store=True,
        readonly=True, tracking=True, aggregator="avg",
        help="Score (0-100) indicating the clarity and completeness of the identified job statement."
    )

    # --- Analysis Summary Fields (Populated by Phase 2 Force Analysis Logic) ---
    jtbd_force_analysis_count = fields.Integer(
        compute='_compute_jtbd_analysis_counts', string="Force Analyses",
        help="Number of Force Analyses linked to this opportunity."
    )
    jtbd_momentum_score = fields.Integer(
        string='Momentum Score', readonly=True, tracking=True, aggregator="avg",
        help="Latest calculated momentum score (0-100) from Force Analysis."
    )
    jtbd_signal_strength = fields.Integer(
        string='Signal Strength', readonly=True, tracking=True, aggregator="avg",
        help="Latest calculated signal strength (0-100) combining intent and triggers."
    )
    jtbd_trigger_window = fields.Selection(
         [('immediate', 'Immediate (0-30 days)'),
          ('short', 'Short-term (1-3 months)'),
          ('medium', 'Medium-term (3-6 months)'),
          ('long', 'Long-term (6+ months)'),
          ('undefined', 'Undefined')],
         string='Decision Window', readonly=True, tracking=True,
         help="Estimated decision timing based on Force Analysis."
    )
    jtbd_contract_loss = fields.Boolean(
        string='Recent Contract Loss', readonly=True, tracking=True,
        help="Indicates if a significant contract loss was identified as a trigger."
    )
    jtbd_risk_level = fields.Selection(
        [('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('undefined', 'Undefined')],
        string='Risk Level', readonly=True, tracking=True,
        help="Risk assessment based on Force Analysis momentum."
    )

    # --- Outcome Summary Fields (Populated by Phase 2 Outcome Mapping Logic) ---
    jtbd_outcome_mapping_count = fields.Integer(
        compute='_compute_jtbd_analysis_counts', string="Outcome Maps",
        help="Number of Outcome Maps linked to this opportunity."
    )
    jtbd_outcome_metric = fields.Char(
        string='Primary Outcome Metric', readonly=True, tracking=True,
        help="The primary metric defined in the Outcome Mapping."
    )
    jtbd_white_space = fields.Text(
        string='White Space Opportunities', readonly=True, tracking=True,
        help="Identified expansion opportunities from Outcome Mapping."
    )
    
    # --- Inverse Relations for Related JTBD Records ---
    jtbd_force_analysis_ids = fields.One2many(
        'jtbd.force.analysis', # Related Model
        'lead_id', # Inverse Field Name on related model
        string='Force Analyses (Related)',
        readonly=True, # Typically read-only on the lead form itself
        help="Force Analyses associated with this opportunity."
    )
    jtbd_outcome_mapping_ids = fields.One2many(
        'jtbd.outcome.mapping', # Related Model
        'lead_id', # Inverse Field Name on related model
        string='Outcome Maps (Related)',
        readonly=True,
        help="Outcome Maps associated with this opportunity."
    )
    # --- End Inverse Relations ---    
    
    # --- Economic Analysis Fields (PRD3 Phase 3) ---
    jtbd_mrr = fields.Monetary(
        string="Est. MRR/Project Value", # Clarified label
        currency_field='company_currency', # Use company currency from base lead model
        tracking=True,
        help="Estimated Monthly Recurring Revenue or total value for project-based work."
    )
    # Placeholder for CAC - needed for ratio calculation
    jtbd_cac = fields.Monetary(
        string="Est. Customer Acquisition Cost (CAC)",
        currency_field='company_currency',
        tracking=True,
        help="Estimated cost to acquire this customer (Planned P3/P4)."
    )
    jtbd_ltv_cac_ratio = fields.Float(
        string="LTV:CAC Ratio",
        compute='_compute_ltv_cac_ratio',
        store=True, # Store the calculation
        readonly=True,
        aggregator='avg',
        tracking=True,
        help="Estimated Lifetime Value to Customer Acquisition Cost ratio (LTV based on Expected Revenue for now)."
    )

    # --- NEW Computed field for latest impact ---
    jtbd_latest_economic_impact = fields.Monetary(
        string="Latest Est. Economic Impact",
        compute='_compute_latest_economic_impact',
        currency_field='company_currency', # Use lead's company currency
        store=False, # No need to store, compute on demand
        readonly=True,
        help="Displays the Estimated Economic Impact from the most recent Outcome Map linked to this opportunity."
    )

    # --- End Economic Analysis Fields ---
    
    # --- Decision Analysis Fields (PRD3 Phase 3) ---
    jtbd_decision_authority = fields.Selection(
        [('economic', 'Economic Buyer'),
        ('champion', 'Champion'),
        ('influencer', 'Influencer'),
        ('technical', 'Technical Buyer/Gatekeeper'),
        ('user', 'End User'),
        ('multiple', 'Multiple/Committee'),
        ('unknown', 'Unknown')],
        string="Decision Authority Type",
        tracking=True,
        help="Primary role of the key contact(s) in the decision process."
    )
    # Using Text for forecast initially, can be M2M to tags/objection model later
    jtbd_objection_forecast = fields.Text(
        string="Objection Forecast",
        tracking=True,
        help="Anticipated objections or hurdles based on job, forces, or past experience."
    )
    # --- End Decision Analysis Fields ---
    
    # --- ML Attribution Placeholder Field (PRD3 Phase 2/3 Foundation) ---
    jtbd_attribution_summary = fields.Text(
        string="Attribution Summary (ML)",
        readonly=True, # Populated by external system/future logic
        copy=False,
        tracking=True,
        help="Placeholder field to store a summary or key results from the external ML-driven attribution model (Future Integration)."
    )
    # --- End ML Attribution Field ---
    
    # --- Relationship Health Fields (PRD3 Phase 3) ---
    jtbd_relationship_health_score = fields.Integer(
        string="Relationship Health Score",
        tracking=True,
        aggregator='avg',
        help="Overall score (0-100) assessing the health and strength of the client relationship (manual or computed later)."
    )
    jtbd_knowledge_transfer_status = fields.Selection(
        [('na', 'N/A'),
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('blocked', 'Blocked')],
        string="Knowledge Transfer Status",
        tracking=True,
        default='na',
        help="Status of knowledge transfer activities required for this opportunity or related project."
    )
    # --- End Relationship Health Fields ---
    
    # --- Campaign/Content Fields (PRD3 Phase 3) ---
    jtbd_engagement_quality = fields.Integer(
        string="Engagement Quality Score",
        tracking=True,
        aggregator='avg',
        help="Score (0-100) representing the quality and depth of prospect engagement with marketing/sales content (manual or computed later)."
    )
    jtbd_content_approval_state = fields.Selection(
        [('na', 'N/A'),
        ('draft', 'Draft'),
        ('pending_review', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')],
        string="Content Approval State",
        tracking=True,
        default='na',
        index=True,
        help="Approval status for key content pieces related to this opportunity (e.g., proposal, SOW)."
    )
    jtbd_content_alignment = fields.Float(
        string="Content Alignment (%)",
        tracking=True,
        aggregator='avg',
        digits=(16, 1), # Optional: Use digits for precision like (3, 1) for 95.5%
        help="Assessed score (0-100) of how well presented content aligns with the identified Job-to-be-Done."
    )
    # --- End Campaign/Content Fields ---
    
    # --- Client Operations Field (PRD3 Phase 3) ---
    jtbd_delivery_model = fields.Selection(
        [('project', 'Project-Based'),
        ('retainer', 'Retainer'),
        ('hybrid', 'Hybrid (Project + Retainer)'),
        ('productized', 'Productized Service'),
        ('other', 'Other'),
        ('tbd', 'To Be Determined')],
        string="Delivery Model",
        tracking=True,
        default='tbd',
        help="The intended or primary service delivery model for this opportunity."
    )
    # --- End Client Operations Field ---
    
    # --- Partner Ecosystem Field (PRD3 Phase 3) ---
    jtbd_ecosystem_impact = fields.Selection(
        [('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('none', 'None / Not Applicable')],
        string="Partner Ecosystem Impact",
        tracking=True,
        default='none',
        help="Assessment of this opportunity's impact on or potential involvement with the partner ecosystem."
    )
    # --- End Partner Ecosystem Field ---

    # --- Cultural Fit Fields (PRD3 Phase 3) ---
    jtbd_innovation_profile = fields.Selection(
        [('innovator', 'Innovator / Early Adopter'),
        ('early_majority', 'Early Majority / Pragmatist'),
        ('late_majority', 'Late Majority / Conservative'),
        ('laggard', 'Laggard / Skeptic'),
        ('unknown', 'Unknown')],
        string="Innovation Profile",
        tracking=True,
        help="Assessment of the client's general approach to adopting new technologies or processes."
    )
    jtbd_values_alignment = fields.Integer(
        string="Values Alignment Score",
        tracking=True,
        aggregator='avg',
        help="Score (0-100) representing the perceived alignment of cultural values between the agency and the client."
    )
    # --- End Cultural Fit Fields ---
    
    # --- Buying Process Fields (PRD3 Phase 3) ---
    jtbd_procurement_complexity = fields.Selection(
        [('low', 'Low (Simple Purchase Order / Direct)'),
        ('medium', 'Medium (Multiple Approvals / Standard Terms)'),
        ('high', 'High (Formal RFP / Legal Review / Lengthy)'),
        ('unknown', 'Unknown')],
        string="Procurement Complexity",
        tracking=True,
        help="Assessment of the complexity of the client's purchasing/procurement process."
    )
    jtbd_trigger_cadence = fields.Selection(
        [('immediate', 'Immediate Action'),
        ('daily', 'Daily Check-in'),
        ('weekly', 'Weekly Follow-up'),
        ('monthly', 'Monthly Nurture'),
        ('event_driven', 'Event-Driven Only'),
        ('on_hold', 'On Hold')],
        string="Recommended Cadence",
        tracking=True,
        help="Recommended outreach frequency based on triggers and buying stage."
    )
    # --- End Buying Process Fields ---
    
    # --- Market Intelligence Field (PRD3 Phase 3) ---
    jtbd_intent_signals = fields.One2many(
        'jtbd.intent.signal', # Related model
        'lead_id', # Inverse field on the related model
        string="Intent Signals",
        help="Collected intent signals related to this lead/opportunity."
    )
    # --- End Market Intelligence Field ---
    
    # --- Job Evolution Relation (PRD3 Phase 3) ---
    jtbd_evolution_ids = fields.One2many(
        'jtbd.job.evolution', # Related model
        'lead_id', # Inverse field on the related model
        string="Job Evolution History",
        help="History tracking changes or evolution of the client's Job-to-be-Done over time."
    )
    # --- End Job Evolution Relation ---

    # --- Job Portfolio Relation (PRD3 Phase 3) ---
    jtbd_portfolio_ids = fields.One2many(
        'jtbd.job.portfolio', # Related model
        'lead_id', # Inverse field on the related model
        string="Job Portfolios",
        help="Analyses of the multiple jobs potentially associated with this opportunity."
    )
    jtbd_portfolio_count = fields.Integer(compute='_compute_jtbd_analysis_counts', string="# Job Portfolios") # Add counter
    # --- End Job Portfolio Relation ---
    
    # --- Privacy / Anonymization Foundation Fields (PRD3 Phase 1/3) ---
    jtbd_privacy_consent_level = fields.Selection(
        [('none', 'None Provided'),
        ('basic', 'Basic Usage'),
        ('analytics', 'Analytics Allowed'),
        ('ai_processing', 'AI Processing Allowed')],
        string="Privacy Consent Level",
        default='none',
        tracking=True,
        copy=False,
        help="Indicates the level of consent obtained for processing related JTBD data."
    )
    jtbd_is_anonymized = fields.Boolean(
        string="Is Anonymized?",
        default=False,
        copy=False,
        readonly=True, # Typically set by an automated process later
        tracking=True,
        help="Indicates if sensitive/PII data related to this record's JTBD analysis has been anonymized."
    )
    # --- End Privacy / Anonymization Fields ---
    
    # --- Pattern Recognition and AI/ML (PRD3 Phase 4) ---
    jtbd_job_pattern_match_ids = fields.Many2many( # Changed name to follow Odoo convention _ids
        'jtbd.job.pattern',
        'jtbd_crm_lead_job_pattern_rel', # Relation table name
        'lead_id', 'pattern_id', # Column names
        string="Matched Job Patterns (AI)",
        compute='_compute_ai_predictions', # Trigger computation
        store=True, # Store the result
        readonly=True, # Result comes from AI
        copy=False,
        help="Job Patterns automatically suggested by AI based on lead data (Future P4+)."
    )
    # --- End Pattern Recognition ---
    
    # --- Expansion / Risk Fields (PRD3 Phase 3/4) ---
    jtbd_renewal_risk = fields.Integer(
        string="Renewal Risk Score",
        compute='_compute_ai_predictions', # Trigger computation
        store=True, # Store the result
        readonly=True, # Result comes from AI
        tracking=True,
        aggregator='avg',
        copy=False,
        help="Predicted risk score (0-100) for client renewal based on various factors (Future P4+)."
    )
    # Use Text for client portfolio initially
    jtbd_client_portfolio = fields.Text(
        string="Client Portfolio Notes",
        tracking=True,
        help="Notes describing the composition and nature of the prospect's own client portfolio (relevant for agencies)."
    )
    # --- End Expansion / Risk Fields ---
    
    # --- Growth Strategy Fields (PRD3 Phase 3/4) ---
    jtbd_growth_velocity = fields.Float(
        string="Est. Growth Velocity (%)", tracking=True, aggregator='avg',
        digits=(16, 1), help="Estimated annual growth rate or velocity metric for the prospect/client."
    )
    jtbd_competitive_position = fields.Selection(
        [('leader', 'Market Leader'), ('challenger', 'Challenger'), ('follower', 'Follower'),
        ('niche', 'Niche Specialist'), ('new_entrant', 'New Entrant'), ('unknown', 'Unknown')],
        string="Competitive Position", tracking=True, help="Assessment of the prospect's position within their market."
    )
    # --- End Growth Strategy Fields ---
    
    # --- Partner Extension Field ---
    jtbd_partner_influence = fields.Integer(
        string="Partner Influence Score", tracking=True, aggregator='avg',
        help="Score (0-100) indicating the influence of the referring partner (if any) on this specific deal."
    )
    # --- End Partner Extension Field ---
    
    # --- Buyer Psychology Fields (PRD3 Phase 3+) ---
    jtbd_response_pattern = fields.Selection(
        [('data_driven', 'Data-Driven / Analytical'),
        ('relationship', 'Relationship-Focused'),
        ('fast_acting', 'Fast-Acting / Decisive'),
        ('consensus', 'Consensus-Seeking'),
        ('detail_oriented', 'Detail-Oriented'),
        ('visual', 'Visual Learner'),
        ('skeptical', 'Skeptical / Proof-Oriented'),
        ('other', 'Other / Mixed'),
        ('unknown', 'Unknown')],
        string="Response Pattern",
        tracking=True,
        help="Observed pattern in how the prospect responds to information and makes decisions."
    )
    jtbd_comms_effectiveness = fields.Integer(
        string="Comms Effectiveness Score",
        tracking=True,
        aggregator='avg',
        help="Score (0-100) rating the effectiveness of communication channels and styles used with this prospect."
    )
    # --- End Buyer Psychology Fields --

    jtbd_ai_personalized_messaging_angles = fields.Text(
        string="AI Personalized Messaging Angles",
        readonly=True, # Populated by external process/AI
        copy=False,
        tracking=True,
        help="Placeholder: Specific messaging angles suggested by AI based on this opportunity's complete JTBD profile (Populated via Phase 4+ Integration)."
    )

    # --- Validation Constraints (PRD3 4.4.3) ---
    @api.constrains('jtbd_job_statement')
    def _check_job_statement_structure(self):
        pattern = re.compile(r"^\s*when\s+.*?\s+i want\s+.*?\s+so i can\s+.*$", re.IGNORECASE | re.DOTALL)
        # Explanation:
        # ^\s*when\s+ : Starts with optional space, then 'when', then one or more spaces
        # .*? : Matches any characters non-greedily (the situation)
        # \s+i want\s+ : Matches ' i want ' surrounded by one or more spaces <--- CHANGE HERE
        # .*? : Matches any characters non-greedily (the motivation)
        # \s+so i can\s+ : Matches ' so i can ' surrounded by one or more spaces
        # .*$ : Matches any remaining characters until the end of the string

        _logger.info("JTBD Check: Running _check_job_statement_structure constraint...")

        for lead in self.filtered('jtbd_job_statement'):
            statement_to_check = lead.jtbd_job_statement.strip()
            _logger.info(f"JTBD Check: Validating Lead ID {lead.id or 'New'}, Statement: >>>{statement_to_check}<<<")

            if not pattern.match(statement_to_check):
                _logger.warning(f"JTBD Check FAILED for Lead ID {lead.id or 'New'}, Statement: >>>{statement_to_check}<<<")
                raise ValidationError(_("Job Statement must follow the 'When..., I want [Motivation]..., so I can...' structure."))
            else:
                 _logger.info(f"JTBD Check PASSED for Lead ID {lead.id or 'New'}.")

    @api.constrains('jtbd_job_clarity_score', 'jtbd_job_category_id', 'jtbd_job_statement', 'jtbd_job_quadrant')
    def _check_required_fields_on_clarity(self):
        # Require fields only if score is above threshold and it's an opportunity
        for lead in self.filtered(lambda l: l.type == 'opportunity' and l.jtbd_job_clarity_score > 50):
             missing = []
             if not lead.jtbd_job_category_id: missing.append('Job Category')
             if not lead.jtbd_job_statement: missing.append('Job Statement')
             if not lead.jtbd_job_quadrant: missing.append('Job Quadrant')
             if missing:
                 raise ValidationError(_("When Job Clarity Score is above 50, the following fields are required: %s") % ", ".join(missing))

    @api.constrains(
        # Integer score fields (0-100)
        'jtbd_engagement_quality', 'jtbd_values_alignment',
        'jtbd_relationship_health_score', 'jtbd_comms_effectiveness',
        'jtbd_partner_influence', 'jtbd_renewal_risk',
        # Float fields (0.0-1.0 stored, displayed as 0-100%)
        'jtbd_tech_stack_match', 'jtbd_content_alignment'
        )
    def _check_score_fields_range(self):
        # Check multiple score/percentage fields
        for lead in self:
            for field_name in ['jtbd_engagement_quality', 'jtbd_values_alignment', 'jtbd_relationship_health_score',
                             'jtbd_comms_effectiveness', 'jtbd_partner_influence', 'jtbd_renewal_risk']:
                score = getattr(lead, field_name, None)
                # Integer checks (0-100)
                if score is not None and score is not False and not (0 <= score <= 100):
                    field_label = lead._fields[field_name].string or field_name
                    raise ValidationError(_("'%s' score must be between 0 and 100.") % field_label)

            for field_name in ['jtbd_tech_stack_match', 'jtbd_content_alignment']:
                score = getattr(lead, field_name, None)
                # Float checks (0.0-1.0)
                if score is not None and score is not False and not (0.0 <= score <= 1.0):
                    field_label = lead._fields[field_name].string or field_name
                    raise ValidationError(_("'%s' percentage value must be between 0%% and 100%%.") % field_label)

    @api.constrains('jtbd_mrr', 'jtbd_cac')
    def _check_monetary_fields(self):
         # Check non-negativity for monetary fields
         for lead in self:
            if lead.jtbd_mrr is not None and lead.jtbd_mrr < 0:
                 raise ValidationError(_("Estimated MRR/Project Value cannot be negative."))
            if lead.jtbd_cac is not None and lead.jtbd_cac < 0:
                raise ValidationError(_("Estimated Customer Acquisition Cost cannot be negative."))
    # --- End Validation Constraints ---

    # --- Compute Methods ---
    @api.depends('jtbd_job_statement', 'jtbd_job_category_id', 'jtbd_job_quadrant')
    def _compute_job_clarity_score(self):
        """ Compute the job clarity score based on statement structure and completeness. """
        # UPDATED Regex: Looks for "i want " to separate motivation
        pattern = re.compile(r"when\s+(.*?)(?:,|\s?)\s*i want\s+(.*?)(?:,|\s?)\s*so i can\s+(.*?)(?:\.?\s*$)", re.IGNORECASE | re.DOTALL)
        # Explanation: Use \s+ around 'i want' and 'so i can' to handle spacing.
        # Use (?:,|\s?)\s* as a flexible separator (optional comma, optional space, then spaces)

        for lead in self:
            score = 0
            max_score = 100
            component_weight = 25
            selection_weight = 12.5
            situation, motivation, outcome = '', '', ''

            if lead.jtbd_job_statement:
                # Apply strip() before matching
                match = pattern.match(lead.jtbd_job_statement.strip())
                if match:
                    # Extract captured groups
                    situation = match.group(1).strip() if match.group(1) else ''
                    motivation = match.group(2).strip() if match.group(2) else ''
                    outcome = match.group(3).strip() if match.group(3) else ''
                    _logger.debug(f"Clarity Score Parts - Lead {lead.id}: S='{situation}', M='{motivation}', O='{outcome}'")
                else:
                     _logger.warning(f"Clarity Score: Regex did not match for Lead {lead.id}. Statement: {lead.jtbd_job_statement}")


            # Score text components based on minimum length
            if situation and len(situation) >= MIN_TEXT_LENGTH_SCORE: score += component_weight
            if motivation and len(motivation) >= MIN_TEXT_LENGTH_SCORE: score += component_weight # Should now correctly score motivation
            if outcome and len(outcome) >= MIN_TEXT_LENGTH_SCORE: score += component_weight

            # Score selections
            if lead.jtbd_job_category_id: score += selection_weight
            if lead.jtbd_job_quadrant: score += selection_weight
            lead.jtbd_job_clarity_score = min(max_score, int(round(score)))
            _logger.debug(f"Clarity Score - Lead {lead.id}: Final Score = {lead.jtbd_job_clarity_score}")
            
    @api.depends('expected_revenue', 'jtbd_cac') # Depends on standard expected_revenue and our new CAC field
    def _compute_ltv_cac_ratio(self):
        for lead in self:
            # Use expected_revenue as a proxy for LTV initially
            # Requires jtbd_cac to be populated (manually or via integration later)
            ltv = lead.expected_revenue
            cac = lead.jtbd_cac

            if cac and cac > 0 and ltv is not None: # Ensure CAC is positive and LTV exists
                try:
                    lead.jtbd_ltv_cac_ratio = ltv / cac
                except ZeroDivisionError:
                    lead.jtbd_ltv_cac_ratio = 0.0
            else:
                lead.jtbd_ltv_cac_ratio = 0.0 # Default to 0 if CAC is zero/missing or LTV is missing

    # --- NEW Compute method for latest impact ---
    @api.depends('jtbd_outcome_mapping_ids.jtbd_economic_impact_value', 'jtbd_outcome_mapping_ids.create_date')
    def _compute_latest_economic_impact(self):
        for lead in self:
            # Find the latest outcome map with a value set
            latest_map = self.env['jtbd.outcome.mapping'].search(
                [('lead_id', '=', lead.id), ('jtbd_economic_impact_value', '!=', False)],
                order='create_date desc, id desc', limit=1
            )
            lead.jtbd_latest_economic_impact = latest_map.jtbd_economic_impact_value if latest_map else 0.0

    # Implement count calculation
    def _compute_jtbd_analysis_counts(self):
        """ Compute the number of related Force Analyses and Outcome Maps using search_count. """
        # Uses search_count for simplicity and robustness in this version.
        # Consider optimizing with read_group if performance becomes an issue with many related records.
        force_model = self.env['jtbd.force.analysis']
        outcome_model = self.env['jtbd.outcome.mapping']
        portfolio_model = self.env['jtbd.job.portfolio']

        for lead in self:
            try:
                lead.jtbd_force_analysis_count = force_model.search_count(
                    [('lead_id', '=', lead.id)]
                )
                lead.jtbd_outcome_mapping_count = outcome_model.search_count(
                    [('lead_id', '=', lead.id)]
                )
                lead.jtbd_portfolio_count = portfolio_model.search_count(
                    [('lead_id', '=', lead.id)]
                )
                
            except Exception as e:
                # Log error but prevent compute method from failing entirely
#                _logger.error(f"Error counting related records for lead {lead.id}: {e}", exc_info=True)
                _logger.error(f"Error counting job portfolios for lead {lead.id}: {e}", exc_info=True)
                lead.jtbd_force_analysis_count = 0
                lead.jtbd_outcome_mapping_count = 0
                lead.jtbd_portfolio_count = 0
            
    @api.depends(
        'description', 'name', # General text fields
        'jtbd_job_category_id',
        'jtbd_job_statement', 'jtbd_job_category_id', # Core JTBD fields
        'jtbd_agency_size', 'jtbd_revenue_range', 'jtbd_current_tools', # Profile fields
        'jtbd_outcome_mapping_ids', 'jtbd_force_analysis_ids' # Related analysis
        # Add more dependencies as needed (e.g., industry, linked activities)
    )
    def _compute_ai_predictions(self):
        _logger.info(f"Attempting to compute AI predictions for Leads: {self.ids}")
        # In a real scenario, batch API calls for efficiency
        for lead in self:
            _logger.debug(f"Computing AI predictions for Lead ID: {lead.id}")
            # --- Placeholder Logic ---
            # 1. Prepare context data (similar to previous AI steps)
            context_data = {
                'lead_id': lead.id,
                'description': lead.description or '',
                'job_statement': lead.jtbd_job_statement or '',
                'job_category': lead.jtbd_job_category_id.name if lead.jtbd_job_category_id else '',
                'agency_size': lead.jtbd_agency_size or '',
                # ... add more fields ...
            }

            # 2. Call external AI/n8n for Pattern Matching (Placeholder)
            try:
                # response_patterns = call_external_pattern_matcher(context_data)
                # matched_pattern_ids = process_pattern_response(response_patterns)
                # Simulate finding one or two patterns based on category for now
                matched_pattern_ids = []
                if lead.jtbd_job_category_id:
                    patterns = self.env['jtbd.job.pattern'].search(
                        [('job_category_id', '=', lead.jtbd_job_category_id.id)], limit=2 # Use ID for search
                    )
                    matched_pattern_ids = patterns.ids
                _logger.debug(f"Lead {lead.id}: Simulated matched pattern IDs: {matched_pattern_ids}")
                # Use write command for Many2many relationship (6, 0, ...)
                lead.jtbd_job_pattern_match_ids = [(6, 0, matched_pattern_ids)]
            except Exception as e:
                _logger.error(f"Error during AI pattern matching simulation for lead {lead.id}: {e}")
                lead.jtbd_job_pattern_match_ids = [(5, 0, 0)] # Clear on error


            # 3. Call external AI/n8n for Renewal Risk (Placeholder)
            try:
                # response_risk = call_external_risk_predictor(context_data)
                # risk_score = process_risk_response(response_risk)
                # Simulate risk based on clarity score for now
                risk_score = 100 - lead.jtbd_job_clarity_score # Inverse relationship example
                _logger.debug(f"Lead {lead.id}: Simulated renewal risk score: {risk_score}")
                lead.jtbd_renewal_risk = max(0, min(100, risk_score))
            except Exception as e:
                _logger.error(f"Error during AI renewal risk simulation for lead {lead.id}: {e}")
                lead.jtbd_renewal_risk = 0 # Default to 0 on error
            # --- End Placeholder Logic ---


    # --- Action Methods (Currently not called by standard buttons) ---
    # These methods provide programmatic access to open related records.
    # The stat buttons on the form view link directly to window actions via XML.
    def action_open_jtbd_force_analysis(self):
        """ Opens the Force Analysis view for this opportunity. """
        # This method could be called from code, but the button uses the action ID directly.
        self.ensure_one()
        action = self.env['ir.actions.act_window']._for_xml_id('jtbd_odoo_crm.action_jtbd_force_analysis_lead')
        action['domain'] = [('lead_id', '=', self.id)]
        action['context'] = {'default_lead_id': self.id, 'search_default_lead_id': self.id}
        return action

    def action_open_jtbd_outcome_mapping(self):
        """ Opens the Outcome Mapping view for this opportunity. """
        # This method could be called from code, but the button uses the action ID directly.
        self.ensure_one()
        action = self.env['ir.actions.act_window']._for_xml_id('jtbd_odoo_crm.action_jtbd_outcome_mapping_lead')
        action['domain'] = [('lead_id', '=', self.id)]
        action['context'] = {
            'default_lead_id': self.id,
            'search_default_lead_id': self.id,
            'default_job_category': self.jtbd_job_category_id.id, # Pass ID
            'default_name': _('Outcome Map for %s') % self.name,
        }
        return action
    
    def action_open_job_portfolios(self):
        self.ensure_one()
        action = self.env['ir.actions.act_window']._for_xml_id('jtbd_odoo_crm.action_jtbd_job_portfolio')
        action['domain'] = [('lead_id', '=', self.id)]
        action['context'] = {'default_lead_id': self.id, 'search_default_lead_id': self.id}
        return action    
    
    # --- Foundational Profile/Tech/Source Fields (Aligned with PRD3 Phase 1 Req.) ---

    # Agency Profile Fields
    # These might require custom selection lists or configuration later
    jtbd_agency_size = fields.Integer(
        string="Agency Size (Employees)",
        tracking=True,
        help="Estimated number of employees at the agency."
    )
    jtbd_revenue_range = fields.Selection(
        [('0-1m', 'Under $1M'),
        ('1m-5m', '$1M - $5M'),
        ('5m-10m', '$5M - $10M'),
        ('10m-25m', '$10M - $25M'),
        ('25m+', 'Over $25M'),
        ('unknown', 'Unknown')],
        string="Est. Revenue Range",
        tracking=True,
        help="Estimated annual revenue range."
    )
    jtbd_account_tier = fields.Selection(
        [('strategic', 'Strategic'),
        ('target', 'Target'),
        ('watch', 'Watch'),
        ('other', 'Other')],
        string="Account Tier",
        tracking=True,
        help="Internal classification of the account's strategic importance."
    )

    # Technology Stack Fields
    # Using simple Text for now; Phase 3 Integration might use M2M to a dedicated tech model
    jtbd_current_tools = fields.Text(
        string="Current Tools/Tech Stack",
        tracking=True,
        help="Notes on the primary tools (CRM, Marketing Auto, PM, etc.) the agency currently uses."
    )
    jtbd_tech_stack_match = fields.Float(
        string="Tech Stack Match (%)",
        tracking=True, aggregator='avg',
        help="Initial assessment (0-100) of how well the prospect's tech stack aligns with potential solutions. (May be computed later)."
    )

    # Basic Marketing/Intent Fields
    jtbd_automation_source = fields.Selection(
        [('inbound', 'Inbound'),
        ('outbound', 'Outbound'),
        ('referral', 'Referral'),
        ('partner', 'Partner'),
        ('other', 'Other'),
        ('unknown', 'Unknown')],
        string="Lead Source Type",
        tracking=True, index=True,
        help="High-level source category of the lead/opportunity."
    )

    # jtbd_signal_strength field (populated by Force Analysis) covers the combined score for now.
    # Detailed jtbd_intent_signals (One2many) planned for Phase 3/4.

    # --- End of Foundational Profile/Tech/Source Fields ---