"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type State = "idle" | "loading" | "success" | "error";

export function LoginForm({ configured }: { configured: boolean }) {
  const searchParams = useSearchParams();
  const next = useMemo(() => searchParams.get("next") || "/", [searchParams]);
  const message = searchParams.get("message");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [feedback, setFeedback] = useState<string | null>(message);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) return;
    setState("loading");
    setFeedback(null);

    try {
      const origin = window.location.origin;
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (error) throw error;
      setState("success");
      setFeedback("Check your email for the secure sign-in link.");
    } catch (error) {
      setState("error");
      setFeedback(error instanceof Error ? error.message : "Unable to start sign-in.");
    }
  }

  return (
    <div className="space-y-5">
      {feedback ? (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${state === "error" ? "border-red-500/20 bg-red-500/10 text-red-200" : "border-white/10 bg-white/[0.03] text-zinc-300"}`}>
          {feedback}
        </div>
      ) : null}

      {!configured ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Supabase is not configured yet. Add the required environment variables to enable login.
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <div className="mb-2 text-xs uppercase tracking-[0.18em] text-zinc-500">Email</div>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={!configured || state === "loading"}
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-white/20"
          />
        </label>
        <button
          type="submit"
          disabled={!configured || state === "loading"}
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
        >
          {state === "loading" ? "Sending secure link..." : "Email me a sign-in link"}
        </button>
      </form>
    </div>
  );
}
