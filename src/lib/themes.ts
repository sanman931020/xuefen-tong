export const THEME_OPTIONS = [
  {
    id: "beige",
    label: "米色",
    swatch: "#e8dcc8",
  },
  {
    id: "mint",
    label: "粉綠",
    swatch: "#c8e6d4",
  },
  {
    id: "sky",
    label: "粉藍",
    swatch: "#c9dff5",
  },
  {
    id: "butter",
    label: "粉黃",
    swatch: "#f3e7b5",
  },
  {
    id: "lilac",
    label: "粉紫",
    swatch: "#e0d0f0",
  },
  {
    id: "blush",
    label: "粉紅",
    swatch: "#f3cfd8",
  },
  {
    id: "peach",
    label: "粉橘",
    swatch: "#f5d0b8",
  },
] as const;

export type ThemeId = (typeof THEME_OPTIONS)[number]["id"];

export const DEFAULT_THEME: ThemeId = "mint";

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return THEME_OPTIONS.some((t) => t.id === value);
}

/** 組出課程所屬類別路徑，例如：教育學程 - 小教 - 教育專業課程 - 教育基礎課程 */
export function buildCourseCategoryPath(input: {
  programType: string;
  programName: string;
  shortLabel?: string | null;
  blockName?: string | null;
  groupName?: string | null;
}) {
  const parts: string[] = [];

  if (input.programType === "education") {
    parts.push("教育學程");
    parts.push(input.shortLabel || input.programName.replace(/^教育學程[｜|]/, ""));
  } else if (input.programType === "undergraduate") {
    parts.push(input.shortLabel || "大學部");
  } else if (input.programType === "master") {
    parts.push(input.shortLabel || "碩班");
  } else {
    parts.push(input.shortLabel || input.programName);
  }

  if (input.blockName) parts.push(input.blockName);
  if (input.groupName) parts.push(input.groupName);

  return parts.join(" - ");
}
