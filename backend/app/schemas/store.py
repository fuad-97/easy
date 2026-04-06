from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ContactMethod
from app.schemas.common import TimestampedSchema


class StoreCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    slug: str = Field(pattern=r"^[a-z0-9-]{3,160}$")
    activity_type: str = Field(min_length=2, max_length=80)
    city: str = Field(min_length=2, max_length=80)
    short_description: str = Field(default="", max_length=500)
    logo_url: str | None = None
    banner_url: str | None = None
    contact_method: ContactMethod = ContactMethod.platform


class StoreUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    activity_type: str | None = Field(default=None, min_length=2, max_length=80)
    city: str | None = Field(default=None, min_length=2, max_length=80)
    short_description: str | None = Field(default=None, max_length=500)
    logo_url: str | None = None
    banner_url: str | None = None
    primary_color: str | None = Field(default=None, max_length=20)
    is_banner_enabled: bool | None = None
    is_open: bool | None = None


class CategoryResponse(TimestampedSchema):
    name: str
    slug: str
    sort_order: int
    is_active: bool


class DeliveryZoneResponse(TimestampedSchema):
    name: str
    fee: float
    estimated_time: str | None
    is_active: bool


class StoreSettingsUpdate(BaseModel):
    working_hours: str | None = None
    delivery_notes: str | None = None
    default_delivery_fee: float | None = None
    pickup_enabled: bool | None = None


class StoreSettingsResponse(TimestampedSchema):
    working_hours: str
    delivery_notes: str
    store_link: str | None
    default_delivery_fee: float
    pickup_enabled: bool


class StoreResponse(TimestampedSchema):
    model_config = ConfigDict(from_attributes=True)

    owner_id: int
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
    categories: list[CategoryResponse] = []
    delivery_zones: list[DeliveryZoneResponse] = []
    settings: StoreSettingsResponse | None = None
