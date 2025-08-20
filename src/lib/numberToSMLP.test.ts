import { describe, it, expect } from "vitest";
import { convertNumbersToSMLP, isNumericOnly } from "./numberToSMLP";

describe("isNumericOnly", () => {
  it("数字のみの文字列の場合はtrueを返す", () => {
    expect(isNumericOnly("123")).toBe(true);
    expect(isNumericOnly("48421934824423")).toBe(true);
    expect(isNumericOnly("0")).toBe(true);
    expect(isNumericOnly("9999")).toBe(true);
  });

  it("空白がある場合はトリムして判定する", () => {
    expect(isNumericOnly(" 123 ")).toBe(true);
    expect(isNumericOnly("  456  ")).toBe(true);
  });

  it("数字以外が含まれる場合はfalseを返す", () => {
    expect(isNumericOnly("")).toBe(false);
    expect(isNumericOnly("123a")).toBe(false);
    expect(isNumericOnly("SMLP")).toBe(false);
    expect(isNumericOnly("12.3")).toBe(false);
    expect(isNumericOnly("12 3")).toBe(false);
    expect(isNumericOnly("abc")).toBe(false);
  });
});

describe("convertNumbersToSMLP", () => {
  it("数字以外が含まれる場合はそのまま返す", () => {
    expect(convertNumbersToSMLP("SMLPSML")).toBe("SMLPSML");
    expect(convertNumbersToSMLP("123abc")).toBe("123abc");
    expect(convertNumbersToSMLP("")).toBe("");
  });

  it("10コマ以上のページを0で囲んだ形式で正しく処理する", () => {
    // 0100 = 10コマ (2L + 5M + 3S)
    expect(convertNumbersToSMLP("0100")).toBe("LLMMMMMSSS");
    // 4 0120 3 = 4コマ、12コマ、3コマ
    expect(convertNumbersToSMLP("401203")).toBe("LLMMPLLMMMMMMMSSSSPLSM");
    // 0150 = 15コマ (3L + 9M + 3S)
    expect(convertNumbersToSMLP("0150")).toBe("LLLMMMMMMMMMSSS");
  });

  it("複数の10コマ以上のページを含む数字列を正しく処理する", () => {
    // 0100 0110 5 = 10コマ、11コマ、5コマ
    // 10: 2L + 5M + 3S = LLMMMMMSSS
    // P
    // 11: 2L + 6M + 3S = LLMMMMMMSSS
    // P
    // 5: 2L + 2M + 1S = LLMMS
    expect(convertNumbersToSMLP("010001105")).toBe("LLMMMMMSSSPLLMMMMMMSSSPLLMMS");
  });

  it("1コマのページはLに変換される", () => {
    expect(convertNumbersToSMLP("1")).toBe("L");
    expect(convertNumbersToSMLP("111")).toBe("LPLPL");
  });

  it("2コマのページはLLに変換される", () => {
    expect(convertNumbersToSMLP("2")).toBe("LL");
    expect(convertNumbersToSMLP("22")).toBe("LLPLL");
  });

  it("3コマのページはLSMに変換される", () => {
    expect(convertNumbersToSMLP("3")).toBe("LSM");
    expect(convertNumbersToSMLP("33")).toBe("LSMPLSM");
  });

  it("4コマのページはLLMMに変換される", () => {
    expect(convertNumbersToSMLP("4")).toBe("LLMM");
    expect(convertNumbersToSMLP("44")).toBe("LLMMPLLMM");
  });

  it("5コマのページはLLMMSに変換される", () => {
    expect(convertNumbersToSMLP("5")).toBe("LLMMS");
    expect(convertNumbersToSMLP("55")).toBe("LLMMSPLLMMS");
  });

  it("6コマのページはLLMMSSに変換される", () => {
    expect(convertNumbersToSMLP("6")).toBe("LLMMSS");
    expect(convertNumbersToSMLP("66")).toBe("LLMMSSPLLMMSS");
  });

  it("7コマのページはLLMMMSSに変換される", () => {
    expect(convertNumbersToSMLP("7")).toBe("LLMMMSS");
  });

  it("8コマのページはLLMMMMSSに変換される", () => {
    expect(convertNumbersToSMLP("8")).toBe("LLMMMMSS");
  });

  it("9コマのページはLLMMMMSSSに変換される", () => {
    expect(convertNumbersToSMLP("9")).toBe("LLMMMMSSS");
  });

  it("0はページ区切りのみとして扱われる", () => {
    expect(convertNumbersToSMLP("102")).toBe("LPPLL");
    expect(convertNumbersToSMLP("201")).toBe("LLPPL");
    expect(convertNumbersToSMLP("00")).toBe("P");
    expect(convertNumbersToSMLP("000")).toBe("PP");
  });

  it("複雑な数字列を正しく変換する", () => {
    // 4-8-4-2-1-9-3-4-8-2-4-4-2-3
    const expected = "LLMM" + "P" + // 4
                    "LLMMMMSS" + "P" + // 8
                    "LLMM" + "P" + // 4
                    "LL" + "P" + // 2
                    "L" + "P" + // 1
                    "LLMMMMSSS" + "P" + // 9
                    "LSM" + "P" + // 3
                    "LLMM" + "P" + // 4
                    "LLMMMMSS" + "P" + // 8
                    "LL" + "P" + // 2
                    "LLMM" + "P" + // 4
                    "LLMM" + "P" + // 4
                    "LL" + "P" + // 2
                    "LSM"; // 3
    expect(convertNumbersToSMLP("48421934824423")).toBe(expected);
  });

  it("各ページの最後以外にPが追加される", () => {
    expect(convertNumbersToSMLP("123")).toBe("LPLLPLSM");
    expect(convertNumbersToSMLP("321")).toBe("LSMPLLPL");
  });
});