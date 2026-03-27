"use client";

import { useState } from "react";
import { PremiumPanel, PremiumKicker } from "@/components/ui/premium";
import { DISCORD_BOT_TEMPLATES } from "@/lib/discord-bots/templates";

export function DeployBotForm() {
  const [message, setMessage] = useState<string>("");
  const [pending, setPending] = useState(false);
  const [template, setTemplate] = useState(DISCORD_BOT_TEMPLATES[0]);

  async function submit(formData: FormData) {
    setPending(true);
    setMessage("");
    const additionalEnvRaw = String(formData.get("additional_env") || "").trim();
    const additionalEnv = Object.fromEntries(
      additionalEnvRaw
        ? additionalEnvRaw
            .split(/\n+/)
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
              const [key, ...rest] = line.split("=");
              return [key.trim(), rest.join("=").trim()];
            })
        : [],
    );

    const payload = {
      kind: "register",
      template: String(formData.get("template") || template.id),
      name: String(formData.get("name") || ""),
      repo_url: String(formData.get("repo_url") || ""),
      branch: String(formData.get("branch") || "main"),
      runtime_type: String(formData.get("runtime_type") || template.runtime_type),
      working_directory: String(formData.get("working_directory") || ""),
      install: String(formData.get("install") || template.commands.install),
      build: String(formData.get("build") || template.commands.build),
      start: String(formData.get("start") || template.commands.start),
      healthCheck: String(formData.get("healthCheck") || template.commands.healthCheck),
      discordToken: String(formData.get("discordToken") || ""),
      clientId: String(formData.get("clientId") || ""),
      guildId: String(formData.get("guildId") || ""),
      additionalEnv,
      autoFixEnabled: formData.get("autoFixEnabled") === "on",
      restartPolicy: String(formData.get("restartPolicy") || "always"),
      rollbackEnabled: formData.get("rollbackEnabled") === "on",
    };

    const response = await fetch("/api/discord-bots/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    setPending(false);
    if (!response.ok) {
      setMessage(Array.isArray(json.errors) ? json.errors.join(" ") : json.error || "Failed to register bot.");
      return;
    }
    setMessage(`Registered bot ${json.bot_id} and queued initial deploy.`);
  }

  return (
    <form action={async (formData) => submit(formData)} className="space-y-6">
      <PremiumPanel>
        <PremiumKicker>Template & identity</PremiumKicker>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-zinc-300">
          <span>Template</span>
          <select
            name="template"
            className="rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2"
            defaultValue={template.id}
            onChange={(e) => setTemplate(DISCORD_BOT_TEMPLATES.find((item) => item.id === e.target.value) || DISCORD_BOT_TEMPLATES[0])}
          >
            {DISCORD_BOT_TEMPLATES.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-zinc-300">
          <span>Bot name</span>
          <input name="name" className="rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2" required />
        </label>
        <label className="grid gap-2 text-sm text-zinc-300 md:col-span-2">
          <span>GitHub repo URL</span>
          <input name="repo_url" placeholder="https://github.com/owner/repo" className="rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2" required />
        </label>
        <label className="grid gap-2 text-sm text-zinc-300">
          <span>Branch</span>
          <input name="branch" defaultValue="main" className="rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2" />
        </label>
        <label className="grid gap-2 text-sm text-zinc-300">
          <span>Runtime type</span>
          <input name="runtime_type" defaultValue={template.runtime_type} className="rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2" />
        </label>
        <label className="grid gap-2 text-sm text-zinc-300">
          <span>Working directory</span>
          <input name="working_directory" placeholder="bot-name" className="rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2" />
        </label>
        <label className="grid gap-2 text-sm text-zinc-300">
          <span>Restart policy</span>
          <select name="restartPolicy" className="rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2" defaultValue="always">
            <option value="always">always</option>
            <option value="on-failure">on-failure</option>
            <option value="manual">manual</option>
          </select>
        </label>
        </div>
      </PremiumPanel>

      <PremiumPanel>
        <PremiumKicker>Commands</PremiumKicker>
        <div className="mt-2 text-sm text-zinc-500">Python bots should prefer a local <code className="rounded bg-black/30 px-1 py-0.5">.venv</code> runtime instead of system pip.</div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
        {[
          ["install", "Install command", template.commands.install],
          ["build", "Build command", template.commands.build],
          ["start", "Start command", template.commands.start],
          ["healthCheck", "Health check command", template.commands.healthCheck],
        ].map(([name, label, value]) => (
          <label key={String(name)} className="grid gap-2 text-sm text-zinc-300">
            <span>{label}</span>
            <input name={String(name)} defaultValue={String(value)} className="rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2" required />
          </label>
        ))}
        </div>
      </PremiumPanel>

      <PremiumPanel>
        <PremiumKicker>Secrets & env</PremiumKicker>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm text-zinc-300">
          <span>Discord token</span>
          <input name="discordToken" type="password" className="rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2" />
        </label>
        <label className="grid gap-2 text-sm text-zinc-300">
          <span>Client ID</span>
          <input name="clientId" type="password" className="rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2" />
        </label>
        <label className="grid gap-2 text-sm text-zinc-300">
          <span>Guild ID</span>
          <input name="guildId" type="password" className="rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2" />
        </label>
        </div>

        <label className="mt-4 grid gap-2 text-sm text-zinc-300">
        <span>Additional env vars</span>
        <textarea name="additional_env" rows={4} placeholder="KEY=value" className="rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2" />
      </label>

        <div className="mt-4 flex flex-wrap gap-5 text-sm text-zinc-300">
        <label className="flex items-center gap-2"><input type="checkbox" name="autoFixEnabled" defaultChecked /> Auto-fix enabled</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="rollbackEnabled" defaultChecked /> Rollback enabled</label>
      </div>

      </PremiumPanel>

      <PremiumPanel className="flex items-center gap-3">
        <button disabled={pending} className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">{pending ? "Submitting..." : "Register bot"}</button>
        {message ? <div className="text-sm text-zinc-400">{message}</div> : null}
      </PremiumPanel>
    </form>
  );
}
