"""MaBinouze API /v1/round"""

from flask import Blueprint, request

from ..models import Round, Order
from .utils import required_authentication, verify_authorization, authentication_required, authentication_credentials

routes = Blueprint('round', __name__)

# As `round` is a built-in function,
# `event` is used as Round instance

@routes.get('/search/<string:round_id>')
@routes.get('/round/<uuid:round_id>')
def get_round(round_id):
    """Read a round"""
    if str(request.url_rule).startswith("/v1/search/"):
        event = Round.search(round_id)
    else:
        event = Round.read(round_id)

    if event is None:
        return {'error': "No such round"}, 404

    if request.method == "HEAD":
        return ""

    if event.has_access_token():
        error = required_authentication()
        if error is not None:
            return error

        error = verify_authorization(event.verify_access_token, request.authorization.token)
        if error is not None:
            return error

    return event.read_orders().summary()

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
        return {'error': "Missing compulsory properties 'id', 'description', 'time' or 'password'"}, 400

    event = Round(**body)
    if event.exists():
        return {'error': "Round already exists"}, 400

    event.create()
    return event.summary(), 201

@routes.get('/search/<string:round_id>/details')
@routes.get('/round/<uuid:round_id>/details')
@authentication_required
def get_round_details(round_id):
    """Read round details (i.e. orders)"""
    if str(request.url_rule).startswith("/v1/search/"):
        event = Round.search(round_id)
    else:
        event = Round.read(round_id)

    if event is None:
        return {'error': "No such round"}, 404

    error = verify_authorization(event.verify_password, request.authorization.token)
    if error is not None:
        return error

    return event.read_orders().details()

@routes.get('/search/<string:round_id>/order')
@routes.get('/round/<uuid:round_id>/order')
@authentication_credentials
def get_round_order(round_id):
    """Read round own order"""
    if str(request.url_rule).startswith("/v1/search/"):
        event = Round.search(round_id)
    else:
        event = Round.read(round_id)

    if event is None:
        return {'error': "No such round"}, 404

    order = Order.search(event.uuid, request.authorization.username)
    if order is None:
        return {'error': "No such order"}, 404

    error = verify_authorization(order.verify_password, request.authorization.password)
    if error is not None:
        return error

    return order.read_drinks().to_json(with_drinks=True)

@routes.post('/search/<string:round_id>/order')
@routes.post('/round/<uuid:round_id>/order')
@authentication_credentials
def post_round_order(round_id):
    """Add order to a round"""
    if request.content_type != 'application/json':
        return {'error': "Request Content-Type is not 'application/json'"}, 415
    body = request.get_json()

    if 'order_id' in body:
        del body['order_id']
    if any(x not in body for x in ['tippler', 'password']):
        return {'error': "Missing compulsory properties 'tippler' or 'password'"}, 400

    if str(request.url_rule).startswith("/v1/search/"):
        event = Round.search(round_id)
    else:
        event = Round.read(round_id)

    if event is None:
        return {'error': "No such round"}, 404

    order = Order(round_id=event.uuid, **body)
    other = Order.search(event.uuid, body['tippler'])
    if other is not None:
        # order exists
        if other.verify_password(request.authorization.password):
            order.uuid = other.uuid
            order.update()
            return order.to_json()
        else:
            return {'error': "Order already exists and invalid password supplied"}, 403

    order.create()
    return order.to_json(), 201
