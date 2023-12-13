DROP TABLE IF EXISTS rounds;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS drinks;

CREATE TABLE rounds (
  round_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  time TEXT NOT NULL,
  expires TEXT NOT NULL,
  password TEXT NOT NULL,
  access_token TEXT NULL,
  locked BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY AUTOINCREMENT,
  round_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL DEFAULT(''),
  FOREIGN KEY (round_id) REFERENCES rounds (round_id),
  UNIQUE(round_id, name)
);

CREATE TABLE drinks (
  drink_id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders (order_id),
  UNIQUE(order_id, name)
);
