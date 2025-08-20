import type { PanelSize } from "../types";

/**
 * 数字文字列をSMLP文字列に変換する
 * 各数字は1ページあたりのコマ数を表す
 * 10以上のコマ数は0で囲む (例: "0100" = 10コマ)
 * @param input 数字のみの文字列 (例: "48421934824423" または "4801004234")
 * @returns SMLP文字列
 */
export function convertNumbersToSMLP(input: string): string {
  // 数字のみかチェック
  if (!/^\d+$/.test(input)) {
    return input; // 数字以外が含まれている場合はそのまま返す
  }

  const panelCounts: number[] = [];
  let i = 0;

  while (i < input.length) {
    if (input[i] === "0") {
      // Try to parse 0XXX0 format for 10+ panels
      // Need to find the LAST 0 in a sequence to get the full number

      if (i + 3 <= input.length && input[i + 1] !== "0") {
        // Could be 0XXX0 format

        // Scan from current position to find extent of this number
        // For "0100", we want to extract "10"
        // For "01020", we want to extract "102"

        // Simple approach: if we have 0DDD0 pattern where DDD is 2+ chars
        let j = i + 1;
        let numStr = "";

        // Scan forward to find all the content before the final 0(s)
        // Look for pattern: current is 0, then non-zeros, then 0
        while (j < input.length) {
          if (input[j] === "0") {
            // Found a 0 - could be end delimiter or part of number
            // If numStr has 2+ chars already, treat this as end delimiter
            if (numStr.length >= 2) {
              break;
            }
            // If numStr has <2 chars, include the 0 in the number
            numStr += input[j];
            j++;
          } else {
            numStr += input[j];
            j++;
          }
        }

        // Check if we have a valid pattern
        if (numStr.length >= 2 && j < input.length && input[j] === "0") {
          // Valid 0XXX0 pattern - parse the number
          if (/^\d+$/.test(numStr)) {
            panelCounts.push(parseInt(numStr, 10));
            i = j + 1;
          } else {
            panelCounts.push(0);
            i++;
          }
        } else {
          panelCounts.push(0);
          i++;
        }
      } else {
        // Page separator
        panelCounts.push(0);
        i++;
      }
    } else {
      // Regular single digit (1-9)
      panelCounts.push(parseInt(input[i], 10));
      i++;
    }
  }

  const result: string[] = [];

  panelCounts.forEach((panelCount, pageIndex) => {
    if (panelCount === 0) {
      // 0の場合はページ区切りのみ
      if (pageIndex < panelCounts.length - 1) {
        result.push("P");
      }
      return;
    }

    // ページ内のコマサイズを自動割り当て
    const sizes = assignPanelSizes(panelCount);
    result.push(...sizes);

    // 最後のページ以外はPを追加
    if (pageIndex < panelCounts.length - 1) {
      result.push("P");
    }
  });

  return result.join("");
}

/**
 * コマ数に応じて自動的にS/M/Lを割り当てる
 * @param count コマ数
 * @returns サイズの配列
 */
function assignPanelSizes(count: number): PanelSize[] {
  const sizes: PanelSize[] = [];

  if (count === 1) {
    // 1コマの場合はL
    return ["L"];
  } else if (count === 2) {
    // 2コマの場合はLL
    return ["L", "L"];
  } else if (count === 3) {
    // 3コマの場合はLSM
    return ["L", "S", "M"];
  } else if (count === 4) {
    // 4コマの場合はLLMM
    return ["L", "L", "M", "M"];
  } else if (count === 5) {
    // 5コマの場合はLLMMS
    return ["L", "L", "M", "M", "S"];
  } else if (count === 6) {
    // 6コマの場合はLLMMSS
    return ["L", "L", "M", "M", "S", "S"];
  } else if (count === 7) {
    // 7コマの場合はLLMMMSS
    return ["L", "L", "M", "M", "M", "S", "S"];
  } else if (count === 8) {
    // 8コマの場合はLLMMMMSS
    return ["L", "L", "M", "M", "M", "M", "S", "S"];
  } else if (count === 9) {
    // 9コマの場合はLLMMMMSSS
    return ["L", "L", "M", "M", "M", "M", "S", "S", "S"];
  } else if (count === 10) {
    // 10コマの場合はLLMMMMMSSS
    return ["L", "L", "M", "M", "M", "M", "M", "S", "S", "S"];
  } else if (count === 11) {
    // 11コマの場合はLLMMMMMSSS
    return ["L", "L", "M", "M", "M", "M", "M", "M", "S", "S", "S"];
  } else if (count === 12) {
    // 12コマの場合はLLMMMMMMMSSSS
    return ["L", "L", "M", "M", "M", "M", "M", "M", "M", "S", "S", "S", "S"];
  }

  // 13コマ以上の場合は適度に分配
  const lCount = Math.max(2, Math.floor(count * 0.2)); // 20%をL（最低2）
  const sCount = Math.max(3, Math.floor(count * 0.25)); // 25%をS（最低3）
  const mCount = count - lCount - sCount; // 残りをM

  for (let i = 0; i < lCount; i++) sizes.push("L");
  for (let i = 0; i < mCount; i++) sizes.push("M");
  for (let i = 0; i < sCount; i++) sizes.push("S");

  return sizes;
}

/**
 * 入力が数字のみかチェック
 */
export function isNumericOnly(input: string): boolean {
  return /^\d+$/.test(input.trim());
}
