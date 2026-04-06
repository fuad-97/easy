"""initial schema"""

from alembic import op
import sqlalchemy as sa


revision = "20260405_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    contact_method = sa.Enum("platform", "whatsapp", "both", name="contactmethod")
    product_status = sa.Enum("available", "unavailable", name="productstatus")
    order_status = sa.Enum(
        "new",
        "confirmed",
        "preparing",
        "ready",
        "out_for_delivery",
        "delivered",
        "cancelled",
        name="orderstatus",
    )
    pickup_method = sa.Enum("delivery", "pickup", name="pickupmethod")

    bind = op.get_bind()
    contact_method.create(bind, checkfirst=True)
    product_status.create(bind, checkfirst=True)
    order_status.create(bind, checkfirst=True)
    pickup_method.create(bind, checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True, unique=True),
        sa.Column("phone", sa.String(length=30), nullable=True, unique=True),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "stores",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("owner_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False, unique=True),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("slug", sa.String(length=160), nullable=False, unique=True),
        sa.Column("activity_type", sa.String(length=80), nullable=False),
        sa.Column("city", sa.String(length=80), nullable=False),
        sa.Column("short_description", sa.Text(), nullable=False, server_default=""),
        sa.Column("logo_url", sa.String(length=255)),
        sa.Column("banner_url", sa.String(length=255)),
        sa.Column("primary_color", sa.String(length=20), nullable=False, server_default="#B45309"),
        sa.Column("is_banner_enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("contact_method", contact_method, nullable=False, server_default="both"),
        sa.Column("whatsapp_number", sa.String(length=30)),
        sa.Column("is_open", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_stores_slug", "stores", ["slug"])

    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("store_id", sa.Integer(), sa.ForeignKey("stores.id"), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "store_settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("store_id", sa.Integer(), sa.ForeignKey("stores.id"), nullable=False, unique=True),
        sa.Column("working_hours", sa.Text(), nullable=False, server_default=""),
        sa.Column("delivery_notes", sa.Text(), nullable=False, server_default=""),
        sa.Column("store_link", sa.String(length=255)),
        sa.Column("default_delivery_fee", sa.Numeric(10, 2), nullable=False, server_default="0"),
        sa.Column("pickup_enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "delivery_zones",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("store_id", sa.Integer(), sa.ForeignKey("stores.id"), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("fee", sa.Numeric(10, 2), nullable=False, server_default="0"),
        sa.Column("estimated_time", sa.String(length=80)),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("store_id", sa.Integer(), sa.ForeignKey("stores.id"), nullable=False),
        sa.Column("category_id", sa.Integer(), sa.ForeignKey("categories.id")),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("price", sa.Numeric(10, 2), nullable=False),
        sa.Column("compare_at_price", sa.Numeric(10, 2)),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("prep_time_minutes", sa.Integer()),
        sa.Column("status", product_status, nullable=False, server_default="available"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "product_images",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("image_url", sa.String(length=255), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "product_option_groups",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("is_required", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "product_option_values",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("group_id", sa.Integer(), sa.ForeignKey("product_option_groups.id"), nullable=False),
        sa.Column("value", sa.String(length=80), nullable=False),
        sa.Column("price_delta", sa.Numeric(10, 2), nullable=False, server_default="0"),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "customers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("store_id", sa.Integer(), sa.ForeignKey("stores.id"), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("phone", sa.String(length=30), nullable=False),
        sa.Column("area", sa.String(length=100)),
        sa.Column("short_address", sa.Text()),
        sa.Column("notes", sa.Text()),
        sa.Column("total_spent", sa.Numeric(10, 2), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("store_id", sa.Integer(), sa.ForeignKey("stores.id"), nullable=False),
        sa.Column("customer_id", sa.Integer(), sa.ForeignKey("customers.id"), nullable=False),
        sa.Column("order_number", sa.String(length=40), nullable=False, unique=True),
        sa.Column("status", order_status, nullable=False, server_default="new"),
        sa.Column("subtotal", sa.Numeric(10, 2), nullable=False),
        sa.Column("delivery_fee", sa.Numeric(10, 2), nullable=False, server_default="0"),
        sa.Column("total", sa.Numeric(10, 2), nullable=False),
        sa.Column("pickup_method", pickup_method, nullable=False),
        sa.Column("requested_time", sa.String(length=100)),
        sa.Column("notes", sa.Text()),
        sa.Column("short_address", sa.Text()),
        sa.Column("area", sa.String(length=100)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "order_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("order_id", sa.Integer(), sa.ForeignKey("orders.id"), nullable=False),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id")),
        sa.Column("product_name", sa.String(length=160), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("total_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("notes", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "order_item_options",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("order_item_id", sa.Integer(), sa.ForeignKey("order_items.id"), nullable=False),
        sa.Column("group_name", sa.String(length=80), nullable=False),
        sa.Column("option_value", sa.String(length=80), nullable=False),
        sa.Column("price_delta", sa.Numeric(10, 2), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("order_item_options")
    op.drop_table("order_items")
    op.drop_table("orders")
    op.drop_table("customers")
    op.drop_table("product_option_values")
    op.drop_table("product_option_groups")
    op.drop_table("product_images")
    op.drop_table("products")
    op.drop_table("delivery_zones")
    op.drop_table("store_settings")
    op.drop_table("categories")
    op.drop_index("ix_stores_slug", table_name="stores")
    op.drop_table("stores")
    op.drop_table("users")

    bind = op.get_bind()
    sa.Enum(name="pickupmethod").drop(bind, checkfirst=True)
    sa.Enum(name="orderstatus").drop(bind, checkfirst=True)
    sa.Enum(name="productstatus").drop(bind, checkfirst=True)
    sa.Enum(name="contactmethod").drop(bind, checkfirst=True)
