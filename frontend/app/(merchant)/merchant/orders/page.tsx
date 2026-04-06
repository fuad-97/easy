"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MerchantShell } from "@/components/merchant-shell";
import { OrderBadge, SectionCard } from "@/components/ui";
import { merchantApi } from "@/lib/api";
import { Order } from "@/lib/types";
import { currency, orderStatusLabel } from "@/lib/format";

const statuses = ["new", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"];

export default function OrdersPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  async function loadOrders(activeToken: string) {
    const response = await merchantApi.orders(activeToken);
    setOrders(response.items);
    setSelectedOrder(response.items[0] ?? null);
  }

  useEffect(() => {
    const savedToken = localStorage.getItem("merchant_token");
    if (!savedToken) {
      router.push("/merchant/login");
      return;
    }
    setToken(savedToken);
    loadOrders(savedToken).catch(() => router.push("/merchant/login"));
  }, [router]);

  return (
    <MerchantShell title="الطلبات" subtitle="راجع الطلبات وحدّث الحالة واطبع الطلب عند الحاجة.">
      <div className="grid gap-5 lg:grid-cols-[0.9fr,1.1fr]">
        <SectionCard title="كل الطلبات">
          <div className="space-y-3">
            {orders.map((order) => (
              <button key={order.id} type="button" onClick={() => setSelectedOrder(order)} className="w-full rounded-2xl bg-white px-4 py-4 text-right">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-ink">{order.order_number}</p>
                    <p className="text-sm text-stone-500">
                      {order.customer.name} • {currency(order.total)}
                    </p>
                  </div>
                  <OrderBadge status={order.status} />
                </div>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title={selectedOrder ? `تفاصيل ${selectedOrder.order_number}` : "تفاصيل الطلب"}>
          {selectedOrder ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white p-4">
                <p className="font-bold text-ink">{selectedOrder.customer.name}</p>
                <p className="mt-1 text-sm text-stone-500">{selectedOrder.customer.phone}</p>
                <p className="mt-1 text-sm text-stone-500">{selectedOrder.short_address || "لا يوجد عنوان مختصر"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={async () => {
                        const updated = await merchantApi.updateOrderStatus(token, selectedOrder.id, status);
                        setSelectedOrder(updated);
                        await loadOrders(token);
                      }}
                      className={`rounded-full px-3 py-2 text-xs font-bold ${
                        selectedOrder.status === status ? "bg-terracotta text-white" : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {orderStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-ink">{item.product_name}</p>
                        <p className="text-sm text-stone-500">الكمية: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-orange-800">{currency(item.total_price)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => window.print()} className="rounded-2xl border border-orange-200 px-4 py-3 font-bold text-orange-900">
                طباعة مبسطة
              </button>
            </div>
          ) : (
            <p className="text-sm text-stone-500">لا يوجد طلب محدد.</p>
          )}
        </SectionCard>
      </div>
    </MerchantShell>
  );
}
