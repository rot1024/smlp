import type { Page, Panel, PanelSize, TimeSettings } from "../types";


export function calculatePanelMinutes(size: PanelSize, settings: TimeSettings): number {
  if (size === "P") return 0;
  if (size === "S") return settings.S;
  if (size === "M") return settings.M;
  if (size === "L") return settings.L;
  return 0;
}

export function createPagesFromSMLP(smlpPages: PanelSize[][], settings: TimeSettings): Page[] {
  return smlpPages.map((pagePanels, index) => {
    const pageNumber = index + 1;

    const panels: Panel[] = pagePanels.map((size, panelIndex) => ({
      id: `page-${pageNumber}-panel-${panelIndex + 1}`,
      pageId: `page-${pageNumber}`,
      size,
      estimatedMinutes: calculatePanelMinutes(size, settings),
    }));

    return {
      id: `page-${pageNumber}`,
      number: pageNumber,
      panels,
    };
  });
}
