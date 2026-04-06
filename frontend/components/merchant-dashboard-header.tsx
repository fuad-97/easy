"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Store } from "@/lib/types";

type StoreStatus = "open" | "busy" | "closed";

const statusStyles: Record<StoreStatus, string> = {
  open: "bg-emerald-100 text-emerald-800",
  busy: "bg-amber-100 text-amber-900",
  closed: "bg-rose-100 text-rose-800"
};

const statusLabels: Record<StoreStatus, string> = {
  open: "مفتوح",
  busy: "مشغول",
  closed: "مغلق"
};

function HeaderButton({
  onClick,
  children
}: {
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-bold text-stone-800 transition hover:bg-orange-50"
    >
      {children}
    </button>
  );
}

export function MerchantDashboardHeader({
  store,
  status,
  savingStatus,
  onChangeStatus,
  onCopyLink,
  onShareStore
}: {
  store: Store;
  status: StoreStatus;
  savingStatus: boolean;
  onChangeStatus: (status: StoreStatus) => void;
  onCopyLink: () => void;
  onShareStore: () => void;
}) {
  const publicStoreUrl = useMemo(() => {
    if (typeof window === "undefined") return `/s/${store.slug}`;
    return `${window.location.origin}/s/${store.slug}`;
  }, [store.slug]);

  return (
    <section className="glass-card rounded-[1.8rem] p-4 md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black text-ink md:text-3xl">{store.name}</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-black ${statusStyles[status]}`}>{statusLabels[status]}</span>
          </div>
          <p className="text-sm leading-7 text-stone-600">{store.short_description || "متجرك جاهز لاستقبال الطلبات ومتابعتها يوميًا من مكان واحد."}</p>
          <div className="flex flex-wrap gap-2">
            {(["open", "busy", "closed"] as StoreStatus[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onChangeStatus(value)}
                disabled={savingStatus}
                className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                  status === value ? "text-white" : "border border-orange-200 bg-white text-stone-700"
                }`}
                style={status === value ? { backgroundColor: value === "closed" ? "#be123c" : value === "busy" ? "#d97706" : "#059669" } : undefined}
              >
                {statusLabels[value]}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full space-y-3 md:w-auto md:min-w-[320px]">
          <div className="grid gap-2 sm:grid-cols-3">
            <HeaderButton onClick={onCopyLink}>نسخ الرابط</HeaderButton>
            <Link href={`/s/${store.slug}`} target="_blank" className="rounded-2xl border border-orange-200 bg-white px-4 py-3 text-center text-sm font-bold text-stone-800 transition hover:bg-orange-50">
              فتح المتجر
            </Link>
            <HeaderButton onClick={onShareStore}>مشاركة المتجر</HeaderButton>
          </div>
          <div className="rounded-[1.4rem] border border-orange-100 bg-white px-4 py-3">
            <p className="text-xs font-bold text-stone-500">رابط المتجر</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="truncate text-sm font-bold text-ink" dir="ltr">{publicStoreUrl}</p>
              <button type="button" onClick={onCopyLink} className="rounded-xl bg-orange-50 px-3 py-2 text-xs font-black text-orange-800">
                نسخ
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
