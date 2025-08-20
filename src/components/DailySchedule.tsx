import React from "react";
import { isHoliday } from "japanese-holidays";
import type { DaySchedule } from "../types";

interface DailyScheduleProps {
  schedule: DaySchedule[];
}

export const DailySchedule: React.FC<DailyScheduleProps> = ({ schedule }) => {
  const getLabelColor = (label: DaySchedule["label"]) => {
    switch (label) {
      case "very-harsh":
        return "bg-red-100 border-red-500 text-red-900";
      case "harsh":
        return "bg-orange-100 border-orange-500 text-orange-900";
      case "high":
        return "bg-yellow-100 border-yellow-500 text-yellow-900";
      case "moderate":
        return "bg-blue-100 border-blue-500 text-blue-900";
      case "light":
        return "bg-green-100 border-green-500 text-green-900";
      case "very-light":
        return "bg-gray-100 border-gray-500 text-gray-900";
      default:
        return "bg-gray-100 border-gray-500 text-gray-900";
    }
  };

  const getLabelText = (label: DaySchedule["label"]) => {
    switch (label) {
      case "very-harsh":
        return "修羅場";
      case "harsh":
        return "缶詰め";
      case "high":
        return "高負荷";
      case "moderate":
        return "中程度";
      case "light":
        return "軽め";
      case "very-light":
        return "とても軽い";
      default:
        return label;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    const holiday = isHoliday(date);
    const baseFormat = `${date.getMonth() + 1}/${date.getDate()} (${weekdays[date.getDay()]})`;
    return holiday ? `${baseFormat} ${holiday}` : baseFormat;
  };

  const getPanelBadges = (panels: DaySchedule["panels"]) => {
    return panels
      .slice()
      .reverse()
      .map((panel) => {
        const pageMatch = panel.pageId.match(/page-(\d+)/);
        const panelMatch = panel.id.match(/panel-(\d+)/);

        if (pageMatch && panelMatch) {
          const pageNum = pageMatch[1];
          const panelNum = panelMatch[1];
          return {
            label: `${panel.size}: ${pageNum}-${panelNum}`,
            size: panel.size,
          };
        }
        return { label: panel.size, size: panel.size };
      });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">日別スケジュール</h2>

      <div className="space-y-2">
        {schedule.map((day, index) => {
          const panelBadges = getPanelBadges(day.panels);
          const hasWork = day.usedMinutes > 0;

          return (
            <div
              key={index}
              className={`p-3 rounded-lg border-l-4 ${getLabelColor(day.label)} ${
                !hasWork ? "opacity-50" : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-sm">{formatDate(day.date)}</span>
                  {hasWork && (
                    <>
                      <span className="text-sm font-bold">
                        {(day.usedMinutes / 60).toFixed(1)}h
                      </span>
                      <div className="flex gap-1 flex-wrap text-xs">
                        {panelBadges.map((badge, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-1 rounded ${
                              badge.size === "L"
                                ? "bg-red-200 text-red-800"
                                : badge.size === "M"
                                  ? "bg-yellow-200 text-yellow-800"
                                  : "bg-green-200 text-green-800"
                            }`}
                          >
                            {badge.label}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {hasWork && (
                  <span className="text-xs font-medium px-2 py-1 bg-white/50 rounded">
                    {getLabelText(day.label)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
