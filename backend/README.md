# Backend

واجهة FastAPI للمنصة مع:

- SQLAlchemy 2.x
- Pydantic v2
- Alembic
- SQLite محليًا

## التشغيل

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --reload
```

## الملفات المهمة

- `app/main.py` نقطة التشغيل
- `app/api/` الراوترز
- `app/models/` الموديلات
- `app/schemas/` مخططات Pydantic
- `app/services/` منطق المساعدة
- `alembic/` ملفات المايغريشن
- `scripts/seed.py` بيانات تجريبية
