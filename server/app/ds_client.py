import os
import uuid
import logging
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from docusign_esign import ApiClient, AccountsApi, ApiException
from app.ds_config import (
    TOKEN_EXPIRATION_IN_SECONDS,
    CODE_GRANT_SCOPES,
    DS_RETURN_URL,
    DS_DEMO_SERVER,
)

# Configure logging
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


class DsClient:
    """
    DocuSign Client for managing authentication and API interactions.
    """

    @staticmethod
    def get_instance():
        """
        Creates and returns a configured ApiClient instance.
        """
        try:
            client = ApiClient()
            host_name = os.environ.get("DS_AUTH_SERVER")
            if not host_name:
                raise ValueError("DS_AUTH_SERVER environment variable is not set.")
            client.set_oauth_host_name(oauth_host_name=host_name.split("://")[1])
            logger.debug("ApiClient instance created successfully.")
            return client
        except Exception as e:
            logger.error(f"Error creating ApiClient instance: {e}")
            raise

    @classmethod
    def get_configured_instance(cls, access_token, host=None):
        """
        Returns an ApiClient configured with the given access token and host.
        """
        try:
            if not host:
                host = f"{DS_DEMO_SERVER}/restapi"
            client = cls.get_instance()
            client.host = host
            client.set_default_header("Authorization", f"Bearer {access_token}")
            logger.debug("Configured ApiClient instance with access token.")
            return client
        except Exception as e:
            logger.error(f"Error configuring ApiClient instance: {e}")
            raise

    @classmethod
    def get_redirect_uri(cls):
        """
        Generates a redirect URI for user login and consent.
        """
        try:
            client = cls.get_instance()
            callback_uri = f"{DS_RETURN_URL}/callback"
            uri = client.get_authorization_uri(
                client_id=os.environ.get("DS_CLIENT_ID"),
                scopes=CODE_GRANT_SCOPES,
                redirect_uri=callback_uri,
                response_type="code",
                state=uuid.uuid4().hex.upper(),
            )
            logger.debug(f"Generated redirect URI: {uri}")
            return uri
        except Exception as e:
            logger.error(f"Error generating redirect URI: {e}")
            raise

    @classmethod
    def callback(cls, code):
        """
        Handles the OAuth Code Grant callback to exchange code for access token.
        """
        try:
            client = cls.get_instance()
            response = client.generate_access_token(
                client_id=os.environ.get("DS_CLIENT_ID"),
                client_secret=os.environ.get("DS_CLIENT_SECRET"),
                code=code,
            )
            client.set_default_header("Authorization", f"Bearer {response.access_token}")
            account_info = cls._get_account_info(client)

            auth_data = {
                "access_token": response.access_token,
                "account_id": account_info["account_id"],
                "expires_in": int(response.expires_in),
                "auth_type": "code_grant",
            }
            logger.debug("Access token successfully retrieved via Code Grant.")
            return auth_data
        except ApiException as e:
            logger.error(f"DocuSign API exception: {e.reason}")
            logger.debug(f"Full API error body: {e.body}")
            raise
        except Exception as e:
            logger.error(f"Error during OAuth callback: {e}")
            raise

    @staticmethod
    def _get_account_info(client):
        """
        Fetches account information from the DocuSign API.
        """
        try:
            client.host = os.environ.get("DS_AUTH_SERVER")
            response = client.call_api("/oauth/userinfo", "GET", response_type="object")

            if len(response) > 1 and not (200 <= response[1] < 300):
                raise Exception(f"Cannot get user info: {response[1]}")

            accounts = response[0]["accounts"]
            target_account_id = os.environ.get("DS_TARGET_ACCOUNT_ID")

            if target_account_id and target_account_id != "FALSE":
                for acc in accounts:
                    if acc["account_id"] == target_account_id:
                        return acc
                raise Exception(f"User does not have access to account {target_account_id}")

            for acc in accounts:
                if acc["is_default"]:
                    return acc

            raise Exception("No appropriate account found.")
        except Exception as e:
            logger.error(f"Error fetching account info: {e}")
            raise

    @classmethod
    def validate_private_key(cls, private_key_bytes):
        """
        Validates the private key to ensure it's an RSA key.
        """
        try:
            key = serialization.load_pem_private_key(private_key_bytes, password=None)
            if not isinstance(key, rsa.RSAPrivateKey):
                raise ValueError("The private key is not an RSA key.")
            logger.debug("Private key successfully validated.")
        except Exception as e:
            logger.error(f"Invalid private key: {e}")
            raise

    @classmethod
    def update_token(cls):
        """
        Implements JWT-based authorization with detailed logging for environment variables.
        """
        try:
            logger.info("Starting JWT token generation process...")

            # Get API client instance
            client = cls.get_instance()
            client.host = os.environ.get("DS_AUTH_SERVER")
            logger.debug(f"DS_AUTH_SERVER: {client.host}")

            # Log all required environment variables
            private_key_path = os.environ.get("DS_PRIVATE_KEY")
            client_id = os.environ.get("DS_CLIENT_ID")
            user_id = os.environ.get("DS_IMPERSONATED_USER_GUID")
            logger.debug(f"Environment Variables for Token Generation:")
            logger.debug(f"DS_CLIENT_ID: {client_id}")
            logger.debug(f"DS_IMPERSONATED_USER_GUID: {user_id}")
            logger.debug(f"DS_AUTH_SERVER: {client.host}")
            logger.debug(f"DS_PRIVATE_KEY Path: {private_key_path}")
            logger.debug(f"TOKEN_EXPIRATION_IN_SECONDS: {TOKEN_EXPIRATION_IN_SECONDS}")

            if not private_key_path:
                raise ValueError("DS_PRIVATE_KEY environment variable is not set.")

            # Read and validate private key
            if os.path.exists(private_key_path):
                logger.debug("Private key file found. Validating...")
                with open(private_key_path, "r") as key_file:
                    private_key_bytes = key_file.read().encode("utf-8")
                    cls.validate_private_key(private_key_bytes)
                    logger.debug("Private key successfully validated.")
            else:
                raise FileNotFoundError(f"Private key file not found at {private_key_path}")

            # Request JWT token
            logger.info("Requesting JWT token...")
            oauth_token = client.request_jwt_user_token(
                client_id=client_id,
                user_id=user_id,
                oauth_host_name=os.environ.get("DS_AUTH_SERVER").split("://")[1],
                private_key_bytes=private_key_bytes,
                expires_in=TOKEN_EXPIRATION_IN_SECONDS,
                scopes=["signature", "impersonation", "click.manage"],
            )
            logger.info("JWT token successfully obtained.")

            # Fetch account info
            logger.debug("Fetching account information...")
            account_info = cls._get_account_info(client)

            auth_data = {
                "access_token": oauth_token.access_token,
                "account_id": account_info["account_id"],
                "expires_in": TOKEN_EXPIRATION_IN_SECONDS,
                "auth_type": "jwt",
            }
            logger.debug(f"Auth data: {auth_data}")
            return auth_data
        except FileNotFoundError as e:
            logger.error(f"File error: {e}")
            raise
        except ApiException as e:
            logger.error(f"DocuSign API exception: {e.reason}")
            logger.debug(f"Full API error body: {e.body}")
            raise
        except ValueError as e:
            logger.error(f"Configuration error: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in update_token: {e}")
            raise

    @classmethod
    def check_payment_gateway(cls, client_args):
        """
        Checks if a payment gateway is enabled for the account.
        """
        try:
            access_token = client_args.get("access_token")
            account_id = client_args.get("account_id")

            if not access_token or not account_id:
                raise ValueError("Access token or account ID is missing.")

            client = cls.get_configured_instance(access_token)
            account_api = AccountsApi(api_client=client)

            response = account_api.get_all_payment_gateway_accounts(account_id=account_id)
            if response.payment_gateway_accounts:
                payment_gateways = [
                    gateway
                    for gateway in response.payment_gateway_accounts
                    if gateway.is_enabled == "true"
                ]
                if payment_gateways:
                    gateway_info = {
                        "payment_display_name": payment_gateways[0].display_name,
                        "payment_gateway": payment_gateways[0].payment_gateway,
                        "payment_gateway_account_id": payment_gateways[0].payment_gateway_account_id,
                    }
                    logger.info(f"Payment gateway enabled: {gateway_info}")
                    return gateway_info

            logger.info("No enabled payment gateway found.")
            return {}
        except ApiException as e:
            logger.error(f"DocuSign API exception: {e.reason}")
            logger.debug(f"Full API error body: {e.body}")
            raise
        except Exception as e:
            logger.error(f"Error checking payment gateway: {e}")
            raise
