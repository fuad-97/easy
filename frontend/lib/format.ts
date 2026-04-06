export function currency(value: number) {
  return new Intl.NumberFormat("ar-OM", {
    style: "currency",
    currency: "OMR",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  }).format(value);
}

export function orderStatusLabel(status: string) {
  const map: Record<string, string> = {
    new: "جديد",
    confirmed: "تم التأكيد",
    preparing: "قيد التحضير",
    ready: "جاهز",
    out_for_delivery: "خرج للتوصيل",
    delivered: "تم التسليم",
    cancelled: "ملغي"
  };
  return map[status] ?? status;
}

export function relativeTimeFromNow(value?: string | null) {
  if (!value) return "الآن";
  const now = Date.now();
  const target = new Date(value).getTime();
  if (Number.isNaN(target)) return "الآن";

  const diffMinutes = Math.max(0, Math.floor((now - target) / 60000));
  if (diffMinutes < 1) return "الآن";
  if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;

  const diffDays = Math.floor(diffHours / 24);
  return `منذ ${diffDays} يوم`;
}
