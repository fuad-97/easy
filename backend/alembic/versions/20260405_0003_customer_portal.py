"""add customer portal token"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = "20260405_0003"
down_revision = "20260405_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    customer_columns = {column["name"] for column in inspector.get_columns("customers")}
    customer_indexes = {index["name"] for index in inspector.get_indexes("customers")}

    if "portal_token" not in customer_columns:
        op.add_column("customers", sa.Column("portal_token", sa.String(length=64), nullable=True))

    if "ix_customers_portal_token" not in customer_indexes:
        op.create_index("ix_customers_portal_token", "customers", ["portal_token"], unique=True)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    customer_columns = {column["name"] for column in inspector.get_columns("customers")}
    customer_indexes = {index["name"] for index in inspector.get_indexes("customers")}

    if "ix_customers_portal_token" in customer_indexes:
        op.drop_index("ix_customers_portal_token", table_name="customers")

    if "portal_token" in customer_columns:
        op.drop_column("customers", "portal_token")
