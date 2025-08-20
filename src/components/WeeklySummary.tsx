import React from "react";
import type { WeekSummary } from "../types";

interface WeeklySummaryProps {
  summaries: WeekSummary[];
}

export const WeeklySummary: React.FC<WeeklySummaryProps> = ({ summaries }) => {
  const getLabelColor = (label: string) => {
    switch (label) {
      case "very-harsh":
        return "bg-red-600 text-white";
      case "harsh":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "moderate":
        return "bg-yellow-500 text-white";
      case "light":
        return "bg-green-500 text-white";
      case "very-light":
        return "bg-green-400 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getLabelText = (label: string) => {
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
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">週次サマリ</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                週
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                総時間
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                平日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                週末
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                最大日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SML
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                体感
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {summaries.map((summary, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatDate(summary.weekStart)} - {formatDate(summary.weekEnd)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {summary.totalHours.toFixed(1)}h
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {summary.weekdayHours.toFixed(1)}h
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {summary.weekendHours.toFixed(1)}h
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {summary.maxDayHours.toFixed(1)}h
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  S:{summary.panelCounts.S} M:{summary.panelCounts.M} L:{summary.panelCounts.L}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getLabelColor(
                      summary.peakLabel,
                    )}`}
                  >
                    {getLabelText(summary.peakLabel)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {summaries.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">総作業時間</p>
            <p className="text-2xl font-bold text-blue-800">
              {summaries.reduce((sum, s) => sum + s.totalHours, 0).toFixed(1)}h
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">平均週間時間</p>
            <p className="text-2xl font-bold text-green-800">
              {(summaries.reduce((sum, s) => sum + s.totalHours, 0) / summaries.length).toFixed(1)}h
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-600 font-medium">最大日時間</p>
            <p className="text-2xl font-bold text-orange-800">
              {Math.max(...summaries.map((s) => s.maxDayHours)).toFixed(1)}h
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
