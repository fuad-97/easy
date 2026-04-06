from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse
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


@app.get("/", response_class=HTMLResponse)
def root(request: Request):
    if settings.frontend_url:
        return RedirectResponse(url=settings.frontend_url, status_code=307)

    base_url = str(request.base_url).rstrip("/")
    return HTMLResponse(
        content=f"""
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>{settings.app_name}</title>
            <style>
              body {{
                margin: 0;
                font-family: Arial, sans-serif;
                background: #fffaf5;
                color: #2b1d0e;
              }}
              .wrap {{
                max-width: 720px;
                margin: 80px auto;
                padding: 24px;
              }}
              .card {{
                background: white;
                border: 1px solid rgba(194, 65, 12, 0.14);
                border-radius: 24px;
                padding: 24px;
                box-shadow: 0 16px 40px rgba(120, 53, 15, 0.1);
              }}
              a {{
                color: #b45309;
                font-weight: bold;
                text-decoration: none;
              }}
            </style>
          </head>
          <body>
            <div class="wrap">
              <div class="card">
                <h1>{settings.app_name}</h1>
                <p>تم تشغيل واجهة الـ API بنجاح.</p>
                <p>لإظهار الصفحة الرئيسية الفعلية من الواجهة الأمامية، عيّن المتغير <strong>FRONTEND_URL</strong> في Railway.</p>
                <p><a href="{base_url}/docs">فتح التوثيق</a></p>
                <p><a href="{base_url}/health">فحص الصحة</a></p>
              </div>
            </div>
          </body>
        </html>
        """
    )
