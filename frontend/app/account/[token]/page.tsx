import Link from "next/link";
import { storefrontApi } from "@/lib/api";
import { currency, orderStatusLabel } from "@/lib/format";

export default async function CustomerAccountPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const portal = await storefrontApi.customerPortal(token);
  const customer = (portal as { customer: { name: string; phone: string; total_spent: number }; orders: Array<{ id: number; order_number: string; status: string; total: number; created_at: string; items: Array<{ id: number; product_name: string; quantity: number }> }> }).customer;
  const orders = (portal as { customer: unknown; orders: Array<{ id: number; order_number: string; status: string; total: number; created_at: string; items: Array<{ id: number; product_name: string; quantity: number }> }> }).orders;

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6 md:px-6">
      <section className="glass-card rounded-[2rem] p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black text-ink">حسابي</h1>
            <p className="mt-2 text-sm text-stone-600">
              {customer.name} • {customer.phone}
            </p>
          </div>
          <div className="rounded-2xl bg-orange-50 px-4 py-3 font-bold text-orange-900">
            إجمالي الطلبات: {currency(customer.total_spent)}
          </div>
        </div>
      </section>

      <section className="mt-5 space-y-4">
        {orders.map((order) => (
          <article key={order.id} className="glass-card rounded-[2rem] p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black text-ink">{order.order_number}</h2>
                <p className="mt-1 text-sm text-stone-500">
                  {new Date(order.created_at).toLocaleDateString("ar-OM")} • {orderStatusLabel(order.status)}
                </p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 font-bold text-orange-800">
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

      <div className="mt-6">
        <Link href="/" className="text-sm font-bold text-orange-700">
          العودة للرئيسية
        </Link>
      </div>
    </main>
  );
}
