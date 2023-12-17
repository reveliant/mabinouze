"""MaBinouze API /v1/round"""

from flask import Blueprint, request

from ..models import Round, Order
from .utils import required_authentication, verify_authorization, authentication_required

routes = Blueprint('round', __name__)

@routes.get('/search/<string:round_id>')
@routes.get('/round/<uuid:round_id>')
def get_round(round_id):
    """Read a round"""
    if str(request.url_rule).startswith("/v1/search/"):
        obj = Round.search(round_id)
    else:
        obj = Round.read(round_id)

    if obj is None:
        return {'error': "No such round"}, 404

    if request.method == "HEAD":
        return ""

    if obj.has_access_token():
        error = required_authentication("Bearer")
        if error is not None:
            return error

        error = verify_authorization(obj.verify_access_token, request.authorization.token)
        if error is not None:
            return error

    return obj.read_orders().summary()

@routes.post('/round')
def post_round():
    """Create a new round"""
    if request.content_type != 'application/json':
        return {'error': "Request Content-Type is not 'application/json'"}, 415
    body = request.get_json()

    if 'expires' in body:
        del body['expires']
    if 'locked' in body:
        del body['locked']
    if any(x not in body for x in ['id', 'description', 'time', 'password']):
        return {'error': "Missing compulsory properties"}, 400

    event = Round(**body)
    if event.exists():
        return {'error': "Round already exists"}, 400

    event.create()
    return event.summary(), 201

@routes.get('/search/<string:round_id>/details')
@routes.get('/round/<uuid:round_id>/details')
@authentication_required('Bearer')
def get_round_details(round_id):
    """Read round details (i.e. orders)""" 
    if str(request.url_rule).startswith("/v1/search/"):
        obj = Round.search(round_id)
    else:
        obj = Round.read(round_id)

    if obj is None:
        return {'error': "No such round"}, 404

    error = verify_authorization(obj.verify_password, request.authorization.token)
    if error is not None:
        return error

    return obj.read_orders().details()

@routes.post('/round/<uuid:round_id>/order')
@authentication_required('Basic')
def post_round_order(round_id):
    """Add order to a round"""
    if request.content_type != 'application/json':
        return {'error': "Request Content-Type is not 'application/json'"}, 415
    body = request.get_json()

    if 'expires' in body:
        del body['expires']
    if any(x not in body for x in ['name', 'password']):
        return {'error': "Missing compulsory properties"}, 400

    event = Round.read(round_id)
    if event is None:
        return {'error': "No such round"}, 404

    order = Order(**body)
    other = Order.search(event.name, body['name'])
    if other is None:
        order.create()
    else: # order exists
        if other.verify_password(request.authorization.password):
            order.copy_id(other)
            order.update()
        else:
            return {'error': "Order already exists"}, 400

    return order.to_json(), 201
