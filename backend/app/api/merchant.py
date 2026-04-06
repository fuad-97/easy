from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models import Order, OrderItem, Product, ProductImage, ProductOptionGroup, ProductOptionValue, Store, User
from app.models.enums import OrderStatus
from app.schemas.customer import CustomerListResponse, CustomerResponse
from app.schemas.order import DashboardResponse, OrderListResponse, OrderResponse, OrderStatusUpdate
from app.schemas.product import ProductCreate, ProductListResponse, ProductResponse, ProductUpdate
from app.services.dependencies import get_current_user
from app.services.merchant import build_dashboard, customer_stats_query


router = APIRouter(prefix="/merchant", tags=["merchant"])


def get_merchant_store(db: Session, current_user: User) -> Store:
    store = db.scalar(select(Store).where(Store.owner_id == current_user.id))
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="أنشئ المتجر أولًا.")
    return store


@router.get("/dashboard", response_model=DashboardResponse)
def dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> DashboardResponse:
    store = get_merchant_store(db, current_user)
    return DashboardResponse.model_validate(build_dashboard(db, store.id))


@router.get("/products", response_model=ProductListResponse)
def list_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    search: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
) -> ProductListResponse:
    store = get_merchant_store(db, current_user)
    query = (
        select(Product)
        .where(Product.store_id == store.id, Product.is_deleted.is_(False))
        .options(joinedload(Product.images), joinedload(Product.option_groups).joinedload(ProductOptionGroup.values))
        .order_by(Product.created_at.desc())
    )
    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))
    if status_filter:
        query = query.where(Product.status == status_filter)
    items = db.scalars(query).unique().all()
    return ProductListResponse(items=[ProductResponse.model_validate(item) for item in items], total=len(items))


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> ProductResponse:
    store = get_merchant_store(db, current_user)
    product = Product(store_id=store.id, **payload.model_dump(exclude={"images", "option_groups"}))
    for image in payload.images:
        product.images.append(ProductImage(**image.model_dump()))
    for group in payload.option_groups:
        option_group = ProductOptionGroup(name=group.name, is_required=group.is_required, sort_order=group.sort_order)
        for value in group.values:
            option_group.values.append(ProductOptionValue(**value.model_dump()))
        product.option_groups.append(option_group)
    db.add(product)
    db.commit()
    db.refresh(product)
    return ProductResponse.model_validate(product)


@router.patch("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int, payload: ProductUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> ProductResponse:
    store = get_merchant_store(db, current_user)
    product = db.scalar(
        select(Product)
        .where(Product.id == product_id, Product.store_id == store.id, Product.is_deleted.is_(False))
        .options(joinedload(Product.images), joinedload(Product.option_groups).joinedload(ProductOptionGroup.values))
    )
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="المنتج غير موجود.")

    for key, value in payload.model_dump(exclude_unset=True, exclude={"images", "option_groups"}).items():
        setattr(product, key, value)
    if payload.images is not None:
        product.images.clear()
        for image in payload.images:
            product.images.append(ProductImage(**image.model_dump()))
    if payload.option_groups is not None:
        product.option_groups.clear()
        for group in payload.option_groups:
            new_group = ProductOptionGroup(name=group.name, is_required=group.is_required, sort_order=group.sort_order)
            for value in group.values:
                new_group.values.append(ProductOptionValue(**value.model_dump()))
            product.option_groups.append(new_group)
    db.commit()
    db.refresh(product)
    return ProductResponse.model_validate(product)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> None:
    store = get_merchant_store(db, current_user)
    product = db.scalar(select(Product).where(Product.id == product_id, Product.store_id == store.id))
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="المنتج غير موجود.")
    product.is_deleted = True
    product.is_active = False
    db.commit()


@router.get("/orders", response_model=OrderListResponse)
def list_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    status_filter: OrderStatus | None = Query(default=None, alias="status"),
) -> OrderListResponse:
    store = get_merchant_store(db, current_user)
    query = (
        select(Order)
        .where(Order.store_id == store.id)
        .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.options))
        .order_by(Order.created_at.desc())
    )
    if status_filter:
        query = query.where(Order.status == status_filter)
    items = db.scalars(query).unique().all()
    return OrderListResponse(items=[OrderResponse.model_validate(item) for item in items], total=len(items))


@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> OrderResponse:
    store = get_merchant_store(db, current_user)
    order = db.scalar(
        select(Order)
        .where(Order.id == order_id, Order.store_id == store.id)
        .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.options))
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="الطلب غير موجود.")
    return OrderResponse.model_validate(order)


@router.patch("/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> OrderResponse:
    store = get_merchant_store(db, current_user)
    order = db.scalar(
        select(Order)
        .where(Order.id == order_id, Order.store_id == store.id)
        .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.options))
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="الطلب غير موجود.")
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return OrderResponse.model_validate(order)


@router.get("/customers", response_model=CustomerListResponse)
def list_customers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> CustomerListResponse:
    store = get_merchant_store(db, current_user)
    result = db.execute(customer_stats_query(store.id)).all()
    items = [
        CustomerResponse(
            id=customer.id,
            name=customer.name,
            phone=customer.phone,
            area=customer.area,
            short_address=customer.short_address,
            total_spent=float(customer.total_spent),
            order_count=order_count,
            last_order_at=last_order_at,
        )
        for customer, order_count, last_order_at in result
    ]
    return CustomerListResponse(items=items, total=len(items))
