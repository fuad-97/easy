"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { assetUrl, uploadImage } from "@/lib/api";

const editorConfig = {
  logo: { aspectRatio: "1 / 1", minHeight: "220px" },
  product: { aspectRatio: "1 / 1", minHeight: "220px" },
  banner: { aspectRatio: "16 / 7", minHeight: "180px" }
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

async function buildCroppedFile(
  source: string,
  kind: "logo" | "banner" | "product",
  zoom: number,
  offsetX: number,
  offsetY: number
) {
  const image = new Image();
  image.src = source;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  const isBanner = kind === "banner";
  canvas.width = isBanner ? 1600 : 1200;
  canvas.height = isBanner ? 700 : 1200;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("تعذر تجهيز الصورة.");
  }

  const scale = zoom;
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const x = (canvas.width - drawWidth) / 2 + offsetX;
  const y = (canvas.height - drawHeight) / 2 + offsetY;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, x, y, drawWidth, drawHeight);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
  if (!blob) {
    throw new Error("تعذر حفظ الصورة بعد القص.");
  }

  return new File([blob], `cropped-${kind}.jpg`, { type: "image/jpeg" });
}

export function FileUploadField({
  token,
  kind,
  label,
  value,
  onUploaded
}: {
  token: string;
  kind: "logo" | "banner" | "product";
  label: string;
  value?: string | null;
  onUploaded: (url: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sourceImage, setSourceImage] = useState("");
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const config = editorConfig[kind];

  const previewStyle = useMemo(
    () => ({
      backgroundImage: `url(${sourceImage || assetUrl(value)})`,
      backgroundPosition: `calc(50% + ${offsetX}px) calc(50% + ${offsetY}px)`,
      backgroundSize: `${zoom * 100}%`,
      aspectRatio: config.aspectRatio,
      minHeight: config.minHeight
    }),
    [config.aspectRatio, config.minHeight, offsetX, offsetY, sourceImage, value, zoom]
  );

  async function onFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setSourceImage(URL.createObjectURL(file));
  }

  async function onCropAndUpload() {
    if (!sourceImage || !token) return;

    setLoading(true);
    setError("");
    try {
      const croppedFile = await buildCroppedFile(sourceImage, kind, zoom, offsetX, offsetY);
      const result = await uploadImage(token, kind, croppedFile);
      onUploaded(result.file_url);
      URL.revokeObjectURL(sourceImage);
      setSourceImage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر رفع الصورة");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-stone-700">{label}</label>
      <input
        type="file"
        accept="image/*"
        className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-4 outline-none file:ml-4 file:rounded-xl file:border-0 file:bg-orange-100 file:px-3 file:py-2 file:font-bold file:text-orange-800"
        onChange={onFileSelect}
      />

      {(sourceImage || value) ? (
        <div className="space-y-3 rounded-[1.5rem] border border-orange-200 bg-white p-4">
          <div className="overflow-hidden rounded-[1.25rem] border border-orange-100 bg-stone-100 bg-no-repeat" style={previewStyle} />

          {sourceImage ? (
            <>
              <div className="grid gap-3 md:grid-cols-3">
                <label className="space-y-2 text-sm font-medium text-stone-700">
                  <span>تكبير وتصغير</span>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-stone-700">
                  <span>تحريك أفقي</span>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    value={offsetX}
                    onChange={(e) => setOffsetX(clamp(Number(e.target.value), -180, 180))}
                    className="w-full"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-stone-700">
                  <span>تحريك عمودي</span>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    value={offsetY}
                    onChange={(e) => setOffsetY(clamp(Number(e.target.value), -180, 180))}
                    className="w-full"
                  />
                </label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onCropAndUpload}
                  disabled={loading}
                  className="rounded-2xl bg-terracotta px-4 py-3 font-bold text-white disabled:opacity-60"
                >
                  {loading ? "جارٍ رفع الصورة..." : "قص ورفع الصورة"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(sourceImage);
                    setSourceImage("");
                    setZoom(1);
                    setOffsetX(0);
                    setOffsetY(0);
                  }}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 font-bold text-stone-700"
                >
                  إلغاء التعديل
                </button>
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {loading ? <p className="text-sm text-stone-500">جارٍ تجهيز الصورة...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
