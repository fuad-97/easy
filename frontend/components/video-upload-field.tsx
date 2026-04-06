"use client";

import { useState } from "react";
import { assetUrl, uploadImage } from "@/lib/api";

export function VideoUploadField({
  token,
  label,
  value,
  onUploaded
}: {
  token: string;
  label: string;
  value?: string | null;
  onUploaded: (url: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-stone-700">{label}</label>
      <input
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-4 outline-none file:ml-4 file:rounded-xl file:border-0 file:bg-orange-100 file:px-3 file:py-2 file:font-bold file:text-orange-800"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file || !token) return;
          setLoading(true);
          setError("");
          try {
            const result = await uploadImage(token, "product-video", file);
            onUploaded(result.file_url);
          } catch (err) {
            setError(err instanceof Error ? err.message : "تعذر رفع الفيديو");
          } finally {
            setLoading(false);
          }
        }}
      />
      {loading ? <p className="text-sm text-stone-500">جارٍ رفع الفيديو...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {value ? (
        <video controls className="w-full rounded-[1.25rem] border border-orange-200 bg-black/90">
          <source src={assetUrl(value)} />
        </video>
      ) : null}
    </div>
  );
}
