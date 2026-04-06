from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.database import get_db
from app.models import Customer, Order, OrderItem, OrderItemOption, Product, ProductOptionGroup, ProductReview, Store
from app.schemas.customer import CustomerPortalResponse, CustomerResponse
from app.schemas.order import CheckoutRequest, OrderResponse
from app.schemas.product import ProductListResponse, ProductResponse, ProductReviewCreate, ProductReviewResponse
from app.schemas.storefront import CheckoutResponse, PublicStoreCardResponse, PublicStoreListResponse, StorefrontResponse
from app.services.store import get_store_by_slug_or_404


router = APIRouter(prefix="/s", tags=["storefront"])


def serialize_product(product: Product) -> ProductResponse:
  visible_reviews = [review for review in product.reviews if review.is_visible]
  rating_count = len(visible_reviews)
  rating_average = round(sum(review.rating for review in visible_reviews) / rating_count, 1) if rating_count else 0
  payload = ProductResponse.model_validate(product).model_dump()
  payload["rating_count"] = rating_count
  payload["rating_average"] = rating_average
  payload["reviews"] = [ProductReviewResponse.model_validate(review).model_dump() for review in visible_reviews]
  return ProductResponse(**payload)


@router.get("", response_model=PublicStoreListResponse)
def list_public_stores(db: Session = Depends(get_db), limit: int = 12) -> PublicStoreListResponse:
  query = select(Store).order_by(Store.created_at.desc()).limit(limit)
  items = db.scalars(query).all()
  return PublicStoreListResponse(
      items=[PublicStoreCardResponse.model_validate(item) for item in items],
      total=len(items),
  )


@router.get("/{slug}", response_model=StorefrontResponse)
def get_storefront(slug: str, db: Session = Depends(get_db)) -> StorefrontResponse:
  store = db.scalar(
      select(Store).where(Store.slug == slug).options(selectinload(Store.categories), selectinload(Store.delivery_zones))
  )
  if not store:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="المتجر غير موجود.")
  return StorefrontResponse.model_validate(store)


@router.get("/{slug}/products", response_model=ProductListResponse)
def list_store_products(
  slug: str,
  db: Session = Depends(get_db),
  category_id: int | None = None,
  search: str | None = Query(default=None),
) -> ProductListResponse:
  store = get_store_by_slug_or_404(db, slug)
  query = (
      select(Product)
      .where(Product.store_id == store.id, Product.is_deleted.is_(False), Product.is_active.is_(True))
      .options(
          joinedload(Product.images),
          joinedload(Product.option_groups).joinedload(ProductOptionGroup.values),
          joinedload(Product.reviews),
      )
      .order_by(Product.created_at.desc())
  )
  if category_id:
    query = query.where(Product.category_id == category_id)
  if search:
    query = query.where(Product.name.ilike(f"%{search}%"))
  items = db.scalars(query).unique().all()
  return ProductListResponse(items=[serialize_product(item) for item in items], total=len(items))


@router.get("/{slug}/products/{product_id}", response_model=ProductResponse)
def get_store_product(slug: str, product_id: int, db: Session = Depends(get_db)) -> ProductResponse:
  store = get_store_by_slug_or_404(db, slug)
  product = db.scalar(
      select(Product)
      .where(Product.id == product_id, Product.store_id == store.id, Product.is_deleted.is_(False))
      .options(
          joinedload(Product.images),
          joinedload(Product.option_groups).joinedload(ProductOptionGroup.values),
          joinedload(Product.reviews),
      )
  )
  if not product:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="المنتج غير موجود.")
  return serialize_product(product)


@router.post("/{slug}/products/{product_id}/reviews", response_model=ProductReviewResponse, status_code=status.HTTP_201_CREATED)
def create_product_review(slug: str, product_id: int, payload: ProductReviewCreate, db: Session = Depends(get_db)) -> ProductReviewResponse:
  store = get_store_by_slug_or_404(db, slug)
  product = db.scalar(select(Product).where(Product.id == product_id, Product.store_id == store.id, Product.is_deleted.is_(False)))
  if not product:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="المنتج غير موجود.")

  review = ProductReview(
      product_id=product.id,
      customer_name=payload.customer_name,
      rating=payload.rating,
      comment=payload.comment,
      is_visible=True,
  )
  db.add(review)
  db.commit()
  db.refresh(review)
  return ProductReviewResponse.model_validate(review)


