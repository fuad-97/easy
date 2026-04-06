import enum


class ContactMethod(str, enum.Enum):
    platform = "platform"
    whatsapp = "whatsapp"
    both = "both"


class ProductStatus(str, enum.Enum):
    available = "available"
    unavailable = "unavailable"


class OrderStatus(str, enum.Enum):
    new = "new"
    confirmed = "confirmed"
    preparing = "preparing"
    ready = "ready"
    out_for_delivery = "out_for_delivery"
    delivered = "delivered"
    cancelled = "cancelled"


class PickupMethod(str, enum.Enum):
    delivery = "delivery"
    pickup = "pickup"
