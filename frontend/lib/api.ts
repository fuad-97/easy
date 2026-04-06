import { Dashboard, ListResponse, Order, Product, PublicStoreCard, Store, TokenResponse } from "@/lib/types";

function normalizeBaseUrl(value?: string | null) {
  if (!value) return "";
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function resolveApiUrl() {
  if (typeof window !== "undefined") {
    return normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL) || window.location.origin;
  }

  return (
    normalizeBaseUrl(process.env.INTERNAL_API_URL) ||
    normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL) ||
    normalizeBaseUrl(process.env.BASE_URL) ||
    (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : "")
  );
}

export const apiUrl = resolveApiUrl();

async function readError(response: Response) {
  try {
    const data = await response.json();
    return data.detail || "حدث خطأ غير متوقع";
  } catch {
    return "تعذر قراءة الاستجابة";
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const response = await fetch(`${resolveApiUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<T>;
}

export function assetUrl(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${resolveApiUrl()}${path}`;
}

export const authApi = {
  register: (payload: Record<string, unknown>) =>
    apiFetch<TokenResponse>("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: Record<string, unknown>) =>
    apiFetch<TokenResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload) })
};

export const merchantApi = {
  me: (token: string) => apiFetch("/me", undefined, token),
  myStore: (token: string) => apiFetch<Store>("/stores/me", undefined, token),
  createStore: (token: string, payload: Record<string, unknown>) =>
    apiFetch<Store>("/stores", { method: "POST", body: JSON.stringify(payload) }, token),
  updateStore: (token: string, payload: Record<string, unknown>) =>
    apiFetch<Store>("/stores/me", { method: "PATCH", body: JSON.stringify(payload) }, token),
  updateSettings: (token: string, payload: Record<string, unknown>) =>
    apiFetch("/stores/me/settings", { method: "PATCH", body: JSON.stringify(payload) }, token),
  dashboard: (token: string) => apiFetch<Dashboard>("/merchant/dashboard", undefined, token),
  products: (token: string) => apiFetch<ListResponse<Product>>("/merchant/products", undefined, token),
  createProduct: (token: string, payload: Record<string, unknown>) =>
    apiFetch<Product>("/merchant/products", { method: "POST", body: JSON.stringify(payload) }, token),
  updateProduct: (token: string, productId: number, payload: Record<string, unknown>) =>
    apiFetch<Product>(`/merchant/products/${productId}`, { method: "PATCH", body: JSON.stringify(payload) }, token),
  deleteProduct: async (token: string, productId: number) => {
    const response = await fetch(`${resolveApiUrl()}/merchant/products/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new Error(await readError(response));
    }
  },
  orders: (token: string) => apiFetch<ListResponse<Order>>("/merchant/orders", undefined, token),
  order: (token: string, orderId: number) => apiFetch<Order>(`/merchant/orders/${orderId}`, undefined, token),
  updateOrderStatus: (token: string, orderId: number, status: string) =>
    apiFetch<Order>(`/merchant/orders/${orderId}/status`, { method: "PATCH", body: JSON.stringify({ status }) }, token),
  customers: (token: string) => apiFetch("/merchant/customers", undefined, token)
};

export async function uploadImage(token: string, kind: "logo" | "banner" | "product" | "product-video", file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${resolveApiUrl()}/uploads/store-image?kind=${kind}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<{ file_url: string }>;
}

export const storefrontApi = {
  stores: () => apiFetch<ListResponse<PublicStoreCard>>("/s"),
  store: (slug: string) => apiFetch<Store>(`/s/${slug}`),
  products: (slug: string, query = "") => apiFetch<ListResponse<Product>>(`/s/${slug}/products${query}`),
  product: (slug: string, id: number | string) => apiFetch<Product>(`/s/${slug}/products/${id}`),
  createReview: (slug: string, id: number | string, payload: Record<string, unknown>) =>
    apiFetch(`/s/${slug}/products/${id}/reviews`, { method: "POST", body: JSON.stringify(payload) }),
  customerPortal: (token: string) => apiFetch(`/s/account/${token}`),
  customerOrdersByPhone: (slug: string, phone: string) => apiFetch(`/s/${slug}/orders?phone=${encodeURIComponent(phone)}`),
  checkout: (slug: string, payload: Record<string, unknown>) =>
    apiFetch(`/s/${slug}/checkout`, { method: "POST", body: JSON.stringify(payload) })
};
