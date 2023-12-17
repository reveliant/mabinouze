"""MaBinouze API /v1 utils"""

from functools import wraps

from werkzeug.datastructures import WWWAuthenticate
from flask import request, make_response

def required_authentication(auth_type):
    """Check that required authorization header is present"""
    if request.authorization is None:
        resp = make_response({'error': f"Missing {auth_type} authentication"}, 401)
        resp.headers['WWW-Authenticate'] = WWWAuthenticate(auth_type.capitalize())
        return resp
    if request.authorization.type != auth_type.lower():
        return {'error': f"Invalid authorization type:"\
            f" expected {auth_type},"\
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

def authentication_required(auth_type):
    """Authentication decorator"""
    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            error = required_authentication(auth_type)
            if error is not None:
                return error
            return func(*args, **kwargs)
        return decorated_function
    return decorator
