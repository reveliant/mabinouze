DROP TABLE IF EXISTS rounds;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS drinks;

CREATE TABLE rounds (
  round_id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description VARCHAR(255) NOT NULL,
  time TEXT NOT NULL,
  expires TEXT NOT NULL,
  password CHAR(76) NOT NULL,
  access_token CHAR(76) NULL,
  locked BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE orders (
  order_id CHAR(36) PRIMARY KEY,
  round_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  password CHAR(76) NOT NULL,
  FOREIGN KEY (round_id) REFERENCES rounds (round_id),
  UNIQUE(round_id, name)
);

CREATE TABLE drinks (
  drink_id CHAR(36) PRIMARY KEY,
  order_id CHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  quantity UNSIGNED TINYINT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders (order_id),
  UNIQUE(order_id, name)
);
