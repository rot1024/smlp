import type { DaySchedule, WeekSummary } from "../types";

export function exportToNotion(weekSummaries: WeekSummary[], schedule: DaySchedule[]): string {
  let markdown = "# 週次工程表\n\n";

  // 週次サマリテーブル
  markdown += "## 週次サマリ\n\n";
  markdown += "| 週 | 総時間 | 平日 | 週末 | 最大日 | SML | 体感 |\n";
  markdown += "|---|---|---|---|---|---|---|\n";

  weekSummaries.forEach((week) => {
    const weekStart = new Date(week.weekStart);
    const weekEnd = new Date(week.weekEnd);
    const weekLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${
      weekEnd.getMonth() + 1
    }/${weekEnd.getDate()}`;
    const peakLabel = getPeakLabelText(week.peakLabel);
    const smlCount = `S:${week.panelCounts.S} M:${week.panelCounts.M} L:${week.panelCounts.L}`;

    markdown += `| ${weekLabel} | ${week.totalHours.toFixed(1)}h | ${week.weekdayHours.toFixed(
      1,
    )}h | ${week.weekendHours.toFixed(1)}h | ${week.maxDayHours.toFixed(1)}h | ${smlCount} | ${peakLabel} |\n`;
  });

  markdown += "\n";

  // 統計情報
  const totalHours = weekSummaries.reduce((sum, s) => sum + s.totalHours, 0);
  const avgWeeklyHours = totalHours / weekSummaries.length;
  const maxDayHours = Math.max(...weekSummaries.map((s) => s.maxDayHours));

  markdown += "### 統計\n\n";
  markdown += `- **総作業時間**: ${totalHours.toFixed(1)}h\n`;
  markdown += `- **平均週間時間**: ${avgWeeklyHours.toFixed(1)}h\n`;
  markdown += `- **最大日時間**: ${maxDayHours.toFixed(1)}h\n\n`;

  // 日別スケジュール（テーブル形式）
  markdown += "## 日別スケジュール\n\n";
  markdown += "| 日付 | 作業時間 | 内容 | 体感 |\n";
  markdown += "|---|---|---|---|\n";

  schedule.forEach((day) => {
    const date = new Date(day.date);
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    const dateStr = `${date.getMonth() + 1}/${date.getDate()} (${weekdays[date.getDay()]})`;
    const hours = day.usedMinutes > 0 ? `${(day.usedMinutes / 60).toFixed(1)}h` : "休日";

    const panelInfo = day.usedMinutes > 0 ? formatPanelDetails(day.panels) : "";
    const label = day.usedMinutes > 0 ? getLabelText(day.label) : "-";

    markdown += `| ${dateStr} | ${hours} | ${panelInfo || "-"} | ${label} |\n`;
  });

  return markdown;
}

function getLabelText(label: DaySchedule["label"]): string {
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
}

function getPeakLabelText(label: string): string {
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
}

function formatPanelDetails(panels: DaySchedule["panels"]): string {
  const panelList: string[] = [];

  panels.forEach((panel) => {
    // Extract page number and panel number from IDs like "page-1-panel-2"
    const pageMatch = panel.pageId.match(/page-(\d+)/);
    const panelMatch = panel.id.match(/panel-(\d+)/);
    if (pageMatch && panelMatch) {
      const pageNum = pageMatch[1];
      const panelNum = panelMatch[1];
      panelList.push(`${panel.size}: ${pageNum}-${panelNum}`);
    }
  });

  return panelList.join(", ");
}
