import Link from "next/link";
import { assetUrl, storefrontApi } from "@/lib/api";

const omanFrankincenseSouq =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Oman%2C%20Salalah%2C%20Haffa%20Souq%20%28Souq%20al-Hosn%29%2C%20Frankincense.jpg";
const omanIncenseBurner =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Riyam%20Park%20with%20incense%20burner%20Mabkhara%20%2847954080007%29.jpg";
const omanMuttrahSouq =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Muttrah%20Souq.jpg";

const quickStats = [
  { value: "سريع", label: "إطلاق المتجر" },
  { value: "مرتب", label: "عرض المنتجات" },
  { value: "واضح", label: "إدارة الطلبات" }
];

const featureTiles = [
  {
    title: "واجهة تبيع",
    text: "صور وهوية مناسبة لمنتجات اللبان والعطور والبخور.",
    image: omanFrankincenseSouq
  },
  {
    title: "لوحة تحكم خفيفة",
    text: "إضافة منتج وتحديث الطلبات من الجوال بدون تعقيد.",
    image: omanMuttrahSouq
  },
  {
    title: "طلبات داخل المنصة",
    text: "تجربة موحدة للعميل من التصفح حتى تأكيد الطلب.",
    image: omanIncenseBurner
  }
];

export default async function HomePage() {
  const partnerStores = await storefrontApi.stores().catch(() => ({ items: [], total: 0 }));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-4 md:px-6 md:py-6">
      <header className="sticky top-3 z-20 rounded-[2rem] border border-white/70 bg-white/80 px-4 py-3 shadow-soft backdrop-blur md:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 text-lg font-black text-white">
              س
            </div>
            <div>
              <p className="text-lg font-black text-ink">سهل</p>
              <p className="text-xs font-medium text-stone-500">منصة متاجر عربية</p>
            </div>
          </div>

          <nav className="hidden items-center gap-3 md:flex">
            <a href="#why" className="text-sm font-bold text-stone-600 transition hover:text-ink">
              لماذا سهل
            </a>
            <a href="#partner-stores" className="text-sm font-bold text-stone-600 transition hover:text-ink">
              المتاجر
            </a>
            <Link href="/merchant/login" className="rounded-2xl border border-orange-200 px-4 py-2 text-sm font-black text-orange-900">
              تسجيل الدخول
            </Link>
            <Link href="/merchant/register" className="rounded-2xl bg-terracotta px-4 py-2 text-sm font-black text-white">
              افتح متجرك
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden rounded-[2.8rem] bg-[#22160d] px-5 py-5 text-white shadow-soft md:px-7 md:py-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.26),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.20),transparent_24%)]" />

        <div className="relative grid gap-4 lg:grid-cols-[0.92fr,1.08fr]">
          <div className="flex min-h-[520px] flex-col justify-between rounded-[2.2rem] border border-white/10 bg-white/5 p-5 backdrop-blur md:p-7">
            <div className="space-y-5">
              <span className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-orange-100">
                تجارة عربية بصياغة أبسط وهوية أجمل
              </span>

              <div className="space-y-4">
                <h1 className="max-w-xl text-4xl font-black leading-[1.05] md:text-6xl">
                  واجهة ترفع قيمة
                  <br />
                  متجرك من أول زيارة
                </h1>
                <p className="max-w-md text-sm leading-7 text-white/70 md:text-base">
                  متجر عام أنيق، لوحة تحكم واضحة، وتجربة شراء سريعة تناسب الجوال وتخدم التاجر والعميل.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/merchant/register"
                  className="rounded-2xl bg-white px-5 py-4 text-center text-sm font-black text-ink transition hover:bg-orange-50"
                >
                  ابدأ الآن
                </Link>
                <Link
                  href="/s/bayt-al-ward"
                  className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-center text-sm font-black text-white transition hover:bg-white/15"
                >
                  شاهد متجرًا حيًا
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {quickStats.map((item) => (
                <div key={item.label} className="rounded-[1.6rem] border border-white/10 bg-white/8 px-4 py-4">
                  <p className="text-xl font-black text-white">{item.value}</p>
                  <p className="mt-1 text-xs font-medium text-white/60">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid min-h-[330px] gap-4 md:grid-cols-[1.15fr,0.85fr]">
              <div
                className="relative overflow-hidden rounded-[2.2rem] bg-cover bg-center"
                style={{
                  backgroundImage:
                    `linear-gradient(180deg, rgba(17,12,8,0.08), rgba(17,12,8,0.42)), url(${omanFrankincenseSouq})`
                }}
              >
                
              </div>

              <div className="grid gap-4">
                <div className="rounded-[2rem] bg-gradient-to-br from-[#f6d7bc] to-[#fff3e4] p-5 text-ink">
                  <p className="text-xs font-black text-orange-800">مناسب للروائح الشرقية والمنتجات الفاخرة</p>
                  <h3 className="mt-2 text-2xl font-black leading-tight">
                    صورة وهوية
                    <br />
                    أقرب للسوق العماني
                  </h3>
                </div>
                <div
                  className="min-h-[150px] rounded-[2rem] bg-cover bg-center"
                  style={{
                    backgroundImage:
                      `linear-gradient(180deg, rgba(17,12,8,0.06), rgba(17,12,8,0.3)), url(${omanIncenseBurner})`
                  }}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {featureTiles.map((tile) => (
                <article key={tile.title} className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/95 text-ink shadow-soft">
                  <div
                    className="h-40 bg-cover bg-center"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(43,29,14,0.04), rgba(43,29,14,0.2)), url(${tile.image})`
                    }}
                  />
                  <div className="space-y-2 p-4">
                    <h3 className="text-base font-black">{tile.title}</h3>
                    <p className="text-sm leading-7 text-stone-600">{tile.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="why" className="grid gap-4 md:grid-cols-[0.9fr,1.1fr]">
        <div className="rounded-[2.3rem] border border-orange-100 bg-white p-6 shadow-soft">
          <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-800">
            لماذا تبدو أفضل
          </span>
          <h2 className="mt-4 text-3xl font-black leading-tight text-ink">
            لأنها تترك المنتج
            <br />
            هو بطل الصفحة
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-stone-600">
            لا ازدحام، لا نصوص كثيرة، ولا عناصر مشتتة. فقط هوية دافئة، صور قوية، ومسار واضح للشراء.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="glass-card rounded-[2rem] p-5">
            <p className="text-xs font-black text-orange-700">01</p>
            <h3 className="mt-3 text-lg font-black text-ink">صورة أولًا</h3>
            <p className="mt-2 text-sm leading-7 text-stone-600">عرض بصري أقوى للمنتجات والهوية.</p>
          </div>
          <div className="glass-card rounded-[2rem] p-5">
            <p className="text-xs font-black text-orange-700">02</p>
            <h3 className="mt-3 text-lg font-black text-ink">كلام أقل</h3>
            <p className="mt-2 text-sm leading-7 text-stone-600">رسائل قصيرة تشرح القيمة بدون إزعاج.</p>
          </div>
          <div className="glass-card rounded-[2rem] p-5">
            <p className="text-xs font-black text-orange-700">03</p>
            <h3 className="mt-3 text-lg font-black text-ink">دعوة أوضح</h3>
            <p className="mt-2 text-sm leading-7 text-stone-600">العميل يعرف أين يبدأ، والتاجر يعرف أين يسجل.</p>
          </div>
        </div>
      </section>

      <section
        id="partner-stores"
        className="rounded-[2.6rem] border border-orange-100 bg-[linear-gradient(180deg,#ffffff_0%,#fff6ec_100%)] px-5 py-6 shadow-soft md:px-8 md:py-8"
      >
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-800">
              المتاجر الشريكة
            </span>
            <h2 className="mt-3 text-3xl font-black text-ink">متاجر تعرض نفسها بشكل أجمل</h2>
          </div>
          <Link href="/merchant/register" className="rounded-2xl bg-terracotta px-5 py-4 text-center text-sm font-black text-white">
            افتح متجرك
          </Link>
        </div>

        {partnerStores.items.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-orange-200 bg-white px-5 py-10 text-center text-sm font-medium text-stone-600">
            لا توجد متاجر منشورة حاليًا.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {partnerStores.items.map((store) => {
              const visual =
                assetUrl(store.banner_url || store.logo_url) ||
                omanMuttrahSouq;

              return (
                <article
                  key={store.id}
                  className="overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(120,53,15,0.16)]"
                >
                  <div
                    className="relative h-56 bg-cover bg-center"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(43,29,14,0.04), rgba(43,29,14,0.38)), url(${visual})`
                    }}
                  >
                    <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-white/88 px-3 py-1 text-xs font-black text-ink backdrop-blur">
                        {store.activity_type}
                      </span>
                      <span className="rounded-full bg-[#22160d]/80 px-3 py-1 text-xs font-black text-white backdrop-blur">
                        {store.is_open ? "مفتوح" : "مغلق"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <div>
                      <h3 className="text-xl font-black text-ink">{store.name}</h3>
                      <p className="mt-2 text-sm leading-7 text-stone-600">
                        {store.short_description || `متجر من ${store.city}`}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Link
                        href={`/s/${store.slug}`}
                        className="flex-1 rounded-2xl bg-terracotta px-4 py-3 text-center text-sm font-black text-white"
                      >
                        عرض المتجر
                      </Link>
                      <Link
                        href="/merchant/register"
                        className="rounded-2xl border border-orange-200 px-4 py-3 text-sm font-black text-orange-900"
                      >
                        انضمام
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
