from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.auth import router as auth_router
from app.api.me import router as me_router
from app.api.merchant import router as merchant_router
from app.api.storefront import router as storefront_router
from app.api.stores import router as stores_router
from app.api.uploads import UPLOAD_ROOT, router as uploads_router
from app.core.config import get_settings


settings = get_settings()
app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(me_router)
app.include_router(stores_router)
app.include_router(merchant_router)
app.include_router(storefront_router)
app.include_router(uploads_router)
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_ROOT), name="uploads")


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/")
def root(request: Request) -> dict[str, str]:
    base_url = str(request.base_url).rstrip("/")
    return {
        "message": "SmallBiz Commerce API is running",
        "docs": f"{base_url}/docs",
        "health": f"{base_url}/health",
    }
