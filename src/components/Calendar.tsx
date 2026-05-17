"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ImageInfo {
  id: string;
  file_path: string;
  taken_date: string;
}

interface DayData {
  [date: string]: ImageInfo[];
}

type ViewMode = "year" | "month" | "day";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

function generateYearRange(center: number): number[] {
  const start = center - 20;
  const result: number[] = [];
  for (let i = start; i <= center + 1; i++) result.push(i);
  return result;
}

export default function Calendar() {
  const today = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [dayData, setDayData] = useState<DayData>({});
  const [yearData, setYearData] = useState<DayData>({});
  const router = useRouter();

  const yearRange = generateYearRange(today.getFullYear());

  // Fetch data based on view
  useEffect(() => {
    if (viewMode === "year") {
      fetch(`/api/images?year=${selectedYear}&month=1`)
        .then(r => r.json())
        .then(data => {
          // Fetch all months for the year
          const promises = [];
          for (let m = 1; m <= 12; m++) {
            const mStr = String(m);
            promises.push(
              fetch(`/api/images?year=${selectedYear}&month=${mStr}`)
                .then(r => r.json())
                .then(d => ({ month: m, images: d.images || [] }))
            );
          }
          return Promise.all(promises);
        })
        .then(results => {
          const grouped: DayData = {};
          for (const { month, images } of results) {
            for (const img of images) {
              const d = img.taken_date;
              if (!grouped[d]) grouped[d] = [];
              grouped[d].push(img);
            }
          }
          setYearData(grouped);
        })
        .catch(console.error);
    } else {
      const yearStr = String(selectedYear);
      const monthStr = String(selectedMonth);
      fetch(`/api/images?year=${yearStr}&month=${monthStr}`)
        .then(r => r.json())
        .then(data => {
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
    }
  }, [viewMode, selectedYear, selectedMonth]);

  // Day view -> redirect
  const dayStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;

  return (
    <div className="space-y-4">
      {/* View Controls */}
      <div className="bg-white rounded-xl shadow border border-amber-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* View toggle */}
          <div className="flex bg-amber-100 rounded-lg p-0.5">
            {(["year", "month", "day"] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === mode
                    ? "bg-amber-900 text-white shadow"
                    : "text-amber-700 hover:bg-amber-200"
                }`}
              >
                {mode === "year" ? "年视图" : mode === "month" ? "月视图" : "日视图"}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-amber-200 hidden sm:block" />

          {/* Quick jump */}
          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="border border-amber-300 rounded px-2 py-1.5 text-sm focus:border-amber-500 focus:outline-none"
            >
              {yearRange.map(y => (
                <option key={y} value={y}>{y}年</option>
              ))}
            </select>

            {viewMode !== "year" && (
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(Number(e.target.value))}
                className="border border-amber-300 rounded px-2 py-1.5 text-sm focus:border-amber-500 focus:outline-none"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            )}

            {viewMode === "day" && (
              <input
                type="number"
                min={1}
                max={31}
                value={selectedDay}
                onChange={e => setSelectedDay(Math.min(31, Math.max(1, Number(e.target.value))))}
                className="w-16 border border-amber-300 rounded px-2 py-1.5 text-sm focus:border-amber-500 focus:outline-none"
                placeholder="日"
              />
            )}
          </div>

          <div className="flex-1" />

          <button
            onClick={() => {
              const t = new Date();
              setSelectedYear(t.getFullYear());
              setSelectedMonth(t.getMonth() + 1);
              setSelectedDay(t.getDate());
              setViewMode("month");
            }}
            className="text-sm bg-amber-800 text-white px-3 py-1.5 rounded hover:bg-amber-700 transition-colors"
          >
            回到今天
          </button>

          {viewMode === "day" && (
            <button
              onClick={() => router.push(`/day/${dayStr}`)}
              className="text-sm bg-amber-900 text-white px-3 py-1.5 rounded hover:bg-amber-800 transition-colors"
            >
              查看这一天 →
            </button>
          )}
        </div>
      </div>

      {/* Year View */}
      {viewMode === "year" && (
        <div className="bg-white rounded-xl shadow-lg border border-amber-200 p-6">
          <h2 className="text-xl font-bold text-amber-900 mb-4 text-center">{selectedYear}年</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => {
              const month = i + 1;
              const monthPrefix = `${selectedYear}-${String(month).padStart(2, "0")}`;
              const monthImages = Object.entries(yearData)
                .filter(([date]) => date.startsWith(monthPrefix))
                .flatMap(([, imgs]) => imgs);

              return (
                <div
                  key={month}
                  onClick={() => {
                    setSelectedMonth(month);
                    setViewMode("month");
                  }}
                  className="border border-amber-200 rounded-lg p-3 cursor-pointer hover:bg-amber-50 hover:border-amber-400 transition-colors text-center"
                >
                  <div className="text-sm font-medium text-amber-800 mb-2">{MONTHS[i]}</div>
                  {monthImages.length > 0 ? (
                    <div>
                      <div className="flex flex-wrap justify-center gap-0.5 mb-1">
                        {monthImages.slice(0, 6).map(img => (
                          <img
                            key={img.id}
                            src={img.file_path}
                            alt=""
                            className="w-8 h-8 object-cover rounded"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-amber-600">{monthImages.length}张</span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-300 py-4">暂无</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Month View */}
      {viewMode === "month" && (
        <div className="bg-white rounded-xl shadow-lg border border-amber-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-amber-900 text-white">
            <button
              onClick={() => {
                if (selectedMonth === 1) {
                  setSelectedYear(selectedYear - 1);
                  setSelectedMonth(12);
                } else {
                  setSelectedMonth(selectedMonth - 1);
                }
              }}
              className="hover:bg-amber-800 px-2 py-1 rounded text-sm"
            >
              ← 上月
            </button>
            <h2 className="text-xl font-bold">
              {selectedYear}年{selectedMonth}月
            </h2>
            <button
              onClick={() => {
                if (selectedMonth === 12) {
                  setSelectedYear(selectedYear + 1);
                  setSelectedMonth(1);
                } else {
                  setSelectedMonth(selectedMonth + 1);
                }
              }}
              className="hover:bg-amber-800 px-2 py-1 rounded text-sm"
            >
              下月 →
            </button>
          </div>

          <div className="grid grid-cols-7 border-b border-amber-100">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center py-2 text-xs font-medium text-amber-700 bg-amber-50">
                {d}
              </div>
            ))}
          </div>

          {(() => {
            const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
            const firstDayOfWeek = new Date(selectedYear, selectedMonth - 1, 1).getDay();
            const cells: React.ReactNode[] = [];

            for (let i = 0; i < firstDayOfWeek; i++) {
              cells.push(
                <div key={`empty-${i}`} className="border border-amber-50 bg-gray-50 min-h-24 p-1" />
              );
            }

            const todayStr = today.toISOString().slice(0, 10);

            for (let day = 1; day <= daysInMonth; day++) {
              const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const images = dayData[dateStr] || [];
              const isToday = dateStr === todayStr;

              cells.push(
                <div
                  key={day}
                  onClick={() => router.push(`/day/${dateStr}`)}
                  className={`border border-amber-50 min-h-24 p-1 cursor-pointer hover:bg-amber-50 transition-colors ${
                    isToday ? "bg-amber-100/50" : ""
                  }`}
                >
                  <div className={`text-xs font-medium mb-1 ${
                    isToday ? "text-amber-900 bg-amber-200 rounded-full w-5 h-5 flex items-center justify-center" : "text-gray-500"
                  }`}>
                    {day}
                  </div>
                  {images.length > 0 && (
                    <div className="flex flex-wrap gap-0.5">
                      {images.slice(0, 4).map(img => (
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
            }

            return <div className="grid grid-cols-7">{cells}</div>;
          })()}
        </div>
      )}

      {/* Day View - minimal preview, full detail on /day/[date] */}
      {viewMode === "day" && (
        <div className="bg-white rounded-xl shadow-lg border border-amber-200 p-6">
          <h2 className="text-xl font-bold text-amber-900 mb-4 text-center">
            {selectedYear}年{selectedMonth}月{selectedDay}日
          </h2>
          {dayData[dayStr] && dayData[dayStr].length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {dayData[dayStr].map(img => (
                <a key={img.id} href={img.file_path} target="_blank" rel="noopener noreferrer">
                  <img
                    src={img.file_path}
                    alt=""
                    className="w-full h-32 object-cover rounded-lg border border-amber-200 hover:shadow-md transition-shadow"
                  />
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">这一天还没有图片</div>
          )}
          <div className="text-center mt-4">
            <button
              onClick={() => router.push(`/day/${dayStr}`)}
              className="text-sm bg-amber-800 text-white px-4 py-2 rounded hover:bg-amber-700 transition-colors"
            >
              查看详情（含留言与历史书写）
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
