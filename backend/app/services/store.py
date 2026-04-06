import re

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Store, StoreSettings


def ensure_unique_slug(db: Session, slug: str) -> str:
    existing = db.scalar(select(Store).where(Store.slug == slug))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="رابط المتجر مستخدم بالفعل.")
    return slug


def get_store_by_slug_or_404(db: Session, slug: str) -> Store:
    store = db.scalar(select(Store).where(Store.slug == slug))
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="المتجر غير موجود.")
    return store


def ensure_store_settings(db: Session, store: Store) -> StoreSettings:
    if store.settings:
        return store.settings
    settings = StoreSettings(store_id=store.id, store_link=f"/s/{store.slug}")
    db.add(settings)
    db.flush()
    db.refresh(settings)
    return settings
