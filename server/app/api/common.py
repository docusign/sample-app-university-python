from flask import Blueprint, jsonify, request

common = Blueprint('common', __name__)

@common.before_app_request
def only_json(): # pylint: disable-msg=inconsistent-return-statements
    if request.method == 'POST' and not request.is_json:
        return jsonify({'error': 'Payload should be a JSON'}), 400