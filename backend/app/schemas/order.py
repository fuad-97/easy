from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import OrderStatus, PickupMethod
from app.schemas.common import TimestampedSchema


class OrderItemOptionPayload(BaseModel):
    group_name: str = Field(min_length=1, max_length=80)
    option_value: str = Field(min_length=1, max_length=80)
    price_delta: float = 0


class OrderItemPayload(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)
    notes: str | None = None
    selected_options: list[OrderItemOptionPayload] = []


class CheckoutRequest(BaseModel):
    customer_name: str = Field(min_length=2, max_length=120)
    customer_phone: str = Field(min_length=7, max_length=30)
    area: str | None = Field(default=None, max_length=100)
    short_address: str | None = None
    pickup_method: PickupMethod
    requested_time: str | None = Field(default=None, max_length=100)
    notes: str | None = None
    items: list[OrderItemPayload] = Field(min_length=1)


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderItemOptionResponse(TimestampedSchema):
    group_name: str
    option_value: str
    price_delta: float


class OrderItemResponse(TimestampedSchema):
    product_id: int | None
    product_name: str
    quantity: int
    unit_price: float
    total_price: float
    notes: str | None
    options: list[OrderItemOptionResponse] = []


class CustomerSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    phone: str


class OrderResponse(TimestampedSchema):
    model_config = ConfigDict(from_attributes=True)

    order_number: str
    status: OrderStatus
    subtotal: float
    delivery_fee: float
    total: float
    pickup_method: PickupMethod
    requested_time: str | None
    notes: str | None
    short_address: str | None
    area: str | None
    customer: CustomerSummary
    items: list[OrderItemResponse] = []


class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    total: int


class DashboardResponse(BaseModel):
    new_orders: int
    preparing_orders: int
    delivered_orders: int
    active_products: int
    latest_orders: list[OrderResponse]
