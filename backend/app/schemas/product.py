from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ProductStatus
from app.schemas.common import TimestampedSchema


class ProductOptionValueInput(BaseModel):
    value: str = Field(min_length=1, max_length=80)
    price_delta: float = 0
    sort_order: int = 0


class ProductOptionGroupInput(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    is_required: bool = False
    sort_order: int = 0
    values: list[ProductOptionValueInput] = []


class ProductImageInput(BaseModel):
    image_url: str
    sort_order: int = 0


class ProductCreate(BaseModel):
    category_id: int | None = None
    name: str = Field(min_length=2, max_length=160)
    description: str = ""
    price: float = Field(gt=0)
    compare_at_price: float | None = Field(default=None, gt=0)
    video_url: str | None = None
    quantity: int = Field(default=0, ge=0)
    prep_time_minutes: int | None = Field(default=None, ge=0)
    is_new_arrival: bool = False
    is_best_seller: bool = False
    status: ProductStatus = ProductStatus.available
    images: list[ProductImageInput] = []
    option_groups: list[ProductOptionGroupInput] = []


class ProductUpdate(BaseModel):
    category_id: int | None = None
    name: str | None = Field(default=None, min_length=2, max_length=160)
    description: str | None = None
    price: float | None = Field(default=None, gt=0)
    compare_at_price: float | None = Field(default=None, gt=0)
    video_url: str | None = None
    quantity: int | None = Field(default=None, ge=0)
    prep_time_minutes: int | None = Field(default=None, ge=0)
    is_new_arrival: bool | None = None
    is_best_seller: bool | None = None
    status: ProductStatus | None = None
    is_active: bool | None = None
    images: list[ProductImageInput] | None = None
    option_groups: list[ProductOptionGroupInput] | None = None


class ProductOptionValueResponse(TimestampedSchema):
    value: str
    price_delta: float
    sort_order: int


class ProductOptionGroupResponse(TimestampedSchema):
    name: str
    is_required: bool
    sort_order: int
    values: list[ProductOptionValueResponse]


class ProductImageResponse(TimestampedSchema):
    image_url: str
    sort_order: int


class ProductReviewCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=120)
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=1000)


class ProductReviewResponse(TimestampedSchema):
    customer_name: str
    rating: int
    comment: str | None
    is_visible: bool


class ProductResponse(TimestampedSchema):
    model_config = ConfigDict(from_attributes=True)

    category_id: int | None
    name: str
    description: str
    price: float
    compare_at_price: float | None
    video_url: str | None
    quantity: int
    prep_time_minutes: int | None
    is_new_arrival: bool
    is_best_seller: bool
    status: ProductStatus
    is_active: bool
    is_deleted: bool
    rating_average: float = 0
    rating_count: int = 0
    images: list[ProductImageResponse] = []
    option_groups: list[ProductOptionGroupResponse] = []
    reviews: list[ProductReviewResponse] = []


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
