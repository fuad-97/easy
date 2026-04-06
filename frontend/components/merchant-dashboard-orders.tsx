import Link from "next/link";
import { Order } from "@/lib/types";
import { currency, relativeTimeFromNow } from "@/lib/format";
import { OrderBadge } from "@/components/ui";

type Filter = "all" | "new" | "preparing" | "delivered";

const tabConfig: { key: Filter; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "new", label: "جديد" },
  { key: "preparing", label: "قيد التحضير" },
  { key: "delivered", label: "تم التسليم" }
];

export function MerchantDashboardOrders({
  orders,
  filter,
  onFilterChange,
  onConfirm,
  onMarkReady
}: {
  orders: Order[];
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
  onConfirm: (order: Order) => void;
  onMarkReady: (order: Order) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-auto pb-1">
        {tabConfig.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onFilterChange(tab.key)}
            className={`shrink-0 rounded-2xl px-4 py-2.5 text-sm font-black transition ${
              filter === tab.key ? "bg-terracotta text-white" : "border border-orange-100 bg-white text-stone-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-orange-200 bg-white px-5 py-8 text-center">
          <p className="font-black text-ink">لا توجد طلبات بعد</p>
          <p className="mt-2 text-sm text-stone-500">ابدأ بمشاركة متجرك للحصول على أول طلب.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-[1.5rem] border border-orange-100 bg-white p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-black text-ink">{order.order_number}</p>
                    <OrderBadge status={order.status} />
                  </div>
                  <p className="text-sm font-bold text-stone-700">{order.customer.name}</p>
                  <p className="text-sm text-stone-500">
                    {currency(order.total)} • {relativeTimeFromNow(order.created_at)} • {order.pickup_method === "delivery" ? "توصيل" : "استلام"}
                  </p>
                </div>
                <Link href="/merchant/orders" className="rounded-xl border border-orange-200 px-3 py-2 text-xs font-black text-orange-900">
                  عرض
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {order.status === "new" ? (
                  <button type="button" onClick={() => onConfirm(order)} className="rounded-xl bg-sky-50 px-4 py-2 text-xs font-black text-sky-800">
                    تأكيد
                  </button>
                ) : null}
                {(order.status === "confirmed" || order.status === "preparing") ? (
                  <button type="button" onClick={() => onMarkReady(order)} className="rounded-xl bg-amber-50 px-4 py-2 text-xs font-black text-amber-900">
                    تعليم كجاهز
                  </button>
                ) : null}
                <Link href="/merchant/orders" className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-black text-stone-700">
                  فتح الطلب
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
