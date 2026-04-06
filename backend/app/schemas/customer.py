from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CustomerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    phone: str
    portal_token: str | None = None
    area: str | None
    short_address: str | None
    total_spent: float
    order_count: int
    last_order_at: datetime | None


class CustomerListResponse(BaseModel):
    items: list[CustomerResponse]
    total: int


class CustomerPortalResponse(BaseModel):
    customer: CustomerResponse
    orders: list[dict]
