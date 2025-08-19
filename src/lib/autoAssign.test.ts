import { describe, it, expect } from "vitest";
import { autoAssignPanelSizes, calculatePanelMinutes, createPagesFromSMLP } from "./autoAssign";
import type { TimeSettings, PanelSize } from "../types";

describe("autoAssignPanelSizes", () => {
  it("1コマの場合はLを割り当てる", () => {
    const result = autoAssignPanelSizes(1, 1);
    expect(result).toEqual(["L"]);
  });

  it("2コマの場合は1L+1Mを割り当てる", () => {
    const result = autoAssignPanelSizes(1, 2);
    expect(result).toEqual(["L", "M"]);
  });

  it("3コマの場合は1L+2Mを割り当てる", () => {
    const result = autoAssignPanelSizes(1, 3);
    expect(result).toEqual(["L", "M", "M"]);
  });

  it("4コマの場合は2M+2Sを割り当てる", () => {
    const result = autoAssignPanelSizes(1, 4);
    expect(result).toEqual(["M", "M", "S", "S"]);
  });

  it("5コマの場合は2M+3Sを割り当てる", () => {
    const result = autoAssignPanelSizes(1, 5);
    expect(result).toEqual(["M", "M", "S", "S", "S"]);
  });

  it("6コマ以上の場合は1M+残りSを割り当てる", () => {
    const result = autoAssignPanelSizes(1, 6);
    expect(result).toEqual(["M", "S", "S", "S", "S", "S"]);
  });

  it("既にSMLP指定がある場合はそれを優先する", () => {
    const result = autoAssignPanelSizes(1, 3, ["S", "L", "M"]);
    expect(result).toEqual(["S", "L", "M"]);
  });

  it("SMLP指定がコマ数と一致しない場合は自動割り当てする", () => {
    const result = autoAssignPanelSizes(1, 3, ["S", "L"]);
    expect(result).toEqual(["L", "M", "M"]);
  });
});

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
    // 自動割り当ての場合、3コマは1L+2Mになるが、既存のSMLP指定を優先
    expect(result[0].panels[0].size).toBe("M");
    expect(result[0].panels[0].estimatedMinutes).toBe(60);
    expect(result[0].panels[1].size).toBe("M");
    expect(result[0].panels[1].estimatedMinutes).toBe(60);
    expect(result[0].panels[2].size).toBe("L");
    expect(result[0].panels[2].estimatedMinutes).toBe(90);

    expect(result[1].number).toBe(2);
    expect(result[1].panels).toHaveLength(2);
    // 自動割り当ての場合、2コマは1L+1Mになるが、既存のSMLP指定を優先
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
