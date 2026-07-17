from io import BytesIO
import os

from docusign_esign import EnvelopesApi, RecipientViewRequest
from flask import send_file

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
        document_data = envelope_api.get_document(
            account_id, args['document_id'], args['envelope_id'], certificate=True
        )

        if isinstance(document_data, (bytes, bytearray)):
            filename = f"{args['envelope_id']}-{args['document_id']}.pdf"
            return send_file(
                BytesIO(document_data),
                as_attachment=True,
                download_name=filename,
                mimetype='application/pdf'
            )

        if isinstance(document_data, str) and os.path.isfile(document_data):
            return send_file(document_data, as_attachment=True)

        payload = bytes(document_data) if not isinstance(document_data, str) else document_data.encode('utf-8')
        filename = f"{args['envelope_id']}-{args['document_id']}.pdf"
        return send_file(
            BytesIO(payload),
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )