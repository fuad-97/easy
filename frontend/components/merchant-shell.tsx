"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/merchant/dashboard", label: "الرئيسية" },
  { href: "/merchant/products", label: "المنتجات" },
  { href: "/merchant/orders", label: "الطلبات" },
  { href: "/merchant/customers", label: "العملاء" },
  { href: "/merchant/settings", label: "الإعدادات" }
] as const;

export function MerchantShell({
  children,
  title,
  subtitle,
  navBadges
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  navBadges?: Partial<Record<(typeof navItems)[number]["href"], number | string>>;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-3 py-3 md:px-5 md:py-4">
      <header className="glass-card mb-4 rounded-[1.75rem] px-4 py-4 md:px-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="text-sm font-semibold text-orange-700">
              منصة المتاجر الصغيرة
            </Link>
            <h1 className="mt-2 text-2xl font-black text-ink md:text-3xl">{title}</h1>
            <p className="mt-1 text-sm text-stone-600">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("merchant_token");
              router.push("/merchant/login");
            }}
            className="rounded-2xl border border-orange-200 px-4 py-3 text-sm font-bold text-orange-900 transition hover:bg-orange-50"
          >
            تسجيل الخروج
          </button>
        </div>
        <nav className="mt-4 flex gap-2 overflow-auto pb-1">
          {navItems.map((item) => {
            const badge = navBadges?.[item.href];
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  active ? "bg-terracotta text-white" : "bg-white/80 text-stone-700 hover:bg-white"
                }`}
              >
                <span>{item.label}</span>
                {badge ? (
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${active ? "bg-white/20 text-white" : "bg-orange-100 text-orange-800"}`}>
                    {badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </header>
      {children}
    </div>
  );
}
