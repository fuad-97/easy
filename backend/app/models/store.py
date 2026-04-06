from sqlalchemy import Boolean, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel
from app.models.enums import ContactMethod


class Store(BaseModel):
    __tablename__ = "stores"

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    slug: Mapped[str] = mapped_column(String(160), unique=True, nullable=False, index=True)
    activity_type: Mapped[str] = mapped_column(String(80), nullable=False)
    city: Mapped[str] = mapped_column(String(80), nullable=False)
    short_description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    logo_url: Mapped[str | None] = mapped_column(String(255))
    banner_url: Mapped[str | None] = mapped_column(String(255))
    primary_color: Mapped[str] = mapped_column(String(20), default="#B45309", nullable=False)
    is_banner_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    contact_method: Mapped[ContactMethod] = mapped_column(Enum(ContactMethod), default=ContactMethod.platform, nullable=False)
    whatsapp_number: Mapped[str | None] = mapped_column(String(30))
    is_open: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    owner = relationship("User", back_populates="store")
    categories = relationship("Category", back_populates="store", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="store", cascade="all, delete-orphan")
    customers = relationship("Customer", back_populates="store", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="store", cascade="all, delete-orphan")
    delivery_zones = relationship("DeliveryZone", back_populates="store", cascade="all, delete-orphan")
    settings = relationship("StoreSettings", back_populates="store", uselist=False, cascade="all, delete-orphan")


class Category(BaseModel):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[int] = mapped_column(ForeignKey("stores.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(120), nullable=False)
    sort_order: Mapped[int] = mapped_column(default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    store = relationship("Store", back_populates="categories")
    products = relationship("Product", back_populates="category")


class DeliveryZone(BaseModel):
    __tablename__ = "delivery_zones"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[int] = mapped_column(ForeignKey("stores.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    fee: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    estimated_time: Mapped[str | None] = mapped_column(String(80))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    store = relationship("Store", back_populates="delivery_zones")


class StoreSettings(BaseModel):
    __tablename__ = "store_settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[int] = mapped_column(ForeignKey("stores.id"), unique=True, nullable=False)
    working_hours: Mapped[str] = mapped_column(Text, default="", nullable=False)
    delivery_notes: Mapped[str] = mapped_column(Text, default="", nullable=False)
    store_link: Mapped[str | None] = mapped_column(String(255))
    default_delivery_fee: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    pickup_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    store = relationship("Store", back_populates="settings")
