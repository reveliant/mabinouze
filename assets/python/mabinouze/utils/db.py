"""MaBinouze DB connector handler"""

import sqlite3
import click

from flask import current_app, g

__ALL__ = ['get_db', 'close_db', 'init_db', 'init_db_command']

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

def init_db():
    """Initialize database"""
    database = get_db()

    with current_app.open_resource('utils/schema.sql') as sql:
        database.executescript(sql.read().decode('utf8'))

@click.command('init-db')
def init_db_command():
    """Clear the existing data and create new tables."""
    init_db()
    click.echo('Initialized the database.')
