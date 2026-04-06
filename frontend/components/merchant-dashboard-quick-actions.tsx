import Link from "next/link";

const actions = [
  { href: "/merchant/products", label: "إضافة منتج", icon: "＋" },
  { href: "/merchant/orders", label: "إدارة الطلبات", icon: "◉" },
  { href: "", label: "فتح المتجر", icon: "↗" },
  { href: "", label: "نسخ الرابط", icon: "⎘" },
  { href: "/merchant/settings", label: "الإعدادات", icon: "⚙" },
  { href: "/merchant/customers", label: "العملاء", icon: "◌" }
];

export function MerchantDashboardQuickActions({
  storeSlug,
  onCopyLink
}: {
  storeSlug: string;
  onCopyLink: () => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {actions.map((action) => {
        if (action.label === "نسخ الرابط") {
          return (
            <button
              key={action.label}
              type="button"
              onClick={onCopyLink}
              className="flex items-center gap-3 rounded-[1.4rem] border border-orange-100 bg-white px-4 py-4 text-right transition hover:-translate-y-0.5 hover:bg-orange-50"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-50 text-lg font-black text-orange-800">{action.icon}</span>
              <div>
                <p className="font-black text-ink">{action.label}</p>
                <p className="mt-1 text-xs text-stone-500">انسخ الرابط لمشاركته بسرعة</p>
              </div>
            </button>
          );
        }

        if (action.label === "فتح المتجر") {
          return (
            <Link
              key={action.label}
              href={`/s/${storeSlug}`}
              target="_blank"
              className="flex items-center gap-3 rounded-[1.4rem] border border-orange-100 bg-white px-4 py-4 text-right transition hover:-translate-y-0.5 hover:bg-orange-50"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-50 text-lg font-black text-orange-800">{action.icon}</span>
              <div>
                <p className="font-black text-ink">{action.label}</p>
                <p className="mt-1 text-xs text-stone-500">شاهد الواجهة العامة كما يراها العميل</p>
              </div>
            </Link>
          );
        }

        return (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center gap-3 rounded-[1.4rem] border border-orange-100 bg-white px-4 py-4 text-right transition hover:-translate-y-0.5 hover:bg-orange-50"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-50 text-lg font-black text-orange-800">{action.icon}</span>
            <div>
              <p className="font-black text-ink">{action.label}</p>
              <p className="mt-1 text-xs text-stone-500">
                {action.label === "إضافة منتج" && "أضف منتجًا جديدًا بسرعة"}
                {action.label === "إدارة الطلبات" && "راجع الطلبات وحدّث حالاتها"}
                {action.label === "الإعدادات" && "حدّث بيانات وهوية المتجر"}
                {action.label === "العملاء" && "اعرف أكثر العملاء شراءً"}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
