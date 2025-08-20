import React, { useState } from "react";
import type { ProjectSettings, TimeSettings } from "../types";
import { convertNumbersToSMLP, isNumericOnly } from "../lib/numberToSMLP";

interface InputFormProps {
  onSubmit: (settings: ProjectSettings) => void;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit }) => {
  const [smlpString, setSmlpString] = useState("");
  const [timeSettings, setTimeSettings] = useState<TimeSettings>({
    S: 30,
    M: 60,
    L: 90,
  });
  const [deadline, setDeadline] = useState("");
  const [startDate, setStartDate] = useState("");
  const [restDays, setRestDays] = useState<number[]>([]); // デフォルトは休日なし
  const [includeHolidays, setIncludeHolidays] = useState(true); // デフォルトで祝日を休日とする
  const [weekdayMaxHours, setWeekdayMaxHours] = useState(2); // 平日の最大作業時間
  const [weekendMaxHours, setWeekendMaxHours] = useState(4); // 休日の最大作業時間
  const [warmupFactor, setWarmupFactor] = useState(0.75);
  const [warmupDays, setWarmupDays] = useState(3);
  const [finalSprintEnabled, setFinalSprintEnabled] = useState(false);
  const [finalSprintDays, setFinalSprintDays] = useState(3);
  const [finalSprintMaxHours, setFinalSprintMaxHours] = useState(14);
  const [allowSplitPanels, setAllowSplitPanels] = useState(false);

  // 数字入力の場合の変換プレビュー
  const convertedPreview = React.useMemo(() => {
    if (isNumericOnly(smlpString.trim())) {
      return convertNumbersToSMLP(smlpString.trim());
    }
    return null;
  }, [smlpString]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 数字のみの入力の場合はSMLP文字列に変換
    const finalSmlpString = isNumericOnly(smlpString.trim())
      ? convertNumbersToSMLP(smlpString.trim())
      : smlpString;

    const settings: ProjectSettings = {
      smlpString: finalSmlpString,
      timeSettings,
      deadline,
      startDate: startDate || undefined,
      restDays,
      includeHolidays,
      weekdayMaxHours,
      weekendMaxHours,
      warmupFactor,
      warmupDays,
      finalSprintEnabled,
      finalSprintDays,
      finalSprintMaxHours,
      allowSplitPanels,
    };

    onSubmit(settings);
  };

  const loadSample = () => {
    setSmlpString("MMLMMPSMMSMMPLLSPMMSLLPSSSMMP");
    setDeadline(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div>
        <label htmlFor="smlp" className="block text-sm font-medium text-gray-700 mb-2">
          SMLP文字列 (必須)
        </label>
        <textarea
          id="smlp"
          value={smlpString}
          onChange={(e) => setSmlpString(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300"
          rows={3}
          placeholder="MMLMMPSMMSMMP... または 48421934824423..."
          required
        />
        <div className="mt-1 text-xs text-gray-500">
          ※数字のみ入力した場合、各数字をページあたりのコマ数として自動的にSMLP文字列に変換します
        </div>
        {convertedPreview && (
          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
            <div className="text-xs font-semibold text-blue-700 mb-1">変換後のSMLP文字列:</div>
            <div className="font-mono text-sm text-blue-900 break-all">{convertedPreview}</div>
          </div>
        )}
        <button
          type="button"
          onClick={loadSample}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          サンプルを読み込む
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
            締切日 (必須)
          </label>
          <input
            type="date"
            id="deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
            開始日 (任意)
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">S (分)</label>
          <input
            type="number"
            value={timeSettings.S}
            onChange={(e) => setTimeSettings({ ...timeSettings, S: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">M (分)</label>
          <input
            type="number"
            value={timeSettings.M}
            onChange={(e) => setTimeSettings({ ...timeSettings, M: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">L (分)</label>
          <input
            type="number"
            value={timeSettings.L}
            onChange={(e) => setTimeSettings({ ...timeSettings, L: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">平日最大作業時間</label>
          <input
            type="number"
            value={weekdayMaxHours}
            onChange={(e) => setWeekdayMaxHours(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="24"
            step="0.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">休日最大作業時間</label>
          <input
            type="number"
            value={weekendMaxHours}
            onChange={(e) => setWeekendMaxHours(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="24"
            step="0.5"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">オフ日</label>
        <div className="grid grid-cols-8 gap-1">
          {["日", "月", "火", "水", "木", "金", "土"].map((day, index) => (
            <label key={index} className="flex flex-col items-center">
              <input
                type="checkbox"
                checked={restDays.includes(index)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setRestDays([...restDays, index]);
                  } else {
                    setRestDays(restDays.filter((d) => d !== index));
                  }
                }}
                className="mb-1"
              />
              <span className="text-xs">{day}</span>
            </label>
          ))}
          <label className="flex flex-col items-center">
            <input
              type="checkbox"
              checked={restDays.includes(7)}
              onChange={(e) => {
                if (e.target.checked) {
                  setRestDays([...restDays, 7]);
                } else {
                  setRestDays(restDays.filter((d) => d !== 7));
                }
              }}
              className="mb-1"
            />
            <span className="text-xs">祝</span>
          </label>
        </div>
      </div>

      <details className="border-t pt-4">
        <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-4">
          詳細設定
        </summary>

        <div className="space-y-4">
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeHolidays}
                onChange={(e) => setIncludeHolidays(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">祝日を休日として扱う</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ウォームアップ係数
              </label>
              <input
                type="number"
                value={warmupFactor}
                onChange={(e) => setWarmupFactor(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0.1"
                max="1"
                step="0.05"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ウォームアップ日数
              </label>
              <input
                type="number"
                value={warmupDays}
                onChange={(e) => setWarmupDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={finalSprintEnabled}
                onChange={(e) => setFinalSprintEnabled(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">最終スプリントを有効化</span>
            </label>
          </div>

          {finalSprintEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最終スプリント日数
                </label>
                <input
                  type="number"
                  value={finalSprintDays}
                  onChange={(e) => setFinalSprintDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">最大作業時間</label>
                <input
                  type="number"
                  value={finalSprintMaxHours}
                  onChange={(e) => setFinalSprintMaxHours(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="24"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={allowSplitPanels}
                onChange={(e) => setAllowSplitPanels(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">パネルを日を跨いで分割可能</span>
            </label>
          </div>
        </div>
      </details>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        解析してプラン生成
      </button>
    </form>
  );
};
