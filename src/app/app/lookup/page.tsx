import { CourseLookupClient } from "@/components/CourseLookupClient";
import { getOrCreateProfile, requireUser } from "@/lib/session";

export default async function LookupPage() {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--brand-deep)]">
          課程類別查詢
        </h1>
        <p className="mt-2 text-[var(--ink-muted)]">
          輸入課程名稱，即可查出屬於哪個學制與學分類別。
        </p>
      </div>
      <CourseLookupClient currentTerm={profile.currentTerm} />
    </div>
  );
}
