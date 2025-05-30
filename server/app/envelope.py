import os

from docusign_esign import EnvelopesApi, RecipientViewRequest
from flask import send_from_directory

from app.ds_client import DsClient


class Envelope:
    @staticmethod
    def send(envelope, session):
        """Send an envelope
        Parameters:
            envelope (object): EnvelopeDefinition object
        Returns:
            envelope_id (str): envelope ID
        """
        # Call Envelope API create method
        # Exceptions will be caught by the calling function
        access_token = session.get('access_token')
        account_id = session.get('account_id')

        ds_client = DsClient.get_configured_instance(access_token)

        envelope_api = EnvelopesApi(ds_client)
        results = envelope_api.create_envelope(
            account_id,
            envelope_definition=envelope
        )
        return results.envelope_id

    @staticmethod
    def get_view(envelope_id, envelope_args, student, session, authentication_method='None'):
        """Get the recipient view
        Parameters:
            envelope_id (str): envelope ID
            envelope_args (dict): parameters of the document
            student (dict): student information
            authentication_method (str): authentication method
        Returns:
            URL to the recipient view UI
        """
        access_token = session.get('access_token')
        account_id = session.get('account_id')

        # Create the RecipientViewRequest object
        recipient_view_request = RecipientViewRequest(
            authentication_method=authentication_method,
            client_user_id=envelope_args['signer_client_id'],
            recipient_id='1',
            return_url=envelope_args['ds_return_url'],
            user_name=f"{student['first_name']} {student['last_name']}",
            email=student['email']
        )
        # Obtain the recipient view URL for the signing ceremony
        # Exceptions will be caught by the calling function
        ds_client = DsClient.get_configured_instance(access_token)

        envelope_api = EnvelopesApi(ds_client)
        results = envelope_api.create_recipient_view(
            account_id,
            envelope_id,
            recipient_view_request=recipient_view_request
        )
        return results

    @staticmethod
    def list(envelope_args, user_documents, session):
        """Get status changes for one or more envelopes
        Parameters:
            envelope_args (dict): document parameters
            user_documents (list): documents signed by user
        Returns:
            EnvelopesInformation
        """
        access_token = session.get('access_token')
        account_id = session.get('account_id')

        if not access_token or not account_id:
            return []

        ds_client = DsClient.get_configured_instance(access_token)
        envelope_api = EnvelopesApi(ds_client)
        envelopes_info = envelope_api.list_status_changes(
            account_id,
            from_date=envelope_args['from_date'],
            include='recipients'
        )
        if not envelopes_info.envelopes:
            return []
        results = [env.to_dict() for env in envelopes_info.envelopes
                   if env.envelope_id in user_documents]
        return results

    @staticmethod
    def download(args, session):
        """Download the specified document from the envelope"""
        access_token = session.get('access_token')
        account_id = session.get('account_id')

        ds_client = DsClient.get_configured_instance(access_token)
        envelope_api = EnvelopesApi(ds_client)
        file_path = envelope_api.get_document(
            account_id, args['document_id'], args['envelope_id'], certificate=True
        )
        (dirname, filename) = os.path.split(file_path)
        return send_from_directory(
            directory=dirname,
            path=filename,
            as_attachment=True
        )