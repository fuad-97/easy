"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
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
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 md:px-6">
      <div className="grid w-full gap-5 lg:grid-cols-[0.95fr,1.05fr]">
        <section className="glass-card hidden rounded-[2.2rem] p-7 lg:block">
          <div className="flex h-full flex-col justify-between">
            <div>
              <Link href="/" className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-800">
                العودة للرئيسية
              </Link>
              <h1 className="mt-5 text-4xl font-black leading-tight text-ink">
                دخول التاجر
                <br />
                إلى لوحة المتجر
              </h1>
              <p className="mt-4 max-w-md text-sm leading-8 text-stone-600">
                ادخل إلى لوحة التحكم لمتابعة الطلبات، إضافة المنتجات، ومشاركة رابط المتجر بسهولة من الجوال أو الكمبيوتر.
              </p>
            </div>

            <div className="mt-8 grid gap-3">
              <div className="rounded-[1.6rem] border border-orange-100 bg-white/80 px-4 py-4">
                <p className="text-sm font-black text-ink">كل ما تحتاجه في شاشة واحدة</p>
                <p className="mt-1 text-xs leading-6 text-stone-500">الطلبات، المنتجات، العملاء، ورابط المتجر.</p>
              </div>
              <div className="rounded-[1.6rem] border border-orange-100 bg-white/80 px-4 py-4">
                <p className="text-sm font-black text-ink">سريع وواضح</p>
                <p className="mt-1 text-xs leading-6 text-stone-500">واجهة عربية بسيطة ومناسبة للاستخدام اليومي.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card rounded-[2rem] p-6 md:p-8">
          <div className="mb-6 space-y-2">
            <Link href="/" className="text-sm font-bold text-orange-700 lg:hidden">
              العودة للرئيسية
            </Link>
            <h2 className="text-3xl font-black text-ink">تسجيل الدخول</h2>
            <p className="text-sm leading-7 text-stone-600">
              استخدم البريد الإلكتروني أو رقم الجوال، ثم أدخل كلمة المرور للمتابعة.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">البريد الإلكتروني</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-4 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-orange-100" />
              <span className="text-xs font-black text-stone-400">أو</span>
              <div className="h-px flex-1 bg-orange-100" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">رقم الجوال</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9XXXXXXXX"
                autoComplete="tel"
                inputMode="tel"
                className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-4 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">كلمة المرور</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                type="password"
                autoComplete="current-password"
                className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-4 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}

            <button
              disabled={loading || (!email && !phone) || !password}
              className="w-full rounded-2xl bg-terracotta px-5 py-4 font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "جارٍ تسجيل الدخول..." : "دخول"}
            </button>
          </form>

          <div className="mt-5 rounded-[1.5rem] border border-orange-100 bg-white/70 px-4 py-4">
            <p className="text-sm text-stone-600">
              لا يوجد حساب؟{" "}
              <Link href="/merchant/register" className="font-black text-orange-700">
                أنشئ حسابًا جديدًا
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
