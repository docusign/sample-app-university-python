import logging
from docusign_esign import ApiException
from flask import Blueprint, jsonify, request, session
from flask_cors import cross_origin
import os

from app.api.utils import process_error, check_token
from app.clickwrap import Clickwrap

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,  # Set to DEBUG for detailed logging
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

clickwrap = Blueprint('clickwrap', __name__)

@clickwrap.route('/clickwraps/transcript', methods=['POST'])
@cross_origin()
@check_token
def transcript_clickwrap():
    """Create clickwrap for an unofficial transcript"""
    logger.info("Transcript clickwrap endpoint called.")
    
    # Parse request JSON
    try:
        req_json = request.get_json(force=True)
        logger.debug(f"Received request JSON: {req_json}")
    except TypeError as e:
        logger.error(f"Invalid JSON input: {e}")
        return jsonify(message='Invalid JSON input'), 400

    # Prepare clickwrap arguments
    try:
        clickwrap_args = {
            'terms_name': req_json['terms-name'],
            'display_name': req_json['display-name']
        }
        logger.debug(f"Prepared clickwrap arguments: {clickwrap_args}")
    except KeyError as e:
        logger.error(f"Missing required fields in JSON: {e}")
        return jsonify(message=f"Missing required fields: {e}"), 400

    # Log session data
    try:
        session_data = dict(session)
        logger.debug(f"Session data: {session_data}")
    except Exception as e:
        logger.error(f"Error logging session data: {e}")
        session_data = {}

    # Create the clickwrap
    try:
        logger.info("Data being passed to Clickwrap.create:")
        logger.info("server/app/api/clickwrap.py")
        logger.debug(f"clickwrap_args: {clickwrap_args}")
        logger.debug(f"Session before modification: {dict(session)}")
        session['payment_display_name'] = os.environ.get('PAYMENT_GATEWAY_DISPLAY_NAME')
        session['payment_gateway'] = os.environ.get('PAYMENT_GATEWAY_NAME')
        session['payment_gateway_account_id'] = os.environ.get('PAYMENT_GATEWAY_ACCOUNT_ID')

        # Set the account_id value in the session
        session['account_id'] = os.environ.get('API_ACCOUNT_ID')

        logger.debug(f"Session after setting account_id: {dict(session)}")

        # Pass the session to Clickwrap.create
        clickwrap_ = Clickwrap.create(clickwrap_args, session)
        logger.info(f"Clickwrap created successfully. Response: {clickwrap_}")
    except ApiException as exc:
        logger.error("DocuSign API exception occurred:")
        logger.error(f"Status Code: {exc.status}")
        logger.error(f"Reason: {exc.reason}")
        logger.error(f"Headers: {exc.headers}")
        logger.error(f"Body: {exc.body}")
        logger.error(f"Trace Token: {exc.headers.get('X-DocuSign-TraceToken') if exc.headers else 'Not available'}")
        return process_error(exc)  # This should be within the ApiException block
    except Exception as e:
        logger.error(f"Unexpected error occurred: {e}")
        return jsonify(message=f"An unexpected error occurred: {e}"), 500

    logger.info("Returning created clickwrap response.")
    logger.debug(f"Final clickwrap response: {clickwrap_}")
    return jsonify(clickwrap=clickwrap_)
