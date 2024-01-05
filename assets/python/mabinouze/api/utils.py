"""MaBinouze API /v1 utils"""

import binascii

from functools import wraps

from werkzeug.datastructures import WWWAuthenticate
from flask import request, make_response

from ..utils import base64urldecode

def required_authentication():
    """Check that required authorization header is present"""
    if request.authorization is None:
        resp = make_response({'error': f"Missing Bearer authentication"}, 401)
        resp.headers['WWW-Authenticate'] = WWWAuthenticate(auth_type.capitalize())
        return resp
    if request.authorization.type != 'bearer':
        return {'error': "Invalid authorization type: expected Bearer,"\
            f" received {request.authorization.type.capitalize()}"}, 400
    return None

def verify_authorization(method, token):
    """Verify authorization for a given token with matching object method"""
    try:
        if not method(token):
            return {'error': "Invalid authorization"}, 403
    except ValueError as err:
        return {'error': f"Invalid authorization: {err}"}, 500
    return None

def authentication_required(func):
    """Bearer Authentication decorator"""
    @wraps(func)
    def decorated_function(*args, **kwargs):
        error = required_authentication()
        if error is not None:
            return error
        return func(*args, **kwargs)
    return decorated_function

def authentication_credentials(func):
    """Bearer Authentication with Username and Password decorator"""
    @wraps(func)
    def decorated_function(*args, **kwargs):
        error = required_authentication()
        if error is not None:
            return error

        try:
            (b64username, b64password) = request.authorization.token.split('.')
            request.authorization.username = base64urldecode(b64username)
            request.authorization.password = base64urldecode(b64password)
        except (ValueError, binascii.Error, UnicodeDecodeError) as err:
            return {'error': "Invalid authorization token", 'exception': str(err)}, 400

        return func(*args, **kwargs)
    return decorated_function