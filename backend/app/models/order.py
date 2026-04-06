from sqlalchemy import Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel
from app.models.enums import OrderStatus, PickupMethod


class Order(BaseModel):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[int] = mapped_column(ForeignKey("stores.id"), nullable=False, index=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), nullable=False, index=True)
    order_number: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.new, nullable=False)
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    delivery_fee: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    total: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    pickup_method: Mapped[PickupMethod] = mapped_column(Enum(PickupMethod), nullable=False)
    requested_time: Mapped[str | None] = mapped_column(String(100))
    notes: Mapped[str | None] = mapped_column(Text)
    short_address: Mapped[str | None] = mapped_column(Text)
    area: Mapped[str | None] = mapped_column(String(100))

    store = relationship("Store", back_populates="orders")
    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(BaseModel):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), nullable=False, index=True)
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id"))
    product_name: Mapped[str] = mapped_column(String(160), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    total_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
    options = relationship("OrderItemOption", back_populates="order_item", cascade="all, delete-orphan")


class OrderItemOption(BaseModel):
    __tablename__ = "order_item_options"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_item_id: Mapped[int] = mapped_column(ForeignKey("order_items.id"), nullable=False, index=True)
    group_name: Mapped[str] = mapped_column(String(80), nullable=False)
    option_value: Mapped[str] = mapped_column(String(80), nullable=False)
    price_delta: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)

    order_item = relationship("OrderItem", back_populates="options")
