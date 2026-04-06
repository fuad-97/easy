import { assetUrl } from "@/lib/api";
import { currency, orderStatusLabel } from "@/lib/format";
import { themeStyles, withAlpha } from "@/lib/store-theme";

const fallbackImage =
  "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=800&q=80";

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass-card rounded-[1.5rem] p-5">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-ink">{value}</p>
    </div>
  );
}

export function SectionCard({
  title,
  action,
  children
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-card rounded-[1.75rem] p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-black text-ink md:text-xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ProductCard({
  name,
  price,
  image,
  subtitle,
  accentColor,
  action
}: {
  name: string;
  price: number;
  image?: string | null;
  subtitle?: string;
  accentColor?: string;
  action?: React.ReactNode;
}) {
  const theme = themeStyles(accentColor || "#C2410C");
  return (
    <div className="overflow-hidden rounded-[1.8rem] border bg-white shadow-soft transition duration-200 hover:-translate-y-1" style={{ borderColor: withAlpha(theme.color, 0.16), ...theme.elevatedShadow }}>
      <div className="flex h-48 items-center justify-center p-3 md:h-60 md:p-4" style={{ backgroundImage: `linear-gradient(180deg, ${withAlpha(theme.color, 0.08)} 0%, ${theme.soft} 100%)` }}>
        <img
          src={assetUrl(image) || fallbackImage}
          alt={name}
          className="h-full w-full rounded-[1.2rem] object-contain"
        />
      </div>
      <div className="space-y-3 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-black text-ink md:text-base">{name}</h3>
            {subtitle ? <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-stone-500 md:mt-2 md:leading-7">{subtitle}</p> : null}
          </div>
          <span
            className="rounded-full px-3 py-1 text-xs font-black md:text-sm"
            style={{ backgroundColor: withAlpha(theme.color, 0.12), color: theme.color }}
          >
            {currency(price)}
          </span>
        </div>
        <div
          className="rounded-2xl px-4 py-2.5 text-center text-sm font-black md:py-3"
          style={{ backgroundColor: withAlpha(theme.color, 0.08), color: theme.color }}
        >
          عرض التفاصيل
        </div>
        {action ? <div>{action}</div> : null}
      </div>
    </div>
  );
}

export function OrderBadge({ status }: { status: string }) {
  return <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">{orderStatusLabel(status)}</span>;
}

export function ProductImageStage({ image, alt, className = "" }: { image?: string | null; alt: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-50 to-stone-100 p-4 ${className}`}>
      <img src={assetUrl(image) || fallbackImage} alt={alt} className="h-full w-full object-contain" />
    </div>
  );
}
