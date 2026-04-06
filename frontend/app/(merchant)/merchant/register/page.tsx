"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await authApi.register({
        ...form,
        email: form.email || undefined,
        phone: form.phone || undefined
      });
      localStorage.setItem("merchant_token", data.access_token);
      router.push("/merchant/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-4 py-8">
      <div className="glass-card w-full rounded-[2rem] p-6 md:p-8">
        <div className="mb-6 space-y-2">
          <Link href="/" className="text-sm font-bold text-orange-700">
            العودة للرئيسية
          </Link>
          <h1 className="text-3xl font-black text-ink">إنشاء حساب تاجر</h1>
          <p className="text-sm text-stone-600">حساب بسيط ثم خطوة واحدة لإنشاء المتجر والرابط العام.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="الاسم الكامل" className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-4 outline-none" />
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="البريد الإلكتروني" className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-4 outline-none" />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="رقم الجوال" className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-4 outline-none" />
          <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="كلمة المرور" className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-4 outline-none" />
          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
          <button disabled={loading} className="w-full rounded-2xl bg-terracotta px-5 py-4 font-bold text-white disabled:opacity-60">
            {loading ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"}
          </button>
        </form>
      </div>
    </main>
  );
}
