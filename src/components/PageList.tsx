import React from "react";
import type { Page, PanelSize } from "../types";

interface PageListProps {
  pages: Page[];
  onPageUpdate: (page: Page) => void;
}

export const PageList: React.FC<PageListProps> = ({ pages, onPageUpdate }) => {
  // デバッグ情報を計算
  const debugInfo = React.useMemo(() => {
    const allPanels = pages.flatMap((page) => page.panels);
    const sCount = allPanels.filter((p) => p.size === "S").length;
    const mCount = allPanels.filter((p) => p.size === "M").length;
    const lCount = allPanels.filter((p) => p.size === "L").length;
    return { s: sCount, m: mCount, l: lCount };
  }, [pages]);
  const handlePanelSizeChange = (page: Page, panelIndex: number, newSize: PanelSize) => {
    const updatedPage = {
      ...page,
      panels: page.panels.map((panel, idx) =>
        idx === panelIndex ? { ...panel, size: newSize } : panel,
      ),
    };
    onPageUpdate(updatedPage);
  };

  const getPanelSizeColor = (size: PanelSize) => {
    switch (size) {
      case "L":
        return "bg-red-100 text-red-800";
      case "M":
        return "bg-yellow-100 text-yellow-800";
      case "S":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">ページ一覧</h2>
        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
          生成パネル: S={debugInfo.s}, M={debugInfo.m}, L={debugInfo.l}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ページ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                コマ数
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                パネル評価
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                推定時間 (分)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {page.number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {page.panels.length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-1">
                    {page.panels.map((panel, idx) => (
                      <select
                        key={panel.id}
                        value={panel.size}
                        onChange={(e) =>
                          handlePanelSizeChange(page, idx, e.target.value as PanelSize)
                        }
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getPanelSizeColor(
                          panel.size,
                        )}`}
                      >
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                      </select>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {page.panels.reduce((sum, panel) => sum + panel.estimatedMinutes, 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>ヒント:</strong> 各パネルのサイズをクリックして手動で調整できます。
          変更は即座にスケジュールに反映されます。
        </p>
      </div>
    </div>
  );
};
