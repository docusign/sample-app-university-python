import json
import os

from docusign_esign import ApiException
from flask import abort, Blueprint, jsonify, Response, request, session
from flask_cors import cross_origin

from app.api.utils import process_error, check_token
from app.clickwrap import Clickwrap
from app.document import DsDocument
from app.envelope import Envelope
from app.envelope_status_store import envelope_status_store
from app.transcript import render_transcript
from app.ds_config import CONNECTED_FIELDS_BASE_HOST
from app.extensions import Extensions

from .session_data import SessionData

requests = Blueprint('requests', __name__)


@requests.route('/requests/minormajor', methods=['POST'])
@cross_origin()
@check_token
def minor_major():
    """Request for major/minor change"""
    try:
        req_json = request.get_json(force=True)
    except TypeError:
        return jsonify(message='Invalid json input'), 400

    student = req_json['student']
    useWithoutExtension = student['useWithoutExtension']
    envelope_args = {
        'signer_client_id': 1000,
        'ds_return_url': req_json['callback-url'],
        'monitor_callback_url': os.environ.get('MONITOR_CALLBACK_URL'),
    }

    try:
        # Create envelope
        if useWithoutExtension == True:
            envelope = DsDocument.create_without_extension('minor-major.html', student, envelope_args)
        else:
            extensions = json.loads(session.get('extensions'))
            envelope = DsDocument.create('minor-major.html', student, envelope_args, extensions)

        # Submit envelope to the Docusign
        envelope_id = Envelope.send(envelope, session)
    except ApiException as exc:
        return process_error(exc)

    SessionData.set_ds_documents(envelope_id)

    try:
        # Get the recipient view
        result = Envelope.get_view(envelope_id, envelope_args, student, session)
    except ApiException as exc:
        return process_error(exc)
    return jsonify({'envelope_id': envelope_id, 'redirect_url': result.url})


@requests.route('/requests/transcript', methods=['POST'])
@cross_origin()
@check_token
def download_transcript(): # pylint: disable-msg=inconsistent-return-statements
    """Request for viewing unofficial transcript"""
    try:
        req_json = request.get_json(force=True)
    except TypeError:
        return jsonify(message="Invalid json input"), 400

    student = req_json['student']
    client_user_id = req_json['client_user_id']
    args = {
        'clickwrap_id': req_json['clickwrap_id']
    }

    try:
        # Gets all the users that have agreed to the clickwrap
        user_agreements = Clickwrap.get_user_agreements(args, session)
    except ApiException as exc:
        return process_error(exc)

    if client_user_id not in user_agreements:
        abort(404)

    student_name = f"{student['first_name']} {student['last_name']}"
    transcript = render_transcript(student_name)
    response = Response(transcript, mimetype='text/html')
    response.headers['Content-Disposition'] = (
        'attachment;filename=Unofficial_transcript.html'
    )
    return response


@requests.route('/requests/activity', methods=['POST'])
@cross_origin()
@check_token
def payment_activity():
    """Request for extracurricular activity"""
    try:
        req_json = request.get_json(force=True)
    except TypeError:
        return jsonify(message='Invalid json input'), 400

    activity_info = req_json['activity']
    student = req_json['student']
    envelope_args = {
        'signer_client_id': 1000,
        'ds_return_url': req_json['callback-url'],
        'gateway_account_id': session.get('payment_gateway_account_id'),
        'gateway_name': session.get('payment_gateway'),
        'gateway_display_name': session.get('payment_display_name'),
        'monitor_callback_url': os.environ.get('MONITOR_CALLBACK_URL')
    }

    try:
        # Create envelope with payment
        envelope = DsDocument.create_with_payment(
            'payment-activity.html', student, activity_info, envelope_args
        )
        # Submit envelope to Docusign
        envelope_id = Envelope.send(envelope, session)
    except ApiException as exc:
        return process_error(exc)

    SessionData.set_ds_documents(envelope_id)

    try:
        # Get the recipient view
        result = Envelope.get_view(envelope_id, envelope_args, student, session)
    except ApiException as exc:
        return process_error(exc)
    return jsonify({'envelope_id': envelope_id, 'redirect_url': result.url})


