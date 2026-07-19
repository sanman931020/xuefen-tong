import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { IntroSplash } from "@/components/IntroSplash";
import { ThemePicker } from "@/components/ThemePicker";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/app/schedule");

  return (
    <>
      <IntroSplash storageKey="xuefen-intro-home" />
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-10">
        <div className="flex items-center justify-between gap-4">
          <div className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--brand-deep)]">
            學分通
          </div>
          <div className="flex gap-2">
            <Link href="/login" className="btn btn-ghost">
              登入
            </Link>
            <Link href="/register" className="btn btn-primary">
              註冊
            </Link>
          </div>
        </div>

        <section className="mt-16 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="fade-up">
            <p className="mb-3 text-sm font-medium tracking-wide text-[var(--brand)]">
              請先登入或註冊後進入系統
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight font-bold text-[var(--brand-deep)] sm:text-5xl">
              學分通
            </h1>
            <p className="mt-5 max-w-xl text-lg text-[var(--ink-muted)]">
              合併大學部、碩班與教育學程規則，追蹤學分缺口、規劃學期進度，並查詢課程所屬類別。資料會綁定你的帳號保存。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn btn-primary">
                註冊開始
              </Link>
              <Link href="/login" className="btn btn-ghost">
                已有帳號，登入
              </Link>
            </div>
            <div className="mt-8">
              <div className="mb-2 text-sm text-[var(--ink-muted)]">預覽系統顏色</div>
              <ThemePicker />
            </div>
            <p className="mt-6 text-xs text-[var(--ink-muted)]">
              規則資料為 113 學年度示範版本，實際畢業條件以學校教務／師資培育中心公告為準。
            </p>
          </div>

          <div className="card fade-up p-6" style={{ animationDelay: "0.1s" }}>
            <div className="space-y-4">
              {[
                ["登入後才可進入", "未登入無法使用系統功能"],
                ["學分與學期規劃", "必修／甲乙類／教育學程一次掌握"],
                ["課程類別查詢", "輸入課名即可查出所屬類別路徑"],
                ["自選介面顏色", "米色、粉綠、粉藍等七種主題"],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-2xl bg-[var(--bg-accent)] p-4">
                  <div className="font-semibold text-[var(--brand-deep)]">{title}</div>
                  <div className="mt-1 text-sm text-[var(--ink-muted)]">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
