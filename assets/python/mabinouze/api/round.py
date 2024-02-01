"""MaBinouze API /v1/round"""

from datetime import datetime

from werkzeug.exceptions import BadRequest, Forbidden, NotFound
from flask import Blueprint, request

from ..models import Round, Order
from .utils import (
    required_authentication,
    verify_authorization,
    authentication_required,
    authentication_credentials,
    sanitized_json
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
    body = sanitized_json(['expires','locked'], ['name', 'description', 'time', 'password'])
    event = Round(**body)
    if event.exists():
        raise BadRequest("Round already exists")

    event.create()
    return event.summary(), 201

@routes.put('/round/<uuid:round_id>')
@authentication_required
def put_round(round_id):
    """Update round"""
    body = sanitized_json([], ['description', 'time'])
    
    event = get_round_instance(round_id)
    verify_authorization(event.verify_password, request.authorization.token)

    event.description = body['description']
    event.times['round'] = datetime.fromisoformat(body['time'])
    
    if not event.is_locked() and event.times['round'] > event.times['expires']:
        raise BadRequest("Requested time is after round expiration")

    event.update()
    return ""

@routes.get('/search/<string:round_id>/details')
@routes.get('/round/<uuid:round_id>/details')
@authentication_required
def get_round_details(round_id):
    """Read round details (i.e. orders)"""
    event = get_round_instance(round_id)

    verify_authorization(event.verify_password, request.authorization.token)

    return event.read_orders(include_empty=True).details()

@routes.get('/search/<string:round_id>/order')
@routes.get('/round/<uuid:round_id>/order')
@authentication_credentials
def get_round_order(round_id):
    """Read round own order"""
    event = get_round_instance(round_id)

    order = Order.search(event.uuid, request.authorization.username)
    if order is None:
        raise NotFound("No such order")
    verify_authorization(order.verify_credentials, request.authorization)

    return order.read_drinks().to_json(with_drinks=True)

@routes.post('/search/<string:round_id>/order')
@routes.post('/round/<uuid:round_id>/order')
@authentication_credentials
def post_round_order(round_id):
    """Add order to a round"""
    body = sanitized_json(['order_id'], ['tippler', 'password'])
    event = get_round_instance(round_id)

    order = Order(round_id=event.uuid, **body)
    arrival = Order.search(event.uuid, body['tippler'])

    # Arrival order does not exist (create)
    if arrival is None:
        # Tippler name change
        if body['tippler'] != request.authorization.username:
            # Check departure credentials
            depature = Order.search(event.uuid, request.authorization.username)
            if depature is None:
                raise NotFound("Tippler name and authentication mismatch, cannot rename tippler from inexistant order")
            verify_authorization(depature.verify_credentials, request.authorization)

            # Keep departure UUID
            order.uuid = depature.uuid
            order.update()
            return order.to_json()

        # Tippler creation
        order.create()
        return order.to_json(), 201

    # Arrival order exists (update)
    verify_authorization(arrival.verify_credentials, request.authorization)
    order.uuid = arrival.uuid
    order.update()
    return order.to_json()
