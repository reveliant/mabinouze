"""MaBinouze Order model"""

from uuid import uuid4

from .drink import Drink
from ..utils import get_db, crypt, verify

class Order:
    """MaBinouze Order model"""
    def __init__(self, **kwargs):
        self.uuid = kwargs.get('order_id', uuid4())
        self.round_uuid = kwargs.get('round_id', None)
        self.tippler = kwargs.get('tippler', "")
        self.drinks = kwargs.get('drinks', []) # list of Drinks
        self.__password = kwargs['password'].encode() \
            if 'password' in kwargs and kwargs['password'] is not None else None

    def __str__(self):
        return f"{self.tippler}: {self.drinks}"

    def __repr__(self):
        return f"<Order>{self.tippler}: {self.drinks!r}"

    def to_json(self, with_drinks=False):
        """Return object as JSON-serializable dict"""
        obj = {
            "id": self.uuid,
            "name": self.tippler
        }
        if with_drinks:
            obj["drinks"] = [drink.to_json() for drink in self.drinks]
        return obj

    @property
    def round(self):
        """Return parent round ID"""
        return self.round_uuid

    #
    # Databse CRUD methods
    #

    def create(self):
        """Create order in database"""
        conn = get_db()
        conn.execute("""
            INSERT INTO orders(order_id, round_id, name, password)
            VALUES (?, ?, ?, ?)
        """, (
            str(self.uuid),
            str(self.round_uuid),
            self.tippler,
            crypt(self.__password)
        ))

    @classmethod
    def read(cls, order_id):
        """Read an order from database"""
        conn = get_db()
        cur = conn.execute("""
            SELECT round_id, order_id, name AS tippler, password
            FROM orders
            WHERE order_id = ?
        """, (
            str(order_id),
        ))
        res = cur.fetchone()

        if res is None:
            return None

        return cls(**res)

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
            str(self.uuid),
        ))

    def delete(self):
        """Delete order in database"""
        conn = get_db()
        conn.execute("""
            DELETE FROM drinks
            WHERE order_id = ?
        """, (
            str(self.uuid),
        ))
        conn.execute("""
            DELETE FROM orders
            WHERE order_id = ?
        """, (
            str(self.uuid),
        ))

    #
    # Searches
    #

    @classmethod
    def search(cls, round_id, tippler):
        """Read an order from database"""
        conn = get_db()
        cur = conn.execute("""
            SELECT round_id, order_id, name AS tippler, password
            FROM orders
            WHERE round_id = ?
            AND name = ?
        """, (
            str(round_id),
            tippler,
        ))
        res = cur.fetchone()

        if res is None:
            return None

        return cls(**res)

    @classmethod
    def from_round(cls, round_id):
        """Read all orders for a given round from database"""
        orders = []

        conn = get_db()
        cur = conn.execute("""
            SELECT round_id, order_id, name AS tippler, password
            FROM orders
            WHERE round_id = ?
        """, (
            str(round_id),
        ))
        for res in cur.fetchall():
            orders.append(cls(**res).read_drinks())
        return orders

    def read_drinks(self):
        """Populate order with drinks"""
        self.drinks = Drink.from_order(self.uuid)
        return self

    #
    # Specific methods
    #

    def copy_id(self, other):
        """Updates self database ID from another order"""
        # pylint: disable=protected-access
        self.uuid = other.uuid

    def verify_password(self, token):
        """Verify a tippler password"""
        return verify(token, self.__password)
