from docusign_esign import ApiException
from flask import Blueprint, jsonify, request, redirect, url_for, session
from flask_cors import cross_origin

from app.ds_client import DsClient

from .utils import process_error
from .session_data import SessionData

auth = Blueprint('auth', __name__)


@auth.route('/code_grant_auth', methods=['GET'])
@cross_origin()
def code_grant_auth():
    """
    Starting authorization by code grant
    """
    try:
        url = DsClient.get_redirect_uri()
    except ApiException as exc:
        return process_error(exc)
    return jsonify({
        'reason': 'Unauthorized',
        'response': 'Permissions should be granted for current integration',
        'url': url
    }), 401


@auth.route('/callback', methods=['POST'])
@cross_origin()
def callback():
    """
    Completing authorization by code grant
    """
    try:
        req_json = request.get_json(force=True)
    except TypeError:
        return jsonify(message='Invalid json input'), 400

    try:
        auth_data = DsClient.callback(req_json['code'])
    except ApiException:
        return redirect(url_for("auth.jwt_auth"), code=307)

    SessionData.set_auth_data(auth_data)
    return jsonify(message="Logged in with code grant"), 200


@auth.route('/jwt_auth', methods=['GET'])
@cross_origin()
def jwt_auth():
    """
    Authorization by JWT
    """

    try:
        auth_data = DsClient.update_token()
    except ApiException as exc:
        return process_error(exc)

    SessionData.set_auth_data(auth_data)
    SessionData.set_payment_data()

    return jsonify(message="Logged in with JWT"), 200


@auth.route('/get_status', methods=['GET'])
@cross_origin()
def get_status():
    logged = SessionData.is_logged()
    auth_type = session.get('auth_type')
    return jsonify(logged=logged, auth_type=auth_type), 200


@auth.route('/logout', methods=['POST'])
@cross_origin()
def log_out():
    session.clear()
    return jsonify(message="Logged out"), 200


@auth.route('/check_payment', methods=['GET'])
@cross_origin()
def check_payment():
    try:
        payment_data = DsClient.check_payment_gateway(session)
    except ApiException as exc:
        return process_error(exc)

    if payment_data:
        session.update(payment_data)
        return jsonify(message="User has a payment gateway account"), 200

    return jsonify(message="User doesn't have a payment gateway account"), 402