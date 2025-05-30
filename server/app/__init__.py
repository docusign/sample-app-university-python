from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

from app.api import auth, clickwrap, requests, common

load_dotenv()

URL_PREFIX = '/api'

app = Flask(__name__)
app.config.from_pyfile("config.py")
app.register_blueprint(auth, url_prefix=URL_PREFIX)
app.register_blueprint(common, url_prefix=URL_PREFIX)
app.register_blueprint(clickwrap, url_prefix=URL_PREFIX)
app.register_blueprint(requests, url_prefix=URL_PREFIX)
cors = CORS(app)
