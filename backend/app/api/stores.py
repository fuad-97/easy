from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.database import get_db
from app.models import Store, StoreSettings, User
from app.schemas.store import StoreCreate, StoreResponse, StoreSettingsResponse, StoreSettingsUpdate, StoreUpdate
from app.services.dependencies import get_current_user
from app.services.store import ensure_store_settings, ensure_unique_slug


router = APIRouter(prefix="/stores", tags=["stores"])


@router.post("", response_model=StoreResponse, status_code=status.HTTP_201_CREATED)
def create_store(
    payload: StoreCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> StoreResponse:
    existing_store = db.scalar(select(Store).where(Store.owner_id == current_user.id))
    if existing_store:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="لدى هذا المستخدم متجر بالفعل.")

    ensure_unique_slug(db, payload.slug)
    store = Store(owner_id=current_user.id, **payload.model_dump())
    db.add(store)
    db.flush()
    db.add(StoreSettings(store_id=store.id, store_link=f"/s/{store.slug}"))
    db.commit()
    store = db.scalar(
        select(Store)
        .where(Store.id == store.id)
        .options(selectinload(Store.categories), selectinload(Store.delivery_zones), joinedload(Store.settings))
    )
    return StoreResponse.model_validate(store)


@router.get("/me", response_model=StoreResponse)
def get_my_store(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> StoreResponse:
    store = db.scalar(
        select(Store)
        .where(Store.owner_id == current_user.id)
        .options(selectinload(Store.categories), selectinload(Store.delivery_zones), joinedload(Store.settings))
    )
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="لم يتم إنشاء متجر بعد.")
    return StoreResponse.model_validate(store)


@router.patch("/me", response_model=StoreResponse)
def update_my_store(
    payload: StoreUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> StoreResponse:
    store = db.scalar(
        select(Store)
        .where(Store.owner_id == current_user.id)
        .options(selectinload(Store.categories), selectinload(Store.delivery_zones), joinedload(Store.settings))
    )
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="المتجر غير موجود.")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(store, key, value)
    if store.settings:
        store.settings.store_link = f"/s/{store.slug}"
    db.commit()
    db.refresh(store)
    return StoreResponse.model_validate(store)


@router.patch("/me/settings", response_model=StoreSettingsResponse)
def update_store_settings(
    payload: StoreSettingsUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> StoreSettingsResponse:
    store = db.scalar(select(Store).where(Store.owner_id == current_user.id).options(joinedload(Store.settings)))
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="المتجر غير موجود.")
    settings = ensure_store_settings(db, store)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings, key, value)
    settings.store_link = f"/s/{store.slug}"
    db.commit()
    db.refresh(settings)
    return StoreSettingsResponse.model_validate(settings)
