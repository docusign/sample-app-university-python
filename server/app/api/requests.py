from docusign_esign import ApiException
from flask import abort, Blueprint, jsonify, Response, request, session
from flask_cors import cross_origin

from app.api.utils import process_error, check_token
from app.clickwrap import Clickwrap
from app.document import DsDocument
from app.envelope import Envelope
from app.transcript import render_transcript

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
    envelope_args = {
        'signer_client_id': 1000,
        'ds_return_url': req_json['callback-url']
    }

    try:
        # Create envelope
        envelope = DsDocument.create('minor-major.html', student, envelope_args)
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
        'gateway_display_name': session.get('payment_display_name')
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