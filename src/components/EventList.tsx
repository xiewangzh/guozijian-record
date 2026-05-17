"use client";

import { useState, useEffect } from "react";

interface Semester {
  id: string;
  name: string;
  sort_order: number;
}

interface EventEntry {
  id: string;
  event_id: string;
  author: string;
  content: string;
  created_at: string;
}

interface Event {
  id: string;
  semester_id: string;
  title: string;
  created_by: string;
  created_at: string;
  event_entries: EventEntry[];
}

interface Props {
  isAdmin: boolean;
}

export default function EventList({ isAdmin }: Props) {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [activeSemester, setActiveSemester] = useState<string>("");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [entryContents, setEntryContents] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/semesters")
      .then(r => r.json())
      .then(data => {
        setSemesters(data.semesters || []);
        if (data.semesters?.[0]) setActiveSemester(data.semesters[0].id);
      });
  }, []);

  useEffect(() => {
    if (!activeSemester) return;
    fetch(`/api/events?semester_id=${activeSemester}`)
      .then(r => r.json())
      .then(data => setEvents(data.events || []));
  }, [activeSemester]);

  async function createEvent() {
    if (!newEventTitle.trim()) return;
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ semester_id: activeSemester, title: newEventTitle.trim() }),
    });
    if (res.ok) {
      setNewEventTitle("");
      const data = await fetch(`/api/events?semester_id=${activeSemester}`).then(r => r.json());
      setEvents(data.events || []);
    }
  }

  async function deleteEvent(eventId: string) {
    if (!confirm("Confirm delete this event?")) return;
    await fetch(`/api/events/${eventId}`, { method: "DELETE" });
    setEvents(prev => prev.filter(e => e.id !== eventId));
  }

  async function addEntry(eventId: string) {
    const content = entryContents[eventId]?.trim();
    if (!content) return;
    const res = await fetch(`/api/events/${eventId}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      setEntryContents(prev => ({ ...prev, [eventId]: "" }));
      const data = await fetch(`/api/events?semester_id=${activeSemester}`).then(r => r.json());
      setEvents(data.events || []);
    }
  }

  async function deleteEntry(entryId: string, eventId: string) {
    if (!confirm("Confirm delete?")) return;
    await fetch(`/api/events/${eventId}/entries/${entryId}`, { method: "DELETE" });
    const data = await fetch(`/api/events?semester_id=${activeSemester}`).then(r => r.json());
    setEvents(data.events || []);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {semesters.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSemester(s.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSemester === s.id
                ? "bg-amber-900 text-white shadow"
                : "bg-white text-amber-700 border border-amber-200 hover:bg-amber-50"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {isAdmin && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newEventTitle}
            onChange={e => setNewEventTitle(e.target.value)}
            placeholder="Create new event..."
            className="flex-1 rounded-lg border border-amber-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
            onKeyDown={e => e.key === "Enter" && createEvent()}
          />
          <button
            onClick={createEvent}
            className="bg-amber-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700 transition-colors"
          >
            Add
          </button>
        </div>
      )}

      <div className="space-y-3">
        {events.length === 0 && (
          <div className="bg-white rounded-xl border border-amber-100 p-8 text-center">
            <p className="text-gray-400 text-sm">No events in this semester yet</p>
          </div>
        )}

        {events.map(event => (
          <div key={event.id} className="bg-white rounded-xl shadow border border-amber-200 overflow-hidden">
            <div
              onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
              className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-amber-50 transition-colors"
            >
              <div>
                <h3 className="font-bold text-amber-900">{event.title}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">Created by {event.created_by}</span>
                  <span className="text-xs text-gray-300">|</span>
                  <span className="text-xs text-gray-400">
                    {event.event_entries?.length || 0} records
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    onClick={e => { e.stopPropagation(); deleteEvent(event.id); }}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Delete
                  </button>
                )}
                <span className="text-amber-400 text-sm">
                  {expandedEvent === event.id ? "▲" : "▼"}
                </span>
              </div>
            </div>

            {expandedEvent === event.id && (
              <div className="border-t border-amber-100 px-5 py-4 space-y-3 bg-amber-50/30">
                {(event.event_entries || []).length === 0 && (
                  <p className="text-xs text-gray-400">No records yet. Share your memory!</p>
                )}

                {(event.event_entries || []).map(entry => (
                  <div key={entry.id} className="border-l-2 border-amber-300 pl-3 py-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-amber-800">{entry.author}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {new Date(entry.created_at).toLocaleString("zh-CN", {
                            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => deleteEntry(entry.id, event.id)}
                            className="text-xs text-red-400 hover:text-red-600"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{entry.content}</p>
                  </div>
                ))}

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={entryContents[event.id] || ""}
                    onChange={e => setEntryContents(prev => ({ ...prev, [event.id]: e.target.value }))}
                    placeholder="Write your memory..."
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-amber-500 focus:outline-none"
                    onKeyDown={e => e.key === "Enter" && addEntry(event.id)}
                  />
                  <button
                    onClick={() => addEntry(event.id)}
                    className="bg-amber-700 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-amber-600 transition-colors"
                  >
                    Record
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
