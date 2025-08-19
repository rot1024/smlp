import React from "react";
import type { DaySchedule } from "../types";

interface GanttChartProps {
  schedule: DaySchedule[];
}

export const GanttChart: React.FC<GanttChartProps> = ({ schedule }) => {
  const maxHours = 14;

  const getBarColor = (hours: number) => {
    if (hours >= 10) return "bg-red-500";
    if (hours >= 6) return "bg-orange-500";
    if (hours >= 4) return "bg-yellow-500";
    if (hours >= 2) return "bg-blue-500";
    if (hours >= 1) return "bg-green-500";
    return "bg-gray-400";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const getWeekNumber = (dateStr: string) => {
    const date = new Date(dateStr);
    const firstDay = new Date(schedule[0].date);
    const diffTime = Math.abs(date.getTime() - firstDay.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7) + 1;
  };

  // Group schedule by weeks
  const weeks: DaySchedule[][] = [];
  let currentWeek: DaySchedule[] = [];
  let lastWeekNumber = 0;

  schedule.forEach((day) => {
    const weekNumber = getWeekNumber(day.date);
    if (weekNumber !== lastWeekNumber && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
    lastWeekNumber = weekNumber;
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">ガントチャート</h2>

      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Hour scale header */}
          <div className="flex items-center mb-2 text-xs text-gray-600">
            <div className="w-20 shrink-0">週</div>
            <div className="flex-1 flex">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="flex-1 text-center border-l border-gray-300">
                  {i}h
                </div>
              ))}
            </div>
          </div>

          {/* Weekly rows */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="mb-4 border rounded-lg p-2 bg-white">
              <div className="text-sm font-medium text-gray-700 mb-2">
                第{weekIndex + 1}週 ({formatDate(week[0].date)} -{" "}
                {formatDate(week[week.length - 1].date)})
              </div>

              {week.map((day, dayIndex) => {
                const hours = day.usedMinutes / 60;
                const widthPercent = (hours / maxHours) * 100;
                const date = new Date(day.date);
                const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                return (
                  <div key={dayIndex} className="flex items-center mb-1">
                    <div
                      className={`w-20 shrink-0 text-xs ${isWeekend ? "text-red-600" : "text-gray-700"}`}
                    >
                      {formatDate(day.date)} ({weekdays[date.getDay()]})
                    </div>
                    <div className="flex-1 relative h-6 bg-gray-100 rounded">
                      {hours > 0 && (
                        <div
                          className={`absolute left-0 top-0 h-full rounded ${getBarColor(hours)}`}
                          style={{ width: `${Math.min(widthPercent, 100)}%` }}
                        >
                          <span className="text-xs text-white px-1">{hours.toFixed(1)}h</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Week total */}
              <div className="mt-2 pt-2 border-t text-sm font-medium text-gray-700">
                週合計: {week.reduce((sum, day) => sum + day.usedMinutes / 60, 0).toFixed(1)}h
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-green-500 rounded"></span>軽め (1-2h)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-blue-500 rounded"></span>中程度 (2-4h)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-yellow-500 rounded"></span>高負荷 (4-6h)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-orange-500 rounded"></span>缶詰め (6-10h)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 bg-red-500 rounded"></span>修羅場 (10h+)
        </span>
      </div>
    </div>
  );
};
