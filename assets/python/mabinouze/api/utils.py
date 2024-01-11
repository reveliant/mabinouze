"""MaBinouze API /v1 utils"""

import binascii

from functools import wraps

from werkzeug.exceptions import Unauthorized, BadRequest, Forbidden, InternalServerError
from flask import request

from ..utils import base64urldecode

def required_authentication():
    """Check that required authorization header is present"""
    if request.authorization is None:
        raise Unauthorized("Missing Bearer authentication", www_authenticate="Bearer")
    if request.authorization.type != 'bearer':
        raise BadRequest(
            "Invalid authorization type: expected Bearer,"\
            f" received {request.authorization.type.capitalize()}"
        )

def required_credentials():
    """Check that required authorization header contains user credentials"""
    try:
        (b64username, b64password) = request.authorization.token.split('.')
        request.authorization.username = base64urldecode(b64username)
        request.authorization.password = base64urldecode(b64password)
    except (ValueError, binascii.Error, UnicodeDecodeError) as err:
        raise BadRequest("Invalid authorization token") from err

def verify_authorization(method, token):
    """Verify authorization for a given token with matching object method"""
    try:
        if not method(token):
            raise Forbidden("Invalid authorization")
    except ValueError as err:
        raise InternalServerError("Invalid authorization: {err}") from err

def authentication_required(func):
    """Bearer Authentication decorator"""
    @wraps(func)
    def decorated_function(*args, **kwargs):
        required_authentication()
        return func(*args, **kwargs)
    return decorated_function

def authentication_credentials(func):
    """Bearer Authentication with Username and Password decorator"""
    @wraps(func)
    def decorated_function(*args, **kwargs):
        required_authentication()

        if '.' in request.authorization.token:
            try:
                (b64username, b64password) = request.authorization.token.split('.')
                request.authorization.username = base64urldecode(b64username)
                request.authorization.password = base64urldecode(b64password)
            except (ValueError, binascii.Error, UnicodeDecodeError) as err:
                raise BadRequest("Invalid authorization token") from err

        return func(*args, **kwargs)
    return decorated_function

def sanitized_json(reserved_keys, required_keys):
    """Sanitize input JSON object"""
    body = request.get_json()

    # Remove reserved, internal keys
    for x in reserved_keys:
        body.pop(x, None)

    # Check required keys
    missing = [x for x in required_keys if x not in body]
    if missing:
        raise BadRequest("Missing compulsory properties: " + ", ".join(missing))

    return body
