import Link from "next/link";
import { StorefrontCheckoutLink } from "@/components/storefront-cart-actions";
import { StorefrontCartFab } from "@/components/storefront-cart-fab";
import { StorefrontProductCard } from "@/components/storefront-product-card";
import { assetUrl, storefrontApi } from "@/lib/api";
import { Product } from "@/lib/types";
import { themeStyles, withAlpha } from "@/lib/store-theme";

const omanVisual =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Oman%2C%20Salalah%2C%20Haffa%20Souq%20%28Souq%20al-Hosn%29%2C%20Frankincense.jpg";

type StoreView = "all" | "new" | "best";

function buildStoreUrl(
  slug: string,
  params: { search?: string; category_id?: string; view?: StoreView },
) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category_id) query.set("category_id", params.category_id);
  if (params.view && params.view !== "all") query.set("view", params.view);
  const queryString = query.toString();
  return `/s/${slug}${queryString ? `?${queryString}` : ""}`;
}

function filterProductsByView(products: Product[], view: StoreView) {
  if (view === "new") return products.filter((product) => product.is_new_arrival);
  if (view === "best") return products.filter((product) => product.is_best_seller);
  return products;
}

export default async function StorefrontPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ search?: string; category_id?: string; view?: string }>;
}) {
  const { slug } = await params;
  const search = await searchParams;
  const activeView = search.view === "new" || search.view === "best" ? search.view : "all";
  const store = await storefrontApi.store(slug);
  const query = new URLSearchParams();
  if (search.search) query.set("search", search.search);
  if (search.category_id) query.set("category_id", search.category_id);
  const products = await storefrontApi.products(slug, query.toString() ? `?${query.toString()}` : "");
  const filteredProducts = filterProductsByView(products.items, activeView);
  const cover = assetUrl(store.banner_url || store.logo_url) || omanVisual;
  const theme = themeStyles(store.primary_color);

  const viewMeta: Record<StoreView, { eyebrow: string; title: string; empty: string }> = {
    all: {
      eyebrow: "تصفح المجموعة",
      title: "كل المنتجات",
      empty: "لا توجد منتجات مطابقة حاليًا."
    },
    new: {
      eyebrow: "منتجات يحددها صاحب المتجر",
      title: "جديدنا",
      empty: "لم يضف صاحب المتجر منتجات إلى جديدنا بعد."
    },
    best: {
      eyebrow: "منتجات يحددها صاحب المتجر",
      title: "الأكثر مبيعًا",
      empty: "لم يضف صاحب المتجر منتجات إلى الأكثر مبيعًا بعد."
    }
  };

  return (
    <main className="min-h-screen px-3 py-3 md:px-6 md:py-6" style={theme.pageBackground}>
      <div className="mx-auto w-full max-w-7xl">
        <StorefrontCartFab slug={slug} color={store.primary_color} />

        <section className="mb-4 rounded-[1.8rem] border bg-white/92 px-4 py-4 shadow-soft backdrop-blur md:mb-6 md:rounded-[2rem] md:px-6" style={theme.softBorder}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#f6d7bc,#fff3e4)]">
                {store.logo_url ? (
                  <img src={assetUrl(store.logo_url)} alt={store.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-black text-ink">{store.name.slice(0, 1)}</span>
                )}
              </div>
              <div>
                <p className="text-lg font-black text-ink">{store.name}</p>
                <p className="text-xs font-medium text-stone-500">{store.activity_type}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <Link
                href={buildStoreUrl(slug, { search: search.search, category_id: search.category_id, view: "new" })}
                className="rounded-2xl px-4 py-3 text-center text-sm font-black"
                style={activeView === "new" ? theme.button : theme.buttonGhost}
              >
                جديدنا
              </Link>
              <Link
                href={buildStoreUrl(slug, { search: search.search, category_id: search.category_id, view: "best" })}
                className="rounded-2xl px-4 py-3 text-center text-sm font-black"
                style={activeView === "best" ? theme.button : theme.buttonGhost}
              >
                الأكثر مبيعًا
              </Link>
              <Link href={`/s/${slug}/orders`} className="rounded-2xl border px-4 py-3 text-center text-sm font-black" style={theme.buttonGhost}>
                طلباتي
              </Link>
              <StorefrontCheckoutLink slug={slug} color={store.primary_color} className="rounded-2xl px-4 py-3 text-center text-sm font-black" variant="solid" />
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[2rem] text-white shadow-soft md:rounded-[2.6rem]" style={{ backgroundColor: theme.deeper }}>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-75"
            style={{
              backgroundImage: `${theme.heroOverlay.backgroundImage}, url(${cover})`
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.16),transparent_26%)]" />

          <div className="relative space-y-5 px-4 py-5 md:grid md:gap-5 md:px-8 md:py-8 lg:grid-cols-[1.05fr,0.95fr] lg:items-end">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-black" style={{ color: withAlpha(store.primary_color, 0.96) }}>
                  {store.is_open ? "مفتوح الآن" : "مغلق مؤقتًا"}
                </span>
                <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-black" style={{ color: withAlpha(store.primary_color, 0.96) }}>
                  {store.city}
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-black leading-[1.08] md:max-w-2xl md:text-6xl">{store.name}</h1>
                <p className="max-w-2xl text-sm leading-7 text-white/75 md:text-base md:leading-8">
                  {store.short_description || `تجربة تسوق مرتبة لمنتجات ${store.activity_type} بطابع أنيق ومناسب للجوال.`}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
                <Link
                  href={buildStoreUrl(slug, { search: search.search, category_id: search.category_id, view: "all" })}
                  className="rounded-2xl px-4 py-3 text-center text-sm font-black"
                  style={activeView === "all" ? theme.button : theme.buttonGhost}
                >
                  الكل
                </Link>
                <Link
                  href={buildStoreUrl(slug, { search: search.search, category_id: search.category_id, view: "new" })}
                  className="rounded-2xl px-4 py-3 text-center text-sm font-black"
                  style={activeView === "new" ? theme.button : theme.buttonGhost}
                >
                  جديدنا
                </Link>
                <Link
                  href={buildStoreUrl(slug, { search: search.search, category_id: search.category_id, view: "best" })}
                  className="rounded-2xl px-4 py-3 text-center text-sm font-black"
                  style={activeView === "best" ? theme.button : theme.buttonGhost}
                >
                  الأكثر مبيعًا
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 space-y-4 md:mt-6 lg:grid lg:grid-cols-[300px,1fr] lg:gap-5 lg:space-y-0">
          <aside className="space-y-4">
            <div className="rounded-[1.8rem] border p-4 shadow-soft md:rounded-[2rem] md:p-5" style={theme.sectionSurface}>
              <h2 className="text-base font-black text-ink md:text-lg">التصنيفات</h2>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
                <Link
                  href={buildStoreUrl(slug, { search: search.search, view: activeView })}
                  className={`shrink-0 rounded-2xl px-4 py-3 text-sm font-black ${!search.category_id ? "" : "bg-stone-50 text-stone-700"}`}
                  style={!search.category_id ? theme.button : undefined}
                >
                  كل المنتجات
                </Link>
                {store.categories.map((category) => (
                  <Link
                    key={category.id}
                    href={buildStoreUrl(slug, { search: search.search, category_id: String(category.id), view: activeView })}
                    className={`shrink-0 rounded-2xl px-4 py-3 text-sm font-black ${search.category_id === String(category.id) ? "" : "bg-stone-50 text-stone-700"}`}
                    style={search.category_id === String(category.id) ? theme.button : undefined}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          <section id="products" className="space-y-4">
            <div className="rounded-[1.8rem] border p-4 shadow-soft md:rounded-[2rem] md:p-5" style={theme.sectionSurface}>
              <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-4 md:space-y-0">
                <div>
                  <p className="text-sm font-bold text-stone-500">{viewMeta[activeView].eyebrow}</p>
                  <h2 className="mt-1 text-xl font-black text-ink md:text-2xl">{viewMeta[activeView].title}</h2>
                </div>
                <form action={`/s/${slug}`} className="flex gap-2 md:w-full md:max-w-xl">
                  {search.category_id ? <input type="hidden" name="category_id" value={search.category_id} /> : null}
                  {activeView !== "all" ? <input type="hidden" name="view" value={activeView} /> : null}
                  <input
                    name="search"
                    defaultValue={search.search}
                    placeholder="ابحث عن منتج"
                    className="w-full rounded-2xl border bg-stone-50 px-4 py-3.5 text-sm outline-none md:px-4 md:py-4"
                    style={{ borderColor: `${store.primary_color}22` }}
                  />
                  <button className="rounded-2xl px-4 py-3.5 text-sm font-black md:px-5 md:py-4" style={theme.button}>
                    بحث
                  </button>
                </form>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-[1.8rem] border border-dashed bg-white px-5 py-10 text-center text-sm font-medium text-stone-600 shadow-soft md:rounded-[2rem] md:py-12" style={{ borderColor: `${store.primary_color}33` }}>
                {viewMeta[activeView].empty}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <StorefrontProductCard key={`${activeView}-${product.id}`} slug={slug} product={product} color={store.primary_color} />
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
