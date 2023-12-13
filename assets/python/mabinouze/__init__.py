"""MaBinouze API service"""

from flask import Flask, request
from flask_cors import CORS

from .api import v1
from .utils import init_db_command

app = Flask(__name__)
CORS(app)
app.cli.add_command(init_db_command)
app.register_blueprint(v1, url_prefix='/v1')

@app.get('/')
def home():
    """Home route"""
    return 'Ma Binouze'
