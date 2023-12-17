"""MaBinouze API service"""

from flask import Flask, request
from flask_cors import CORS

from .api import v1
from .utils import init_db, clean_db

app = Flask(__name__)
CORS(app)
app.cli.add_command(init_db)
app.cli.add_command(clean_db)
app.register_blueprint(v1)

@app.get('/')
def home():
    """Home route"""
    return 'Ma Binouze'
