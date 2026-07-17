import base64
from os import path

from docusign_esign import (
    ConnectEventData,
    EventNotification,
    Recipients,
    EnvelopeDefinition,
    Tabs,
    Email,
    InitialHere,
    SignHere,
    Signer,
    FormulaTab,
    Number,
    PaymentDetails,
    PaymentLineItem,
    Document
)
from jinja2 import Environment, BaseLoader

from app.ds_config import TPL_PATH, IMG_PATH
from app.extensions import Extensions


class DsDocument:
    @classmethod
    def _build_change_major_minor_objects(cls, tpl, student, envelope_args):
        with open(path.join(TPL_PATH, tpl), 'r') as file:
            content_bytes = file.read()

        # Get base64 logo representation to paste it into the HTML
        with open(path.join(IMG_PATH, 'logo.png'), 'rb') as file:
            img_base64_src = base64.b64encode(file.read()).decode('utf-8')

        content_bytes = Environment(loader=BaseLoader).from_string(content_bytes)\
            .render(
                first_name=student['first_name'],
                last_name=student['last_name'],
                email=student['email'],
                major=student['major'],
                minor=student['minor'],
                img_base64_src=img_base64_src
            )
        base64_file_content = base64.b64encode(
            bytes(content_bytes, 'utf-8')
        ).decode('ascii')

        # Create the document model
        document = Document(  # Create the Docusign document object
            document_base64=base64_file_content,
            name='Change minor/major field',
            file_extension='html',
            document_id=1
        )

        # Create the signer recipient model
        signer = Signer(  # The signer
            email=student['email'],
            name=f"{student['first_name']} {student['last_name']}",
            recipient_id='1',
            routing_order='1',
            # Setting the client_user_id marks the signer as embedded
            client_user_id=envelope_args['signer_client_id']
        )

        # Create a SignHere tab (field on the document)
        sign_here = SignHere(
            anchor_string='/signature_1/',
            anchor_units='pixels',
            anchor_y_offset='10',
            anchor_x_offset='20'
        )

        # Create a InitialHere tab
        initial_here = InitialHere(
            anchor_string='/initials_1/',
            anchor_units='pixels',
            anchor_y_offset='10',
            anchor_x_offset='20'
        )

        return document, signer, sign_here, initial_here

    @classmethod
    def create(cls, tpl, student, envelope_args, extensions):
        """Creates envelope
        Parameters:
            tpl (str): template path for the document
            student (dict): student information
            envelope_args (dict): parameters of the document
            extensions (list): list of extensions retrieved from the Docusign API
        Returns:
            EnvelopeDefinition object that will be submitted to Docusign
        """
        document, signer, sign_here, initial_here = cls._build_change_major_minor_objects(
            tpl,
            student,
            envelope_args
        )

        # Create an Email field
        email_verification_extension = Extensions.get_object_by_app_id(extensions, Extensions.getEmailExtensionId())
        tab = next(
            tab
            for tab in email_verification_extension["tabs"]
            if "VerifyEmailInput" in tab["tabLabel"]
        )
        verification_data = Extensions.extract_verification_data(
            email_verification_extension["appId"],
            tab
        )
        extension_data = Extensions.get_extension_data(verification_data)
        email = Email(
            name=verification_data["application_name"],
            tab_label=verification_data["tab_label"],
            tooltip=verification_data["action_input_key"],
            document_id='1',
            page_number='1',
            anchor_string='/email/',
            anchor_units='pixels',
            required=True,
            value=student['email'],
            locked=False,
            anchor_y_offset='-5',
            extension_data=extension_data
        )

        signer.tabs = Tabs(
            sign_here_tabs=[sign_here],
            email_tabs=[email],
            initial_here_tabs=[initial_here]
        )

        # Create the top-level envelope definition and populate it
        envelope_definition = EnvelopeDefinition(
            email_subject='Change minor/major field',
            documents=[document],
            # The Recipients object takes arrays for each recipient type
            recipients=Recipients(signers=[signer]),
            status='sent',  # Requests that the envelope be created and sent
            event_notification=cls._create_event_notification(envelope_args)
        )

        return envelope_definition
    
    @classmethod
    def create_without_extension(cls, tpl, student, envelope_args):
        """Creates envelope
        Parameters:
            tpl (str): template path for the document
            student (dict): student information
            envelope_args (dict): parameters of the document
        Returns:
            EnvelopeDefinition object that will be submitted to Docusign
        """
        document, signer, sign_here, initial_here = cls._build_change_major_minor_objects(
            tpl,
            student,
            envelope_args
        )

        # Create an Email field
        email = Email(
            document_id='1',
            page_number='1',
            anchor_string='/email/',
            anchor_units='pixels',
            required=True,
            value=student['email'],
            locked=False,
            anchor_y_offset='-5'
        )
        signer.tabs = Tabs(
            sign_here_tabs=[sign_here],
            email_tabs=[email],
            initial_here_tabs=[initial_here]
        )

        # Create the top-level envelope definition and populate it
        envelope_definition = EnvelopeDefinition(
            email_subject='Change minor/major field',
            documents=[document],
            # The Recipients object takes arrays for each recipient type
            recipients=Recipients(signers=[signer]),
            status='sent',  # Requests that the envelope be created and sent
            event_notification=cls._create_event_notification(envelope_args)
        )

        return envelope_definition

    @classmethod
    def create_with_payment(cls, tpl, student, activity_info, envelope_args): # pylint: disable-msg=too-many-locals
        """Create envelope with payment feature included
        Parameters:
            tpl (str): template path for the document
            student (dict}: student information
            activity_info (dict): activity information for enrollment
            envelope_args (dict): parameters for the envelope
        Returns:
            EnvelopeDefinition object that will be submitted to Docusign
        """
        l1_name = activity_info['name']
        l1_price = activity_info['price']
        l1_description = f'${l1_price}'
        currency_multiplier = 100

        # Read template and fill it up
        with open(path.join(TPL_PATH, tpl), 'r') as file:
            content_bytes = file.read()

        # Get base64 logo representation to paste it into the HTML
        with open(path.join(IMG_PATH, 'logo.png'), 'rb') as file:
            img_base64_src = base64.b64encode(file.read()).decode('utf-8')
        content_bytes = Environment(loader=BaseLoader).from_string(
            content_bytes).render(
                user_name=f"{student['first_name']} {student['last_name']}",
                user_email=student['email'],
                activity_name=l1_name,
                activity_price=l1_price,
                img_base64_src=img_base64_src
            )

        base64_file_content = base64.b64encode(
            bytes(content_bytes, 'utf-8')
        ).decode('ascii')

        # Create the envelope definition
        envelope_definition = EnvelopeDefinition(
            email_subject='Register for extracurricular activity'
        )

        # Create the document
        doc1 = Document(document_base64=base64_file_content,
                        name='Order form',  # can be different from actual file name
                        file_extension='html',  # Source data format.
                        document_id='1'  # a label used to reference the doc
                        )
        envelope_definition.documents = [doc1]

        # Create a Signer recipient to sign the document
        signer1 = Signer(
            email=student['email'],
            name=f"{student['first_name']} {student['last_name']}",
            recipient_id='1',
            routing_order='1',
            client_user_id=envelope_args['signer_client_id']
        )
        sign_here1 = SignHere(
            anchor_string='/sn1/',
            anchor_y_offset='10', anchor_units='pixels',
            anchor_x_offset='20')

        # Create a Number tab for the price
        numberl1e = Number(
            font='helvetica',
            font_size='size11',
            anchor_string='/l1e/',
            anchor_y_offset='-8',
            anchor_units='pixels',
            anchor_x_offset='-7',
            tab_label='l1e',
            formula=l1_price,
            required='true',
            locked='true',
            disable_auto_size='false',
        )

        # Create a FormulaTab for the total
        formula_total = FormulaTab(
            font='helvetica',
            bold='true',
            font_size='size12',
            anchor_string='/l2t/',
            anchor_y_offset='-6',
            anchor_units='pixels',
            anchor_x_offset='30',
            tab_label='l2t',
            formula='[l1e]',
            round_decimal_places='2',
            required='true',
            locked='true',
            disable_auto_size='false',
        )

        # Create PaymentLineItems
        payment_line_iteml1 = PaymentLineItem(
            name=l1_name, description=l1_description, amount_reference='l1e'
        )

        payment_details = PaymentDetails(
            gateway_account_id=envelope_args['gateway_account_id'],
            currency_code='USD',
            gateway_name=envelope_args['gateway_name'],
            line_items=[payment_line_iteml1]
        )

        # Create hidden FormulaTab for the payment itself
        formula_payment = FormulaTab(
            tab_label='payment',
            formula=f'{l1_price} * {currency_multiplier}',
            round_decimal_places='2',
            payment_details=payment_details,
            hidden='true',
            required='true',
            locked='true',
            document_id='1',
            page_number='1',
            x_position='0',
            y_position='0'
        )

        # Create Tabs for signer
        signer1_tabs = Tabs(
            sign_here_tabs=[sign_here1],
            formula_tabs=[formula_payment, formula_total],
            number_tabs=[numberl1e]
        )
        signer1.tabs = signer1_tabs

        # Add the recipients to the envelope object
        recipients = Recipients(signers=[signer1])
        envelope_definition.recipients = recipients

        # Request that the envelope be sent by setting status to 'sent'.
        envelope_definition.status = 'sent'

        # Add event notifications
        envelope_definition.event_notification = cls._create_event_notification(envelope_args)

        return envelope_definition
    
    @classmethod
    def _create_event_notification(cls, envelope_args):
        """Creates event notification object for the envelope"""
        monitor_url = f"{envelope_args['monitor_callback_url']}/api/monitor/envelopes/status"

        event_data = ConnectEventData(
            version='restv2.1',
            include_data=["recipients"]
        )
        event_notification = EventNotification(
            url=monitor_url,
            delivery_mode='SIM',
            logging_enabled='true',
            require_acknowledgment='true',
            events=[
                'envelope-sent',
                'envelope-delivered',
                'envelope-completed',
                'envelope-declined',
                'envelope-voided'
            ],
            event_data=event_data
        )

        return event_notification
