"""MaBinouze v1 API"""

from functools import wraps

from werkzeug.datastructures import WWWAuthenticate
from flask import Blueprint, request, make_response

from ..models import Round, Order, Drink

v1 = Blueprint('v1', __name__)

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

@v1.get('/<name>')
def get_round(name):
    """Read a round"""
    event = Round.read(name)
    if event is None:
        return {'error': "No such round"}, 404

    if request.method == "HEAD":
        return ""

    if event.has_access_token():
        error = required_authentication("Bearer")
        if error is not None:
            return error

        error = verify_authorization(event.verify_access_token, request.authorization.token)
        if error is not None:
            return error

    return event.read_orders().summary()

@v1.get('/<name>/details')
@authentication_required('Bearer')
def get_round_details(name):
    """Read round details (i.e. orders)""" 
    event = Round.read(name)
    if event is None:
        return {'error': "No such round"}, 404

    error = verify_authorization(event.verify_password, request.authorization.token)
    if error is not None:
        return error

    return event.read_orders().details()

@v1.post('/')
def post_round():
    """Create a new round"""
    if request.content_type != 'application/json':
        return {'error': "Request Content-Type is not 'application/json'"}, 415
    body = request.get_json()

    if 'expires' in body:
        del body['expires']
    if any(x not in body for x in ['id', 'description', 'time', 'password']):
        return {'error': "Missing compulsory properties"}, 400

    event = Round(**body)
    if event.exists():
        return {'error': "Round already exists"}, 400

    event.create()
    return event.summary(), 201

@v1.post('/<name>/order')
@authentication_required('Basic')
def post_order(name):
    """Add order to a round"""
    if request.content_type != 'application/json':
        return {'error': "Request Content-Type is not 'application/json'"}, 415
    body = request.get_json()

    if 'expires' in body:
        del body['expires']
    if any(x not in body for x in ['name', 'password']):
        return {'error': "Missing compulsory properties"}, 400

    event = Round.read(name)
    if event is None:
        return {'error': "No such round"}, 404

    order = Order(**body)
    other = Order.read(event.name, body['name'])
    if other is None:
        order.create()
    else: # order exists
        if other.verify_password(request.authorization.token):
            order.updates(other)
            order.update()
        else:
            return {'error': "Order already exists"}, 400

    return order.to_json(), 201