@requests.route('/requests', methods=['GET'])
@cross_origin()
def envelope_list():
    """Request for envelope list"""
    try:
        envelope_args = {
            'from_date': request.args.get('from-date')
        }
    except TypeError:
        return jsonify(message='Invalid json input'), 400

    user_documents = session.get('ds_documents', [])

    try:
        envelopes = Envelope.list(envelope_args, user_documents, session)
    except ApiException as exc:
        return process_error(exc)
    return jsonify({'envelopes': envelopes})


@requests.route('/requests/download', methods=['GET'])
@cross_origin()
@check_token
def envelope_download():
    """Request for document download from the envelope"""
    try:
        envelope_args = {
            'envelope_id': request.args['envelope-id'],
            "document_id": request.args['document-id'],
        }
    except TypeError:
        return jsonify(message="Invalid json input"), 400

    try:
        envelope_file = Envelope.download(envelope_args, session)
    except ApiException as exc:
        return process_error(exc)
    return envelope_file


@requests.route('/requests/extensionApps', methods=['GET'])
@cross_origin()
def extension_apps():
    """Request for extension apps"""

    access_token = session.get('access_token')
    account_id = session.get('account_id')

    try:
        extensions = Extensions.getExtensions(account_id, access_token, CONNECTED_FIELDS_BASE_HOST)
        email_extension_id = Extensions.getEmailExtensionId()
        required_app_ids = [email_extension_id]
        actual_app_ids = [item.get("appId") for item in extensions]

        filtered_extensions = [
            item for item in extensions
            if item.get("appId") in required_app_ids
        ]
        session['extensions'] = json.dumps(filtered_extensions)

        has_all_app_ids = all(app_id in actual_app_ids for app_id in required_app_ids)
    except Exception as exc:
        return process_error(exc)
    return jsonify({'areExtensionsPresent': has_all_app_ids})


@requests.route('/monitor/envelopes/status', methods=['POST'])
@cross_origin()
def monitor_envelope_status():
    """Receive Docusign monitor updates."""
    payload = request.get_json(silent=True)
    if not payload or not isinstance(payload, dict):
        return jsonify(message='Invalid JSON input'), 400

    data = _extract_event_data(payload)

    envelope_status_store.upsert(data)
    publish_envelope_status()
    
    return jsonify(data), 200

def publish_envelope_status():
    records = envelope_status_store.all()
    
    for client in envelope_status_store.clients():
        try:
            client.send(json.dumps(records))
        except Exception:
            envelope_status_store.unregister_client(client)


def _extract_event_data(payload):
    """Extract event data from the payload."""
    event = payload.get('event', '')
    return _extract_extension_event_data(payload) if event.startswith('extension-') else _extract_envelope_event_data(payload)


def _extract_envelope_event_data(payload):
    event = payload.get('event', '')

    data = payload.get('data', {}) if isinstance(payload, dict) else {}
    envelope_id = data.get('envelopeId', '')
    envelope_summary = data.get('envelopeSummary', {}) if isinstance(data, dict) else {}
    subject = envelope_summary.get('emailSubject', '')
    status = envelope_summary.get('status', '')
    status_timestamp = envelope_summary.get('statusChangedDateTime', '')

    recipients = envelope_summary.get('recipients', {})
    signers = recipients.get('signers', []) if isinstance(recipients, dict) else []
    signer_name = signers[0].get('name', '') if len(signers) > 0 else ''

    return {
        'event': event,
        'envelope_id': envelope_id,
        'subject': subject,
        'status': status,
        'status_timestamp': status_timestamp,
        'signer_name': signer_name,
    }


def _extract_extension_event_data(payload):
    event = payload.get('event', '')

    data = payload.get('data', {}) if isinstance(payload, dict) else {}
    envelope_id = data.get('entityId', '')
    extension = data.get('extension', {}) if isinstance(data, dict) else {}
    action_contract = extension.get('actionContract', '')
    app_name = extension.get('appName', '')
    attempt_time = extension.get('attemptTime', '')

    verification_data = extension.get('data', {})
    verified = verification_data.get('verified', False) if isinstance(verification_data, dict) else False

    return {
        'event': event,
        'envelope_id': envelope_id,
        'action_contract': action_contract,
        'app_name': app_name,
        'attempt_time': attempt_time,
        'verified': verified,
    }
