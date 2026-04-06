"""add product reviews"""

from alembic import op
import sqlalchemy as sa


revision = "20260405_0004"
down_revision = "20260405_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "product_reviews",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("customer_name", sa.String(length=120), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("is_visible", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
    )
    op.create_index("ix_product_reviews_product_id", "product_reviews", ["product_id"])


def downgrade() -> None:
    op.drop_index("ix_product_reviews_product_id", table_name="product_reviews")
    op.drop_table("product_reviews")
