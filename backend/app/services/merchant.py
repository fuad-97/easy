from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models import Customer, Order, OrderItem, Product
from app.models.enums import OrderStatus


def build_dashboard(db: Session, store_id: int) -> dict:
    new_orders = db.scalar(select(func.count(Order.id)).where(Order.store_id == store_id, Order.status == OrderStatus.new)) or 0
    preparing_orders = (
        db.scalar(select(func.count(Order.id)).where(Order.store_id == store_id, Order.status == OrderStatus.preparing)) or 0
    )
    delivered_orders = (
        db.scalar(select(func.count(Order.id)).where(Order.store_id == store_id, Order.status == OrderStatus.delivered)) or 0
    )
    active_products = (
        db.scalar(
            select(func.count(Product.id)).where(
                Product.store_id == store_id, Product.is_deleted.is_(False), Product.is_active.is_(True)
            )
        )
        or 0
    )
    latest_orders = (
        db.scalars(
            select(Order)
            .where(Order.store_id == store_id)
            .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.options))
            .order_by(Order.created_at.desc())
            .limit(5)
        )
        .unique()
        .all()
    )
    return {
        "new_orders": new_orders,
        "preparing_orders": preparing_orders,
        "delivered_orders": delivered_orders,
        "active_products": active_products,
        "latest_orders": latest_orders,
    }


def customer_stats_query(store_id: int):
    return (
        select(
            Customer,
            func.count(Order.id).label("order_count"),
            func.max(Order.created_at).label("last_order_at"),
        )
        .outerjoin(Order, Order.customer_id == Customer.id)
        .where(Customer.store_id == store_id)
        .group_by(Customer.id)
        .order_by(func.max(Order.created_at).desc())
    )
