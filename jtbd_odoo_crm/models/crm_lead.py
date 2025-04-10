# -*- coding: utf-8 -*-

import re
from odoo import models, fields, api, _
# Import selections from the models where they are defined
from .jtbd_job_pattern import JOB_CATEGORIES

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
    jtbd_job_category = fields.Selection(
        selection=JOB_CATEGORIES, string='Job Category', index=True, tracking=True,
        help="Primary Job-to-be-Done category identified for this opportunity."
    )
    jtbd_job_statement = fields.Text(
        string='Job Statement', tracking=True,
        help="Full Job Statement in 'When... I want to... So I can...' format."
    )
    jtbd_job_quadrant = fields.Selection(
        selection=JOB_QUADRANTS, string='Job Quadrant', tracking=True,
        help="Classification of the primary job (Functional, Emotional, Social, Strategic)."
    )
    jtbd_job_clarity_score = fields.Integer(
        string='Job Clarity Score', compute='_compute_job_clarity_score', store=True,
        readonly=True, tracking=True, group_operator="avg",
        help="Score (0-100) indicating the clarity and completeness of the identified job statement."
    )

    # --- Analysis Summary Fields (Populated by Phase 2 Logic) ---
    # FIX C9/D11: Ensure compute attribute points to the correct method
    jtbd_force_analysis_count = fields.Integer(
        compute='_compute_jtbd_analysis_counts', string="Force Analyses",
        help="Number of Force Analyses linked to this opportunity."
    )
    jtbd_momentum_score = fields.Integer(
        string='Momentum Score', readonly=True, tracking=True, group_operator="avg",
        help="Latest calculated momentum score (0-100) from Force Analysis."
    )
    jtbd_signal_strength = fields.Integer(
        string='Signal Strength', readonly=True, tracking=True, group_operator="avg",
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

    # --- Outcome Summary Fields (Populated by Phase 2 Logic) ---
    # FIX C9/D11: Ensure compute attribute points to the correct method
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

    # --- Compute Methods ---
    @api.depends('jtbd_job_statement', 'jtbd_job_category', 'jtbd_job_quadrant')
    def _compute_job_clarity_score(self):
        """ Compute the job clarity score based on statement structure and completeness. """
        pattern = re.compile(r"when\s+(.*?)(?:,\s*|\s+)i want to\s+(.*?)(?:,\s*|\s+)so i can\s+(.*?)(?:\.?\s*$)", re.IGNORECASE | re.DOTALL)
        for lead in self:
            score = 0
            max_score = 100
            component_weight = 25
            selection_weight = 12.5
            situation, motivation, outcome = '', '', ''

            if lead.jtbd_job_statement:
                match = pattern.match(lead.jtbd_job_statement.strip())
                if match:
                    situation = match.group(1).strip()
                    motivation = match.group(2).strip()
                    outcome = match.group(3).strip()

            # Score text components based on minimum length
            if situation and len(situation) >= MIN_TEXT_LENGTH_SCORE: score += component_weight
            if motivation and len(motivation) >= MIN_TEXT_LENGTH_SCORE: score += component_weight
            if outcome and len(outcome) >= MIN_TEXT_LENGTH_SCORE: score += component_weight

            # Score selections
            if lead.jtbd_job_category: score += selection_weight
            if lead.jtbd_job_quadrant: score += selection_weight

            lead.jtbd_job_clarity_score = min(max_score, int(round(score)))

    # Implement count calculation
    def _compute_jtbd_analysis_counts(self):
        """ Compute the number of related Force Analyses and Outcome Maps using search_count. """
        # This approach iterates and performs a count query for each lead.
        # It's less efficient than read_group for large recordsets but more robust against
        # unexpected read_group return formats.
        force_model = self.env['jtbd.force.analysis']
        outcome_model = self.env['jtbd.outcome.mapping']

        for lead in self:
            try:
                lead.jtbd_force_analysis_count = force_model.search_count(
                    [('lead_id', '=', lead.id)]
                )
                lead.jtbd_outcome_mapping_count = outcome_model.search_count(
                    [('lead_id', '=', lead.id)]
                )
            except Exception as e:
                # Log error but prevent compute method from failing entirely
                _logger.error(f"Error counting related records for lead {lead.id}: {e}", exc_info=True)
                lead.jtbd_force_analysis_count = 0
                lead.jtbd_outcome_mapping_count = 0

    # --- Action Methods (Future Implementation) ---
    # Note: Stat buttons now link directly to actions via XML (%(...)d), so these methods
    # might only be needed for other programmatic calls or overrides later.
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
            'default_job_category': self.jtbd_job_category, # Pass category
            'default_name': _('Outcome Map for %s') % self.name,
        }
        return action