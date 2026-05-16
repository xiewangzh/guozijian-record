"use client";

import { useState, useEffect } from "react";

interface Comment {
  id: string;
  author: string;
  content: string;
  created_at: string;
  image_id: string | null;
}

interface CommentSectionProps {
  date: string;
  imageId?: string;
}

export default function CommentSection({ date, imageId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const label = imageId ? "对这张图片留言" : "对这一天留言";

  const fetchComments = () => {
    const params = new URLSearchParams({ date });
    if (imageId) params.set("imageId", imageId);
    fetch(`/api/comments?${params}`)
      .then((r) => r.json())
      .then((data) => setComments(data.comments || []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchComments();
  }, [date, imageId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, image_id: imageId || null, content: content.trim() }),
    });

    setLoading(false);
    if (res.ok) {
      setContent("");
      fetchComments();
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-amber-900">{label}</h3>

      {/* Existing comments */}
      {comments.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {comments.map((c) => (
            <div key={c.id} className="bg-amber-50 rounded-lg p-2.5 text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-amber-800 text-xs">{c.author}</span>
                <span className="text-xs text-gray-400">
                  {new Date(c.created_at).toLocaleString("zh-CN", {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-gray-700 text-sm">{c.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="写句留言..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="rounded-lg bg-amber-700 px-4 py-1.5 text-sm text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
        >
          发送
        </button>
      </form>
    </div>
  );
}
