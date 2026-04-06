from pydantic import BaseModel, ConfigDict

from app.schemas.order import OrderResponse
from app.schemas.product import ProductResponse
from app.schemas.store import CategoryResponse, DeliveryZoneResponse


class StorefrontResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    activity_type: str
    city: str
    short_description: str
    logo_url: str | None
    banner_url: str | None
    primary_color: str
    is_banner_enabled: bool
    is_open: bool
    categories: list[CategoryResponse]
    delivery_zones: list[DeliveryZoneResponse]


class PublicStoreCardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    activity_type: str
    city: str
    short_description: str
    logo_url: str | None
    banner_url: str | None
    primary_color: str
    is_open: bool


class PublicStoreListResponse(BaseModel):
    items: list[PublicStoreCardResponse]
    total: int


class CheckoutResponse(BaseModel):
    order: OrderResponse
    customer_portal_url: str | None
