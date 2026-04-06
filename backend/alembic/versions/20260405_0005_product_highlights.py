"""add product highlight flags

Revision ID: 20260405_0005
Revises: 20260405_0004
Create Date: 2026-04-05 20:40:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260405_0005"
down_revision = "20260405_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("products", sa.Column("is_new_arrival", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("products", sa.Column("is_best_seller", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.alter_column("products", "is_new_arrival", server_default=None)
    op.alter_column("products", "is_best_seller", server_default=None)


def downgrade() -> None:
    op.drop_column("products", "is_best_seller")
    op.drop_column("products", "is_new_arrival")
