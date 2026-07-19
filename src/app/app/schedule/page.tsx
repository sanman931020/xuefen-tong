import { ScheduleClient } from "@/components/ScheduleClient";
import { pickLatestTerm } from "@/lib/schedule";
import { getOrCreateProfile, requireUser } from "@/lib/session";

export default async function SchedulePage() {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user.id);
  const defaultTerm = pickLatestTerm([profile.currentTerm, "115-1"], "115-1");

  return <ScheduleClient defaultTerm={defaultTerm} />;
}
