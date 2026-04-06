"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { StorefrontCartFab } from "@/components/storefront-cart-fab";
import { storefrontApi } from "@/lib/api";
import { currency } from "@/lib/format";
import { Store } from "@/lib/types";
import { themeStyles } from "@/lib/store-theme";

interface CartItem {
  product_id: number;
  name: string;
  quantity: number;
  unit_price: number;
  image?: string;
  notes?: string;
  selected_options: { group_name: string; option_value: string; price_delta: number }[];
}

export default function CheckoutPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState("");
  const [store, setStore] = useState<Store | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    area: "",
    pickup_method: "delivery",
    short_address: "",
    requested_time: "",
    notes: ""
  });
  const [result, setResult] = useState<{ order?: { order_number: string }; customer_portal_url?: string | null } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(async ({ slug: routeSlug }) => {
      setSlug(routeSlug);
      const raw = localStorage.getItem(`cart:${routeSlug}`);
      setCart(raw ? JSON.parse(raw) : []);
      const storeData = await storefrontApi.store(routeSlug);
      setStore(storeData);
    });
  }, [params]);

  const color = store?.primary_color || "#C2410C";
  const theme = themeStyles(color);

  function removeCartItem(indexToRemove: number) {
    const nextCart = cart.filter((_, index) => index !== indexToRemove);
    setCart(nextCart);
    localStorage.setItem(`cart:${slug}`, JSON.stringify(nextCart));
  }

  function updateQuantity(indexToUpdate: number, delta: number) {
    const nextCart = cart
      .map((item, index) =>
        index === indexToUpdate
          ? {
              ...item,
              quantity: item.quantity + delta
            }
          : item
      )
      .filter((item) => item.quantity > 0);

    setCart(nextCart);
    localStorage.setItem(`cart:${slug}`, JSON.stringify(nextCart));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const response = await storefrontApi.checkout(slug, {
        ...form,
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          notes: item.notes,
          selected_options: item.selected_options
        }))
      });
      setResult(response as { order: { order_number: string }; customer_portal_url?: string | null });
      localStorage.removeItem(`cart:${slug}`);
      setCart([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إتمام الطلب");
    }
  }

  const total = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  return (
    <main className="min-h-screen px-4 py-6 md:px-6" style={theme.pageBackground}>
      <div className="mx-auto w-full max-w-5xl">
      <StorefrontCartFab slug={slug} color={color} />
      <div className="grid gap-5 lg:grid-cols-[0.9fr,1.1fr]">
        <section className="glass-card rounded-[2rem] p-6" style={theme.sectionSurface}>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-black text-ink">السلة</h1>
            <Link href={`/s/${slug}`} className="text-sm font-bold" style={{ color }}>
              العودة للمتجر
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {cart.map((item, index) => (
              <div key={`${item.product_id}-${index}`} className="rounded-2xl bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-ink">{item.name}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(index, -1)}
                        className="grid h-8 w-8 place-items-center rounded-full text-sm font-black"
                        style={{ backgroundColor: `${color}12`, color }}
                      >
                        -
                      </button>
                      <span className="min-w-8 text-center text-sm font-black text-stone-700">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(index, 1)}
                        className="grid h-8 w-8 place-items-center rounded-full text-sm font-black"
                        style={{ backgroundColor: `${color}12`, color }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold" style={{ color }}>{currency(item.unit_price * item.quantity)}</span>
                    <button
                      type="button"
                      onClick={() => removeCartItem(index)}
                      className="rounded-xl px-3 py-2 text-xs font-black"
                      style={{ backgroundColor: `${color}12`, color }}
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl p-4 font-bold" style={{ backgroundColor: `${color}12`, color }}>
            الإجمالي: {currency(total)}
          </div>
        </section>

        <section className="glass-card rounded-[2rem] p-6" style={theme.sectionSurface}>
          <h2 className="text-2xl font-black text-ink">إتمام الطلب</h2>
          <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
            <input required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="الاسم" className="rounded-2xl border bg-white px-4 py-4 outline-none" style={{ borderColor: `${color}33` }} />
            <input required value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} placeholder="رقم الهاتف" className="rounded-2xl border bg-white px-4 py-4 outline-none" style={{ borderColor: `${color}33` }} />
            <select value={form.pickup_method} onChange={(e) => setForm({ ...form, pickup_method: e.target.value })} className="rounded-2xl border bg-white px-4 py-4 outline-none" style={{ borderColor: `${color}33` }}>
              <option value="delivery">توصيل</option>
              <option value="pickup">استلام</option>
            </select>
            {form.pickup_method === "delivery" ? (
              <input
                required
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                placeholder="اسم المنطقة"
                className="rounded-2xl border bg-white px-4 py-4 outline-none"
                style={{ borderColor: `${color}33` }}
              />
            ) : null}
            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
            {result ? (
              <div className="rounded-2xl bg-green-50 p-4 text-sm font-medium text-green-800">
                تم إنشاء الطلب بنجاح برقم {result.order?.order_number}.
                {result.customer_portal_url ? (
                  <>
                    {" "}
                    <Link href={result.customer_portal_url} className="font-bold underline">
                      عرض حسابي وطلباتي
                    </Link>
                  </>
                ) : null}
              </div>
            ) : null}
            <button disabled={cart.length === 0} className="rounded-2xl px-5 py-4 font-bold disabled:opacity-60" style={theme.button}>
              تأكيد الطلب
            </button>
          </form>
        </section>
      </div>
      </div>
    </main>
  );
}
