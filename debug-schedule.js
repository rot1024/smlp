// デバッグ用スクリプト
import { parseSMLPString } from './src/lib/parser.js';
import { createPagesFromSMLP } from './src/lib/autoAssign.js';
import { schedulePages } from './src/lib/scheduler.js';

const smlpString = "MMLMMPSMMSMMPLLSP";
const settings = {
  smlpString,
  timeSettings: { S: 30, M: 60, L: 90 },
  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  weeklyRestDays: 2,
  dailyCapHours: 2,
  warmupFactor: 0.75,
  warmupDays: 3,
  finalSprintEnabled: false,
  finalSprintDays: 3,
  finalSprintMaxHours: 14,
  allowSplitPanels: true,
};

console.log("SMLP String:", smlpString);

const parsed = parseSMLPString(smlpString);
console.log("Parsed:", parsed);

const pages = createPagesFromSMLP(parsed, settings.timeSettings);
console.log("Pages created:", pages.length);

// 各ページのパネル詳細を表示
pages.forEach((page, idx) => {
  console.log(`Page ${idx + 1}:`);
  page.panels.forEach(panel => {
    console.log(`  ${panel.id}: ${panel.size} (${panel.estimatedMinutes}min)`);
  });
});

const schedule = schedulePages(pages, settings);
console.log("Schedule generated:", schedule.length, "days");

// スケジュール詳細を表示
schedule.forEach((day, idx) => {
  if (day.panels.length > 0) {
    console.log(`Day ${idx + 1} (${day.date}): ${day.usedMinutes}/${day.capacityMinutes}min`);
    day.panels.forEach(panel => {
      console.log(`  ${panel.id}: ${panel.size} (${panel.progressMinutes || panel.estimatedMinutes}min)`);
    });
  }
});

// S, M, Lのパネル数をカウント
const allPanels = pages.flatMap(page => page.panels);
const sCount = allPanels.filter(p => p.size === 'S').length;
const mCount = allPanels.filter(p => p.size === 'M').length;
const lCount = allPanels.filter(p => p.size === 'L').length;

console.log(`Total panels: S=${sCount}, M=${mCount}, L=${lCount}`);

// スケジュールに含まれるパネル数をカウント
const scheduledPanels = schedule.flatMap(day => day.panels);
const scheduledSCount = scheduledPanels.filter(p => p.size === 'S').length;
const scheduledMCount = scheduledPanels.filter(p => p.size === 'M').length;
const scheduledLCount = scheduledPanels.filter(p => p.size === 'L').length;

console.log(`Scheduled panels: S=${scheduledSCount}, M=${scheduledMCount}, L=${scheduledLCount}`);