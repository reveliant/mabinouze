"""MaBinouze v1 API"""

from flask import Blueprint

from ..models import Round, Drink

v1 = Blueprint('v1', __name__)

@v1.get('/<id>')
def getRound(id):
    round = Round.get(id)
    if round is None:
        return {'error': "No such round"}, 404
    return round.summary()

@v1.get('/<id>/details')
def getRoundDetails(id):
    round = Round.get(id)
    if round is None:
        return {'error': "No such round"}, 404
    return round.details()

@v1.post('/')
def postRound():
    round = Round(**request.get_json())
    return round.summary(), 201
