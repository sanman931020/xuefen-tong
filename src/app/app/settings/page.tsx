import { AccountSettings } from "@/components/AccountSettings";
import { SettingsClient } from "@/components/SettingsClient";
import { prisma } from "@/lib/prisma";
import { getOrCreateProfile, requireUser } from "@/lib/session";

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user.id!);
  const programs = await prisma.program.findMany({ orderBy: { sortOrder: "asc" } });
  const account = await prisma.user.findUnique({
    where: { id: user.id! },
    select: {
      username: true,
      email: true,
      passwordHash: true,
      accounts: { select: { provider: true }, where: { provider: "google" } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--brand-deep)]">
          設定
        </h1>
        <p className="mt-2 text-[var(--ink-muted)]">選擇你正在修的學制與教育學程，資料會綁定帳號永久保存。</p>
      </div>
      <AccountSettings
        username={account?.username ?? null}
        email={account?.email ?? null}
        hasPassword={Boolean(account?.passwordHash)}
        hasGoogle={(account?.accounts.length ?? 0) > 0}
      />
      <SettingsClient
        displayName={profile.displayName || user.name || ""}
        entryYear={profile.entryYear}
        currentGrade={profile.currentGrade}
        expectedGradYear={profile.expectedGradYear}
        currentTerm={profile.currentTerm}
        includeFailInAvg={profile.includeFailInAvg}
        themeColor={profile.themeColor}
        selectedCodes={profile.selectedPrograms.map((s) => s.program.code)}
        programs={programs.map((p) => ({
          id: p.id,
          code: p.code,
          name: p.name,
          type: p.type,
        }))}
      />
    </div>
  );
}
