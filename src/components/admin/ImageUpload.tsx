"use client";

import { useRef, useState } from "react";

type Props = {
  name: string;
  defaultValue?: string | null;
  label?: string;
};

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export default function ImageUpload({ name, defaultValue, label = "Image" }: Props) {
  const [url, setUrl] = useState<string>(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function upload(file: File) {
    setErr(null);

    if (!file.type.startsWith("image/")) {
      setErr("Please choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setErr("Image must be 10MB or smaller.");
      return;
    }

    setBusy(true);
    try {
      // 1. Get signed params from server.
      const sigRes = await fetch("/api/admin/cloudinary/sign", { method: "POST" });
      if (!sigRes.ok) {
        const data = await sigRes.json().catch(() => null);
        throw new Error(data?.error ?? "Could not authorise upload");
      }
      const { cloudName, apiKey, timestamp, signature, folder } = await sigRes.json();

      // 2. Upload directly to Cloudinary.
      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", apiKey);
      fd.append("timestamp", String(timestamp));
      fd.append("signature", signature);
      fd.append("folder", folder);

      const upRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: fd }
      );
      if (!upRes.ok) {
        const data = await upRes.json().catch(() => null);
        throw new Error(data?.error?.message ?? "Upload failed");
      }
      const data = (await upRes.json()) as { secure_url: string };
      setUrl(data.secure_url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
    // reset so picking the same file again still fires onChange
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  return (
    <div className="block">
      <span className="text-sm font-semibold">{label}</span>

      {/* Hidden field consumed by the parent form via FormData */}
      <input type="hidden" name={name} value={url} />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={
          "mt-1 rounded-xl border-2 border-dashed p-4 transition " +
          (dragOver
            ? "border-slate-500 bg-slate-100"
            : "border-slate-300 bg-slate-50")
        }
      >
        {url ? (
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="Uploaded preview"
              className="w-32 h-32 object-cover rounded-lg ring-1 ring-slate-200 bg-white"
            />
            <div className="flex-1 min-w-0 w-full">
              <div
                className="text-xs text-slate-500 truncate"
                title={url}
              >
                {url}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={busy}
                  className="btn-outline px-3 py-1.5 text-xs"
                >
                  {busy ? "Uploading..." : "Replace"}
                </button>
                <button
                  type="button"
                  onClick={() => setUrl("")}
                  className="btn-outline px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="btn-primary"
            >
              {busy ? "Uploading..." : "Upload image"}
            </button>
            <p className="text-xs text-slate-500 mt-2">
              or drag &amp; drop · JPG/PNG/WebP up to 10 MB
            </p>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />
      </div>

      {/* Manual URL fallback */}
      <label className="block mt-2">
        <span className="text-xs text-slate-500">Or paste an image URL</span>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="input mt-1"
        />
      </label>

      {err && (
        <div className="mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {err}
        </div>
      )}
    </div>
  );
}
