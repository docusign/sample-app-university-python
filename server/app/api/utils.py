from functools import wraps

from flask import jsonify, redirect, url_for, session

from app.ds_client import DsClient
from app.ds_config import PERMISSION_SCOPES, DS_RETURN_URL, DS_AUTH_SERVER


from .session_data import SessionData


def process_error(err):
    """Special handling for consent_required"""
    body = err.body.decode('utf8')
    if "consent_required" in body:
        client_id = session.get('account_id')
        consent_scopes = ' '.join(PERMISSION_SCOPES)
        consent_url = f"{DS_AUTH_SERVER}/oauth/auth?response_type=code&scope=\
            {consent_scopes}&client_id={client_id}&redirect_uri={DS_RETURN_URL}"

        return jsonify({
            'reason': 'Unauthorized',
            'response': 'Permissions should be granted for current integration',
            'url': consent_url}), 401

    return jsonify({
        'reason': err.reason,
        'response': err.body.decode('utf8')
    }), 400


def check_token(func):
    @wraps(func)
    def wrapper(*args, **kwargs):

        if session.get('auth_type') == 'jwt':
            DsClient.update_token()

        if not SessionData.is_logged():
            return redirect(url_for("auth.code_grant_auth"))

        return func(*args, **kwargs)

    return wrapper