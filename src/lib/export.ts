import type { Project, DaySchedule, WeekSummary } from "../types";

export function exportToJSON(project: Project): string {
  return JSON.stringify(project, null, 2);
}

export function exportWeeklyCSV(summaries: WeekSummary[]): string {
  const headers = [
    "week_start",
    "week_end",
    "total_hours",
    "weekday_hours",
    "weekend_hours",
    "max_day",
    "S_count",
    "M_count",
    "L_count",
    "peak_label",
  ];
  const rows = summaries.map((s) => [
    s.weekStart,
    s.weekEnd,
    s.totalHours.toFixed(2),
    s.weekdayHours.toFixed(2),
    s.weekendHours.toFixed(2),
    s.maxDayHours.toFixed(2),
    s.panelCounts.S,
    s.panelCounts.M,
    s.panelCounts.L,
    s.peakLabel,
  ]);

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}

export function exportDailyCSV(schedule: DaySchedule[]): string {
  const headers = ["date", "used_hours", "panels_detail", "label"];
  const rows = schedule.map((d) => {
    // Format panel details with IDs - each panel with its size prefix
    const panelDetails = d.panels
      .map((panel) => {
        const pageMatch = panel.pageId.match(/page-(\d+)/);
        const panelMatch = panel.id.match(/panel-(\d+)/);
        if (pageMatch && panelMatch) {
          return `${panel.size}: ${pageMatch[1]}-${panelMatch[1]}`;
        }
        return panel.size;
      })
      .join(", ");

    return [d.date, (d.usedMinutes / 60).toFixed(2), `"${panelDetails || "-"}"`, d.label];
  });

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function saveToLocalStorage(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
    return false;
  }
}

export function loadFromLocalStorage(key: string): unknown | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error("Failed to load from localStorage:", e);
    return null;
  }
}

export function exportToImage(elementId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const element = document.getElementById(elementId);
    if (!element) {
      reject(new Error("Element not found"));
      return;
    }

    // Simple approach: use browser's print functionality
    window.print();
    resolve();
  });
}