@router.get("/account/{portal_token}", response_model=CustomerPortalResponse)
def get_customer_portal(portal_token: str, db: Session = Depends(get_db)) -> CustomerPortalResponse:
  customer = db.scalar(
      select(Customer)
      .where(Customer.portal_token == portal_token)
      .options(joinedload(Customer.orders).joinedload(Order.items).joinedload(OrderItem.options))
  )
  if not customer:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="حساب العميل غير موجود.")

  customer_payload = CustomerResponse(
      id=customer.id,
      name=customer.name,
      phone=customer.phone,
      portal_token=customer.portal_token,
      area=customer.area,
      short_address=customer.short_address,
      total_spent=float(customer.total_spent),
      order_count=len(customer.orders),
      last_order_at=max((order.created_at for order in customer.orders), default=None),
  )
  orders_payload = [OrderResponse.model_validate(order).model_dump() for order in sorted(customer.orders, key=lambda item: item.created_at, reverse=True)]
  return CustomerPortalResponse(customer=customer_payload, orders=orders_payload)


@router.get("/{slug}/orders", response_model=CustomerPortalResponse)
def get_customer_orders_by_phone(slug: str, phone: str, db: Session = Depends(get_db)) -> CustomerPortalResponse:
  store = get_store_by_slug_or_404(db, slug)
  customer = db.scalar(
      select(Customer)
      .where(Customer.store_id == store.id, Customer.phone == phone)
      .options(joinedload(Customer.orders).joinedload(Order.items).joinedload(OrderItem.options))
  )
  if not customer:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="لا توجد طلبات بهذا الرقم.")

  customer_payload = CustomerResponse(
      id=customer.id,
      name=customer.name,
      phone=customer.phone,
      portal_token=customer.portal_token,
      area=customer.area,
      short_address=customer.short_address,
      total_spent=float(customer.total_spent),
      order_count=len(customer.orders),
      last_order_at=max((order.created_at for order in customer.orders), default=None),
  )
  orders_payload = [OrderResponse.model_validate(order).model_dump() for order in sorted(customer.orders, key=lambda item: item.created_at, reverse=True)]
  return CustomerPortalResponse(customer=customer_payload, orders=orders_payload)


@router.post("/{slug}/checkout", response_model=CheckoutResponse, status_code=status.HTTP_201_CREATED)
def checkout(slug: str, payload: CheckoutRequest, db: Session = Depends(get_db)) -> CheckoutResponse:
  store = db.scalar(select(Store).where(Store.slug == slug).options(joinedload(Store.settings)))
  if not store:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="المتجر غير موجود.")

  customer = db.scalar(select(Customer).where(Customer.store_id == store.id, Customer.phone == payload.customer_phone))
  if not customer:
    customer = Customer(
        store_id=store.id,
        name=payload.customer_name,
        phone=payload.customer_phone,
        portal_token=uuid4().hex,
        area=payload.area,
        short_address=payload.short_address,
    )
    db.add(customer)
    db.flush()
  else:
    customer.name = payload.customer_name
    customer.area = payload.area
    customer.short_address = payload.short_address
    if not customer.portal_token:
      customer.portal_token = uuid4().hex

  subtotal = 0.0
  order_items: list[OrderItem] = []
  for item in payload.items:
    product = db.scalar(select(Product).where(Product.id == item.product_id, Product.store_id == store.id))
    if not product or product.is_deleted or not product.is_active:
      raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="أحد المنتجات غير متاح.")
    options_total = sum(option.price_delta for option in item.selected_options)
    unit_price = float(product.price) + options_total
    total_price = unit_price * item.quantity
    subtotal += total_price
    order_item = OrderItem(
        product_id=product.id,
        product_name=product.name,
        quantity=item.quantity,
        unit_price=unit_price,
        total_price=total_price,
        notes=item.notes,
    )
    for option in item.selected_options:
      order_item.options.append(OrderItemOption(**option.model_dump()))
    order_items.append(order_item)

  delivery_fee = float(store.settings.default_delivery_fee if store.settings else 0)
  total = subtotal + delivery_fee
  order = Order(
      store_id=store.id,
      customer_id=customer.id,
      order_number=f"SB-{uuid4().hex[:8].upper()}",
      subtotal=subtotal,
      delivery_fee=delivery_fee,
      total=total,
      pickup_method=payload.pickup_method,
      requested_time=payload.requested_time,
      notes=payload.notes,
      short_address=payload.short_address,
      area=payload.area,
  )
  for order_item in order_items:
    order.items.append(order_item)
  db.add(order)
  customer.total_spent = float(customer.total_spent) + total
  db.commit()
  full_order = db.scalar(
      select(Order)
      .where(Order.id == order.id)
      .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.options))
  )

  customer_portal_url = f"/account/{customer.portal_token}" if customer.portal_token else None

  return CheckoutResponse(
      order=OrderResponse.model_validate(full_order),
      customer_portal_url=customer_portal_url,
  )
