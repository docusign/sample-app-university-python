import os

from datetime import datetime
from flask import session

from app.ds_config import TOKEN_REPLACEMENT_IN_SECONDS


class SessionData:
    """
    This class provides methods for
    getting, setting and deleting session data
    """

    @staticmethod
    def set_auth_data(auth_data):
        expires_date = int(round(datetime.utcnow().timestamp() + auth_data['expires_in']))

        session['access_token'] = auth_data['access_token']
        session['account_id'] = auth_data['account_id']
        session['auth_type'] = auth_data['auth_type']
        session['expires_date'] = expires_date

    @staticmethod
    def set_payment_data():
        """
        Set payment data for JWT auth
        """
        session['payment_display_name'] = os.environ.get('DS_PAYMENT_GATEWAY_DISPLAY_NAME')
        session['payment_gateway'] = os.environ.get('DS_PAYMENT_GATEWAY_NAME')
        session['payment_gateway_account_id'] = os.environ.get('DS_PAYMENT_GATEWAY_ID')

    @staticmethod
    def is_logged():
        expires_date = session.get('expires_date')
        date_now = int(round(datetime.utcnow().timestamp()))
        return expires_date and expires_date > date_now + TOKEN_REPLACEMENT_IN_SECONDS

    @staticmethod
    def set_ds_documents(envelope_id):
        if not session.get('ds_documents'):
            session['ds_documents'] = [envelope_id]
        else:
            documents = session['ds_documents']
            documents.append(envelope_id)
            session['ds_documents'] = documents