export type PanelSize = "S" | "M" | "L" | "P";

export interface TimeSettings {
  S: number;
  M: number;
  L: number;
}

export interface Panel {
  id: string;
  pageId: string;
  size: PanelSize;
  estimatedMinutes: number;
  progressMinutes?: number;
  note?: string;
}

export interface Page {
  id: string;
  number: number;
  panels: Panel[];
  note?: string;
  priority?: number;
}

export interface DaySchedule {
  date: string;
  capacityMinutes: number;
  usedMinutes: number;
  panels: Panel[];
  label: "very-light" | "light" | "moderate" | "high" | "harsh" | "very-harsh";
}

export interface WeekSummary {
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  weekdayHours: number;
  weekendHours: number;
  maxDayHours: number;
  peakLabel: string;
  panelCounts: {
    S: number;
    M: number;
    L: number;
  };
}

export interface ProjectSettings {
  smlpString: string;
  timeSettings: TimeSettings;
  deadline: string;
  restDays: number[]; // 曜日の配列 (0=日, 1=月, 2=火, 3=水, 4=木, 5=金, 6=土)
  includeHolidays: boolean; // 祝日を平日として扱うかどうか
  weekdayMaxHours: number; // 平日の最大作業時間
  weekendMaxHours: number; // 休日の最大作業時間（土日・祝日）
  warmupEnabled: boolean; // ウォームアップ期間を有効にするかどうか
  warmupFactor: number;
  warmupDays: number;
  finalSprintEnabled: boolean;
  finalSprintDays: number;
  finalSprintMaxHours: number;
  allowSplitPanels: boolean;
}

export interface Project {
  id: string;
  name: string;
  settings: ProjectSettings;
  pages: Page[];
  schedule?: DaySchedule[];
  weekSummaries?: WeekSummary[];
  createdAt: string;
  updatedAt: string;
}
