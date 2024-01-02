"""MaBinouze API /v1/drink"""

from flask import Blueprint, request

from ..models import Order, Drink
from .utils import verify_authorization, authentication_required

routes = Blueprint('drink', __name__)

@routes.get('/drink/<uuid:drink_id>')
@authentication_required('Basic')
def get_drink(drink_id):
    """Read drink"""
    drink = Drink.read(drink_id)
    if drink is None:
        return {'error': "No such drink"}, 404

    order = Order.read(drink.order_uuid)
    error = verify_authorization(order.verify_password, request.authorization.password)
    if error is not None:
        return error

    return drink.to_json()

@routes.put('/drink/<uuid:drink_id>')
@authentication_required('Basic')
def put_drink(drink_id):
    """Read drink"""
    if request.content_type != 'application/json':
        return {'error': "Request Content-Type is not 'application/json'"}, 415
    body = request.get_json()

    if any(x not in body for x in ['name', 'quantity']):
        return {'error': "Missing compulsory properties 'name', or 'quantity'"}, 400
    
    drink = Drink.read(drink_id)
    if drink is None:
        return {'error': "No such drink"}, 404

    order = Order.read(drink.order_uuid)
    error = verify_authorization(order.verify_password, request.authorization.password)
    if error is not None:
        return error

    drink.quantity = body['quantity']
    if drink.quantity > 0:
        drink.update()
    else:
        drink.delete()
    return drink.to_json()

@routes.delete('/drink/<uuid:drink_id>')
@authentication_required('Basic')
def delete_drink(drink_id):
    """Delete drink"""
    if request.content_type != 'application/json':
        return {'error': "Request Content-Type is not 'application/json'"}, 415
    body = request.get_json()

    if 'quantity' not in body:
        return {'error': "Missing compulsory property 'quantity'"}, 400
    
    drink = Drink(**body)
    if drink is None:
        return {'error': "No such drink"}, 404

    order = Order.read(drink.order_uuid)
    error = verify_authorization(order.verify_password, request.authorization.password)
    if error is not None:
        return error

    drink.delete()
    return drink.to_json()


@routes.post('/drink')
@authentication_required('Basic')
def post_drink():
    """Create drink"""
    if request.content_type != 'application/json':
        return {'error': "Request Content-Type is not 'application/json'"}, 415
    body = request.get_json()

    if 'drink_id' in body:
        del body['drink_id']
    if any(x not in body for x in ['name', 'quantity', 'order_id']):
        return {'error': "Missing compulsory properties 'name', 'quantity' or 'order_id'"}, 400
    
    drink = Drink(**body)
    order = Order.read(drink.order_uuid)
    if order is None:
        return {'error': "No such order"}, 404

    error = verify_authorization(order.verify_password, request.authorization.password)
    if error is not None:
        return error

    drink.create()
    return drink.to_json()
