"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MerchantShell } from "@/components/merchant-shell";
import { OrderBadge, SectionCard, StatCard } from "@/components/ui";
import { merchantApi } from "@/lib/api";
import { Dashboard, Store } from "@/lib/types";
import { currency } from "@/lib/format";

export default function DashboardPage() {
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("merchant_token");
    if (!token) {
      router.push("/merchant/login");
      return;
    }

    merchantApi
      .myStore(token)
      .then(setStore)
      .catch(() => router.push("/merchant/onboarding"));

    merchantApi.dashboard(token).then(setDashboard).catch(() => undefined);
  }, [router]);

  return (
    <MerchantShell title={store?.name ?? "لوحة التحكم"} subtitle="ملخص سريع للطلبات والمنتجات والنشاط اليومي.">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="طلبات جديدة" value={dashboard?.new_orders ?? 0} />
        <StatCard label="قيد التحضير" value={dashboard?.preparing_orders ?? 0} />
        <StatCard label="تم التسليم" value={dashboard?.delivered_orders ?? 0} />
        <StatCard label="منتجات نشطة" value={dashboard?.active_products ?? 0} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr,1.1fr]">
        <SectionCard
          title="إجراءات سريعة"
          action={
            store ? (
              <Link href={`/s/${store.slug}`} className="text-sm font-bold text-orange-700">
                فتح المتجر العام
              </Link>
            ) : null
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/merchant/products" className="rounded-2xl bg-white px-4 py-4 font-bold text-ink">
              إضافة أو تعديل المنتجات
            </Link>
            <Link href="/merchant/settings" className="rounded-2xl bg-white px-4 py-4 font-bold text-ink">
              تعديل الإعدادات
            </Link>
            <Link href="/merchant/orders" className="rounded-2xl bg-white px-4 py-4 font-bold text-ink">
              متابعة الطلبات
            </Link>
            <Link href="/merchant/customers" className="rounded-2xl bg-white px-4 py-4 font-bold text-ink">
              إدارة العملاء
            </Link>
          </div>
        </SectionCard>

        <SectionCard title="آخر الطلبات">
          <div className="space-y-3">
            {dashboard?.latest_orders?.map((order) => (
              <div key={order.id} className="rounded-2xl bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-ink">{order.order_number}</p>
                    <p className="text-sm text-stone-500">
                      {order.customer.name} • {currency(order.total)}
                    </p>
                  </div>
                  <OrderBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </MerchantShell>
  );
}
