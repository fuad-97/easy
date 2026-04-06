"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/merchant/dashboard", label: "الرئيسية" },
  { href: "/merchant/products", label: "المنتجات" },
  { href: "/merchant/orders", label: "الطلبات" },
  { href: "/merchant/customers", label: "العملاء" },
  { href: "/merchant/settings", label: "الإعدادات" }
];

export function MerchantShell({
  children,
  title,
  subtitle
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 md:px-6">
      <header className="glass-card mb-5 rounded-[1.75rem] px-4 py-4 md:px-6">
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
            className="rounded-2xl border border-orange-200 px-4 py-3 text-sm font-bold text-orange-900"
          >
            تسجيل الخروج
          </button>
        </div>
        <nav className="mt-5 flex gap-2 overflow-auto pb-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-2xl px-4 py-3 text-sm font-bold ${
                pathname === item.href ? "bg-terracotta text-white" : "bg-white/80 text-stone-700"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
