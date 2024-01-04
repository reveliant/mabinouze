"""MaBinouze Round model"""

from datetime import datetime, timedelta
from uuid import uuid4

from .order import Order
from ..utils import get_db, crypt, verify, base64urldecode

class Round:
    """MaBinouze Round model"""
    def __init__(self, **kwargs):
        self.uuid = kwargs.get('round_id', uuid4())
        self.name = kwargs.get('name')
        self.description = kwargs.get('description', "")
        self.times = {
            'round': datetime.fromisoformat(kwargs['time']) \
                if 'time' in kwargs and kwargs['time'] is not None \
                else datetime.now() + timedelta(hours=1),
            'expires': datetime.fromisoformat(kwargs['expires']) \
                if 'expires' in kwargs and kwargs['expires'] is not None \
                else None,
        }
        if self.times['expires'] is None:
            self.times['expires'] = self.times['round'] + timedelta(hours=6)
        self.__passwords = {
            'organizer': kwargs.get('password', None),
            'access': kwargs.get('access_token', None),
        }
        self.orders = kwargs.get('orders', []) # list of Orders
        self.__locked = bool(kwargs.get('locked', False))

    def __str__(self):
        return f"{self.name} ({self.times[round]})"

    def __repr__(self):
        return f"<Round>{self.name} ({self.times[round]})"

    def to_json(self):
        """Return object as JSON-serializable dict"""
        return {
            "id": self.uuid,
            "name": self.name,
            "description": self.description,
            "time": self.times['round'].isoformat(timespec='minutes'),
            "expires": self.times['expires'].isoformat(timespec='minutes')
        }

    #
    # Database CRUD methods
    #

    def create(self):
        """Create round in database"""
        conn = get_db()
        conn.execute("""
            INSERT INTO rounds(round_id, name, description, time, expires, password, access_token, locked)
            VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)
        """, (
            str(self.uuid),
            self.name,
            self.description,
            self.times['round'].isoformat(timespec='minutes'),
            self.times['expires'].isoformat(timespec='minutes'),
            crypt(self.__passwords['organizer']),
            crypt(self.__passwords['access'])
        ))
        conn.commit()

    @classmethod
    def read(cls, round_id):
        """Read a round from database"""
        conn = get_db()
        cur = conn.execute("""
            SELECT round_id, name, description, time, expires, password, access_token
            FROM rounds
            WHERE round_id = ?
        """, (
            str(round_id),
        ))
        res = cur.fetchone()

        if res is None:
            return None

        return cls(**res)

    def update(self):
        """Update round in database"""
        expires = self.times['expires'] \
            if self.__locked is False \
            else (self.times['round'] + timedelta(hours=6)).isoformat(timespec='minutes')

        conn = get_db()
        conn.execute("""
            UPDATE rounds
            SET name = ?,
                description = ?,
                time = ?,
                expires = ?,
                password = ?,
                access_token = ?
            WHERE round_id = ?
        """, (
            self.name,
            self.description,
            self.times['round'].isoformat(timespec='minutes'),
            expires,
            crypt(self.__passwords['organizer']),
            crypt(self.__passwords['access']),
            str(self.uuid)
        ))
        conn.commit()
    #
    # Searches
    #

    @classmethod
    def search(cls, name):
        """Read a round from database"""
        conn = get_db()
        cur = conn.execute("""
            SELECT round_id, name, description, time, expires, password, access_token
            FROM rounds
            WHERE name = ?
        """, (
            name,
        ))
        res = cur.fetchone()

        if res is None:
            return None

        return cls(**res)

    def exists(self):
        """Check if round exists in database"""
        conn = get_db()
        cur = conn.execute("""
            SELECT round_id
            FROM rounds
            WHERE name = ?
        """, (
            self.name,
        ))

        return cur.fetchone() is not None

    #
    # Specific methods
    #

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

        return self.to_json() | {
            "drinks": [d.to_json(without_id=True) for d in drinks.values()],
            "tipplers": len(tipplers)
        }

    def details(self):
        """Return a round details, including personnal informations"""
        tipplers = {}
        for order in self.orders:
            tipplers[order.tippler] = order.to_json(with_drinks=True)

        return self.to_json() | {
            "tipplers": tipplers
        }

    def read_orders(self):
        """Populate round with orders"""
        self.orders = Order.from_round(self.uuid)
        return self


    def verify_password(self, token):
        """Verify an organizer password"""
        return verify(base64urldecode(token), self.__passwords['organizer'])

    def verify_access_token(self, token):
        """Verify an access token"""
        return verify(base64urldecode(token), self.__passwords['access'])

    def has_access_token(self):
        """Check if round requires an access token"""
        return self.__passwords['access'] is not None
