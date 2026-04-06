from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models import (
    Category,
    Customer,
    DeliveryZone,
    Order,
    OrderItem,
    OrderItemOption,
    Product,
    ProductImage,
    ProductOptionGroup,
    ProductOptionValue,
    Store,
    StoreSettings,
    User,
)
from app.models.enums import ContactMethod, OrderStatus, PickupMethod, ProductStatus


def seed() -> None:
    db = SessionLocal()
    try:
        existing = db.scalar(select(Store).where(Store.slug == "bayt-al-ward"))
        if existing:
            print("Seed data already exists.")
            return

        user = User(
            full_name="سارة العتيبي",
            email="merchant@example.com",
            phone="0500000001",
            password_hash=get_password_hash("12345678"),
        )
        db.add(user)
        db.flush()

        store = Store(
            owner_id=user.id,
            name="حلويات بيت الورد",
            slug="bayt-al-ward",
            activity_type="حلويات",
            city="الرياض",
            short_description="حلويات منزلية وتوزيعات أنيقة للمناسبات بطابع دافئ وبسيط.",
            logo_url="https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80",
            banner_url="https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=1200&q=80",
            primary_color="#C2410C",
            is_banner_enabled=True,
            contact_method=ContactMethod.platform,
            whatsapp_number=None,
        )
        db.add(store)
        db.flush()

        db.add(
            StoreSettings(
                store_id=store.id,
                working_hours="يوميًا من 10 صباحًا إلى 10 مساءً",
                delivery_notes="التوصيل داخل الرياض خلال نفس اليوم حسب التوفر.",
                default_delivery_fee=18,
                pickup_enabled=True,
                store_link=f"/s/{store.slug}",
            )
        )

        db.add_all(
            [
                DeliveryZone(store_id=store.id, name="شمال الرياض", fee=18, estimated_time="90 دقيقة"),
                DeliveryZone(store_id=store.id, name="شرق الرياض", fee=22, estimated_time="120 دقيقة"),
                DeliveryZone(store_id=store.id, name="استلام من المتجر", fee=0, estimated_time="45 دقيقة"),
            ]
        )

        categories = [
            Category(store_id=store.id, name="كيك", slug="cake", sort_order=1),
            Category(store_id=store.id, name="كوكيز", slug="cookies", sort_order=2),
            Category(store_id=store.id, name="توزيعات", slug="favors", sort_order=3),
        ]
        db.add_all(categories)
        db.flush()
        category_map = {category.slug: category for category in categories}

        products_data = [
            ("كيك الفانيلا بالتوت", "cake", 145, 170, 6, "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80"),
            ("كيك شوكولاتة بلجيكية", "cake", 165, 190, 4, "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80"),
            ("ميني كيك عيد ميلاد", "cake", 95, None, 10, "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80"),
            ("كوكيز شوكولاتة محشية", "cookies", 48, 58, 15, "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80"),
            ("كوكيز تمر وقرفة", "cookies", 42, None, 12, "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80"),
            ("بوكس توزيعات وردي", "favors", 85, 99, 8, "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80"),
            ("بوكس ضيافة صغير", "favors", 65, None, 20, "https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=800&q=80"),
            ("علبة كوكيز مناسبات", "cookies", 78, 88, 9, "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?auto=format&fit=crop&w=800&q=80"),
        ]

        products = []
        for name, category_slug, price, compare, quantity, image_url in products_data:
            product = Product(
                store_id=store.id,
                category_id=category_map[category_slug].id,
                name=name,
                description=f"{name} محضّر يوميًا بمكونات طازجة وتغليف مناسب للهدايا.",
                price=price,
                compare_at_price=compare,
                quantity=quantity,
                prep_time_minutes=60,
                status=ProductStatus.available,
                is_active=True,
            )
            product.images.append(ProductImage(image_url=image_url, sort_order=0))
            if category_slug == "cake":
                group = ProductOptionGroup(name="الحجم", is_required=True, sort_order=0)
                group.values.extend(
                    [
                        ProductOptionValue(value="صغير", price_delta=0, sort_order=0),
                        ProductOptionValue(value="وسط", price_delta=20, sort_order=1),
                        ProductOptionValue(value="كبير", price_delta=45, sort_order=2),
                    ]
                )
                product.option_groups.append(group)
            elif category_slug == "cookies":
                group = ProductOptionGroup(name="النكهة", is_required=False, sort_order=0)
                group.values.extend(
                    [
                        ProductOptionValue(value="شوكولاتة", price_delta=0, sort_order=0),
                        ProductOptionValue(value="فستق", price_delta=6, sort_order=1),
                    ]
                )
                product.option_groups.append(group)
            products.append(product)

        db.add_all(products)
        db.flush()

        customers = [
            Customer(store_id=store.id, name="ريم خالد", phone="0501234567", area="الياسمين", short_address="فيلا 12", total_spent=330),
            Customer(store_id=store.id, name="نوف محمد", phone="0507654321", area="قرطبة", short_address="شقة 8", total_spent=512),
            Customer(store_id=store.id, name="العنود فهد", phone="0504444422", area="العقيق", short_address="عمارة 4", total_spent=189),
        ]
        db.add_all(customers)
        db.flush()

        orders_seed = [
            ("SB-1001", customers[0], OrderStatus.new, PickupMethod.delivery, products[0], 1, [("الحجم", "وسط", 20)]),
            ("SB-1002", customers[1], OrderStatus.confirmed, PickupMethod.pickup, products[3], 2, [("النكهة", "فستق", 6)]),
            ("SB-1003", customers[1], OrderStatus.preparing, PickupMethod.delivery, products[5], 1, []),
            ("SB-1004", customers[2], OrderStatus.ready, PickupMethod.delivery, products[1], 1, [("الحجم", "كبير", 45)]),
            ("SB-1005", customers[0], OrderStatus.delivered, PickupMethod.delivery, products[6], 3, []),
        ]

        for index, (order_number, customer, status, pickup_method, product, quantity, options) in enumerate(orders_seed, start=1):
            option_total = sum(price for _, _, price in options)
            unit_price = float(product.price) + option_total
            subtotal = unit_price * quantity
            delivery_fee = 18 if pickup_method == PickupMethod.delivery else 0
            order = Order(
                store_id=store.id,
                customer_id=customer.id,
                order_number=order_number,
                status=status,
                subtotal=subtotal,
                delivery_fee=delivery_fee,
                total=subtotal + delivery_fee,
                pickup_method=pickup_method,
                requested_time=f"اليوم {4 + index}:00 مساءً",
                notes="يرجى التواصل قبل الوصول",
                short_address=customer.short_address,
                area=customer.area,
            )
            item = OrderItem(
                product_id=product.id,
                product_name=product.name,
                quantity=quantity,
                unit_price=unit_price,
                total_price=subtotal,
            )
            for group_name, option_value, price_delta in options:
                item.options.append(OrderItemOption(group_name=group_name, option_value=option_value, price_delta=price_delta))
            order.items.append(item)
            db.add(order)

        db.commit()
        print("Seed data inserted successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
