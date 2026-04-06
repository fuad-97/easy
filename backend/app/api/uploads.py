from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.models import User
from app.services.dependencies import get_current_user


router = APIRouter(prefix="/uploads", tags=["uploads"])

UPLOAD_ROOT = Path(__file__).resolve().parents[2] / "uploads"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov"}

def save_upload(file: UploadFile, folder: str, allowed_extensions: set[str]) -> str:
    extension = Path(file.filename or "").suffix.lower()
    if extension not in allowed_extensions:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="صيغة الملف غير مدعومة.")

    target_dir = UPLOAD_ROOT / folder
    target_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid4().hex}{extension}"
    target_path = target_dir / filename

    content = file.file.read()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ملف الصورة فارغ.")

    target_path.write_bytes(content)
    return f"/uploads/{folder}/{filename}"


@router.post("/store-image")
def upload_store_image(
    kind: str,
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    _ = current_user
    folder_map = {
        "logo": ("logo", ALLOWED_EXTENSIONS),
        "banner": ("banner", ALLOWED_EXTENSIONS),
        "product": ("product", ALLOWED_EXTENSIONS),
        "product-video": ("product-video", ALLOWED_VIDEO_EXTENSIONS),
    }
    if kind not in folder_map:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="نوع الملف غير صالح.")
    folder, allowed_extensions = folder_map[kind]
    file_url = save_upload(image, folder, allowed_extensions)
    return {"file_url": file_url}
