"use client";

import { useState } from "react";
import ImageUpload from "./ImageUpload";
import CommentSection from "./CommentSection";
import HistoryWriting from "./HistoryWriting";

interface Image {
  id: string;
  file_path: string;
  file_name: string;
  taken_date: string;
  uploaded_by: string;
  description: string;
  created_at: string;
}

interface DayContentProps {
  date: string;
  images: Image[];
  isAdmin: boolean;
}

export default function DayContent({ date, images: initialImages, isAdmin }: DayContentProps) {
  const [images, setImages] = useState<Image[]>(initialImages);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");

  function refreshImages() {
    fetch(`/api/images?date=${date}`)
      .then((r) => r.json())
      .then((data) => setImages(data.images || []))
      .catch(console.error);
  }

  async function handleDateCorrection(imageId: string) {
    if (!newDate) return;
    const res = await fetch(`/api/images/${imageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taken_date: newDate }),
    });
    if (res.ok) {
      setEditingDate(null);
      setNewDate("");
      refreshImages();
    }
  }

  async function handleDeleteImage(imageId: string) {
    if (!confirm("确认删除这张图片？")) return;
    const res = await fetch(`/api/images/${imageId}`, { method: "DELETE" });
    if (res.ok) refreshImages();
  }

  return (
    <div className="space-y-6">
      {/* Image upload for this date */}
      <div className="bg-white rounded-xl shadow border border-amber-200 p-4">
        <h2 className="text-sm font-medium text-amber-900 mb-3">上传图片到这一天</h2>
        <ImageUpload defaultDate={date} onUploaded={refreshImages} />
      </div>

      {/* Image grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((img) => (
            <div key={img.id} className="bg-white rounded-xl shadow border border-amber-200 overflow-hidden">
              <a href={img.file_path} target="_blank" rel="noopener noreferrer">
                <img
                  src={img.file_path}
                  alt={img.file_name}
                  className="w-full h-48 object-cover"
                />
              </a>
              <div className="p-3 space-y-2">
                <p className="text-xs text-gray-400 truncate">{img.file_name}</p>
                <p className="text-xs text-gray-500">上传者: {img.uploaded_by}</p>

                {/* Date correction */}
                {editingDate === img.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="text-xs border border-gray-300 rounded px-1 py-0.5 flex-1"
                    />
                    <button
                      onClick={() => handleDateCorrection(img.id)}
                      className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded"
                    >
                      确认
                    </button>
                    <button
                      onClick={() => setEditingDate(null)}
                      className="text-xs text-gray-400"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingDate(img.id);
                      setNewDate(img.taken_date);
                    }}
                    className="text-xs text-amber-600 hover:text-amber-800"
                  >
                    修正日期
                  </button>
                )}

                {isAdmin && (
                  <button
                    onClick={() => handleDeleteImage(img.id)}
                    className="text-xs text-red-400 hover:text-red-600 block"
                  >
                    删除图片
                  </button>
                )}

                {/* Image comments */}
                <CommentSection date={date} imageId={img.id} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow border border-amber-200 p-8 text-center">
          <p className="text-gray-400 text-sm">这一天还没有图片</p>
        </div>
      )}

      {/* Date-level comments */}
      <div className="bg-white rounded-xl shadow border border-amber-200 p-4">
        <CommentSection date={date} />
      </div>

      {/* History writing */}
      <div className="bg-white rounded-xl shadow border border-amber-200 p-4">
        <HistoryWriting date={date} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
