import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { googleAuthEnabled } from "@/lib/auth";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/app/schedule");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-8 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--brand-deep)]">
        學分通
      </Link>
      <LoginForm googleEnabled={googleAuthEnabled} />
    </main>
  );
}
