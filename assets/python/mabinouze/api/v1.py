"""MaBinouze v1 API"""

from importlib import import_module

from flask import Blueprint

v1 = Blueprint('v1', __name__)
for route in ['round', 'order', 'drink']:
    module = import_module(f'mabinouze.api.{route}')
    v1.register_blueprint(module.routes, url_prefix='/v1')
