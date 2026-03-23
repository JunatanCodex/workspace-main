import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";

export default function AuthErrorPage() {
  return (
    <AuthShell title="Authentication problem" description="Something went wrong while completing the secure sign-in flow.">
      <div className="space-y-4 text-sm text-zinc-300">
        <p>Please try signing in again.</p>
        <Link href="/login" className="inline-flex rounded-2xl bg-white px-4 py-3 font-medium text-black transition hover:bg-zinc-200">
          Back to login
        </Link>
      </div>
    </AuthShell>
  );
}
