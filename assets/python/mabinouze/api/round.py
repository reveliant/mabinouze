"""MaBinouze API /v1/round"""

from werkzeug.exceptions import BadRequest, Forbidden, NotFound, UnsupportedMediaType
from flask import Blueprint, request

from ..models import Round, Order
from .utils import (
    required_authentication,
    verify_authorization,
    authentication_required,
    authentication_credentials
)

routes = Blueprint('round', __name__)

# As `round` is a built-in function,
# `event` is used as Round instance

def get_round_instance(round_id):
    """Get requested round or raise NotFound"""
    if str(request.url_rule).startswith("/v1/search/"):
        event = Round.search(round_id)
    else:
        event = Round.read(round_id)

    if event is None:
        raise NotFound("No such round")

    return event

@routes.get('/search/<string:round_id>')
@routes.get('/round/<uuid:round_id>')
def get_round(round_id):
    """Read a round"""
    event = get_round_instance(round_id)

    if request.method == "HEAD":
        return ""

    if event.has_access_token():
        required_authentication()
        verify_authorization(event.verify_access_token, request.authorization.token)

    return event.read_orders().summary()

@routes.post('/round')
def post_round():
    """Create a new round"""
    if request.content_type != 'application/json':
        raise UnsupportedMediaType("Request Content-Type is not 'application/json'")
    body = request.get_json()

    if 'expires' in body:
        del body['expires']
    if 'locked' in body:
        del body['locked']
    if any(x not in body for x in ['id', 'description', 'time', 'password']):
        raise BadRequest("Missing compulsory properties 'id', 'description', 'time' or 'password'")

    event = Round(**body)
    if event.exists():
        raise BadRequest("Round already exists")

    event.create()
    return event.summary(), 201

@routes.get('/search/<string:round_id>/details')
@routes.get('/round/<uuid:round_id>/details')
@authentication_required
def get_round_details(round_id):
    """Read round details (i.e. orders)"""
    event = get_round_instance(round_id)

    verify_authorization(event.verify_password, request.authorization.token)

    return event.read_orders().details()

@routes.get('/search/<string:round_id>/order')
@routes.get('/round/<uuid:round_id>/order')
@authentication_credentials
def get_round_order(round_id):
    """Read round own order"""
    event = get_round_instance(round_id)

    order = Order.search(event.uuid, request.authorization.username)
    if order is None:
        raise NotFound("No such order")

    verify_authorization(order.verify_password, request.authorization.password)

    return order.read_drinks().to_json(with_drinks=True)

@routes.post('/search/<string:round_id>/order')
@routes.post('/round/<uuid:round_id>/order')
@authentication_credentials
def post_round_order(round_id):
    """Add order to a round"""
    if request.content_type != 'application/json':
        raise UnsupportedMediaType("Request Content-Type is not 'application/json'")
    body = request.get_json()

    if 'order_id' in body:
        del body['order_id']
    if any(x not in body for x in ['tippler', 'password']):
        raise BadRequest("Missing compulsory properties 'tippler' or 'password'")

    event = get_round_instance(round_id)

    order = Order(round_id=event.uuid, **body)
    other = Order.search(event.uuid, body['tippler'])

    # Order does not exists
    if other is None:
        order.create()
        return order.to_json(), 201

    # Order exists
    if not other.verify_password(request.authorization.password):
        raise Forbidden("Order already exists and invalid password supplied")

    order.uuid = other.uuid
    order.update()
    return order.to_json()
