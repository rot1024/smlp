import type { Page, Panel, PanelSize, TimeSettings } from "../types";

export function autoAssignPanelSizes(
  _pageNumber: number,
  panelCount: number,
  smlpPanels?: PanelSize[],
): PanelSize[] {
  // If SMLP string already specifies sizes, use them
  if (smlpPanels && smlpPanels.length === panelCount) {
    return smlpPanels;
  }

  // Auto-assign based on panel count
  if (panelCount === 1) {
    return ["L"];
  } else if (panelCount === 2 || panelCount === 3) {
    // One L, rest M
    const result: PanelSize[] = ["L"];
    for (let i = 1; i < panelCount; i++) {
      result.push("M");
    }
    return result;
  } else if (panelCount === 4 || panelCount === 5) {
    // Top 1-2 panels M, rest S
    const mCount = Math.min(2, Math.floor(panelCount / 2));
    const result: PanelSize[] = [];
    for (let i = 0; i < mCount; i++) {
      result.push("M");
    }
    for (let i = mCount; i < panelCount; i++) {
      result.push("S");
    }
    return result;
  } else {
    // 6+ panels: 1 M, rest S
    const result: PanelSize[] = ["M"];
    for (let i = 1; i < panelCount; i++) {
      result.push("S");
    }
    return result;
  }
}

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
    const panelSizes = autoAssignPanelSizes(pageNumber, pagePanels.length, pagePanels);

    const panels: Panel[] = panelSizes.map((size, panelIndex) => ({
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
