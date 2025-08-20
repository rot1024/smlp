import React, { useState } from "react";
import type { Project, DaySchedule, WeekSummary } from "../types";
import { exportToJSON, exportWeeklyCSV, exportDailyCSV, downloadFile } from "../lib/export";
import { exportToNotion } from "../lib/notionExport";

interface ExportButtonsProps {
  project: Project | null;
  schedule: DaySchedule[];
  weekSummaries: WeekSummary[];
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  project,
  schedule,
  weekSummaries,
}) => {
  const handleExportJSON = () => {
    if (!project) return;
    const json = exportToJSON(project);
    downloadFile(json, "smlp-project.json", "application/json");
  };

  const handleExportWeeklyCSV = () => {
    if (weekSummaries.length === 0) return;
    const csv = exportWeeklyCSV(weekSummaries);
    downloadFile(csv, "weekly-summary.csv", "text/csv");
  };

  const handleExportDailyCSV = () => {
    if (schedule.length === 0) return;
    const csv = exportDailyCSV(schedule);
    downloadFile(csv, "daily-schedule.csv", "text/csv");
  };

  const [copyButtonText, setCopyButtonText] = useState("Notion用コピー");

  const handleCopyForNotion = () => {
    if (weekSummaries.length === 0 || schedule.length === 0) return;

    const notionMarkdown = exportToNotion(weekSummaries, schedule);

    navigator.clipboard.writeText(notionMarkdown).then(
      () => {
        setCopyButtonText("コピーしました！");
        setTimeout(() => setCopyButtonText("Notion用コピー"), 2000);
      },
      () => {
        setCopyButtonText("コピー失敗");
        setTimeout(() => setCopyButtonText("Notion用コピー"), 2000);
      },
    );
  };

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <button
        onClick={handleExportJSON}
        disabled={!project}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        JSON出力
      </button>

      <button
        onClick={handleExportWeeklyCSV}
        disabled={weekSummaries.length === 0}
        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        週次CSV
      </button>

      <button
        onClick={handleExportDailyCSV}
        disabled={schedule.length === 0}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        日次CSV
      </button>

      <button
        onClick={handleCopyForNotion}
        disabled={weekSummaries.length === 0 || schedule.length === 0}
        className={`px-4 py-2 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
          copyButtonText === "コピーしました！"
            ? "bg-green-600 hover:bg-green-700"
            : copyButtonText === "コピー失敗"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-slate-700 hover:bg-slate-800"
        }`}
      >
        {copyButtonText}
      </button>
    </div>
  );
};
