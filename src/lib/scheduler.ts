import { isHoliday } from "japanese-holidays";
import type { Page, Panel, DaySchedule, ProjectSettings, WeekSummary } from "../types";

// Dayインターフェースは新しいスケジューリング方式では不要

function getDayOfWeek(date: Date): number {
  return date.getDay();
}

function getIsRestDay(date: Date, dayOfWeek: number, restDays: number[]): boolean {
  // 曜日チェック
  if (restDays.includes(dayOfWeek)) {
    return true;
  }

  // 祝日チェック（restDaysに7が含まれている場合）
  if (restDays.includes(7) && isHoliday(date)) {
    return true;
  }

  return false;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// 未使用関数を削除（新しい動的スケジューリング方式では不要）

function sortPanelsByPriority(pages: Page[]): Panel[] {
  // Sort pages by priority if specified
  const sortedPages = [...pages].sort((a, b) => {
    if (a.priority !== undefined && b.priority !== undefined) {
      return a.priority - b.priority;
    }
    return 0;
  });

  // Group panels by size: L -> M -> S (作業優先順序)
  const lPanels: Panel[] = [];
  const mPanels: Panel[] = [];
  const sPanels: Panel[] = [];

  for (const page of sortedPages) {
    for (const panel of page.panels) {
      if (panel.size === "L") lPanels.push(panel);
      else if (panel.size === "M") mPanels.push(panel);
      else if (panel.size === "S") sPanels.push(panel);
    }
  }

  // 作業優先順序: L→M→S（Lパネルを最優先で締切日近くに配置）
  return [...lPanels, ...mPanels, ...sPanels];
}

function calculateDayLabel(
  usedHours: number,
): "very-light" | "light" | "moderate" | "high" | "harsh" | "very-harsh" {
  if (usedHours >= 10) return "very-harsh";
  if (usedHours >= 6) return "harsh";
  if (usedHours >= 4) return "high";
  if (usedHours >= 2) return "moderate";
  if (usedHours >= 1) return "light";
  return "very-light";
}

export function schedulePages(pages: Page[], settings: ProjectSettings): DaySchedule[] {
  const panels = sortPanelsByPriority(pages);

  // 締切日から逆算するため、パネル配列を逆順にしてLパネルが締切日に近くなるようにする
  const reversedPanels = [...panels].reverse();

  // 締切日から実際にスケジューリングして必要な日付範囲を決定
  return scheduleFromDeadlineWithDynamicRange(reversedPanels, settings);
}

function scheduleFromDeadlineWithDynamicRange(
  panels: Panel[],
  settings: ProjectSettings,
): DaySchedule[] {
  const deadline = new Date(settings.deadline);
  const schedule: DaySchedule[] = [];
  const panelProgress = new Map<string, number>();
  let panelIndex = 0;
  const currentDate = new Date(deadline);
  let dayIndex = 0;

  // 開始日が指定されている場合は最大遡り日数を制限
  const maxDaysBack = settings.startDate
    ? Math.ceil(
        (deadline.getTime() - new Date(settings.startDate).getTime()) / (1000 * 60 * 60 * 24),
      ) + 1
    : 365; // 開始日未指定なら最大1年まで遡る

  // 締切日から逆算してスケジューリング
  while (panelIndex < panels.length && dayIndex < maxDaysBack) {
    const dayOfWeek = getDayOfWeek(currentDate);
    const isRestDay = getIsRestDay(currentDate, dayOfWeek, settings.restDays);

    // 作業容量を計算
    let capacityMinutes = 0;
    if (isRestDay) {
      capacityMinutes = 0;
    } else {
      // 平日か休日（土日・祝日）かで最大作業時間を決定
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isJapaneseHoliday = settings.includeHolidays && isHoliday(currentDate);

      if (isWeekend || isJapaneseHoliday) {
        // 休日（土日・祝日）の最大作業時間
        capacityMinutes = settings.weekendMaxHours * 60;
      } else {
        // 平日の最大作業時間
        capacityMinutes = settings.weekdayMaxHours * 60;
      }
    }

    // ウォームアップ係数は後で適用（現時点では総日数が不明なため）

    // 最終スプリント適用（オフ日でない場合のみ）
    if (!isRestDay && settings.finalSprintEnabled && dayIndex < settings.finalSprintDays) {
      capacityMinutes = settings.finalSprintMaxHours * 60;
    }

    const daySchedule: DaySchedule = {
      date: formatDate(currentDate),
      capacityMinutes,
      usedMinutes: 0,
      panels: [],
      label: "very-light" as const,
    };

    // この日に作業を配置
    while (panelIndex < panels.length && daySchedule.usedMinutes < capacityMinutes) {
      const panel = panels[panelIndex];
      const progress = panelProgress.get(panel.id) || 0;
      const remaining = panel.estimatedMinutes - progress;

      if (remaining <= 0) {
        panelIndex++;
        continue;
      }

      const available = capacityMinutes - daySchedule.usedMinutes;
      if (available <= 0) break;

      if (!settings.allowSplitPanels && remaining > available) {
        // パネル全体が入らない場合は次の日に
        break;
      }

      const take = Math.min(remaining, available);
      panelProgress.set(panel.id, progress + take);
      daySchedule.usedMinutes += take;
      daySchedule.panels.push({
        ...panel,
        progressMinutes: take,
      });

      if (progress + take >= panel.estimatedMinutes) {
        panelIndex++;
      }
    }

    daySchedule.label = calculateDayLabel(daySchedule.usedMinutes / 60);

    // すべての日をスケジュールに追加（オフ日も含める）
    schedule.unshift(daySchedule); // 配列の先頭に追加（時系列順にするため）

    // 次の日（前日）へ
    currentDate.setDate(currentDate.getDate() - 1);
    dayIndex++;
  }

  // ウォームアップ期間を適用（スケジューリング後に総日数が確定してから）
  if (settings.warmupDays > 0) {
    for (let i = 0; i < Math.min(settings.warmupDays, schedule.length); i++) {
      schedule[i].capacityMinutes = Math.round(schedule[i].capacityMinutes * settings.warmupFactor);
      // ラベルを再計算
      schedule[i].label = calculateDayLabel(schedule[i].usedMinutes / 60);
    }
  }

  // 配置順序を保持（締切日から逆算された優先順序）
  // Lパネルが締切日に近く、Sパネルが早い時期に配置される

  return schedule;
}

export function generateWeekSummaries(schedule: DaySchedule[]): WeekSummary[] {
  const summaries: WeekSummary[] = [];
  const weeks = new Map<string, DaySchedule[]>();

  // 日次スケジュールの実際の結果を元に週次集計
  for (const day of schedule) {
    const date = new Date(day.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = formatDate(weekStart);

    if (!weeks.has(weekKey)) {
      weeks.set(weekKey, []);
    }
    weeks.get(weekKey)!.push(day);
  }

  for (const [weekStart, days] of weeks) {
    const weekEnd = formatDate(addDays(new Date(weekStart), 6));
    let totalMinutes = 0;
    let weekdayMinutes = 0;
    let weekendMinutes = 0;
    let maxDayMinutes = 0;
    let peakLabel: "very-light" | "light" | "moderate" | "high" | "harsh" | "very-harsh" =
      "very-light";

    for (const day of days) {
      totalMinutes += day.usedMinutes;
      const date = new Date(day.date);
      const dayOfWeek = date.getDay();

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendMinutes += day.usedMinutes;
      } else {
        weekdayMinutes += day.usedMinutes;
      }

      if (day.usedMinutes > maxDayMinutes) {
        maxDayMinutes = day.usedMinutes;
        peakLabel = day.label; // 日次スケジュールで計算済みのラベルを使用
      }
    }

    // 新しいアルゴリズムでは作業がある日のみスケジュールに含まれるため、
    // 基本的に作業時間0の週は生まれないはずだが、念のため残しておく
    if (totalMinutes > 0) {
      summaries.push({
        weekStart,
        weekEnd,
        totalHours: totalMinutes / 60,
        weekdayHours: weekdayMinutes / 60,
        weekendHours: weekendMinutes / 60,
        maxDayHours: maxDayMinutes / 60,
        peakLabel,
      });
    }
  }

  return summaries.sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}
