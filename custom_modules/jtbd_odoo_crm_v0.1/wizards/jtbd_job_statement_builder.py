# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
# Import selections from the models where they are defined
from odoo.addons.jtbd_odoo_crm.models.jtbd_job_pattern import JOB_CATEGORIES
from odoo.addons.jtbd_odoo_crm.models.crm_lead import JOB_QUADRANTS
import re # Import regex

# Define minimum length for validation
MIN_TEXT_LENGTH = 10 # Require at least 10 characters for each part

class JtbdJobStatementBuilder(models.TransientModel):
    _name = 'jtbd.job.statement.builder'
    _description = 'JTBD Statement Builder Wizard'

    # Link to the opportunity
    lead_id = fields.Many2one(
        'crm.lead',
        string='Opportunity',
        required=True,
        readonly=True, # Set from context, shouldn't be changed in wizard
        help="The opportunity this job statement relates to."
    )

    # Wizard state management
    state = fields.Selection(
        [('situation', 'Situation'),
         ('motivation', 'Motivation'),
         ('outcome', 'Outcome'),
         ('review', 'Review')],
        default='situation',
        string='Step',
        readonly=True, # State changes are controlled by buttons
        help="Current step in the job statement building process."
    )

    # Job Statement Components
    job_situation = fields.Text(
        string='When... (Situation)',
        help='Describe the situation when the agency faces this job. E.g., "When onboarding new clients without a standard process..."'
    )
    job_motivation = fields.Text(
        string='I want to... (Motivation)',
        help='Describe what the agency wants to accomplish. E.g., "streamline our client reporting process..."'
    )
    job_outcome = fields.Text(
        string='So I can... (Expected Outcome)',
        help='Describe the successful outcome the agency expects. E.g., "focus more time on strategic client work..."'
    )

    # Classification Fields
    job_category = fields.Selection(
        selection=JOB_CATEGORIES,
        string='Job Category',
        help="Select the primary job category."
    )
    job_quadrant = fields.Selection(
        selection=JOB_QUADRANTS,
        string='Job Quadrant',
        help="Classify the job type."
    )

    # Calculated/Helper Fields
    # This field holds the score calculated *within* the wizard flow
    # It gets saved to the crm.lead field on action_save
    jtbd_job_clarity_score = fields.Integer(
        string='Job Clarity Score',
        readonly=True,
        help="Score (0-100) indicating the clarity and completeness of the statement (calculated on review step)."
    )
    suggested_patterns = fields.Many2many(
        'jtbd.job.pattern',
        string='Suggested Patterns',
        readonly=True,
        help="Relevant job patterns suggested based on inputs."
    )

    # --- Helper fields for dynamic view ---
    display_situation_templates = fields.Boolean(compute='_compute_display_templates')
    display_motivation_templates = fields.Boolean(compute='_compute_display_templates')
    display_outcome_templates = fields.Boolean(compute='_compute_display_templates')

    @api.depends('state')
    def _compute_display_templates(self):
        """ Determine which template sections to show based on state. """
        for wizard in self:
            wizard.display_situation_templates = wizard.state == 'situation'
            wizard.display_motivation_templates = wizard.state == 'motivation'
            wizard.display_outcome_templates = wizard.state == 'outcome'

    # --- Default Get Method ---
    @api.model
    def default_get(self, fields_list):
        """Override default_get to pre-fill wizard from opportunity."""
        defaults = super().default_get(fields_list)
        lead_id = defaults.get('lead_id') or self.env.context.get('active_id') # Get lead_id reliably

        if lead_id:
            lead = self.env['crm.lead'].browse(lead_id).exists()
            if lead:
                defaults['lead_id'] = lead.id # Ensure it's set

                # Pre-fill statement parts from existing job statement using regex
                situation, motivation, outcome = '', '', ''
                if lead.jtbd_job_statement:
                    pattern = re.compile(r"when\s+(.*?)(?:,\s*|\s+)i want to\s+(.*?)(?:,\s*|\s+)so i can\s+(.*?)(?:\.?\s*$)", re.IGNORECASE | re.DOTALL)
                    match = pattern.match(lead.jtbd_job_statement.strip())
                    if match:
                        situation = match.group(1).strip()
                        motivation = match.group(2).strip()
                        outcome = match.group(3).strip()

                # Pre-fill fields if they are in the requested fields_list
                if 'job_situation' in fields_list and situation:
                    defaults['job_situation'] = situation
                if 'job_motivation' in fields_list and motivation:
                    defaults['job_motivation'] = motivation
                if 'job_outcome' in fields_list and outcome:
                    defaults['job_outcome'] = outcome
                if 'job_category' in fields_list and lead.jtbd_job_category:
                    defaults['job_category'] = lead.jtbd_job_category
                if 'job_quadrant' in fields_list and lead.jtbd_job_quadrant:
                    defaults['job_quadrant'] = lead.jtbd_job_quadrant

                # Pre-fetch suggested patterns if category exists
                if defaults.get('job_category'):
                    defaults['suggested_patterns'] = self._default_get_suggested_patterns(defaults['job_category'], lead)

        return defaults

    # Helper for default_get to fetch patterns
    @api.model
    def _default_get_suggested_patterns(self, category, lead):
        if not category:
            return [(5, 0, 0)]
        domain = [('job_category', '=', category), ('active', '=', True)]
        # Add agency size filter here if/when field exists on lead
        patterns = self.env['jtbd.job.pattern'].search(domain, limit=5, order='sequence asc')
        return [(6, 0, patterns.ids)] if patterns else [(5, 0, 0)]

    # --- Wizard Actions ---
    def action_next(self):
        """Move to the next step of the wizard with validation."""
        self.ensure_one()
        next_state = False
        if self.state == 'situation':
            if not self.job_situation or len(self.job_situation.strip()) < MIN_TEXT_LENGTH:
                raise ValidationError(_("Please describe the situation in at least %s characters.") % MIN_TEXT_LENGTH)
            if not self.job_category:
                 raise ValidationError(_("Please select a Job Category."))
            # Suggest patterns when moving from Situation
            self._find_suggested_patterns()
            next_state = 'motivation'
        elif self.state == 'motivation':
            if not self.job_motivation or len(self.job_motivation.strip()) < MIN_TEXT_LENGTH:
                raise ValidationError(_("Please describe the motivation in at least %s characters.") % MIN_TEXT_LENGTH)
            next_state = 'outcome'
        elif self.state == 'outcome':
            if not self.job_outcome or len(self.job_outcome.strip()) < MIN_TEXT_LENGTH:
                raise ValidationError(_("Please describe the expected outcome in at least %s characters.") % MIN_TEXT_LENGTH)
            if not self.job_quadrant:
                raise ValidationError(_("Please select a Job Quadrant."))
            # Calculate the score within the wizard for review
            self._calculate_job_score()
            next_state = 'review'

        if next_state:
            self.state = next_state
            return {
                'type': 'ir.actions.act_window',
                'name': 'Build Job Statement',  # Added to set the title
                'res_model': self._name,
                'res_id': self.id,
                'view_mode': 'form',
                'target': 'new',
            }
        return False

    def action_back(self):
        """Go back to the previous step."""
        self.ensure_one()
        previous_state = False
        if self.state == 'motivation':
            previous_state = 'situation'
        elif self.state == 'outcome':
            previous_state = 'motivation'
        elif self.state == 'review':
            previous_state = 'outcome'

        if previous_state:
            self.state = previous_state
            return {
                'type': 'ir.actions.act_window',
                'name': 'Build Job Statement',  # Added to set the title
                'res_model': self._name,
                'res_id': self.id,
                'view_mode': 'form',
                'target': 'new',
            }
        return False

    def action_save(self):
        """Save the completed job statement to the opportunity."""
        self.ensure_one()
        if not (self.job_situation and self.job_motivation and self.job_outcome):
            raise ValidationError(_("All parts of the job statement (Situation, Motivation, Outcome) must be completed."))

        # Format the complete job statement
        job_statement = f"When {self.job_situation.strip()}, I want to {self.job_motivation.strip()}, so I can {self.job_outcome.strip()}."

        # Explicitly calculate score before saving (ensures wizard's calculation is used)
        self._calculate_job_score()

        vals_to_write = {
            'jtbd_job_statement': job_statement,
            'jtbd_job_category': self.job_category,
            'jtbd_job_quadrant': self.job_quadrant,
            # Save the score calculated in the wizard
            'jtbd_job_clarity_score': self.jtbd_job_clarity_score,
        }

        self.lead_id.write(vals_to_write)

        # Log the activity in chatter
        self.lead_id.message_post(
            body=_("JTBD Statement created/updated via Builder: %s") % job_statement,
            subtype_id=self.env.ref('mail.mt_note').id
        )

        return {'type': 'ir.actions.act_window_close'}

    def use_template(self):
        """Use a template text for a job statement part based on context."""
        self.ensure_one()
        template_type = self.env.context.get('template_type')
        template_text = self.env.context.get('template_text')

        if template_type and template_text:
            if template_type == 'situation':
                self.job_situation = template_text
            elif template_type == 'motivation':
                self.job_motivation = template_text
            elif template_type == 'outcome':
                self.job_outcome = template_text
        # Reopen the wizard to show the updated field value
        return {
            'type': 'ir.actions.act_window',
            'name': 'Build Job Statement',  # Added to set the title
            'res_model': self._name,
            'res_id': self.id,
            'view_mode': 'form',
            'target': 'new',
        }

    # --- Internal Helper Methods ---
    def _find_suggested_patterns(self):
        """Find suggested job patterns based on inputs and opportunity data."""
        # This method is called when moving from Situation step
        self.ensure_one()
        self.suggested_patterns = self._default_get_suggested_patterns(self.job_category, self.lead_id)

    def _calculate_job_score(self):
        """Calculate the job clarity score based on completeness and length (for wizard)."""
        # This duplicates the logic from crm.lead for use within the wizard review step
        self.ensure_one()
        score = 0
        max_score = 100
        component_weight = 25 # Max points per text component
        selection_weight = 12.5 # Max points per selection component

        # Score Situation
        if self.job_situation:
            situation_len = len(self.job_situation.strip())
            score += min(component_weight, situation_len * (component_weight / 50.0)) if situation_len >= MIN_TEXT_LENGTH else 0

        # Score Motivation
        if self.job_motivation:
            motivation_len = len(self.job_motivation.strip())
            score += min(component_weight, motivation_len * (component_weight / 50.0)) if motivation_len >= MIN_TEXT_LENGTH else 0

        # Score Outcome
        if self.job_outcome:
            outcome_len = len(self.job_outcome.strip())
            score += min(component_weight, outcome_len * (component_weight / 50.0)) if outcome_len >= MIN_TEXT_LENGTH else 0

        # Score Selections
        if self.job_category:
            score += selection_weight
        if self.job_quadrant:
            score += selection_weight

        # Normalize score to 0-100 and store on the wizard record
        self.jtbd_job_clarity_score = min(max_score, int(round(score)))