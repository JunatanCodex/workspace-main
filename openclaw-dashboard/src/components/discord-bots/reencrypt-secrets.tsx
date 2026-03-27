"use client";

import { useState } from "react";
import { GhostButton } from "@/components/ui/button-link";

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

  return <GhostButton onClick={run} disabled={pending}>{pending ? 'Re-encrypting…' : 'Re-encrypt secrets at rest'}</GhostButton>;
}
