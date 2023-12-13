"""MaBinouze Order model"""

from .drink import Drink
from ..utils import get_db, crypt, verify

class Order:
    """MaBinouze Order model"""
    def __init__(self, **kwargs):
        self.__id = kwargs.get('order_id', None)
        self.__round_id = kwargs.get('round_id', None)
        self.tippler = kwargs.get('tippler', "")
        self.drinks = kwargs.get('drinks', []) # list of Drinks
        self.__password = kwargs['password'].encode() \
            if 'password' in kwargs and kwargs['password'] is not None else None

    def __str__(self):
        return f"{self.tippler}: {self.drinks}"

    def __repr__(self):
        return f"<Order>{self.tippler}: {self.drinks!r}"

    def to_json(self):
        """Return object as JSON-serializable dict"""
        return {
            "name": self.tippler,
            "drinks": [drink.to_json() for drink in self.drinks]
        }

    def updates(self, other):
        """Updates self database ID from another order"""
        # pylint: disable=protected-access
        self.__id = other.__id

    @classmethod
    def read(cls, round_id, name):
        """Read an order from database"""
        conn = get_db()
        cur = conn.execute("""
            SELECT round_id, order_id, name AS tippler, password
            FROM orders
            WHERE round_id = ?
            AND name = ?
        """, (round_id, name, ))
        res = cur.fetchone()

        if res is None:
            return None

        return cls(**res)

    @classmethod
    def read_round(cls, round_id):
        """Read all orders for a given round from database"""
        orders = []

        conn = get_db()
        cur = conn.execute("""
            SELECT round_id, order_id, name AS tippler, password
            FROM orders
            WHERE round_id = ?
        """, (round_id, ))
        for res in cur.fetchall():
            orders.append(cls(**res).read_drinks())
        return orders

    def read_drinks(self):
        """Populate order with drinks"""
        self.drinks = Drink.read_order(self.__id)
        return self

    def create(self):
        """Create order in database"""
        conn = get_db()
        conn.execute("""
            INSERT INTO orders(round_id, name, password)
            VALUES (?, ?, ?)
        """, (
            self.__round_id,
            self.tippler,
            crypt(self.__password)
        ))

    def update(self):
        """Update order in database"""
        conn = get_db()
        conn.execute("""
            UPDATE orders
            SET name = ?,
                password = ?
            WHERE order_id = ?
        """, (
            self.tippler,
            crypt(self.__password),
            self.__id,
        ))

    def delete(self):
        """Delete order in database"""
        conn = get_db()
        conn.execute("""
            DELETE FROM orders
            WHERE order_id = ?
        """, (self.__id,))

    def verify_password(self, token):
        """Verify a tippler password"""
        return verify(token, self.__password)
