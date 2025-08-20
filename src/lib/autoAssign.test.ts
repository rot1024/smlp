import { describe, it, expect } from "vitest";
import { calculatePanelMinutes, createPagesFromSMLP } from "./autoAssign";
import type { TimeSettings, PanelSize } from "../types";

describe("calculatePanelMinutes", () => {
  const settings: TimeSettings = {
    S: 30,
    M: 60,
    L: 90,
  };

  it("Sサイズの時間を正しく計算する", () => {
    expect(calculatePanelMinutes("S", settings)).toBe(30);
  });

  it("Mサイズの時間を正しく計算する", () => {
    expect(calculatePanelMinutes("M", settings)).toBe(60);
  });

  it("Lサイズの時間を正しく計算する", () => {
    expect(calculatePanelMinutes("L", settings)).toBe(90);
  });

  it("Pの場合は0を返す", () => {
    expect(calculatePanelMinutes("P", settings)).toBe(0);
  });
});

describe("createPagesFromSMLP", () => {
  const settings: TimeSettings = {
    S: 30,
    M: 60,
    L: 90,
  };

  it("SMLP配列からページを正しく作成する", () => {
    const smlpPages = [
      ["M", "M", "L"],
      ["S", "S"],
    ];
    const result = createPagesFromSMLP(smlpPages as PanelSize[][], settings);

    expect(result).toHaveLength(2);
    expect(result[0].number).toBe(1);
    expect(result[0].panels).toHaveLength(3);
    // SMLP指定をそのまま使用
    expect(result[0].panels[0].size).toBe("M");
    expect(result[0].panels[0].estimatedMinutes).toBe(60);
    expect(result[0].panels[1].size).toBe("M");
    expect(result[0].panels[1].estimatedMinutes).toBe(60);
    expect(result[0].panels[2].size).toBe("L");
    expect(result[0].panels[2].estimatedMinutes).toBe(90);

    expect(result[1].number).toBe(2);
    expect(result[1].panels).toHaveLength(2);
    // SMLP指定をそのまま使用
    expect(result[1].panels[0].size).toBe("S");
    expect(result[1].panels[0].estimatedMinutes).toBe(30);
    expect(result[1].panels[1].size).toBe("S");
    expect(result[1].panels[1].estimatedMinutes).toBe(30);
  });

  it("空の配列を渡した場合は空の配列を返す", () => {
    const result = createPagesFromSMLP([], settings);
    expect(result).toEqual([]);
  });

  it("パネルのIDが正しく生成される", () => {
    const smlpPages = [["S", "M"]];
    const result = createPagesFromSMLP(smlpPages as PanelSize[][], settings);

    expect(result[0].id).toBe("page-1");
    expect(result[0].panels[0].id).toBe("page-1-panel-1");
    expect(result[0].panels[0].pageId).toBe("page-1");
    expect(result[0].panels[1].id).toBe("page-1-panel-2");
    expect(result[0].panels[1].pageId).toBe("page-1");
  });
});
