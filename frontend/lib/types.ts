export type ProductStatus = "available" | "unavailable";
export type OrderStatus =
  | "new"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PickupMethod = "delivery" | "pickup";

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  full_name: string;
  email?: string | null;
  phone?: string | null;
}

export interface Store {
  id: number;
  owner_id: number;
  name: string;
  slug: string;
  activity_type: string;
  city: string;
  short_description: string;
  logo_url?: string | null;
  banner_url?: string | null;
  primary_color: string;
  is_banner_enabled: boolean;
  is_open: boolean;
  categories: Category[];
  delivery_zones: DeliveryZone[];
  settings?: StoreSettings | null;
}

export interface PublicStoreCard {
  id: number;
  name: string;
  slug: string;
  activity_type: string;
  city: string;
  short_description: string;
  logo_url?: string | null;
  banner_url?: string | null;
  primary_color: string;
  is_open: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
}

export interface DeliveryZone {
  id: number;
  name: string;
  fee: number;
  estimated_time?: string | null;
}

export interface StoreSettings {
  id: number;
  working_hours: string;
  delivery_notes: string;
  store_link?: string | null;
  default_delivery_fee: number;
  pickup_enabled: boolean;
}

export interface ProductImage {
  id: number;
  image_url: string;
  sort_order: number;
}

export interface ProductOptionValue {
  id: number;
  value: string;
  price_delta: number;
  sort_order: number;
}

export interface ProductOptionGroup {
  id: number;
  name: string;
  is_required: boolean;
  sort_order: number;
  values: ProductOptionValue[];
}

export interface ProductReview {
  id: number;
  customer_name: string;
  rating: number;
  comment?: string | null;
  is_visible: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  category_id?: number | null;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number | null;
  video_url?: string | null;
  quantity: number;
  prep_time_minutes?: number | null;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  status: ProductStatus;
  is_active: boolean;
  is_deleted: boolean;
  rating_average: number;
  rating_count: number;
  images: ProductImage[];
  option_groups: ProductOptionGroup[];
  reviews: ProductReview[];
}

export interface OrderItemOption {
  id: number;
  group_name: string;
  option_value: string;
  price_delta: number;
}

export interface OrderItem {
  id: number;
  product_id?: number | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string | null;
  options: OrderItemOption[];
}

export interface CustomerSummary {
  id: number;
  name: string;
  phone: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  pickup_method: PickupMethod;
  requested_time?: string | null;
  notes?: string | null;
  short_address?: string | null;
  area?: string | null;
  customer: CustomerSummary;
  items: OrderItem[];
  created_at: string;
}

export interface Dashboard {
  new_orders: number;
  preparing_orders: number;
  delivered_orders: number;
  active_products: number;
  latest_orders: Order[];
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  area?: string | null;
  short_address?: string | null;
  total_spent: number;
  order_count: number;
  last_order_at?: string | null;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
}
