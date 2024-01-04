"""MaBinouze Utilities"""

from base64 import urlsafe_b64decode

from .db import *
from .crypto import *

def base64urldecode(b64):
    """Decode a Base64 URL Encoded (unpadded) string"""
    padding = "=" * ((4 - len(b64) % 4) % 4)
    return urlsafe_b64decode(b64 + padding).decode()