// Command Center Content Scheduling
// CC-FT-04: Wired to GET/POST /v1/publishing/* (calendar, schedule items)

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getPublishingCalendar,
  publishContent,
  type CalendarItem,
} from '@/services/command-center/publishing-api';

function getMonthRange(month: string) {
  const [y, m] = month.split('-').map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0);
  return {
    start_date: start.toISOString().slice(0, 10),
    end_date: end.toISOString().slice(0, 10),
  };
}

export function ContentScheduling() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [calendar, setCalendar] = useState<{ content: CalendarItem[]; ads: CalendarItem[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const fetchCalendar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const range = getMonthRange(currentMonth);
      const data = await getPublishingCalendar(range);
      setCalendar(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calendar');
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const handlePublish = async (id: string) => {
    setPublishingId(id);
    try {
      await publishContent(id);
      fetchCalendar();
    } catch (err) {
      console.error('Failed to publish:', err);
    } finally {
      setPublishingId(null);
    }
  };

  const prevMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const nextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m, 1);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const items = [...(calendar?.content ?? []), ...(calendar?.ads ?? [])];
  const byDate = items.reduce<Record<string, CalendarItem[]>>((acc, item) => {
    const date =
      item.scheduled_publish_at ?? item.scheduled_start_at ?? item.scheduled_end_at ?? '';
    const key = date.slice(0, 10);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const [year, month] = currentMonth.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Publishing Calendar
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          View scheduled items and publish content
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-lg font-medium min-w-[140px] text-center">
            {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`pad-${i}`} className="min-h-[100px] p-2 bg-gray-50 dark:bg-slate-800/50 rounded" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const key = `${currentMonth}-${String(day).padStart(2, '0')}`;
              const dayItems = byDate[key] ?? [];
              return (
                <div
                  key={day}
                  className="min-h-[100px] p-2 border rounded bg-white dark:bg-slate-800"
                >
                  <div className="text-sm font-medium mb-2">{day}</div>
                  <div className="space-y-1">
                    {dayItems.map((item) => (
                      <div
                        key={item.id}
                        className="text-xs p-2 rounded bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                      >
                        <div className="font-medium truncate">
                          {item.title ?? item.name ?? 'Untitled'}
                        </div>
                        <div className="text-gray-500">{item.type ?? item.platform}</div>
                        {item.status !== 'published' && (
                          <Button
                            size="sm"
                            className="mt-1 w-full"
                            onClick={() => handlePublish(item.id)}
                            disabled={publishingId === item.id}
                          >
                            {publishingId === item.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Send className="w-3 h-3 mr-1" />
                                Publish
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
