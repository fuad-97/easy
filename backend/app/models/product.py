from sqlalchemy import Boolean, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel
from app.models.enums import ProductStatus


class Product(BaseModel):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[int] = mapped_column(ForeignKey("stores.id"), nullable=False, index=True)
    category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"))
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    compare_at_price: Mapped[float | None] = mapped_column(Numeric(10, 2))
    video_url: Mapped[str | None] = mapped_column(String(255))
    quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    prep_time_minutes: Mapped[int | None] = mapped_column(Integer)
    is_new_arrival: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_best_seller: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[ProductStatus] = mapped_column(Enum(ProductStatus), default=ProductStatus.available, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    store = relationship("Store", back_populates="products")
    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    option_groups = relationship("ProductOptionGroup", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product")
    reviews = relationship("ProductReview", back_populates="product", cascade="all, delete-orphan")


class ProductImage(BaseModel):
    __tablename__ = "product_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)
    image_url: Mapped[str] = mapped_column(String(255), nullable=False)
    sort_order: Mapped[int] = mapped_column(default=0, nullable=False)

    product = relationship("Product", back_populates="images")


class ProductOptionGroup(BaseModel):
    __tablename__ = "product_option_groups"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    is_required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sort_order: Mapped[int] = mapped_column(default=0, nullable=False)

    product = relationship("Product", back_populates="option_groups")
    values = relationship("ProductOptionValue", back_populates="group", cascade="all, delete-orphan")


class ProductOptionValue(BaseModel):
    __tablename__ = "product_option_values"

    id: Mapped[int] = mapped_column(primary_key=True)
    group_id: Mapped[int] = mapped_column(ForeignKey("product_option_groups.id"), nullable=False, index=True)
    value: Mapped[str] = mapped_column(String(80), nullable=False)
    price_delta: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    sort_order: Mapped[int] = mapped_column(default=0, nullable=False)

    group = relationship("ProductOptionGroup", back_populates="values")


class ProductReview(BaseModel):
    __tablename__ = "product_reviews"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)
    customer_name: Mapped[str] = mapped_column(String(120), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    product = relationship("Product", back_populates="reviews")
