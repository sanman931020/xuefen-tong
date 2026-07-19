import { AppNav } from "@/components/AppNav";
import { IntroSplash } from "@/components/IntroSplash";
import { requireUser } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-screen">
      <IntroSplash storageKey="xuefen-intro-app" />
      <AppNav name={user.name} />
      <main className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-4 sm:py-8">{children}</main>
    </div>
  );
}
