"""MaBinouze Drink model"""

from uuid import uuid4

from ..utils import get_db

class Drink:
    """MaBinouze Drink model"""
    def __init__(self, **kwargs):
        self.uuid = kwargs.get('drink_id', uuid4())
        self.order_uuid = kwargs.get('order_id', None)
        self.name = kwargs.get('name', "")
        self.quantity = kwargs.get('quantity', 1)

    def __str__(self):
        return "{s.name} ({s.quantity})".format(s=self)

    def __repr__(self):
        return "<Drink>{s.name} ({s.quantity})".format(s=self)

    def to_json(self, without_id=False):
        """Return object as JSON-serializable dict"""
        obj = {
            "id": self.uuid,
            "name": self.name,
            "quantity": self.quantity
        }
        if without_id:
            del obj['id']
        return obj

    #
    # Database CRUD methods
    #

    def create(self):
        """Create drink in database"""
        conn = get_db()
        conn.execute("""
            INSERT INTO drinks(drink_id, order_id, name, quantity)
            VALUES (?, ?, ?, ?)
        """, (
            str(self.uuid),
            str(self.order_uuid),
            self.name,
            self.quantity
        ))

    @classmethod
    def read(cls, drink_id):
        """Read a drink from database"""
        conn = get_db()
        cur = conn.execute("""
            SELECT drink_id, order_id, name, quantity
            FROM drinks
            WHERE drink_id = ?
        """, (
            str(drink_id),
        ))
        res = cur.fetchone()

        if res is None:
            return None

        return cls(**res)

    def update(self):
        """Update drink in database""" 
        conn = get_db()
        conn.execute("""
            UPDATE drinks
            SET quantity = ?
            WHERE drink_id = ?
        """, (
            self.quantity,
            str(self.uuid)
        ))

    def delete(self):
        """Delete drink in database""" 
        conn = get_db()
        conn.execute("""
            DELETE FROM drinks
            WHERE drink_id = ?
        """, (
            str(self.uuid),
        ))

    #
    # Searches
    #

    @classmethod
    def from_order(cls, order_id):
        """Read all drinks for a given order in database"""
        drinks = []
        conn = get_db()
        cur = conn.execute("""
            SELECT drink_id, order_id, name, quantity
            FROM drinks
            WHERE order_id = ?
        """, (
            str(order_id),
        ))
        for res in cur.fetchall():
            drinks.append(cls(**res))
        return drinks

    #
    # Specific methods
    #

    def copy(self):
        """Return a copy of current drink"""
        return Drink(name=self.name, quantity=self.quantity)

    def increase(self, quantity=1):
        """Increase quantity and update database"""
        self.quantity += quantity
        self.update()

    def decrease(self, quantity=1):
        """Decrease quantity and update database"""
        self.quantity -= quantity
        if self.quantity > 0:
            self.update()
        else:
            self.delete()
