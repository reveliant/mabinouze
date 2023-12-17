"""MaBinouze DB connector handler"""

import sqlite3
import click

from flask import current_app, g

__ALL__ = ['get_db', 'close_db', 'init_db', 'clean_db']

def get_db():
    """Get database connector"""
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config.get('DATABASE', 'mabinouze.db'),
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row

    return g.db

def close_db():
    """Close database connector"""
    database = g.pop('db', None)

    if database is not None:
        database.close()

@click.command('init-db')
def init_db():
    """Clear the existing data and create new tables."""
    conn = get_db()
    with current_app.open_resource('utils/schema.sql') as sql:
        conn.executescript(sql.read().decode('utf8'))

    click.echo('Initialized database.')


@click.command('clean-db')
def clean_db():
    """Clear expired data."""
    conn = get_db()
    conn.executescript("""
        CREATE TEMPORARY TABLE expired_rounds
        AS SELECT round_id, locked
        FROM rounds
        WHERE rounds.expires < datetime('now');

        DELETE FROM drinks
        WHERE order_id IN (
            SELECT order_id
            FROM orders, expired_rounds
            WHERE orders.round_id = expired_rounds.round_id
        );

        DELETE FROM orders
        WHERE round_id IN (
            SELECT round_id
            FROM expired_rounds
        );

        DELETE FROM rounds
        WHERE round_id IN (
            SELECT round_id
            FROM expired_rounds
            WHERE locked IS NOT TRUE
        );

        DROP TABLE expired_rounds;
    """)

    click.echo('Cleaned database from expired data.')
