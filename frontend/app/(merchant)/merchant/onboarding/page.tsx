"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUploadField } from "@/components/file-upload-field";
import { merchantApi } from "@/lib/api";

export default function OnboardingPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    activity_type: "حلويات",
    city: "مسقط",
    short_description: "",
    logo_url: "",
    banner_url: ""
  });

  useEffect(() => {
    const savedToken = localStorage.getItem("merchant_token");
    if (!savedToken) {
      router.push("/merchant/login");
      return;
    }
    setToken(savedToken);
    merchantApi
      .myStore(savedToken)
      .then(() => router.push("/merchant/dashboard"))
      .catch(() => undefined);
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      await merchantApi.createStore(token, {
        ...form,
        logo_url: form.logo_url || undefined,
        banner_url: form.banner_url || undefined
      });
      router.push("/merchant/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إنشاء المتجر");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-8">
      <div className="glass-card w-full rounded-[2rem] p-6 md:p-8">
        <h1 className="text-3xl font-black text-ink">أنشئ متجرك الآن</h1>
        <p className="mt-2 text-sm text-stone-600">خطوات قصيرة وسيتم تجهيز متجرك لاستقبال الطلبات داخل المنصة مباشرة.</p>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="اسم المتجر"
            className="rounded-2xl border border-orange-200 bg-white px-4 py-4 outline-none"
          />
          <input
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
            placeholder="الرابط المختصر مثل bayt-al-ward"
            className="rounded-2xl border border-orange-200 bg-white px-4 py-4 outline-none"
          />
          <input
            required
            value={form.activity_type}
            onChange={(e) => setForm({ ...form, activity_type: e.target.value })}
            placeholder="نوع النشاط"
            className="rounded-2xl border border-orange-200 bg-white px-4 py-4 outline-none"
          />
          <input
            required
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="المدينة"
            className="rounded-2xl border border-orange-200 bg-white px-4 py-4 outline-none"
          />
          <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-4 text-sm font-medium text-orange-900 md:col-span-2">
            استقبال الطلبات يتم داخل المنصة فقط.
          </div>
          <div className="md:col-span-2">
            <FileUploadField token={token} kind="logo" label="شعار المتجر" value={form.logo_url} onUploaded={(fileUrl) => setForm({ ...form, logo_url: fileUrl })} />
          </div>
          <div className="md:col-span-2">
            <FileUploadField token={token} kind="banner" label="غلاف المتجر" value={form.banner_url} onUploaded={(fileUrl) => setForm({ ...form, banner_url: fileUrl })} />
          </div>
          <textarea
            value={form.short_description}
            onChange={(e) => setForm({ ...form, short_description: e.target.value })}
            placeholder="وصف قصير"
            rows={4}
            className="rounded-2xl border border-orange-200 bg-white px-4 py-4 outline-none md:col-span-2"
          />
          {error ? <p className="text-sm font-medium text-red-600 md:col-span-2">{error}</p> : null}
          <button disabled={loading} className="rounded-2xl bg-terracotta px-5 py-4 font-bold text-white disabled:opacity-60 md:col-span-2">
            {loading ? "جارٍ تجهيز المتجر..." : "إنشاء المتجر"}
          </button>
        </form>
      </div>
    </main>
  );
}
