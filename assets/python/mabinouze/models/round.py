"""MaBinouze Round model"""

from datetime import datetime

from .order import Order
from ..utils import get_db

class Round:
    def __init__(self, **kwargs):
        self.id = kwargs.get('id')
        self.description = kwargs.get('description', "")
        self.time = datetime.fromisoformat(kwargs.get('time'))
        self.expires = datetime.fromisoformat(kwargs.get('expires'))
        self.password = kwargs.get('password', "")
        self.orders = kwargs.get('orders', []) # list of Drinks

    def summary(self):
        drinks = {}
        tipplers = set()

        for order in self.orders:
            print(order)
            if order.drink.name not in drinks:
                drinks[order.drink.name] = order.drink.copy()
            else:
                drinks[order.drink.name].quantity += order.drink.quantity
            tipplers.add(order.tippler)

        return {
            "id": self.id,
            "description": self.description,
            "time": self.time.isoformat(),
            "drinks": [d.to_json() for d in drinks.values()],
            "tipplers": len(tipplers)
        }

    def details(self):
        tipplers = {}
        for order in self.orders:
            if order.tippler not in tipplers:
                tipplers[order.tippler] = {
                    "name": order.tippler,
                    "drinks": [order.drink.to_json()]
                }
            else:
                tipplers[order.tippler]["drinks"].append(order.drink.to_json())

        return {
            "id": self.id,
            "description": self.description,
            "time": self.time.isoformat(),
            "tipplers": tipplers
        }
    
    def add_order(self, **kwargs):
        self.orders.append(Order(**kwargs))

    @classmethod
    def get(cls, id):
        db = get_db();

        cur = db.execute("""
            SELECT round_id, name AS id, description, time, expires, password
            FROM rounds
            WHERE name = ?
        """, (id, ))
        res = cur.fetchone()
        
        if res is None:
            return None

        round = cls(**res)
        round_id = res['round_id']

        cur = db.execute("""
            SELECT orders.name AS tippler, drinks.name, drinks.quantity
            FROM orders, drinks
            WHERE orders.round_id = ?
            AND orders.order_id = drinks.order_id
        """, (round_id, ))
        for res in cur.fetchall():
            round.add_order(**res)

        return round
        