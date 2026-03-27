import { PageShell } from "@/components/layout/page-shell";
import { DeployBotForm } from "@/components/discord-bots/deploy-bot-form";

export default function DiscordBotDeployPage() {
  return (
    <PageShell title="Deploy Bot" description="Register a Discord bot, store secrets server-side, and queue its first deployment task.">
      <DeployBotForm />
    </PageShell>
  );
}
