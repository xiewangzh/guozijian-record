"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface ImageInfo {
  id: string;
  file_path: string;
  taken_date: string;
}

interface DayData {
  [date: string]: ImageInfo[];
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dayData, setDayData] = useState<DayData>({});
  const router = useRouter();
  const supabase = createClient();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const yearStr = String(year);
    const monthStr = String(month + 1);
    fetch(`/api/images?year=${yearStr}&month=${monthStr}`)
      .then((r) => r.json())
      .then((data) => {
        const grouped: DayData = {};
        if (data.images) {
          for (const img of data.images) {
            const d = img.taken_date;
            if (!grouped[d]) grouped[d] = [];
            grouped[d].push(img);
          }
        }
        setDayData(grouped);
      })
      .catch(console.error);
  }, [year, month]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="bg-white rounded-xl shadow-lg border border-amber-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-amber-900 text-white">
        <button onClick={prevMonth} className="hover:bg-amber-800 px-2 py-1 rounded text-sm">
          ← 上月
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">
            {year}年{month + 1}月
          </h2>
          <button onClick={goToToday} className="text-xs bg-amber-700 hover:bg-amber-600 px-2 py-1 rounded">
            今天
          </button>
        </div>
        <button onClick={nextMonth} className="hover:bg-amber-800 px-2 py-1 rounded text-sm">
          下月 →
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-amber-100">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center py-2 text-xs font-medium text-amber-700 bg-amber-50">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="border border-amber-50 bg-gray-50 min-h-24 p-1" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const images = dayData[dateStr] || [];
          const isToday = dateStr === new Date().toISOString().slice(0, 10);

          return (
            <div
              key={day}
              onClick={() => router.push(`/day/${dateStr}`)}
              className={`border border-amber-50 min-h-24 p-1 cursor-pointer hover:bg-amber-50 transition-colors ${
                isToday ? "bg-amber-100/50" : ""
              }`}
            >
              <div className={`text-xs font-medium mb-1 ${isToday ? "text-amber-900 bg-amber-200 rounded-full w-5 h-5 flex items-center justify-center" : "text-gray-500"}`}>
                {day}
              </div>
              {images.length > 0 && (
                <div className="flex flex-wrap gap-0.5">
                  {images.slice(0, 4).map((img) => (
                    <img
                      key={img.id}
                      src={img.file_path}
                      alt=""
                      className="w-8 h-8 object-cover rounded"
                    />
                  ))}
                  {images.length > 4 && (
                    <span className="text-xs text-amber-600 self-center ml-1">
                      +{images.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
