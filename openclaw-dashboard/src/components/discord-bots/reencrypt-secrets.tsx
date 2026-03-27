"use client";

import { useState } from "react";

export function ReencryptSecretsButton() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function run() {
    setPending(true);
    setMessage("");
    const response = await fetch("/api/discord-bots/reencrypt", { method: "POST" });
    const json = await response.json();
    setPending(false);
    setMessage(response.ok ? json.message || "Secrets re-encrypted." : json.error || "Re-encryption failed.");
  }

  return <button onClick={run} disabled={pending} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 disabled:opacity-50">{pending ? 'Re-encrypting…' : 'Re-encrypt secrets at rest'}</button>;
}
