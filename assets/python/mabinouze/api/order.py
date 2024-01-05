"""MaBinouze API /v1/order"""

from werkzeug.exceptions import NotFound, Forbidden
from flask import Blueprint, request

from ..models import Order
from .utils import verify_authorization, authentication_credentials

routes = Blueprint('order', __name__)

@routes.get('/order/<uuid:order_id>')
@authentication_credentials
def get_order(order_id):
    """Read order"""
    order = Order.read(order_id)
    if order is None:
        raise NotFound("No such order")
    verify_authorization(order.verify_credentials, request.authorization)

    return order.read_drinks().to_json()
