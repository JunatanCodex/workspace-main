import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/app/login/login-form";
import { getCurrentSession } from "@/lib/auth/session";

export default async function LoginPage() {
  const session = await getCurrentSession();

  if (session.user) {
    redirect("/");
  }

  return (
    <AuthShell
      title="Secure sign-in"
      description="Sign in with Supabase Auth to access the OpenClaw control dashboard. Protected routes use cookie-based SSR sessions."
    >
      <LoginForm configured={session.configured} />
    </AuthShell>
  );
}
