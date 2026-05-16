"use client";

import { useState, useEffect } from "react";

interface HistoryEntry {
  id: string;
  author: string;
  content: string;
  created_at: string;
}

interface HistoryWritingProps {
  date: string;
  isAdmin: boolean;
}

export default function HistoryWriting({ date, isAdmin }: HistoryWritingProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchEntries = () => {
    fetch(`/api/history?date=${date}`)
      .then((r) => r.json())
      .then((data) => setEntries(data.entries || []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchEntries();
  }, [date]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    const res = await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, content: content.trim() }),
    });

    setLoading(false);
    if (res.ok) {
      setContent("");
      fetchEntries();
    }
  }

  async function handleDelete(entryId: string) {
    if (!confirm("确认删除这条记录？")) return;
    await fetch(`/api/history/${entryId}`, { method: "DELETE" });
    fetchEntries();
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-amber-900 border-t border-amber-200 pt-3">
        📜 历史书写
      </h3>

      {entries.length > 0 && (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-amber-50/80 border-l-2 border-amber-400 pl-3 py-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-amber-800">
                  {entry.author} 记录
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {new Date(entry.created_at).toLocaleString("zh-CN", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{entry.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="写下你对这一天的回忆..."
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">
            你的书写将按时间顺序展示，不可修改
          </span>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="rounded-lg bg-amber-800 px-4 py-1.5 text-sm text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            写入历史
          </button>
        </div>
      </form>
    </div>
  );
}
