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
