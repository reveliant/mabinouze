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
