import type { PanelSize } from "../types";

export function parseSMLPString(input: string): PanelSize[][] {
  const cleaned = input
    .toUpperCase()
    .replace(/[^SMLP]/g, "")
    .trim();

  if (!cleaned) return [];

  const pages: PanelSize[][] = [];
  let currentPage: PanelSize[] = [];

  for (const char of cleaned) {
    if (char === "P") {
      if (currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [];
      }
    } else {
      currentPage.push(char as PanelSize);
    }
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
}

export function validateSMLPString(input: string): boolean {
  const cleaned = input.toUpperCase().replace(/[^SMLP]/g, "");
  return cleaned.length > 0 && /^[SMLP]+$/.test(cleaned);
}
