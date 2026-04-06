# SmallBiz Commerce Platform

منصة تجارة إلكترونية عربية RTL Mobile-first للتجار الصغار والأسر المنتجة. المشروع مقسم إلى:

- `backend/` واجهة FastAPI مع SQLAlchemy 2.x وAlembic وSQLite
- `frontend/` واجهة Next.js + TypeScript + Tailwind
- `docs/` و`design/` و`prompts/` مواد المنتج الأصلية

## المزايا المنفذة في MVP

- تسجيل تاجر جديد وتسجيل الدخول عبر البريد أو الجوال باستخدام JWT
- إنشاء متجر مع `slug` ووصف وشعار وغلاف وطريقة استقبال الطلبات
- لوحة تحكم تعرض مؤشرات سريعة وآخر الطلبات
- إدارة المنتجات مع حالة التوفر والحذف الناعم
- إدارة الطلبات وتحديث الحالة وفتح واتساب وطباعة مبسطة
- قائمة عملاء مع عدد الطلبات وإجمالي الإنفاق
- متجر عام Public Storefront عبر `/s/{slug}`
- صفحة منتج، سلة، وإتمام طلب
- إعدادات أساسية للهوية وأوقات العمل ورسوم التوصيل
- Seed data لمتجر `حلويات بيت الورد`

## المتطلبات

- Python 3.11+ أو أحدث
- Node.js 20+ لتشغيل الواجهة الأمامية

## التشغيل المحلي

### تشغيل سريع

```bash
.\run-system.ps1
```

أو من مستكشف الملفات:

```bash
run-system.bat
```

الملف سيقوم بـ:

- إنشاء `backend/.venv` إذا لم تكن موجودة
- تثبيت اعتماديات الـ backend
- تطبيق الـ migrations
- تشغيل seed data
- تثبيت `Node.js LTS` تلقائيًا عبر `winget` إذا كان غير موجود
- تثبيت اعتماديات الـ frontend
- فتح نافذتين لتشغيل backend وfrontend
- فتح الصفحة الرئيسية العامة تلقائيًا على `http://localhost:3000/`

### 1. إعداد الـ backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --reload
```

### 2. إعداد الـ frontend

```bash
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

## أوامر المايغريشن

```bash
cd backend
alembic upgrade head
alembic downgrade -1
```

## بيانات الدخول التجريبية

- البريد: `merchant@example.com`
- الجوال: `0500000001`
- كلمة المرور: `12345678`
- رابط المتجر العام: `http://localhost:3000/s/bayt-al-ward`

## بيانات Seed

- المتجر: `حلويات بيت الورد`
- التصنيفات: `كيك`، `كوكيز`، `توزيعات`
- المنتجات: 8 منتجات تجريبية
- الطلبات: 5 طلبات بحالات مختلفة
- العملاء: 3 عملاء

## هيكل الـ API

- `POST /auth/register`
- `POST /auth/login`
- `GET /me`
- `POST /stores`
- `GET /stores/me`
- `PATCH /stores/me`
- `PATCH /stores/me/settings`
- `GET /merchant/dashboard`
- `GET|POST /merchant/products`
- `PATCH|DELETE /merchant/products/{id}`
- `GET /merchant/orders`
- `GET /merchant/orders/{id}`
- `PATCH /merchant/orders/{id}/status`
- `GET /merchant/customers`
- `GET /s/{slug}`
- `GET /s/{slug}/products`
- `GET /s/{slug}/products/{id}`
- `POST /s/{slug}/checkout`

## ملاحظات

- قاعدة البيانات الحالية SQLite ويمكن الترقية لاحقًا إلى PostgreSQL عبر تغيير `DATABASE_URL`.
- في هذه البيئة الحالية لم تكن `Node.js` و`npm` مثبتتين، لذلك تم إنشاء مشروع Next.js كامل لكن لم يمكن تنفيذ `npm install` أو `next build` هنا.
