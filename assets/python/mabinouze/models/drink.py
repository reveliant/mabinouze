"""MaBinouze Drink model"""

from ..utils import get_db

class Drink:
    """MaBinouze Drink model"""
    def __init__(self, **kwargs):
        self.__id = kwargs.get('drink_id', None)
        self.__order_id = kwargs.get('order_id', None)
        self.name = kwargs.get('name', "")
        self.quantity = kwargs.get('quantity', 1)

    def __str__(self):
        return "{s.name} ({s.quantity})".format(s=self)

    def __repr__(self):
        return "<Drink>{s.name} ({s.quantity})".format(s=self)

    def copy(self):
        """Return a copy of current drink"""
        return Drink(name=self.name, quantity=self.quantity)

    def to_json(self):
        """Return object as JSON-serializable dict"""
        return {
            "name": self.name,
            "quantity": self.quantity
        }

    @classmethod
    def read_order(cls, order_id):
        """Read all drinks for a given order in database"""
        drinks = []
        conn = get_db()
        cur = conn.execute("""
            SELECT drink_id, order_id, name, quantity
            FROM drinks
            WHERE order_id = ?
        """, (order_id, ))
        for res in cur.fetchall():
            drinks.append(cls(**res))
        return drinks

    def create(self):
        """Create drink in database"""
        conn = get_db()
        conn.execute("""
            INSERT INTO drinks(order_id, name, quantity)
            VALUES (?, ?, ?)
        """, (
            self.__order_id,
            self.name,
            self.quantity
        ))

    def update(self):
        """Update drink in database""" 
        conn = get_db()
        conn.execute("""
            UPDATE drinks
            SET quantity = ?
            WHERE drink_id = ?
        """, (
            self.quantity,
            self.__id
        ))

    def delete(self):
        """Delete drink in database""" 
        conn = get_db()
        conn.execute("""
            DELETE FROM drinks
            WHERE drink_id = ?
        """, (self.__id,))

    def increase(self):
        """Increase quantity and update database"""
        self.quantity += 1
        self.update()

    def decrease(self):
        """Decrease quantity and update database"""
        self.quantity -= 1
        if self.quantity > 0:
            self.update()
        else:
            self.delete()
