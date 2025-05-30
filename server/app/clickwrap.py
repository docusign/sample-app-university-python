import base64
from datetime import datetime
from os import path
import os
from app.ds_config import (
    TPL_PATH,
    CLICKWRAP_BASE_HOST,
    CLICKWRAP_BASE_URI,
    CLICKWRAP_TIME_DELTA_IN_MINUTES
)
from app.ds_client import DsClient


class Clickwrap:
    @staticmethod
    def create(args, session):
        """
        Creates a clickwrap for an account
        Parameters:
            args (dict): parameters for the clickwrap.
        Returns:
            JSON structure of the created clickwrap.
        """
        terms_name = args.get('terms_name')
        account_id = session.get('account_id')

        file_name = 'transcript-terms.docx'

        with open(path.join(TPL_PATH, file_name), 'rb') as binary_file:
            binary_file_data = binary_file.read()
            base64_encoded_data = base64.b64encode(binary_file_data)
            base64_terms = base64_encoded_data.decode('utf-8')

        # Construct clickwrap JSON body
        body = {
            'displaySettings': {
                'consentButtonText': 'I Agree',
                'displayName': args.get('display_name'),
                'downloadable': True,
                'format': 'modal',
                'hasAccept': True,
                'mustView': False,
                'requireAccept': True,
                'size': 'medium',
                'documentDisplay': 'document',
            },
            'documents': [
                {
                    'documentBase64': base64_terms,
                    'documentName': terms_name,
                    'fileExtension': file_name[file_name.rfind('.')+1:],
                    'order': 0
                }
            ],
            'name': terms_name,
            'requireReacceptance': True
        }

        # Make a POST call to the clickwraps endpoint to create a clickwrap for an account
        ds_client = DsClient.get_configured_instance(
            session.get('access_token'),
            CLICKWRAP_BASE_HOST
        )

        uri = f"{CLICKWRAP_BASE_URI}/{account_id}/clickwraps"
        response = ds_client.call_api(
            uri, 'POST', body=body, response_type='object'
        )

        clickwrap_id = response[0].get('clickwrapId')

        # Make a PUT call to the clickwraps endpoint to activate the created clickwrap
        uri = f"{CLICKWRAP_BASE_URI}/{account_id}/clickwraps/{clickwrap_id}/versions/1"
        response_active = ds_client.call_api(
            uri, 'PUT', body={'status': 'active'}, response_type='object'
        )
        return response_active[0]

    @staticmethod
    def get_user_agreements(args, session):
        """Gets all the users that have agreed to a clickwrap
        Parameters:
            args (dict): parameters for the clickwrap
        Returns:
            list of users that have agreed to a clickwrap
        """
        # Make a GET call to the clickwraps endpoint to retrieve all the users
        # that have agreed to a clickwrap
        access_token = session.get('access_token')
        account_id = os.environ.get('API_ACCOUNT_ID')

        ds_client = DsClient.get_configured_instance(access_token, CLICKWRAP_BASE_HOST)

        uri = f"{CLICKWRAP_BASE_URI}/{account_id}/clickwraps/{args['clickwrap_id']}/users"
        response = ds_client.call_api(
            uri, 'GET', response_type='object'
        )

        agreed_users = []
        utc_time_now = datetime.utcnow()
        user_agreements = response[0].get('userAgreements')
        if user_agreements:
            for agreement in user_agreements:
                client_user_id = agreement['clientUserId']
                agreed_on = datetime.strptime(
                    agreement['agreedOn'].split('.')[0], '%Y-%m-%dT%H:%M:%S'
                )
                time_delta = (utc_time_now - agreed_on).total_seconds() / 60

                # Сheck that no more than 15 minutes have passed since the
                # agreement was agreed
                if time_delta <= CLICKWRAP_TIME_DELTA_IN_MINUTES:
                    agreed_users.append(client_user_id)
        return agreed_users