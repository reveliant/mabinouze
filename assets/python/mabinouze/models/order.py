"""MaBinouze Order model"""

from .drink import Drink

class Order:
    def __init__(self, **kwargs):
        self.tippler = kwargs.get('tippler', "")
        self.drink = Drink(**kwargs)
    
    def __str__(self):
        return "{s.tippler}: {s.drink}".format(s=self)

    def __repr__(self):
        return "<Order>{s.tippler}: {s.drink!r}".format(s=self)

    def to_json(self):
        return {
            "name": self.tippler,
            "drink": self.drink.to_json()
        }