"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("merchant@example.com");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("12345678");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await authApi.login({
        email: email || undefined,
        phone: phone || undefined,
        password
      });
      localStorage.setItem("merchant_token", data.access_token);
      router.push("/merchant/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تسجيل الدخول");
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
          <h1 className="text-3xl font-black text-ink">تسجيل دخول التاجر</h1>
          <p className="text-sm text-stone-600">ادخل بالبريد أو الجوال ثم ابدأ إدارة المتجر من الجوال أو الكمبيوتر.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-4 outline-none" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="أو رقم الجوال" className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-4 outline-none" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="كلمة المرور" type="password" className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-4 outline-none" />
          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
          <button disabled={loading} className="w-full rounded-2xl bg-terracotta px-5 py-4 font-bold text-white disabled:opacity-60">
            {loading ? "جارٍ الدخول..." : "دخول"}
          </button>
        </form>
        <p className="mt-5 text-sm text-stone-600">
          لا يوجد حساب؟{" "}
          <Link href="/merchant/register" className="font-bold text-orange-700">
            أنشئ حسابًا جديدًا
          </Link>
        </p>
      </div>
    </main>
  );
}
