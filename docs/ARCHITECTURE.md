# Suggested Architecture

## Frontend
- Next.js App Router or React + Vite
- TypeScript
- Tailwind CSS
- RTL support
- PWA-friendly

## Backend
- FastAPI
- SQLAlchemy
- Pydantic v2
- Alembic
- PostgreSQL in production
- SQLite allowed for local dev

## Auth
- Phone or email login
- JWT access token
- Refresh token optional in MVP

## Storage
- Local file storage in dev
- S3-compatible abstraction later

## Core Entities
- User
- Store
- Category
- Product
- ProductOptionGroup
- ProductOptionValue
- Order
- OrderItem
- Customer
- DeliveryZone
- StoreTheme

## Non-goals in MVP
- Multi-vendor marketplace
- Advanced accounting
- Complex shipping integrations
- Loyalty points
- Bank or financing features
