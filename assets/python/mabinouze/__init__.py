from flask import Flask, request
from flask_cors import CORS

from .api import v1
from .utils import init_db_command

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.cli.add_command(init_db_command)

    from .api import v1
    app.register_blueprint(v1, url_prefix='/v1')

    @app.get('/')
    def home():
        return 'Ma Binouze'
    
    return app

app = create_app()