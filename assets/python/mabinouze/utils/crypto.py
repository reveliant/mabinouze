"""MaBinouze crypto utils"""

from base64 import b64encode, b64decode
import hashlib
from os import urandom

__ALL__ = ['crypt', 'verify']

def crypt(password):
    """Compute a base64 digest for password"""
    if password is None:
        return None

    salt = urandom(24)
    return b64encode(salt + digest(password, salt)).decode()

def verify(candidate, reference):
    """Verify a candidate password against a reference base64 digest"""
    salt = b64decode(reference)[:24]
    saved_digest = b64decode(reference)[24:]
    return saved_digest == digest(candidate, salt)

def digest(password, salt):
    """Compute a binary digest for password with a given salt"""
    return hashlib.scrypt(password.encode(), salt=salt, n=2**13, r=8, p=2, maxmem=2**24, dklen=32)
