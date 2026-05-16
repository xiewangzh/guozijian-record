"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import exifr from "exifr";

interface ImageUploadProps {
  defaultDate?: string;
  onUploaded?: () => void;
}

export default function ImageUpload({ defaultDate, onUploaded }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<Array<{ file: File; date: string; url: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const items: Array<{ file: File; date: string; url: string }> = [];

    for (const file of files) {
      const url = URL.createObjectURL(file);
      let date = defaultDate || new Date().toISOString().slice(0, 10);

      try {
        const exifData = await exifr.parse(file, ["DateTimeOriginal"]);
        if (exifData?.DateTimeOriginal) {
          date = exifData.DateTimeOriginal.toISOString().slice(0, 10);
        }
      } catch {
        // EXIF 读取失败，用默认日期
      }

      items.push({ file, date, url });
    }

    setPreviews((prev) => [...prev, ...items]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function updateDate(index: number, newDate: string) {
    setPreviews((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], date: newDate };
      return updated;
    });
  }

  function removePreview(index: number) {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  }

  async function uploadAll() {
    if (previews.length === 0) return;
    setUploading(true);
    const supabase = createClient();

    for (const item of previews) {
      const ext = item.file.name.split(".").pop() || "jpg";
      const storagePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(storagePath, item.file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      const { data: urlData } = supabase.storage.from("images").getPublicUrl(storagePath);

      await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_path: urlData.publicUrl,
          file_name: item.file.name,
          taken_date: item.date,
        }),
      });
    }

    setPreviews([]);
    setUploading(false);
    if (onUploaded) {
      onUploaded();
    } else {
      window.location.reload();
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview list */}
      {previews.length > 0 && (
        <div className="space-y-2">
          {previews.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white border border-amber-200 rounded-lg p-2">
              <img src={item.url} alt="" className="w-16 h-16 object-cover rounded" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 truncate">{item.file.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <label className="text-xs text-gray-500">日期:</label>
                  <input
                    type="date"
                    value={item.date}
                    onChange={(e) => updateDate(i, e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-0.5 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={() => removePreview(i)}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={uploadAll}
            disabled={uploading}
            className="w-full rounded-lg bg-amber-800 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            {uploading ? "上传中..." : `上传 ${previews.length} 张图片`}
          </button>
        </div>
      )}

      {/* Select button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full rounded-lg border-2 border-dashed border-amber-300 py-3 text-sm text-amber-600 hover:border-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
      >
        + 选择图片
      </button>
    </div>
  );
}
