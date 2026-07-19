"use client";

import { THEME_OPTIONS, type ThemeId } from "@/lib/themes";
import { useTheme } from "@/components/ThemeProvider";

export function ThemePicker({
  value,
  onChange,
  persistRemote = false,
}: {
  value?: ThemeId;
  onChange?: (theme: ThemeId) => void;
  persistRemote?: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const current = value ?? theme;

  async function pick(id: ThemeId) {
    setTheme(id);
    onChange?.(id);
    if (persistRemote) {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeColor: id }),
      });
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {THEME_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          title={opt.label}
          aria-label={opt.label}
          className="theme-swatch"
          style={{ background: opt.swatch }}
          data-active={current === opt.id}
          onClick={() => pick(opt.id)}
        />
      ))}
    </div>
  );
}
