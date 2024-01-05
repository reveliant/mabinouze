"""MaBinouze API /v1/drink"""

from werkzeug.exceptions import BadRequest, NotFound
from flask import Blueprint, request

from ..models import Order, Drink
from .utils import verify_authorization, authentication_credentials

routes = Blueprint('drink', __name__)

@routes.get('/drink/<uuid:drink_id>')
@authentication_credentials
def get_drink(drink_id):
    """Read drink"""
    drink = Drink.read(drink_id)
    if drink is None:
        raise NotFound("No such drink")

    order = Order.read(drink.order_uuid)
    if order is None:
        raise NotFound("No such order")
    verify_authorization(order.verify_password, request.authorization.password)

    return drink.to_json()

@routes.put('/drink/<uuid:drink_id>')
@authentication_credentials
def put_drink(drink_id):
    """Read drink"""
    body = request.get_json()

    if any(x not in body for x in ['name', 'quantity']):
        return BadRequest("Missing compulsory properties 'name', or 'quantity'")

    drink = Drink.read(drink_id)
    if drink is None:
        raise NotFound("No such drink")

    order = Order.read(drink.order_uuid)
    if order is None:
        raise NotFound("No such order")
    verify_authorization(order.verify_password, request.authorization.password)

    drink.quantity = body['quantity']
    if drink.quantity > 0:
        drink.update()
    else:
        drink.delete()
    return drink.to_json()

@routes.delete('/drink/<uuid:drink_id>')
@authentication_credentials
def delete_drink(drink_id):
    """Delete drink"""
    body = request.get_json()

    if 'quantity' not in body:
        raise BadRequest("Missing compulsory property 'quantity'")

    drink = Drink.read(drink_id)
    if drink is None:
        raise NotFound("No such drink")

    order = Order.read(drink.order_uuid)
    if order is None:
        raise NotFound("No such order")
    verify_authorization(order.verify_password, request.authorization.password)

    drink.delete()
    return drink.to_json()


@routes.post('/drink')
@authentication_credentials
def post_drink():
    """Create drink"""
    if request.content_type != 'application/json':
        raise UnsupportedMediaType("Request Content-Type is not 'application/json'")
    body = request.get_json()

    if 'drink_id' in body:
        del body['drink_id']
    if any(x not in body for x in ['name', 'quantity', 'order_id']):
        raise BadRequest("Missing compulsory properties 'name', 'quantity' or 'order_id'")

    drink = Drink(**body)

    order = Order.read(drink.order_uuid)
    if order is None:
        raise NotFound("No such order")
    verify_authorization(order.verify_password, request.authorization.password)

    drink.create()
    return drink.to_json()
