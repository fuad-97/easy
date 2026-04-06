from sqlalchemy import ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Customer(BaseModel):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[int] = mapped_column(ForeignKey("stores.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    portal_token: Mapped[str | None] = mapped_column(String(64), unique=True)
    area: Mapped[str | None] = mapped_column(String(100))
    short_address: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)
    total_spent: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)

    store = relationship("Store", back_populates="customers")
    orders = relationship("Order", back_populates="customer")
