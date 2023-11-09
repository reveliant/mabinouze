"""MaBinouze Drink model"""

from ..utils import get_db

class Drink:
    def __init__(self, **kwargs):
        self.name = kwargs.get('name', "")
        self.quantity = kwargs.get('quantity', 1)
    
    def __str__(self):
        return "{s.name} ({s.quantity})".format(s=self)

    def __repr__(self):
        return "<Drink>{s.name} ({s.quantity})".format(s=self)

    def copy(self):
        return Drink(name=self.name, quantity=self.quantity)
    
    def to_json(self):
        return {
            "name": self.name,
            "quantity": self.quantity
        }
    
    def save(self):
        db = get_db()
        db.execute("SELECT name, quantity")