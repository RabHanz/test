# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError
import logging
import requests # Add for connection testing/sync logic later
import json # For potential payload handling
# REMOVED incorrect slugify imports
import uuid # For webhook token alternative

_logger = logging.getLogger(__name__)

class JtbdIntegrationSettings(models.Model):
    _name = 'jtbd.integration.settings'
    _description = 'JTBD Integration Configuration & Control' # Enhanced Description
    _order = 'sequence, name'
    _inherit = ['mail.thread', 'mail.activity.mixin'] # Add chatter for logging/notifications

    name = fields.Char(string='Integration Name', required=True, tracking=True)
    sequence = fields.Integer(default=10)
    active = fields.Boolean(default=True, tracking=True)

    # --- System Type & Core Config (Enhanced) ---
    system_type = fields.Selection(
        [('marketing', 'Marketing Automation'),
         ('delivery', 'Delivery/Project System'),
         ('analytics', 'Analytics Platform'),
         ('partner', 'Partner Portal'),
         ('ai_service', 'AI Service (via n8n/Direct)'),
         ('cms', 'Content Management System'), # Added CMS
         ('data_source', 'External Data Source (JTBD Radar)'), # Added Data Source
         ('other', 'Other Custom Integration')],
        string='System Type', required=True, index=True, tracking=True
    )
    description = fields.Text(string="Purpose / Description") # Added description
    company_id = fields.Many2one('res.company', string='Company', default=lambda self: self.env.company) # Added company

    # --- Connection & Authentication (Enhanced) ---
    api_endpoint = fields.Char(
        string='API Endpoint URL', size=512, tracking=True,
        help="Base URL for the external system's API. Include trailing slash if needed."
    )
    auth_method = fields.Selection(
        [('api_key_header', 'API Key/Token (Header)'),
         ('api_key_param', 'API Key/Token (URL Param)'),
         ('oauth2_cc', 'OAuth 2.0 (Client Credentials)'), # Specify flows
         ('oauth2_auth_code', 'OAuth 2.0 (Authorization Code)'),
         ('basic_auth', 'Basic Auth (User/Pass)'),
         ('bearer', 'Bearer Token (Header)'),
         ('custom', 'Custom (Requires Code)'),
         ('none', 'No Authentication')],
        string='Authentication Method', default='none', required=True, tracking=True
    )
    # API Key/Token
    api_key_name = fields.Char(string='API Key Header/Param Name', help="e.g., 'Authorization', 'X-API-Key', 'api_key'")
    api_key = fields.Char(string='API Key / Token Value', size=1024, help="The secret key or token.", groups="base.group_system", copy=False) # Restrict access, don't copy

    # Basic Auth
    auth_user = fields.Char(string='Auth Username', groups="base.group_system", copy=False)
    auth_password = fields.Char(string='Auth Password', groups="base.group_system", copy=False)

    # OAuth 2.0 Client Credentials
    oauth_client_id = fields.Char(string='OAuth Client ID', groups="base.group_system", copy=False)
    oauth_client_secret = fields.Char(string='OAuth Client Secret', groups="base.group_system", copy=False)
    oauth_token_url = fields.Char(string='OAuth Token URL')
    oauth_scope = fields.Char(string='OAuth Scope(s)') # Space separated

    # OAuth 2.0 Auth Code (Requires more complex flow usually handled by separate module/library)
    oauth_auth_url = fields.Char(string='OAuth Authorization URL')
    oauth_redirect_uri = fields.Char(string='OAuth Redirect URI (Odoo)', compute='_compute_oauth_redirect_uri', store=False)
    # Store Refresh/Access tokens securely (e.g., in ir.config_parameter or encrypted) - Placeholder fields
    oauth_access_token = fields.Char(string="OAuth Access Token", readonly=True, copy=False, groups="base.group_system")
    oauth_refresh_token = fields.Char(string="OAuth Refresh Token", readonly=True, copy=False, groups="base.group_system")
    oauth_token_expiry = fields.Datetime(string="OAuth Token Expiry", readonly=True, copy=False, groups="base.group_system")

    connection_status = fields.Selection( [('ok', 'Connected'), ('error', 'Error'), ('untested', 'Untested')], string='Connection Status', default='untested', readonly=True, copy=False )
    connection_last_test = fields.Datetime(string='Last Connection Test', readonly=True, copy=False)
    connection_error_msg = fields.Text(string='Last Connection Error', readonly=True, copy=False)

    # --- Synchronization & Webhooks (Enhanced) ---
    sync_frequency = fields.Selection(
        [('realtime', 'Real-time (Webhook)'),
         ('minutes_5', 'Every 5 Minutes'), # More granular options
         ('minutes_15', 'Every 15 Minutes'),
         ('minutes_30', 'Every 30 Minutes'),
         ('hourly', 'Hourly'),
         ('daily', 'Daily'),
         ('weekly', 'Weekly'),
         ('manual', 'Manual Only')],
        string='Sync Frequency', default='daily', required=True, tracking=True
    )
    # Field to link to the ir.cron record if scheduled sync is used
    sync_cron_id = fields.Many2one('ir.cron', string='Sync Scheduler Job', readonly=True, copy=False, ondelete='set null')
    last_sync = fields.Datetime(string='Last Sync Timestamp', readonly=True, copy=False)
    last_sync_status = fields.Selection( [('success', 'Success'), ('warning', 'Warning'), ('error', 'Error')], string='Last Sync Status', readonly=True, copy=False)
    # Link to logs directly
    integration_log_ids = fields.One2many('jtbd.integration.log', 'integration_id', string='Integration Logs', readonly=True)
    integration_log_count = fields.Integer(compute='_compute_integration_log_count', string="# Logs")

    # Generate a unique webhook URL for this integration setting
    webhook_token = fields.Char(string="Webhook Token", default=lambda self: str(uuid.uuid4()), readonly=True, copy=False, required=True)
    webhook_url = fields.Char( string='Incoming Webhook URL', compute='_compute_webhook_url', store=False, readonly=True, help="URL for external system to send real-time updates." )
    webhook_log_calls = fields.Boolean(string="Log Incoming Webhook Calls", default=True)

    # --- Error Handling & Monitoring ---
    error_handling = fields.Selection(
        [('log', 'Log Error Only'),
         ('retry_log', 'Retry Once then Log'), # More specific retry
         ('retry_notify', 'Retry Multiple then Notify'),
         ('fail_notify', 'Fail Immediately and Notify')],
         string='Error Handling Strategy', default='log', required=True, tracking=True
    )
    retry_count = fields.Integer(string="Max Retry Attempts", default=3, help="Maximum number of retries for 'Retry Multiple' strategy.")
    notification_user_ids = fields.Many2many(
        'res.users', 'jtbd_integration_notify_user_rel', 'integration_id', 'user_id',
        string='Notify Users on Error',
        help="Users to notify when sync errors occur (for 'notify' strategies)."
    )

    # --- Field Mappings ---
    field_mapping_ids = fields.One2many(
        'jtbd.integration.field.mapping', 'integration_id', string='Field Mappings'
    )

    # --- Integration Logic Placeholders ---
    # Fields to store Python code snippets or references to server actions/n8n flows for specific operations
    # This allows configuration within Odoo but execution externally or via safe_eval
    sync_logic_ref = fields.Reference(
        # Extend selection as needed for different logic types (n8n workflow ID, etc.)
        [('ir.actions.server', 'Server Action'), ('jtbd.code.snippet', 'JTBD Code Snippet')],
        string="Sync Logic Reference",
        help="Reference to the code/action that performs the data synchronization (Phase 4+)."
    )

    transformation_logic_ref = fields.Reference(
        [('ir.actions.server', 'Server Action'), ('jtbd.code.snippet', 'JTBD Code Snippet')],
        string="Transformation Logic Reference",
        help="Reference to code/action handling data transformations between systems (Phase 4+)."
    )

    # --- Notes ---
    notes = fields.Text(string="Configuration Notes")

    # --- Constraints ---
    _sql_constraints = [
        ('webhook_token_uniq', 'unique(webhook_token)', 'Webhook Token must be unique!')
    ]

    # --- Compute Methods ---
    @api.depends('webhook_token', 'name')
    def _compute_webhook_url(self):
        """ Generate the webhook URL based on base URL and token using ir.http._slugify. """
        # Use get_base_url if available, otherwise fall back
        # sudo() needed for system parameters
        base_url = self.env['ir.config_parameter'].sudo().get_param('web.base.url')
        IrHttp = self.env['ir.http'] # Get model instance
        for record in self:
            if record.webhook_token and record.id and base_url:
                # Call the _slugify method on the ir.http model instance
                # Use record.name or fallback to 'integration' + id for uniqueness
                try:
                    # Use the correct method from ir.http
                    slug_name = IrHttp._slugify(record.name or f'integration-{record.id}')
                    record.webhook_url = f"{base_url}/jtbd/webhook/{record.id}/{slug_name}/{record.webhook_token}"
                except Exception as e:
                     _logger.error(f"Error generating slug for webhook URL (ID: {record.id}): {e}")
                     record.webhook_url = False # Set to False on error
            else:
                record.webhook_url = False

    @api.depends() # No specific field dependency needed, relies on base URL parameter
    def _compute_oauth_redirect_uri(self):
        """ Compute the standard redirect URI for this Odoo instance. """
        # sudo() needed for system parameters
        base_url = self.env['ir.config_parameter'].sudo().get_param('web.base.url')
        for record in self:
            # Adjust path as needed depending on where OAuth callback controller is defined
            # This controller needs to be implemented separately.
            record.oauth_redirect_uri = f"{base_url}/jtbd/oauth_callback" if base_url else False

      
    def _compute_integration_log_count(self):
        """ Compute the number of related log entries using search_count. """
        log_model = self.env['jtbd.integration.log']
        for record in self:
            try:
                record.integration_log_count = log_model.search_count([('integration_id', '=', record.id)])
            except Exception as e_sc:
                _logger.error(f"Error counting logs for integration {record.id}: {e_sc}")
                record.integration_log_count = 0 # Fallback

    # --- Action Methods ---
    def action_test_connection(self):
        """ Placeholder action to test the configured connection. """
        self.ensure_one()
        _logger.info(f"Attempting test connection for Integration: {self.name}")
        status = 'untested'
        error_msg = False
        # TODO: Implement actual test logic based on auth_method and api_endpoint in Phase 4+
        # Example structure:
        # try:
        #    if self.auth_method == 'api_key_header':
        #        headers = {self.api_key_name or 'X-API-KEY': self.api_key}
        #        response = requests.get(self.api_endpoint + '/ping', headers=headers, timeout=10) # Example endpoint
        #        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
        #    elif self.auth_method == 'basic_auth':
        #        response = requests.get(self.api_endpoint + '/ping', auth=(self.auth_user, self.auth_password), timeout=10)
        #        response.raise_for_status()
        #    # ... other auth methods ...
        #    test_successful = True # If no exception
        # except requests.exceptions.RequestException as e:
        #    _logger.error(f"Connection Test Failed for {self.name}: {e}", exc_info=True)
        #    test_successful = False
        #    error_msg = str(e)
        # except Exception as e:
        #    _logger.error(f"Unexpected error during connection test for {self.name}: {e}", exc_info=True)
        #    test_successful = False
        #    error_msg = _("An unexpected error occurred.")

        # Basic simulation for now
        test_successful = 'fail' not in (self.name or '').lower()

        if test_successful:
            message = _("Connection test successful (Simulated).")
            msg_type = 'success'
            status = 'ok'
        else:
            message = _("Connection test failed (Simulated). Check logs/config.")
            msg_type = 'danger'
            status = 'error'
            error_msg = message # Store simulated error

        # Update status fields
        self.write({
            'connection_status': status,
            'connection_last_test': fields.Datetime.now(),
            'connection_error_msg': error_msg
        })

        return { 'type': 'ir.actions.client', 'tag': 'display_notification',
                 'params': {'title': _('Connection Test'), 'message': message, 'sticky': False, 'type': msg_type}}

    def action_sync_now(self):
        """ Action to manually trigger a sync. Ensures logging and status updates. """
        self.ensure_one()
        _logger.info(f"ACTION_SYNC_NOW: Triggered for Integration: {self.name} (ID: {self.id})")
        sync_status = 'error' # Default to error
        sync_log_msg = _("Manual sync execution failed.")
        details_for_log = "Execution did not complete as expected."
        processed_count = 0 # Track processed items if needed later

        try:
            # --- Call the actual sync logic placeholder ---
            # We expect _execute_sync to handle its own internal logging and potentially return status/counts
            # For now, we assume it runs and we simulate a result based on name.
            self._execute_sync()
            # --- End Call ---

            # Simulate success/failure based on name for testing
            if 'fail' not in (self.name or '').lower():
                sync_status = 'success'
                sync_log_msg = _("Manual sync completed (Simulated).")
                details_for_log = "Placeholder simulation ran successfully."
                # Update last sync time ONLY on success
                self.last_sync = fields.Datetime.now()
            else:
                # Keep status as error if name contains 'fail'
                sync_log_msg = _("Manual sync FAILED (Simulated based on name).")
                details_for_log = "Integration name contained 'fail', simulating an error during execution."

            _logger.info(f"ACTION_SYNC_NOW: Sync simulation finished for {self.name}. Status: {sync_status}")

        except Exception as e:
            sync_status = 'error'
            sync_log_msg = _("Manual sync encountered an error: %s") % str(e)
            details_for_log = str(e)
            _logger.error(f"ACTION_SYNC_NOW: Error during sync execution for {self.name}: {e}", exc_info=True)
            # Re-raise the error if you want the user to see it immediately
            # raise UserError(sync_log_msg) from e

        finally:
            # Always attempt to update status and create a log entry
            try:
                self.write({'last_sync_status': sync_status})
            except Exception as write_e:
                _logger.error(f"ACTION_SYNC_NOW: Failed to write final sync status for {self.name}: {write_e}")

            log_vals = {
                'integration_id': self.id,
                'operation': 'sync', # Could be 'manual_sync'
                'status': sync_status,
                'message': sync_log_msg,
                'details': details_for_log
            }
            try:
                log_entry = self.env['jtbd.integration.log'].create(log_vals)
                _logger.info(f"ACTION_SYNC_NOW: Created log entry {log_entry.id} for {self.name} with status {sync_status}")
            except Exception as log_e:
                _logger.error(f"ACTION_SYNC_NOW: Failed to create integration log entry for {self.name}: {log_e}", exc_info=True)

        # Return notification based on final outcome
        msg_type = 'success' if sync_status == 'success' else 'danger'
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {'title': _('Manual Sync'), 'message': sync_log_msg, 'sticky': False, 'type': msg_type}
        }


    def action_view_logs(self):
        """ Opens the list view for logs related to this integration setting. """
        self.ensure_one()
        # Ensure the action XML ID is correct
        action_ref = 'jtbd_odoo_crm.action_jtbd_integration_log_from_setting'
        try:
            action = self.env['ir.actions.act_window']._for_xml_id(action_ref)
            action['domain'] = [('integration_id', '=', self.id)]
            # Ensure context defaults don't cause issues if model changes
            action['context'] = {'default_integration_id': self.id, 'search_default_integration_id': self.id}
            return action
        except ValueError as e:
             _logger.error(f"Action XML ID '{action_ref}' not found: {e}")
             raise UserError(_("Could not find the action to view integration logs."))


    def action_oauth_start(self):
        """ Placeholder for initiating the OAuth 2.0 Authorization Code flow. """
        self.ensure_one()
        if self.auth_method != 'oauth2_auth_code' or not self.oauth_auth_url or not self.oauth_client_id:
             raise UserError(_("OAuth 2.0 Authorization Code Flow is not configured correctly."))
        # TODO: Implement the redirect logic to the provider's auth URL.
        # Requires a controller endpoint at /jtbd/oauth_callback to handle the response.
        _logger.info(f"Placeholder for starting OAuth flow for {self.name}")
        return self._notify_success("OAuth flow start not fully implemented.")


    def _execute_sync(self):
        """
        Placeholder method simulating the execution of sync logic.
        This version includes basic structure for fetching data, applying mappings,
        simulating API calls, and logging.
        """
        self.ensure_one()
        _logger.info(f"Executing sync logic for Integration: {self.name} (ID: {self.id})")
        log_entries = [] # Collect log entries to create at the end
        sync_status = 'success' # Assume success initially
        error_count = 0
        processed_count = 0

        # Determine models/directions to sync based on mappings
        mappings = self.field_mapping_ids.filtered(lambda m: m.active)
        models_to_sync = mappings.mapped('odoo_model_id')
        directions_to_sync = mappings.mapped('direction')

        _logger.debug(f"Integration {self.name}: Syncing models { [m.model for m in models_to_sync] } in directions {list(set(directions_to_sync))}")

        # --- Example: Syncing crm.lead data OUT ('odoo_to_external') ---
        if 'odoo_to_external' in directions_to_sync or 'bidirectional' in directions_to_sync:
            lead_model = self.env['crm.lead']
            # Define relevant fields based on mappings for this model/direction
            lead_mappings = mappings.filtered(lambda m: m.odoo_model_id.model == 'crm.lead' and m.direction in ('odoo_to_external', 'bidirectional'))
            if lead_mappings:
                odoo_field_names = lead_mappings.mapped('odoo_field_name') # Fields to read from Odoo
                # Find leads modified since last sync (or all if no last sync)
                # Add state filter if needed
                domain = [('write_date', '>', self.last_sync)] if self.last_sync else []
                # Add company check
                domain.append('|')
                domain.append(('company_id', '=', False))
                domain.append(('company_id', '=', self.company_id.id))

                leads_to_sync = lead_model.search(domain, limit=100) # Limit batch size
                _logger.info(f"Integration {self.name}: Found {len(leads_to_sync)} leads to sync outwards.")

                for lead in leads_to_sync:
                    processed_count += 1
                    payload = {'odoo_id': lead.id}
                    external_key_field = False
                    external_key_value = None

                    # Build payload based on mappings
                    for mapping in lead_mappings:
                        try:
                            payload[mapping.external_field] = getattr(lead, mapping.odoo_field_name)
                            if mapping.is_key:
                                external_key_field = mapping.external_field
                                external_key_value = payload[mapping.external_field]
                        except AttributeError:
                             _logger.warning(f"Field {mapping.odoo_field_name} not found on lead {lead.id}. Skipping.")
                        except Exception as prep_e:
                            _logger.error(f"Error preparing payload for lead {lead.id}, mapping {mapping.id}: {prep_e}")
                            error_count += 1
                            continue # Skip this mapping for this lead

                    # Simulate API Call (e.g., Update/Create external record)
                    api_call_successful = False
                    api_error_msg = None
                    try:
                        _logger.debug(f"Integration {self.name}: Simulating external API call for lead {lead.id}. Payload: {payload}")
                        # --- Placeholder for actual API call ---
                        # if external_key_value: # Found key, attempt update
                        #    # response = requests.put(f"{self.api_endpoint}/contacts/{external_key_value}", json=payload, ...)
                        # else: # No key, attempt create
                        #    # response = requests.post(f"{self.api_endpoint}/contacts", json=payload, ...)
                        # response.raise_for_status()
                        # api_call_successful = True
                        # --- End Placeholder ---
                        api_call_successful = True # Simulate success

                    except Exception as api_e:
                         _logger.error(f"Integration {self.name}: Simulated API call FAILED for lead {lead.id}: {api_e}", exc_info=True)
                         api_call_successful = False
                         api_error_msg = str(api_e)
                         error_count += 1

                    # Log result for this record
                    log_entries.append({
                        'integration_id': self.id, 'operation': 'push', 'status': 'success' if api_call_successful else 'error',
                        'message': f"Simulated push for Lead {lead.id} ({lead.name}) " + ("succeeded." if api_call_successful else "failed."),
                        'related_res_model': 'crm.lead', 'related_res_id': lead.id,
                        'details': api_error_msg or json.dumps(payload, indent=2, default=str) # Log payload or error
                    })

        # --- Example: Syncing data IN ('external_to_odoo') ---
        if 'external_to_odoo' in directions_to_sync or 'bidirectional' in directions_to_sync:
            _logger.info(f"Integration {self.name}: Simulating fetch and update for incoming data (Placeholder).")
            # --- Placeholder for fetching external data ---
            # try:
            #    # response = requests.get(f"{self.api_endpoint}/leads?updated_since={self.last_sync}", ...)
            #    # response.raise_for_status()
            #    # external_data_list = response.json()
            #    external_data_list = [{'external_id': 123, 'hs_job_category': 'team_efficiency', 'odoo_id': 1}] # Simulate fetched data
            #    processed_count += len(external_data_list)
            #
            #    for external_data in external_data_list:
            #       # Find mapping keys
            #       key_mapping = mappings.filtered(lambda m: m.is_key and m.direction in ('external_to_odoo', 'bidirectional'))
            #       odoo_record = False
            #       # Find matching Odoo record based on keys
            #       # ... logic to match records ...
            #       vals_to_write = {}
            #       # Map external fields to Odoo fields based on mappings
            #       # ... logic to build vals_to_write ...
            #       # Update or create Odoo record
            #       # ... logic to write/create ...
            #       # Log result
            #       log_entries.append({...})
            #
            # except Exception as pull_e:
            #    _logger.error(f"Integration {self.name}: Error during pull/update: {pull_e}", exc_info=True)
            #    error_count += 1
            #    log_entries.append({... error log ...})
            # --- End Placeholder ---
            pass # No actual pull logic implemented in this phase

        # --- Final Logging & Status Update ---
        final_sync_status = 'success' if error_count == 0 else ('warning' if processed_count > 0 else 'error')
        summary_message = _("Sync completed. Processed: %s, Errors: %s") % (processed_count, error_count)
        if error_count > 0:
            _logger.warning(f"Integration {self.name}: {summary_message}")
            # Trigger notification if needed based on error_handling strategy
            if self.error_handling in ('retry_notify', 'fail_notify') and self.notification_user_ids:
                 # Simplified notification - could use mail.thread logic
                 subject = _("JTBD Integration Error: %s") % self.name
                 body = _("Integration '%s' encountered %s error(s) during the last sync operation. Please check the logs.") % (self.name, error_count)
                 try:
                     self.env['mail.mail'].sudo().create({
                         'subject': subject, 'body_html': body, 'email_to': ','.join(self.notification_user_ids.mapped('email_formatted')),
                         'auto_delete': True,
                     }).send()
                     _logger.info(f"Sent error notification for integration {self.name} to {len(self.notification_user_ids)} users.")
                 except Exception as mail_e:
                     _logger.error(f"Failed to send error notification for integration {self.name}: {mail_e}")
        else:
             _logger.info(f"Integration {self.name}: {summary_message}")

        # Create log entries in batch if possible
        if log_entries:
            try:
                self.env['jtbd.integration.log'].create(log_entries)
            except Exception as log_create_e:
                 _logger.error(f"Error creating batch log entries for integration {self.name}: {log_create_e}")

        # Update the integration setting record's status
        self.write({
            'last_sync': fields.Datetime.now(),
            'last_sync_status': final_sync_status
        })

    # Inside JtbdIntegrationSettings class in models/jtbd_integration_settings.py

    def _create_sync_cron(self):
        """ Creates or updates the ir.cron job for scheduled sync based on frequency. """
        self.ensure_one()
        Cron = self.env['ir.cron'].sudo() # Use sudo to manage cron jobs

        # Map frequency selection to cron parameters
        cron_params = {
            'minutes_5': {'interval_number': 5, 'interval_type': 'minutes'},
            'minutes_15': {'interval_number': 15, 'interval_type': 'minutes'},
            'minutes_30': {'interval_number': 30, 'interval_type': 'minutes'},
            'hourly': {'interval_number': 1, 'interval_type': 'hours'},
            'daily': {'interval_number': 1, 'interval_type': 'days'},
            'weekly': {'interval_number': 1, 'interval_type': 'weeks'},
            'realtime': None, 'manual': None,
        }

        params = cron_params.get(self.sync_frequency)
        cron_name = f"JTBD Sync: {self.name or 'Unnamed'} (ID: {self.id})"
        model_id = self.env['ir.model']._get_id(self._name)

        # Search for cron by name, including inactive ones
        existing_cron = Cron.with_context(active_test=False).search([('name', '=', cron_name)], limit=1)
        # Also check if the M2O field points to a (potentially different) cron
        linked_cron = self.sync_cron_id

        # Decide which cron record to act upon (prefer linked one if it exists and matches name)
        cron_to_update = False
        if linked_cron and linked_cron.name == cron_name:
            cron_to_update = linked_cron
        elif existing_cron:
            cron_to_update = existing_cron
            # If we found one by name but it wasn't linked, link it now
            if self.sync_cron_id != cron_to_update:
                 self.sudo().write({'sync_cron_id': cron_to_update.id})

        if self.active and params:
            # Scheduled sync required
            cron_vals = {
                'name': cron_name, 'model_id': model_id, 'state': 'code',
                'code': f'model.browse({self.id})._execute_sync()',
                'user_id': self.env.ref('base.user_root').id,
                'active': True, # Explicitly activate
                'interval_number': params['interval_number'],
                'interval_type': params['interval_type'],
            }
            if cron_to_update: # Found an existing one (active or inactive)
                _logger.info(f"Updating existing cron job {cron_to_update.id} for {self.name}")
                cron_to_update.write(cron_vals)
            else: # No existing cron found by name
                _logger.info(f"Creating new cron job for {self.name}")
                try:
                    new_cron = Cron.create(cron_vals)
                    self.sudo().write({'sync_cron_id': new_cron.id})
                except Exception as cron_e:
                     _logger.error(f"Failed to create cron job for {self.name}: {cron_e}", exc_info=True)
        else:
            # No scheduled sync needed (Manual, Realtime, or Inactive Setting)
            # Deactivate the existing cron job if found
            if cron_to_update:
                _logger.info(f"Deactivating cron job {cron_to_update.id} for {self.name} (Frequency: {self.sync_frequency}, Active: {self.active})")
                try:
                    # Only deactivate, don't delete unless specifically required
                    cron_to_update.write({'active': False})
                    # Keep the link in sync_cron_id even if inactive, easier to find later
                except Exception as cron_de_e:
                     _logger.error(f"Failed to deactivate cron job {cron_to_update.id}: {cron_de_e}", exc_info=True)

    def write(self, vals):
        # Override write to update cron job if frequency or active status changes
        res = super().write(vals)
        if 'sync_frequency' in vals or 'active' in vals:
            for record in self:
                try: record._create_sync_cron()
                except Exception as e: _logger.error(f"Failed to update cron for integration {record.id}: {e}", exc_info=True)
        return res

    @api.model_create_multi
    def create(self, vals_list):
        # Override create to setup cron job
        records = super().create(vals_list)
        for record in records:
             try: record._create_sync_cron()
             except Exception as e: _logger.error(f"Failed to create cron for new integration {record.id}: {e}", exc_info=True)
        return records

    def unlink(self):
        # Override unlink to remove associated cron job
        crons_to_remove = self.mapped('sync_cron_id').exists()
        res = super().unlink()
        if crons_to_remove:
            try:
                _logger.info(f"Deleting cron jobs {crons_to_remove.ids} associated with deleted integration settings.")
                # Use sudo() if needed for permission to delete ir.cron
                crons_to_remove.sudo().unlink() # Ensure cron is deleted
            except Exception as e:
                 _logger.error(f"Failed to delete cron jobs {crons_to_remove.ids}: {e}", exc_info=True)
        return res

    def _notify_success(self, message):
        """ Helper method to return a success notification. """
        self.ensure_one()
        return {'type': 'ir.actions.client','tag': 'display_notification',
                'params': {'title': _('Action Status'), 'message': message, 'sticky': False, 'type': 'success'}}