"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { storefrontApi } from "@/lib/api";
import { currency, orderStatusLabel } from "@/lib/format";
import { Store } from "@/lib/types";
import { themeStyles } from "@/lib/store-theme";

type PortalOrder = {
  id: number;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  items: Array<{ id: number; product_name: string; quantity: number }>;
};

export default function CustomerOrdersLookupPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [store, setStore] = useState<Store | null>(null);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    customer: { name: string; phone: string; total_spent: number };
    orders: PortalOrder[];
  } | null>(null);

  useEffect(() => {
    storefrontApi.store(slug).then(setStore).catch(() => undefined);
  }, [slug]);

  const color = store?.primary_color || "#C2410C";
  const theme = themeStyles(color);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const response = await storefrontApi.customerOrdersByPhone(slug, phone);
      setResult(
        response as {
          customer: { name: string; phone: string; total_spent: number };
          orders: PortalOrder[];
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر جلب الطلبات");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-6" style={theme.pageBackground}>
      <div className="mx-auto w-full max-w-5xl">
      <section className="glass-card rounded-[2rem] p-6" style={theme.sectionSurface}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black text-ink">طلباتي</h1>
            <p className="mt-2 text-sm text-stone-600">أدخل رقم الهاتف الذي استخدمته عند الطلب لعرض طلباتك.</p>
          </div>
          <Link href={`/s/${slug}`} className="text-sm font-bold" style={{ color }}>
            العودة للمتجر
          </Link>
        </div>

        <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="رقم الهاتف"
            className="w-full rounded-2xl border bg-white px-4 py-4 outline-none"
            style={{ borderColor: `${color}33` }}
          />
          <button disabled={loading} className="rounded-2xl px-5 py-4 font-bold disabled:opacity-60" style={theme.button}>
            {loading ? "جارٍ البحث..." : "عرض طلباتي"}
          </button>
        </form>

        {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}
      </section>

      {result ? (
        <section className="mt-5 space-y-4">
          <div className="glass-card rounded-[2rem] p-5" style={theme.sectionSurface}>
            <p className="text-lg font-black text-ink">{result.customer.name}</p>
            <p className="mt-1 text-sm text-stone-500">{result.customer.phone}</p>
            <p className="mt-3 rounded-2xl px-4 py-3 font-bold" style={{ backgroundColor: `${color}12`, color }}>
              إجمالي الطلبات: {currency(result.customer.total_spent)}
            </p>
          </div>

          {result.orders.map((order) => (
            <article key={order.id} className="glass-card rounded-[2rem] p-5" style={theme.sectionSurface}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-black text-ink">{order.order_number}</h2>
                  <p className="mt-1 text-sm text-stone-500">
                    {new Date(order.created_at).toLocaleDateString("ar-OM")} • {orderStatusLabel(order.status)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 font-bold" style={{ color }}>
                  {currency(order.total)}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-white px-4 py-3 text-sm text-stone-700">
                    {item.product_name} • الكمية {item.quantity}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      ) : null}
      </div>
    </main>
  );
}
