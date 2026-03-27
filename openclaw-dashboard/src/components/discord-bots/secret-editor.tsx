"use client";

import { useState } from "react";

export function SecretEditor({ botId }: { botId: string }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setMessage("");
    const payload = {
      botId,
      discordToken: String(formData.get("discordToken") || ""),
      clientId: String(formData.get("clientId") || ""),
      guildId: String(formData.get("guildId") || ""),
    };
    const response = await fetch("/api/discord-bots/secret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    setPending(false);
    setMessage(response.ok ? "Secrets updated server-side." : json.error || "Failed to update secrets.");
  }

  return (
    <form action={async (fd) => submit(fd)} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <input name="discordToken" type="password" placeholder="New Discord token" className="rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2 text-sm text-zinc-300" />
        <input name="clientId" type="password" placeholder="Client ID" className="rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2 text-sm text-zinc-300" />
        <input name="guildId" type="password" placeholder="Guild ID" className="rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2 text-sm text-zinc-300" />
      </div>
      <div className="flex items-center gap-3">
        <button disabled={pending} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-200 disabled:opacity-50">{pending ? "Saving..." : "Update secrets"}</button>
        {message ? <div className="text-sm text-zinc-400">{message}</div> : null}
      </div>
    </form>
  );
}
