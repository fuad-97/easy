"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { assetUrl, storefrontApi } from "@/lib/api";
import { StorefrontCheckoutLink } from "@/components/storefront-cart-actions";
import { StorefrontCartFab } from "@/components/storefront-cart-fab";
import { ProductImageStage } from "@/components/ui";
import { Product, Store } from "@/lib/types";
import { currency } from "@/lib/format";
import { themeStyles } from "@/lib/store-theme";

type OptionSelection = Record<string, { value: string; price_delta: number }>;

function buildCartSignature(
  productId: number,
  selectedOptions: { group_name: string; option_value: string; price_delta: number }[],
  notes: string
) {
  return JSON.stringify({
    productId,
    notes: notes.trim(),
    options: [...selectedOptions].sort((a, b) => a.group_name.localeCompare(b.group_name))
  });
}

export default function ProductDetailsPage({
  params
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const [slug, setSlug] = useState("");
  const [store, setStore] = useState<Store | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [note, setNote] = useState("");
  const [options, setOptions] = useState<OptionSelection>({});
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [reviewForm, setReviewForm] = useState({ customer_name: "", rating: 5, comment: "" });
  const [reviewState, setReviewState] = useState({ loading: false, message: "", error: "" });

  useEffect(() => {
    params.then(async ({ slug: routeSlug, id }) => {
      setSlug(routeSlug);
      const [storeData, productData] = await Promise.all([
        storefrontApi.store(routeSlug),
        storefrontApi.product(routeSlug, id)
      ]);
      setStore(storeData);
      setProduct(productData);
    });
  }, [params]);

  if (!product || !store) {
    return <main className="p-8">جارٍ تحميل المنتج...</main>;
  }

  const theme = themeStyles(store.primary_color);
  const optionsTotal = Object.values(options).reduce((sum, option) => sum + option.price_delta, 0);
  const total = product.price + optionsTotal;

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!product) {
      setReviewState({
        loading: false,
        message: "",
        error: "تعذر العثور على المنتج"
      });
      return;
    }

    setReviewState({ loading: true, message: "", error: "" });
    try {
      await storefrontApi.createReview(slug, product.id, reviewForm);
      const refreshed = await storefrontApi.product(slug, product.id);
      setProduct(refreshed);
      setReviewForm({ customer_name: "", rating: 5, comment: "" });
      setReviewState({ loading: false, message: "تم إرسال تقييمك بنجاح", error: "" });
    } catch (err) {
      setReviewState({
        loading: false,
        message: "",
        error: err instanceof Error ? err.message : "تعذر إرسال التقييم"
      });
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-6" style={theme.pageBackground}>
      <div className="mx-auto w-full max-w-5xl">
        <StorefrontCartFab slug={slug} color={store.primary_color} />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <ProductImageStage image={product.images[activeImage]?.image_url || product.images[0]?.image_url} alt={product.name} className="glass-card min-h-[380px]" />
            {product.images.length > 1 ? (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className="overflow-hidden rounded-2xl border p-1"
                    style={activeImage === index ? { borderColor: store.primary_color } : { borderColor: `${store.primary_color}22` }}
                  >
                    <img src={assetUrl(image.image_url)} alt={`${product.name}-${index + 1}`} className="h-20 w-full rounded-[0.85rem] object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
            {product.video_url ? (
              <video controls className="glass-card w-full rounded-[1.5rem] bg-black/90">
                <source src={assetUrl(product.video_url)} />
              </video>
            ) : null}
          </div>

          <div className="space-y-5">
            <div className="glass-card rounded-[2rem] p-6" style={theme.sectionSurface}>
              <Link href={`/s/${slug}`} className="text-sm font-bold" style={{ color: store.primary_color }}>
                العودة للمتجر
              </Link>
              <h1 className="mt-3 text-3xl font-black text-ink">{product.name}</h1>
              <div className="mt-3 flex items-center gap-3">
                <div className="text-lg font-black" style={{ color: store.primary_color }}>
                  {"★".repeat(Math.round(product.rating_average || 0))}
                  <span className="mr-2 text-sm font-bold text-stone-500">
                    {product.rating_average ? `${product.rating_average} من 5` : "بدون تقييم"}
                  </span>
                </div>
                <span className="text-sm text-stone-500">({product.rating_count} تقييم)</span>
              </div>
              <p className="mt-3 text-sm leading-8 text-stone-600">{product.description}</p>
              <div className="mt-4 text-2xl font-black" style={{ color: store.primary_color }}>{currency(total)}</div>

              <div className="mt-6 space-y-4">
                {product.option_groups.map((group) => (
                  <div key={group.id} className="rounded-2xl bg-white p-4" style={theme.softBorder}>
                    <p className="font-bold text-ink">{group.name}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {group.values.map((value) => (
                        <button
                          key={value.id}
                          type="button"
                          onClick={() =>
                            setOptions({
                              ...options,
                              [group.name]: { value: value.value, price_delta: value.price_delta }
                            })
                          }
                          className="rounded-full px-4 py-2 text-sm font-bold"
                          style={
                            options[group.name]?.value === value.value
                              ? theme.button
                              : { backgroundColor: `${store.primary_color}14`, color: store.primary_color }
                          }
                        >
                          {value.value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="ملاحظات على الطلب" className="mt-4 w-full rounded-2xl border bg-white px-4 py-4 outline-none" style={{ borderColor: `${store.primary_color}33` }} />
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    const raw = localStorage.getItem(`cart:${slug}`);
                    const cart = raw ? JSON.parse(raw) : [];
                    const selectedOptions = Object.entries(options).map(([group_name, option]) => ({
                      group_name,
                      option_value: option.value,
                      price_delta: option.price_delta
                    }));
                    const signature = buildCartSignature(product.id, selectedOptions, note);
                    const existingIndex = cart.findIndex(
                      (item: {
                        product_id: number;
                        selected_options: { group_name: string; option_value: string; price_delta: number }[];
                        notes?: string;
                      }) => buildCartSignature(item.product_id, item.selected_options || [], item.notes || "") === signature
                    );

                    if (existingIndex >= 0) {
                      cart[existingIndex].quantity += 1;
                      cart[existingIndex].unit_price = total;
                    } else {
                      cart.push({
                        product_id: product.id,
                        name: product.name,
                        quantity: 1,
                        unit_price: total,
                        image: product.images[0]?.image_url,
                        selected_options: selectedOptions,
                        notes: note
                      });
                    }
                    localStorage.setItem(`cart:${slug}`, JSON.stringify(cart));
                    setAdded(true);
                    window.setTimeout(() => setAdded(false), 1800);
                  }}
                  className="rounded-2xl px-5 py-4 font-bold"
                  style={theme.button}
                >
                  إضافة للسلة
                </button>
                <StorefrontCheckoutLink slug={slug} color={store.primary_color} className="rounded-2xl border px-5 py-4 text-center font-bold" variant="ghost" />
              </div>
            </div>

            <div className="glass-card rounded-[2rem] p-6" style={theme.sectionSurface}>
              <h2 className="text-2xl font-black text-ink">التقييمات والتعليقات</h2>
              <div className="mt-4 space-y-3">
                {product.reviews.length === 0 ? (
                  <p className="text-sm text-stone-500">لا توجد تقييمات بعد.</p>
                ) : (
                  product.reviews.map((review) => (
                    <div key={review.id} className="rounded-2xl bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-black text-ink">{review.customer_name}</p>
                        <p className="text-sm font-black" style={{ color: store.primary_color }}>
                          {"★".repeat(review.rating)}
                        </p>
                      </div>
                      {review.comment ? <p className="mt-2 text-sm leading-7 text-stone-600">{review.comment}</p> : null}
                    </div>
                  ))
                )}
              </div>

              <form className="mt-5 space-y-3" onSubmit={submitReview}>
                <h3 className="text-lg font-black text-ink">أضف تقييمك</h3>
                <input
                  value={reviewForm.customer_name}
                  onChange={(e) => setReviewForm({ ...reviewForm, customer_name: e.target.value })}
                  placeholder="اسمك"
                  className="w-full rounded-2xl border bg-white px-4 py-4 outline-none"
                  style={{ borderColor: `${store.primary_color}33` }}
                  required
                />
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  className="w-full rounded-2xl border bg-white px-4 py-4 outline-none"
                  style={{ borderColor: `${store.primary_color}33` }}
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} نجوم
                    </option>
                  ))}
                </select>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="اكتب تعليقك"
                  rows={4}
                  className="w-full rounded-2xl border bg-white px-4 py-4 outline-none"
                  style={{ borderColor: `${store.primary_color}33` }}
                />
                {reviewState.error ? <p className="text-sm font-medium text-red-600">{reviewState.error}</p> : null}
                {reviewState.message ? <p className="text-sm font-medium text-green-700">{reviewState.message}</p> : null}
                <button type="submit" disabled={reviewState.loading} className="rounded-2xl px-5 py-4 font-bold disabled:opacity-60" style={theme.button}>
                  {reviewState.loading ? "جارٍ الإرسال..." : "إرسال التقييم"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {added ? (
          <div className="pointer-events-none fixed bottom-5 right-5 z-50 rounded-[1.4rem] border bg-white px-4 py-3 text-sm font-bold shadow-soft" style={{ borderColor: `${store.primary_color}33`, color: store.primary_color }}>
            تمت إضافة المنتج إلى السلة
          </div>
        ) : null}
      </div>
    </main>
  );
}
