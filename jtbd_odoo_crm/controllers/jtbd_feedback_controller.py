# -*- coding: utf-8 -*-
import json
import logging
from odoo import http
from odoo.http import request, route, Response

_logger = logging.getLogger(__name__)

class JtbdFeedbackController(http.Controller):
    _name = 'jtbd.feedback.controller'

    # Define a simple route to receive feedback data
    # Ensure security later (e.g., API key, IP whitelist, request signature)
    @route('/jtbd/feedback_webhook', type='json', auth='public', methods=['POST'], csrf=False)
    def receive_feedback_signal(self, **kwargs):
        """
        Webhook endpoint to receive feedback signals (e.g., from Analytics/n8n).
        Expected JSON payload:
        {
            "signal_type": "pattern_performance" | "content_performance" | ...,
            "reference_id": Odoo_ID_of_pattern_or_content_record,
            "model_name": "jtbd.job.pattern" | "jtbd.content.alignment" | ...,
            "score": float_or_integer,
            "message": "Optional message string",
            "details": { ... optional extra data ... }
        }
        """
        # --- Phase 4: Implement Basic Security Check (Example: Simple Token) ---
        # In production, use a more robust method (HMAC signature, OAuth)
        # secret_token = request.env['ir.config_parameter'].sudo().get_param('jtbd_odoo_crm.webhook_secret_token')
        # received_token = request.httprequest.headers.get('X-JTBD-Token')
        # if not secret_token or not received_token or not hmac.compare_digest(secret_token, received_token):
        #    _logger.warning("JTBD Feedback Webhook: Unauthorized access attempt.")
        #    return Response("Unauthorized", status=401)
        # --- End Security Placeholder ---

        payload = request.get_json_data() # Get JSON payload using the correct method
        _logger.info(f"JTBD Feedback Webhook Received: {payload}")

        signal_type = payload.get('signal_type')
        ref_id = payload.get('reference_id')
        model_name = payload.get('model_name')
        score = payload.get('score')
        message = payload.get('message', '')

        if not all([signal_type, ref_id, model_name]):
             _logger.warning("JTBD Feedback Webhook: Received incomplete payload.")
             # Return valid JSON response indicating error
             return {'status': 'error', 'message': 'Incomplete payload (signal_type, reference_id, model_name required)'}

        try:
            # --- Phase 4: Implement Basic Reaction Logic ---
            target_model = request.env[model_name]
            target_record = target_model.browse(int(ref_id)).exists()

            if not target_record:
                 _logger.warning(f"JTBD Feedback Webhook: Record not found for {model_name} ID {ref_id}.")
                 return {'status': 'warning', 'message': f'Record {model_name}/{ref_id} not found'}

            # Example Actions based on signal type
            log_body = f"Received feedback signal '{signal_type}' for {model_name} ID {ref_id}."
            if score is not None: log_body += f" Score: {score}."
            if message: log_body += f" Message: {message}"

            if signal_type == 'pattern_performance':
                # Example: If pattern score is low, log a warning or create activity
                if score is not None and score < 50: # Example threshold
                     log_body += "<br/><b>Action:</b> Low performance detected. Recommend review."
                     # Option: Create activity for manager
                     # target_record.activity_schedule(...)
                # Option: Update a performance score field on the pattern
                # if hasattr(target_record, 'jtbd_performance_score'):
                #    target_record.write({'jtbd_performance_score': score})

            elif signal_type == 'content_performance':
                # Example: Update alignment score or log note
                if hasattr(target_record, 'alignment_score') and score is not None:
                     target_record.write({'alignment_score': score})
                     log_body += f"<br/><b>Action:</b> Alignment score updated to {score}."
                # Option: Change content approval state if score is very low?
                # if score is not None and score < 30 and hasattr(target_record, 'approval_state'):
                #    target_record.write({'approval_state': 'pending_review'})


            # Log action to the target record's chatter if possible
            if hasattr(target_record, 'message_post'):
                target_record.message_post(body=log_body, subtype_id=request.env.ref('mail.mt_note').id)
            else:
                 _logger.info(log_body) # Log if no chatter

            return {'status': 'success', 'message': f'Feedback processed for {model_name}/{ref_id}'}
            # --- End Basic Reaction Logic ---

        except Exception as e:
            _logger.error(f"JTBD Feedback Webhook Error processing payload for {model_name}/{ref_id}: {e}", exc_info=True)
            # Return valid JSON response indicating server error
            return {'status': 'error', 'message': f'Internal server error processing feedback: {str(e)}'}