export function MerchantDashboardAttention({
  items
}: {
  items: Array<{ id: string; title: string; description: string; actionLabel: string; actionHref: string; tone?: "blue" | "amber" | "rose" }>;
}) {
  const toneClasses = {
    blue: "bg-sky-50 text-sky-900 border-sky-100",
    amber: "bg-amber-50 text-amber-900 border-amber-100",
    rose: "bg-rose-50 text-rose-900 border-rose-100"
  };

  if (items.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-orange-200 bg-white px-5 py-8 text-center">
        <p className="font-black text-ink">كل شيء تحت السيطرة</p>
        <p className="mt-2 text-sm text-stone-500">لا توجد عناصر تحتاج متابعة الآن.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item.id} className={`rounded-[1.4rem] border p-4 ${toneClasses[item.tone ?? "amber"]}`}>
          <p className="font-black">{item.title}</p>
          <p className="mt-2 text-sm leading-6 opacity-80">{item.description}</p>
          <a href={item.actionHref} className="mt-4 inline-flex rounded-xl bg-white/80 px-4 py-2 text-xs font-black">
            {item.actionLabel}
          </a>
        </div>
      ))}
    </div>
  );
}
