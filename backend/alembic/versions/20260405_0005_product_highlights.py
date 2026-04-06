"""add product highlight flags

Revision ID: 20260405_0005
Revises: 20260405_0004
Create Date: 2026-04-05 20:40:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = "20260405_0005"
down_revision = "20260405_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    existing_columns = {column["name"] for column in inspector.get_columns("products")}

    if "is_new_arrival" not in existing_columns:
        op.add_column("products", sa.Column("is_new_arrival", sa.Boolean(), nullable=False, server_default=sa.false()))

    if "is_best_seller" not in existing_columns:
        op.add_column("products", sa.Column("is_best_seller", sa.Boolean(), nullable=False, server_default=sa.false()))


def downgrade() -> None:
    op.drop_column("products", "is_best_seller")
    op.drop_column("products", "is_new_arrival")
