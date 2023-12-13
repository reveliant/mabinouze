"""MaBinouze Round model"""

from datetime import datetime, timedelta

from .order import Order
from ..utils import get_db, crypt, verify

class Round:
    """MaBinouze Round model"""
    def __init__(self, **kwargs):
        self.__id = kwargs.get('round_id', None)
        self.name = kwargs.get('id')
        self.description = kwargs.get('description', "")
        self.time = datetime.fromisoformat(kwargs['time']) \
            if 'time' in kwargs \
            else datetime.now() + timedelta(hours=1)
        self.expires = datetime.fromisoformat(kwargs['expires']) \
            if 'expires' in kwargs \
            else self.time + timedelta(hours=6)
        self.__passwords = {
            'organizer': kwargs['password'].encode() \
                if 'password' in kwargs and kwargs['password'] is not None else None,
            'access': kwargs['access_token'].encode() \
                if 'access_token' in kwargs and kwargs['access_token'] is not None else None,
        }
        self.orders = kwargs.get('orders', []) # list of Orders

    def summary(self):
        """Return a round summary, without personal informations"""
        drinks = {}
        tipplers = set()

        for order in self.orders:
            for drink in order.drinks:
                if drink.name not in drinks:
                    drinks[drink.name] = drink.copy()
                else:
                    drinks[drink.name].quantity += drink.quantity
            tipplers.add(order.tippler)

        return {
            "id": self.name,
            "description": self.description,
            "time": self.time.isoformat(timespec='minutes'),
            "expires": self.expires.isoformat(timespec='minutes'),
            "drinks": [d.to_json() for d in drinks.values()],
            "tipplers": len(tipplers)
        }

    def details(self):
        """Return a round details, including personnal informations"""
        tipplers = {}
        for order in self.orders:
            tipplers[order.tippler] = order.to_json()

        return {
            "id": self.name,
            "description": self.description,
            "time": self.time.isoformat(timespec='minutes'),
            "expires": self.expires.isoformat(timespec='minutes'),
            "tipplers": tipplers
        }

    @classmethod
    def read(cls, name):
        """Read a round from database"""
        conn = get_db()
        cur = conn.execute("""
            SELECT round_id, name AS id, description, time, expires, password, access_token
            FROM rounds
            WHERE name = ?
        """, (name,))
        res = cur.fetchone()

        if res is None:
            return None

        return cls(**res)

    def read_orders(self):
        """Populate round with orders"""
        self.orders = Order.read_round(self.__id)
        return self

    def exists(self):
        """Check if round exists in database"""
        conn = get_db()
        cur = conn.execute("""
            SELECT round_id
            FROM rounds
            WHERE name = ?
        """, (self.name, ))

        return cur.fetchone() is not None

    def create(self):
        """Create round in database"""
        conn = get_db()
        conn.execute("""
            INSERT INTO rounds(name, description, time, expires, password, access_token)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            self.name,
            self.description,
            self.time.isoformat(timespec='minutes'),
            self.expires.isoformat(timespec='minutes'),
            crypt(self.__passwords['organizer']),
            crypt(self.__passwords['access'])
        ))

    def update(self):
        """Update round in database"""
        conn = get_db()
        conn.execute("""
            UPDATE rounds
            SET name = ?,
                description = ?,
                time = ?,
                password = ?,
                access_token = ?
            WHERE round_id = ?
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            self.name,
            self.description,
            self.time.isoformat(timespec='minutes'),
            crypt(self.__passwords['organizer']),
            crypt(self.__passwords['access']),
            self.__id
        ))

    def verify_password(self, token):
        """Verify an organizer password"""
        return verify(token, self.__passwords['organizer'])

    def verify_access_token(self, token):
        """Verify an access token"""
        return verify(token, self.__passwords['access'])

    def has_access_token(self):
        """Check if round requires an access token"""
        return self.__passwords['access'] is not None
