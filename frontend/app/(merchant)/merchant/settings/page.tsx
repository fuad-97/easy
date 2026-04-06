"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUploadField } from "@/components/file-upload-field";
import { MerchantShell } from "@/components/merchant-shell";
import { merchantApi } from "@/lib/api";
import { Store } from "@/lib/types";

const presetColors = [
  { name: "عنبر", value: "#C2410C" },
  { name: "ذهبي", value: "#B45309" },
  { name: "نحاسي", value: "#9A3412" },
  { name: "رملي", value: "#C28B52" },
  { name: "زيتي", value: "#5F6F52" },
  { name: "خمري", value: "#7C2D12" },
  { name: "بني داكن", value: "#4A2F1B" },
  { name: "أسود فاخر", value: "#1F1A17" }
];

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.6rem] border border-orange-100 bg-white px-4 py-4 shadow-soft">
      <p className="text-xs font-bold text-stone-500">{label}</p>
      <p className="mt-2 text-base font-black text-ink">{value}</p>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [store, setStore] = useState<Store | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("merchant_token");
    if (!savedToken) {
      router.push("/merchant/login");
      return;
    }
    setToken(savedToken);
    merchantApi.myStore(savedToken).then(setStore).catch(() => router.push("/merchant/onboarding"));
  }, [router]);

  async function saveStore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!store) return;

    setSaving(true);
    setMessage("");
    try {
      await merchantApi.updateStore(token, {
        name: store.name,
        city: store.city,
        short_description: store.short_description,
        primary_color: store.primary_color,
        logo_url: store.logo_url,
        banner_url: store.banner_url,
        is_banner_enabled: store.is_banner_enabled,
        is_open: store.is_open
      });

      if (store.settings) {
        await merchantApi.updateSettings(token, {
          working_hours: store.settings.working_hours,
          delivery_notes: store.settings.delivery_notes,
          default_delivery_fee: store.settings.default_delivery_fee,
          pickup_enabled: store.settings.pickup_enabled
        });
      }

      setMessage("تم حفظ الإعدادات بنجاح");
    } finally {
      setSaving(false);
    }
  }

  if (!store) {
    return (
      <MerchantShell title="الإعدادات" subtitle="خصّص هوية المتجر وأوقات العمل ورسوم التوصيل الأساسية.">
        <div className="rounded-[2rem] border border-orange-100 bg-white p-8 text-sm text-stone-500 shadow-soft">
          جارٍ تحميل الإعدادات...
        </div>
      </MerchantShell>
    );
  }

  return (
    <MerchantShell title="الإعدادات" subtitle="جهّز هوية المتجر وطريقة ظهوره وتجربة التوصيل من شاشة واحدة أوضح.">
      <div className="space-y-5">
        <section className="overflow-hidden rounded-[2.3rem] border border-orange-100 bg-[linear-gradient(135deg,#fff9f3_0%,#fff1e0_55%,#f6d7bc_100%)] p-5 shadow-soft md:p-6">
          <div className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr] lg:items-end">
            <div className="space-y-4">
              <span className="inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-black text-orange-800">
                إعدادات المتجر
              </span>
              <div>
                <h2 className="text-3xl font-black text-ink md:text-4xl">{store.name}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-600">
                  عدّل اسم المتجر ووصفه وصوره وأوقات العمل ورسوم التوصيل من صفحة واحدة مرتبة.
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <StatBadge label="الرابط" value={`/s/${store.slug}`} />
              <StatBadge label="الحالة" value={store.is_open ? "مفتوح" : "مغلق"} />
              <StatBadge label="البانر" value={store.is_banner_enabled ? "مفعل" : "متوقف"} />
            </div>
          </div>
        </section>

        <form className="grid gap-5 xl:grid-cols-[1.1fr,0.9fr]" onSubmit={saveStore}>
          <div className="space-y-5">
            <section className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-soft md:p-6">
              <div className="mb-5">
                <p className="text-sm font-bold text-stone-500">المعلومات الأساسية</p>
                <h3 className="mt-1 text-2xl font-black text-ink">بيانات المتجر</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-bold text-stone-700">اسم المتجر</span>
                  <input value={store.name} onChange={(e) => setStore({ ...store, name: e.target.value })} className="w-full rounded-2xl border border-orange-200 bg-stone-50 px-4 py-4 outline-none" placeholder="اسم المتجر" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-bold text-stone-700">المدينة</span>
                  <input value={store.city} onChange={(e) => setStore({ ...store, city: e.target.value })} className="w-full rounded-2xl border border-orange-200 bg-stone-50 px-4 py-4 outline-none" placeholder="المدينة" />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-bold text-stone-700">وصف المتجر</span>
                  <textarea value={store.short_description} onChange={(e) => setStore({ ...store, short_description: e.target.value })} rows={4} className="w-full rounded-2xl border border-orange-200 bg-stone-50 px-4 py-4 outline-none" placeholder="وصف مختصر يساعد العميل على فهم المتجر بسرعة" />
                </label>
              </div>
            </section>

            <section className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-soft md:p-6">
              <div className="mb-5">
                <p className="text-sm font-bold text-stone-500">الهوية البصرية</p>
                <h3 className="mt-1 text-2xl font-black text-ink">الشعار والغلاف واللون</h3>
              </div>

              <div className="space-y-4">
                <label className="space-y-2">
                  <span className="text-sm font-bold text-stone-700">اللون الأساسي</span>
                  <div className="rounded-[1.6rem] border border-orange-200 bg-stone-50 p-3">
                    <div className="mb-3 flex flex-wrap gap-2">
                      {presetColors.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setStore({ ...store, primary_color: color.value })}
                          className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold transition ${
                            store.primary_color === color.value
                              ? "border-ink bg-white text-ink"
                              : "border-transparent bg-white/70 text-stone-700"
                          }`}
                        >
                          <span className="h-5 w-5 rounded-full border border-black/10" style={{ backgroundColor: color.value }} />
                          {color.name}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
                      <span className="h-8 w-8 rounded-full border border-black/10" style={{ backgroundColor: store.primary_color }} />
                      <input
                        value={store.primary_color}
                        onChange={(e) => setStore({ ...store, primary_color: e.target.value })}
                        className="w-full bg-transparent outline-none"
                        placeholder="#C2410C"
                      />
                    </div>
                  </div>
                </label>
                <FileUploadField token={token} kind="logo" label="شعار المتجر" value={store.logo_url} onUploaded={(fileUrl) => setStore({ ...store, logo_url: fileUrl })} />
                <FileUploadField token={token} kind="banner" label="غلاف المتجر" value={store.banner_url} onUploaded={(fileUrl) => setStore({ ...store, banner_url: fileUrl })} />
              </div>
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-soft md:p-6">
              <div className="mb-5">
                <p className="text-sm font-bold text-stone-500">التشغيل</p>
                <h3 className="mt-1 text-2xl font-black text-ink">حالة المتجر والظهور</h3>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between rounded-2xl border border-orange-200 bg-stone-50 px-4 py-4">
                  <div>
                    <p className="font-black text-ink">المتجر مفتوح</p>
                    <p className="mt-1 text-sm text-stone-500">أظهر للعميل أن المتجر يستقبل الطلبات الآن</p>
                  </div>
                  <input type="checkbox" checked={store.is_open} onChange={(e) => setStore({ ...store, is_open: e.target.checked })} />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-orange-200 bg-stone-50 px-4 py-4">
                  <div>
                    <p className="font-black text-ink">تفعيل البانر</p>
                    <p className="mt-1 text-sm text-stone-500">اعرض غلاف المتجر في الواجهة العامة</p>
                  </div>
                  <input type="checkbox" checked={store.is_banner_enabled} onChange={(e) => setStore({ ...store, is_banner_enabled: e.target.checked })} />
                </label>

                <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-4 text-sm font-medium text-orange-900">
                  استقبال الطلبات يتم عبر المنصة فقط.
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-soft md:p-6">
              <div className="mb-5">
                <p className="text-sm font-bold text-stone-500">التوصيل والاستلام</p>
                <h3 className="mt-1 text-2xl font-black text-ink">إعدادات الطلب</h3>
              </div>

              <div className="space-y-4">
                <label className="space-y-2">
                  <span className="text-sm font-bold text-stone-700">أوقات العمل</span>
                  <textarea value={store.settings?.working_hours || ""} onChange={(e) => setStore({ ...store, settings: store.settings ? { ...store.settings, working_hours: e.target.value } : store.settings })} rows={3} className="w-full rounded-2xl border border-orange-200 bg-stone-50 px-4 py-4 outline-none" placeholder="مثال: يوميًا من 10 صباحًا إلى 10 مساءً" />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-bold text-stone-700">ملاحظات التوصيل</span>
                  <textarea value={store.settings?.delivery_notes || ""} onChange={(e) => setStore({ ...store, settings: store.settings ? { ...store.settings, delivery_notes: e.target.value } : store.settings })} rows={3} className="w-full rounded-2xl border border-orange-200 bg-stone-50 px-4 py-4 outline-none" placeholder="مثال: التوصيل خلال نفس اليوم داخل المدينة" />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-bold text-stone-700">رسوم التوصيل الأساسية</span>
                  <input type="number" value={store.settings?.default_delivery_fee || 0} onChange={(e) => setStore({ ...store, settings: store.settings ? { ...store.settings, default_delivery_fee: Number(e.target.value) } : store.settings })} className="w-full rounded-2xl border border-orange-200 bg-stone-50 px-4 py-4 outline-none" placeholder="0" />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-orange-200 bg-stone-50 px-4 py-4">
                  <div>
                    <p className="font-black text-ink">السماح بالاستلام</p>
                    <p className="mt-1 text-sm text-stone-500">اسمح للعميل باختيار الاستلام بدل التوصيل</p>
                  </div>
                  <input type="checkbox" checked={store.settings?.pickup_enabled || false} onChange={(e) => setStore({ ...store, settings: store.settings ? { ...store.settings, pickup_enabled: e.target.checked } : store.settings })} />
                </label>
              </div>
            </section>

            <section className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-soft md:p-6">
              <div className="flex flex-col gap-3">
                {message ? <p className="rounded-2xl bg-green-50 px-4 py-4 text-sm font-medium text-green-700">{message}</p> : null}
                <button disabled={saving} className="rounded-2xl bg-terracotta px-5 py-4 font-black text-white disabled:opacity-60">
                  {saving ? "جارٍ حفظ الإعدادات..." : "حفظ الإعدادات"}
                </button>
              </div>
            </section>
          </div>
        </form>
      </div>
    </MerchantShell>
  );
}
