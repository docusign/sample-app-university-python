import os

TPL_PATH = os.path.abspath(
    os.path.join(os.path.dirname(os.path.realpath(__file__)), 'templates/')
)
IMG_PATH = os.path.abspath(
    os.path.join(os.path.dirname(os.path.realpath(__file__)), "images/")
)

TOKEN_EXPIRATION_IN_SECONDS = 3600
TOKEN_REPLACEMENT_IN_SECONDS = 10 * 60

CLICKWRAP_BASE_HOST = 'https://demo.docusign.net'
CLICKWRAP_BASE_URI = '/clickapi/v1/accounts'
CLICKWRAP_TIME_DELTA_IN_MINUTES = 15

CODE_GRANT_SCOPES = ['signature', 'click.manage']
PERMISSION_SCOPES = ['signature', 'impersonation', 'click.manage']

DS_RETURN_URL = os.environ.get('REACT_APP_DS_RETURN_URL')
DS_AUTH_SERVER = os.environ.get('DS_AUTH_SERVER')
DS_DEMO_SERVER = os.environ.get('REACT_APP_DS_DEMO_SERVER')