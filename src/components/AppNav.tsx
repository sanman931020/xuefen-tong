"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const links = [
  { href: "/app/schedule", label: "課表" },
  { href: "/app", label: "總覽" },
  { href: "/app/credits", label: "學分明細" },
  { href: "/app/lookup", label: "課程查詢" },
  { href: "/app/requirements", label: "條件／擋修" },
  { href: "/app/plan", label: "學期規劃" },
  { href: "/app/grades", label: "成績" },
  { href: "/app/courses", label: "修課紀錄" },
  { href: "/app/settings", label: "設定" },
];

export function AppNav({ name }: { name?: string | null }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--nav-bg)] pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:gap-4 sm:px-4">
        <Link
          href="/app/schedule"
          className="shrink-0 font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-[var(--brand-deep)] sm:text-xl"
        >
          學分通
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => {
            const active = l.href === "/app" ? pathname === "/app" : pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  active
                    ? "bg-[var(--brand)] text-white"
                    : "text-[var(--ink-muted)] hover:bg-[var(--brand-soft)] hover:text-[var(--ink)]"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="hidden truncate text-sm text-[var(--ink-muted)] md:inline">
            {name || "使用者"}
          </span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="btn btn-ghost !min-h-10 !px-3 !py-1.5 text-sm"
          >
            登出
          </button>
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto overscroll-x-contain px-3 pb-3 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] sm:px-4 lg:hidden [&::-webkit-scrollbar]:hidden">
        {links.map((l) => {
          const active = l.href === "/app" ? pathname === "/app" : pathname === l.href || pathname.startsWith(`${l.href}/`);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`min-h-9 shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-sm ${
                active ? "bg-[var(--brand)] text-white" : "bg-white/70 text-[var(--ink-muted)]"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
