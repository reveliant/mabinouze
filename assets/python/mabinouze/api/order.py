"""MaBinouze API /v1/order"""

from flask import Blueprint, request

from ..models import Order
from .utils import verify_authorization, authentication_required

routes = Blueprint('order', __name__)

@routes.get('/order/<uuid:order_id>')
@authentication_required('Basic')
def get_order(order_id):
    """Read order"""
    order = Order.read(order_id)
    if order is None:
        return {'error': "No such order"}, 404

    error = verify_authorization(order.verify_password, request.authorization.password)
    if error is not None:
        return error

    return order.read_drinks().to_json()
