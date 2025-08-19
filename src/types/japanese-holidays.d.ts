declare module "japanese-holidays" {
  export function isHoliday(date: Date): boolean;
  export function getJapaneseHoliday(date: Date): string | null;
}
