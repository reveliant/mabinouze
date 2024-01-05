"""MaBinouze API /v1/drink"""

from werkzeug.exceptions import NotFound
from flask import Blueprint, request

from ..models import Order, Drink
from .utils import verify_authorization, authentication_credentials, sanitized_json

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
    verify_authorization(order.verify_credentials, request.authorization)

    return drink.to_json()

@routes.put('/drink/<uuid:drink_id>')
@authentication_credentials
def put_drink(drink_id):
    """Read drink"""
    body = sanitized_json([], ['name', 'quantity'])

    drink = Drink.read(drink_id)
    if drink is None:
        raise NotFound("No such drink")

    order = Order.read(drink.order_uuid)
    if order is None:
        raise NotFound("No such order")
    verify_authorization(order.verify_credentials, request.authorization)

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
    drink = Drink.read(drink_id)
    if drink is None:
        raise NotFound("No such drink")

    order = Order.read(drink.order_uuid)
    if order is None:
        raise NotFound("No such order")
    verify_authorization(order.verify_credentials, request.authorization)

    drink.delete()
    return drink.to_json()


@routes.post('/drink')
@authentication_credentials
def post_drink():
    """Create drink"""
    body = sanitized_json(['drink_id'], ['name', 'quantity', 'order_id'])
    drink = Drink(**body)

    order = Order.read(drink.order_uuid)
    if order is None:
        raise NotFound("No such order")
    verify_authorization(order.verify_credentials, request.authorization)

    drink.create()
    return drink.to_json()
