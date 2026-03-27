import { readFileSync } from "node:fs";
import path from "node:path";
import { PageShell } from "@/components/layout/page-shell";
import { PremiumPanel, PremiumKicker } from "@/components/ui/premium";
import { DeployBotForm } from "@/components/discord-bots/deploy-bot-form";

export default function DiscordBotDeployPage() {
  const templatePath = path.join(process.cwd(), "src/lib/discord-bots/python-healthcheck-template.py");
  const healthTemplate = readFileSync(templatePath, "utf8");
  return (
    <PageShell title="Deploy Bot" description="Register a Discord bot, store secrets server-side, and queue its first deployment task.">
      <div className="space-y-6">
        <DeployBotForm />
        <PremiumPanel>
          <PremiumKicker>Python health check template</PremiumKicker>
          <div className="mt-2 text-sm text-zinc-400">Use this for future Python Discord bots instead of a placeholder script.</div>
          <pre className="mt-4 overflow-auto whitespace-pre-wrap rounded-xl border border-white/6 bg-black/20 p-4 text-xs text-zinc-300">{healthTemplate}</pre>
        </PremiumPanel>
      </div>
    </PageShell>
  );
}
