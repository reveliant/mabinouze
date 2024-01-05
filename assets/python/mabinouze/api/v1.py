"""MaBinouze v1 API"""

from importlib import import_module

from flask import Blueprint
from werkzeug.exceptions import HTTPException

v1 = Blueprint('v1', __name__)
for route in ['round', 'order', 'drink']:
    module = import_module(f'mabinouze.api.{route}')
    v1.register_blueprint(module.routes, url_prefix='/v1')

@v1.errorhandler(Exception)
def handle_exception(err):
    """Handle HTTPExceptions and other exceptions"""
    if isinstance(err, HTTPException):
        return {'message': str(err.description)}, err.code
    return {'message': str(err)}, 500
