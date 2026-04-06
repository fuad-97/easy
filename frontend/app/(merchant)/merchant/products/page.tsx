"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUploadField } from "@/components/file-upload-field";
import { VideoUploadField } from "@/components/video-upload-field";
import { MerchantShell } from "@/components/merchant-shell";
import { ProductCard, ProductImageStage, SectionCard } from "@/components/ui";
import { assetUrl, merchantApi, uploadImage } from "@/lib/api";
import { currency } from "@/lib/format";
import { Product } from "@/lib/types";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  compare_at_price: "",
  quantity: "1",
  prep_time_minutes: "30",
  status: "available",
  is_new_arrival: false,
  is_best_seller: false,
  video_url: "",
  images: [{ image_url: "", sort_order: 0 }],
  option_groups: []
};

export default function ProductsPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  async function loadProducts(activeToken: string) {
    const response = await merchantApi.products(activeToken);
    setProducts(response.items);
  }

  useEffect(() => {
    const savedToken = localStorage.getItem("merchant_token");
    if (!savedToken) {
      router.push("/merchant/login");
      return;
    }
    setToken(savedToken);
    loadProducts(savedToken).catch((err) => {
      setError(err instanceof Error ? err.message : "تعذر تحميل المنتجات");
    });
  }, [router]);

  const uploadedImages = form.images.filter((image) => image.image_url);
  const currentPreviewImage = uploadedImages[previewIndex]?.image_url ?? uploadedImages[0]?.image_url ?? "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : undefined,
        quantity: Number(form.quantity || 0),
        prep_time_minutes: form.prep_time_minutes ? Number(form.prep_time_minutes) : undefined,
        video_url: form.video_url || undefined,
        images: form.images.filter((image) => image.image_url).map((image, index) => ({ ...image, sort_order: index }))
      };

      if (editingProductId) {
        await merchantApi.updateProduct(token, editingProductId, payload);
      } else {
        await merchantApi.createProduct(token, payload);
      }

      setForm(emptyForm);
      setPreviewIndex(0);
      setShowAdvanced(false);
      setEditingProductId(null);
      setSuccess(editingProductId ? "تم تحديث المنتج بنجاح" : "تمت إضافة المنتج بنجاح");
      await loadProducts(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : editingProductId ? "تعذر تحديث المنتج" : "تعذر حفظ المنتج");
    } finally {
      setSaving(false);
    }
  }

  function updateImageAt(index: number, imageUrl: string) {
    setForm((current) => ({
      ...current,
      images: current.images.map((item, itemIndex) =>
        itemIndex === index ? { ...item, image_url: imageUrl, sort_order: itemIndex } : item
      )
    }));
  }

  function addImageSlot() {
    setForm((current) => ({
      ...current,
      images: [...current.images, { image_url: "", sort_order: current.images.length }]
    }));
  }

  function removeImageAt(index: number) {
    setForm((current) => {
      const nextImages = current.images.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        images: nextImages.length > 0 ? nextImages : [{ image_url: "", sort_order: 0 }]
      };
    });
    setPreviewIndex(0);
  }

  async function handleBulkImageUpload(files: FileList | null) {
    if (!files || !token) return;

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const uploaded = [];
      for (const file of Array.from(files)) {
        const result = await uploadImage(token, "product", file);
        uploaded.push({ image_url: result.file_url, sort_order: uploaded.length });
      }

      setForm((current) => {
        const existing = current.images.filter((image) => image.image_url);
        const merged = [...existing, ...uploaded].map((image, index) => ({ ...image, sort_order: index }));

        return {
          ...current,
          images: merged.length > 0 ? merged : [{ image_url: "", sort_order: 0 }]
        };
      });

      setSuccess("تم رفع الصور وإضافتها للمنتج");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر رفع الصور");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowAdvanced(false);
    setPreviewIndex(0);
    setEditingProductId(null);
  }

  return (
    <MerchantShell title="المنتجات" subtitle="أضف صور المنتج وحدد هل يظهر في جديدنا أو الأكثر مبيعًا داخل المتجر.">
      <div className="grid gap-5 lg:grid-cols-[0.95fr,1.05fr]">
        <SectionCard title={editingProductId ? "تعديل المنتج" : "إضافة منتج جديد"}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {editingProductId ? (
              <div className="rounded-[1.5rem] bg-amber-50 px-4 py-4 text-sm font-bold text-amber-900">
                أنت الآن تعدل هذا المنتج.
              </div>
            ) : null}

            <div className="grid gap-4">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="اسم المنتج"
                className="rounded-2xl border border-orange-200 bg-white px-4 py-4 text-base outline-none"
              />

              <div className="grid gap-3 md:grid-cols-2">
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="السعر"
                  className="rounded-2xl border border-orange-200 bg-white px-4 py-4 text-base outline-none"
                />
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="الكمية"
                  className="rounded-2xl border border-orange-200 bg-white px-4 py-4 text-base outline-none"
                />
              </div>

              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="وصف مختصر للمنتج"
                rows={3}
                className="rounded-2xl border border-orange-200 bg-white px-4 py-4 outline-none"
              />

              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, is_new_arrival: !form.is_new_arrival })}
                  className={`rounded-[1.4rem] border px-4 py-4 text-right transition ${
                    form.is_new_arrival
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border-stone-200 bg-white text-stone-700"
                  }`}
                >
                  <p className="text-sm font-black">جديدنا</p>
                  <p className="mt-1 text-xs leading-6 text-stone-500">سيظهر هذا المنتج عند ضغط العميل على زر جديدنا.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, is_best_seller: !form.is_best_seller })}
                  className={`rounded-[1.4rem] border px-4 py-4 text-right transition ${
                    form.is_best_seller
                      ? "border-amber-200 bg-amber-50 text-amber-900"
                      : "border-stone-200 bg-white text-stone-700"
                  }`}
                >
                  <p className="text-sm font-black">الأكثر مبيعًا</p>
                  <p className="mt-1 text-xs leading-6 text-stone-500">سيظهر هذا المنتج عند ضغط العميل على زر الأكثر مبيعًا.</p>
                </button>
              </div>

              <div className="space-y-3 rounded-[1.5rem] bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black text-ink">صور المنتج</h3>
                  <div className="flex flex-wrap gap-2">
                    <label className="cursor-pointer rounded-2xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-900">
                      رفع عدة صور
                      <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleBulkImageUpload(e.target.files)} />
                    </label>
                    <button
                      type="button"
                      onClick={addImageSlot}
                      className="rounded-2xl border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-orange-900"
                    >
                      إضافة صورة واحدة
                    </button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {form.images.map((image, index) => (
                    <div key={index} className="rounded-[1.25rem] border border-orange-100 p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-stone-700">الصورة {index + 1}</p>
                        {form.images.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removeImageAt(index)}
                            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700"
                          >
                            حذف الصورة
                          </button>
                        ) : null}
                      </div>
                      <FileUploadField token={token} kind="product" label="رفع صورة" value={image.image_url} onUploaded={(fileUrl) => updateImageAt(index, fileUrl)} />
                    </div>
                  ))}
                </div>
              </div>

              <VideoUploadField token={token} label="فيديو المنتج" value={form.video_url} onUploaded={(fileUrl) => setForm({ ...form, video_url: fileUrl })} />

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: "available" })}
                  className={`rounded-2xl px-4 py-3 text-sm font-bold ${
                    form.status === "available" ? "bg-terracotta text-white" : "bg-white text-stone-700"
                  }`}
                >
                  متوفر
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: "unavailable" })}
                  className={`rounded-2xl px-4 py-3 text-sm font-bold ${
                    form.status === "unavailable" ? "bg-stone-800 text-white" : "bg-white text-stone-700"
                  }`}
                >
                  غير متوفر
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced((value) => !value)}
              className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-4 text-sm font-bold text-orange-900"
            >
              {showAdvanced ? "إخفاء التفاصيل الإضافية" : "إظهار التفاصيل الإضافية"}
            </button>

            {showAdvanced ? (
              <div className="grid gap-3 rounded-[1.5rem] bg-white/70 p-4">
                <input
                  type="number"
                  value={form.compare_at_price}
                  onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
                  placeholder="السعر قبل الخصم"
                  className="rounded-2xl border border-orange-200 bg-white px-4 py-4 outline-none"
                />
                <input
                  type="number"
                  value={form.prep_time_minutes}
                  onChange={(e) => setForm({ ...form, prep_time_minutes: e.target.value })}
                  placeholder="مدة التجهيز بالدقائق"
                  className="rounded-2xl border border-orange-200 bg-white px-4 py-4 outline-none"
                />
              </div>
            ) : null}

            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
            {success ? <p className="text-sm font-medium text-green-700">{success}</p> : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button disabled={saving || !form.name || !form.price} className="flex-1 rounded-2xl bg-terracotta px-5 py-4 font-bold text-white disabled:opacity-60">
                {saving ? (editingProductId ? "جارٍ التحديث..." : "جارٍ الحفظ...") : editingProductId ? "تحديث المنتج" : "حفظ المنتج"}
              </button>
              <button type="button" onClick={resetForm} className="rounded-2xl border border-stone-200 bg-white px-5 py-4 font-bold text-stone-700">
                {editingProductId ? "إلغاء التعديل" : "تفريغ الحقول"}
              </button>
            </div>
          </form>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="كيف سيظهر في المتجر">
            <div className="space-y-4">
              <ProductImageStage image={currentPreviewImage} alt={form.name || "معاينة المنتج"} className="min-h-[320px]" />

              {uploadedImages.length > 1 ? (
                <div className="grid grid-cols-4 gap-3">
                  {uploadedImages.map((image, index) => (
                    <button
                      key={`${image.image_url}-${index}`}
                      type="button"
                      onClick={() => setPreviewIndex(index)}
                      className={`overflow-hidden rounded-2xl border p-1 ${previewIndex === index ? "border-terracotta" : "border-orange-100"}`}
                    >
                      <img src={assetUrl(image.image_url)} alt={`preview-${index + 1}`} className="h-20 w-full rounded-[0.85rem] object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}

              {form.video_url ? (
                <video controls className="w-full rounded-[1.5rem] border border-orange-200 bg-black/90">
                  <source src={assetUrl(form.video_url)} />
                </video>
              ) : null}

              <div className="rounded-[1.5rem] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {form.is_new_arrival ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800">جديدنا</span>
                      ) : null}
                      {form.is_best_seller ? (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-800">الأكثر مبيعًا</span>
                      ) : null}
                    </div>
                    <h3 className="text-lg font-black text-ink">{form.name || "اسم المنتج سيظهر هنا"}</h3>
                    <p className="mt-2 text-sm leading-7 text-stone-500">{form.description || "أضف وصفًا واضحًا ومختصرًا للعميل."}</p>
                  </div>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-800">{currency(Number(form.price || 0))}</span>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title={`قائمة المنتجات (${products.length})`}>
            <div className="grid gap-4 md:grid-cols-2">
              {products.map((product) => (
                <div key={product.id} className="space-y-3">
                  <ProductCard
                    name={product.name}
                    price={product.price}
                    image={product.images[0]?.image_url}
                    subtitle={product.status === "available" ? "متوفر" : "غير متوفر"}
                  />

                  <div className="flex flex-wrap gap-2">
                    {product.is_new_arrival ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800">جديدنا</span>
                    ) : null}
                    {product.is_best_seller ? (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-800">الأكثر مبيعًا</span>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingProductId(product.id);
                      setForm({
                        name: product.name,
                        description: product.description || "",
                        price: String(product.price ?? ""),
                        compare_at_price: product.compare_at_price ? String(product.compare_at_price) : "",
                        quantity: String(product.quantity ?? 0),
                        prep_time_minutes: product.prep_time_minutes ? String(product.prep_time_minutes) : "",
                        status: product.status,
                        is_new_arrival: product.is_new_arrival,
                        is_best_seller: product.is_best_seller,
                        video_url: product.video_url || "",
                        images:
                          product.images.length > 0
                            ? product.images.map((image, index) => ({
                                image_url: image.image_url,
                                sort_order: index
                              }))
                            : [{ image_url: "", sort_order: 0 }],
                        option_groups: []
                      });
                      setPreviewIndex(0);
                      setShowAdvanced(Boolean(product.compare_at_price || product.prep_time_minutes));
                      setError("");
                      setSuccess("");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 font-bold text-orange-900"
                  >
                    تعديل المنتج
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await merchantApi.deleteProduct(token, product.id);
                        await loadProducts(token);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "تعذر حذف المنتج");
                      }
                    }}
                    className="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700"
                  >
                    حذف ناعم
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </MerchantShell>
  );
}
