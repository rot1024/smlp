import { describe, it, expect } from "vitest";
import { parseSMLPString, validateSMLPString } from "./parser";

describe("parseSMLPString", () => {
  it("大文字のSMLP文字列を正しくパースする", () => {
    const result = parseSMLPString("MMLMMPSMMSMMP");
    expect(result).toEqual([
      ["M", "M", "L", "M", "M"],
      ["S", "M", "M", "S", "M", "M"],
    ]);
  });

  it("小文字のSMLP文字列を正しくパースする", () => {
    const result = parseSMLPString("mmlmmpsmmsmmp");
    expect(result).toEqual([
      ["M", "M", "L", "M", "M"],
      ["S", "M", "M", "S", "M", "M"],
    ]);
  });

  it("スペースを含むSMLP文字列を正しくパースする", () => {
    const result = parseSMLPString("MML MMP SMMS MMP");
    expect(result).toEqual([
      ["M", "M", "L", "M", "M"],
      ["S", "M", "M", "S", "M", "M"],
    ]);
  });

  it("カンマを含むSMLP文字列を正しくパースする", () => {
    const result = parseSMLPString("M,M,L,M,M,P,S,M,M,S,M,M,P");
    expect(result).toEqual([
      ["M", "M", "L", "M", "M"],
      ["S", "M", "M", "S", "M", "M"],
    ]);
  });

  it("様々な記号を含むSMLP文字列を正しくパースする", () => {
    const result = parseSMLPString("M-M-L-M-M-P S,M,M,S,M,M,P");
    expect(result).toEqual([
      ["M", "M", "L", "M", "M"],
      ["S", "M", "M", "S", "M", "M"],
    ]);
  });

  it("Pで終わらない文字列を正しくパースする", () => {
    const result = parseSMLPString("MMLMMPSMMSM");
    expect(result).toEqual([
      ["M", "M", "L", "M", "M"],
      ["S", "M", "M", "S", "M"],
    ]);
  });

  it("複数のPを含む文字列を正しくパースする", () => {
    const result = parseSMLPString("SPSMPLLP");
    expect(result).toEqual([["S"], ["S", "M"], ["L", "L"]]);
  });

  it("Pのみの文字列を正しくパースする", () => {
    const result = parseSMLPString("PPP");
    expect(result).toEqual([]);
  });

  it("空文字列の場合は空配列を返す", () => {
    const result = parseSMLPString("");
    expect(result).toEqual([]);
  });

  it("SMLP以外の文字のみの場合は空配列を返す", () => {
    const result = parseSMLPString("123,456");
    expect(result).toEqual([]);
  });

  it("日本語を含む文字列から正しくSMLPを抽出する", () => {
    const result = parseSMLPString("Sサイズ、Mサイズ、Lサイズ、Pページ");
    expect(result).toEqual([["S", "M", "L"]]);
  });
});

describe("validateSMLPString", () => {
  it("有効なSMLP文字列の場合trueを返す", () => {
    expect(validateSMLPString("SMLP")).toBe(true);
    expect(validateSMLPString("MMLMMPSMMSMMP")).toBe(true);
  });

  it("小文字を含む有効な文字列の場合trueを返す", () => {
    expect(validateSMLPString("smlp")).toBe(true);
    expect(validateSMLPString("mmlmmpsmmsmmp")).toBe(true);
  });

  it("スペースや記号を含む有効な文字列の場合trueを返す", () => {
    expect(validateSMLPString("S M L P")).toBe(true);
    expect(validateSMLPString("S,M,L,P")).toBe(true);
    expect(validateSMLPString("S-M-L-P")).toBe(true);
  });

  it("SMLP以外の文字のみの場合falseを返す", () => {
    expect(validateSMLPString("123")).toBe(false);
    expect(validateSMLPString("ABC")).toBe(false);
    expect(validateSMLPString("あいうえお")).toBe(false);
  });

  it("空文字列の場合falseを返す", () => {
    expect(validateSMLPString("")).toBe(false);
  });

  it("スペースのみの場合falseを返す", () => {
    expect(validateSMLPString("   ")).toBe(false);
  });
});
