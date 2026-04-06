"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MerchantShell } from "@/components/merchant-shell";
import { MerchantDashboardAttention } from "@/components/merchant-dashboard-attention";
import { MerchantDashboardHeader } from "@/components/merchant-dashboard-header";
import { MerchantDashboardOrders } from "@/components/merchant-dashboard-orders";
import { MerchantDashboardQuickActions } from "@/components/merchant-dashboard-quick-actions";
import { SectionCard, StatCard } from "@/components/ui";
import { merchantApi } from "@/lib/api";
import { Dashboard, Order, Product, Store } from "@/lib/types";

type StoreStatus = "open" | "busy" | "closed";
type OrderFilter = "all" | "new" | "preparing" | "delivered";

function getStatusKey(storeId: number) {
  return `merchant_store_status_${storeId}`;
}

function isToday(dateValue?: string) {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [store, setStore] = useState<Store | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>("open");
  const [savingStatus, setSavingStatus] = useState(false);
  const [ordersFilter, setOrdersFilter] = useState<OrderFilter>("all");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const activeToken = localStorage.getItem("merchant_token");
    if (!activeToken) {
      router.push("/merchant/login");
      return;
    }

    setToken(activeToken);

    merchantApi
      .myStore(activeToken)
      .then((storeData) => {
        setStore(storeData);
        const savedStatus = localStorage.getItem(getStatusKey(storeData.id)) as StoreStatus | null;
        if (!storeData.is_open) {
          setStoreStatus("closed");
        } else if (savedStatus === "busy") {
          setStoreStatus("busy");
        } else {
          setStoreStatus("open");
        }
      })
      .catch(() => router.push("/merchant/onboarding"));

    merchantApi.dashboard(activeToken).then(setDashboard).catch(() => undefined);
    merchantApi.orders(activeToken).then((response) => setOrders(response.items)).catch(() => undefined);
    merchantApi.products(activeToken).then((response) => setProducts(response.items)).catch(() => undefined);
  }, [router]);

  const publicStoreUrl = useMemo(() => {
    if (!store || typeof window === "undefined") return "";
    return `${window.location.origin}/s/${store.slug}`;
  }, [store]);

  const todayOrders = useMemo(() => orders.filter((order) => isToday(order.created_at)), [orders]);

  const topProductToday = useMemo(() => {
    const tally = new Map<string, number>();
    todayOrders.forEach((order) => {
      order.items.forEach((item) => {
        tally.set(item.product_name, (tally.get(item.product_name) ?? 0) + item.quantity);
      });
    });
    return [...tally.entries()].sort((a, b) => b[1] - a[1])[0];
  }, [todayOrders]);

  const attentionItems = useMemo(() => {
    const items: Array<{ id: string; title: string; description: string; actionLabel: string; actionHref: string; tone?: "blue" | "amber" | "rose" }> = [];

    const pendingOrder = orders.find((order) => order.status === "new");
    if (pendingOrder) {
      items.push({
        id: `new-${pendingOrder.id}`,
        title: "طلب جديد بانتظار التأكيد",
        description: `${pendingOrder.order_number} للعميل ${pendingOrder.customer.name}`,
        actionLabel: "تأكيد الطلب",
        actionHref: "/merchant/orders",
        tone: "blue"
      });
    }

    const delayedOrder = orders.find((order) => ["confirmed", "preparing"].includes(order.status) && !isToday(order.created_at));
    if (delayedOrder) {
      items.push({
        id: `delay-${delayedOrder.id}`,
        title: "طلب متأخر يحتاج متابعة",
        description: `${delayedOrder.order_number} ما زال ${delayedOrder.status === "preparing" ? "قيد التحضير" : "بانتظار التنفيذ"}`,
        actionLabel: "فتح الطلبات",
        actionHref: "/merchant/orders",
        tone: "amber"
      });
    }

    const lowStock = products.find((product) => product.is_active && !product.is_deleted && product.quantity <= 3);
    if (lowStock) {
      items.push({
        id: `stock-${lowStock.id}`,
        title: "منتج منخفض المخزون",
        description: `${lowStock.name} بقي منه ${lowStock.quantity} فقط`,
        actionLabel: "تعديل المنتج",
        actionHref: "/merchant/products",
        tone: "rose"
      });
    }

    return items;
  }, [orders, products]);

  const filteredOrders = useMemo(() => {
    if (ordersFilter === "all") return orders.slice(0, 6);
    if (ordersFilter === "new") return orders.filter((order) => order.status === "new").slice(0, 6);
    if (ordersFilter === "preparing") return orders.filter((order) => ["confirmed", "preparing", "ready"].includes(order.status)).slice(0, 6);
    return orders.filter((order) => order.status === "delivered").slice(0, 6);
  }, [orders, ordersFilter]);

  async function updateStoreStatus(nextStatus: StoreStatus) {
    if (!store || !token) return;
    setSavingStatus(true);
    try {
      const updated = await merchantApi.updateStore(token, { is_open: nextStatus !== "closed" });
      setStore(updated);
      setStoreStatus(nextStatus);
      localStorage.setItem(getStatusKey(updated.id), nextStatus);
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleCopyLink() {
    if (!publicStoreUrl) return;
    await navigator.clipboard.writeText(publicStoreUrl);
    setMessage("تم نسخ رابط المتجر");
    window.setTimeout(() => setMessage(""), 2000);
  }

  async function handleShareStore() {
    if (!publicStoreUrl || !store) return;
    if (navigator.share) {
      await navigator.share({ title: store.name, text: `تسوق الآن من ${store.name}`, url: publicStoreUrl });
    } else {
      await handleCopyLink();
    }
  }

  async function updateOrderStatus(orderId: number, status: string) {
    if (!token) return;
    const updated = await merchantApi.updateOrderStatus(token, orderId, status);
    setOrders((current) => current.map((order) => (order.id === orderId ? updated : order)));
    setDashboard((current) =>
      current
        ? {
            ...current,
            latest_orders: current.latest_orders.map((order) => (order.id === orderId ? updated : order)),
            new_orders: status === "confirmed" && current.new_orders > 0 ? current.new_orders - 1 : current.new_orders
          }
        : current,
    );
  }

  const summaryLine = todayOrders.length
    ? `لديك ${todayOrders.filter((order) => order.status === "new").length} طلب جديد اليوم`
    : "لا توجد طلبات جديدة الآن";

  const summarySubline = topProductToday
    ? `أكثر منتج طلبًا اليوم: ${topProductToday[0]}`
    : "ابدأ بمشاركة متجرك لزيادة الطلبات اليوم.";

  return (
    <MerchantShell
      title={store?.name ?? "لوحة التحكم"}
      subtitle="ملخص سريع للطلبات والمنتجات والنشاط اليومي."
      navBadges={{ "/merchant/orders": dashboard?.new_orders ?? 0 }}
    >
      <div className="space-y-4">
        {store ? (
          <MerchantDashboardHeader
            store={store}
            status={storeStatus}
            savingStatus={savingStatus}
            onChangeStatus={updateStoreStatus}
            onCopyLink={handleCopyLink}
            onShareStore={handleShareStore}
          />
        ) : null}

        <section className="glass-card rounded-[1.7rem] px-4 py-4 md:px-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black text-ink">{summaryLine}</p>
              <p className="mt-1 text-sm text-stone-500">{summarySubline}</p>
            </div>
            {message ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800">{message}</span> : null}
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <StatCard label="طلبات جديدة" value={dashboard?.new_orders ?? 0} hint="تحتاج متابعة" tone="blue" featured icon={<span>◉</span>} />
          <StatCard label="قيد التحضير" value={dashboard?.preparing_orders ?? 0} hint="تابع الجاهزية والتسليم" tone="amber" icon={<span>◌</span>} />
          <StatCard label="تم التسليم" value={dashboard?.delivered_orders ?? 0} hint="طلبات مكتملة" tone="green" icon={<span>✓</span>} />
          <StatCard label="المنتجات" value={dashboard?.active_products ?? 0} hint="المنتجات النشطة حاليًا" tone="default" icon={<span>□</span>} />
        </div>

        <SectionCard title="يحتاج انتباهك">
          <MerchantDashboardAttention items={attentionItems} />
        </SectionCard>

        <div className="grid gap-4 xl:grid-cols-[1.05fr,0.95fr]">
          <SectionCard title="آخر الطلبات">
            <MerchantDashboardOrders
              orders={filteredOrders}
              filter={ordersFilter}
              onFilterChange={setOrdersFilter}
              onConfirm={(order) => updateOrderStatus(order.id, "confirmed")}
              onMarkReady={(order) => updateOrderStatus(order.id, "ready")}
            />
          </SectionCard>

          <div className="space-y-4">
            <SectionCard title="إجراءات سريعة">
              {store ? <MerchantDashboardQuickActions storeSlug={store.slug} onCopyLink={handleCopyLink} /> : null}
            </SectionCard>

            <SectionCard title="رابط المتجر">
              {store ? (
                <div className="space-y-3">
                  <div className="rounded-[1.4rem] border border-orange-100 bg-white px-4 py-4">
                    <p className="text-xs font-bold text-stone-500">الرابط الجاهز للمشاركة</p>
                    <p className="mt-2 truncate text-sm font-black text-ink" dir="ltr">
                      {publicStoreUrl}
                    </p>
                  </div>
                  <button type="button" onClick={handleCopyLink} className="w-full rounded-2xl bg-terracotta px-4 py-3 font-black text-white">
                    نسخ رابط المتجر
                  </button>
                </div>
              ) : null}
            </SectionCard>
          </div>
        </div>
      </div>
    </MerchantShell>
  );
}
