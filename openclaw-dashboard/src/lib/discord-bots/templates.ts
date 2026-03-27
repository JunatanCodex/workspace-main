export interface DiscordBotTemplate {
  id: string;
  label: string;
  runtime_type: string;
  required_env: string[];
  commands: {
    install: string;
    build: string;
    start: string;
    healthCheck: string;
  };
}

export const DISCORD_BOT_TEMPLATES: DiscordBotTemplate[] = [
  {
    id: "discord-js",
    label: "Discord.js",
    runtime_type: "node",
    required_env: ["DISCORD_TOKEN", "CLIENT_ID", "GUILD_ID"],
    commands: {
      install: "npm ci",
      build: "npm run build",
      start: "npm run start",
      healthCheck: "npm run healthcheck",
    },
  },
  {
    id: "node-bot",
    label: "Node.js bot",
    runtime_type: "node",
    required_env: ["DISCORD_TOKEN"],
    commands: {
      install: "npm install",
      build: "npm run build",
      start: "node .",
      healthCheck: "npm run healthcheck",
    },
  },
  {
    id: "python-bot",
    label: "Python bot",
    runtime_type: "python",
    required_env: ["DISCORD_TOKEN"],
    commands: {
      install: ".venv/bin/pip install -r requirements.txt",
      build: ".venv/bin/python -m compileall .",
      start: ".venv/bin/python bot.py",
      healthCheck: ".venv/bin/python healthcheck.py",
    },
  },
  {
    id: "docker-bot",
    label: "Docker bot",
    runtime_type: "docker",
    required_env: ["DISCORD_TOKEN"],
    commands: {
      install: "docker compose pull",
      build: "docker compose build",
      start: "docker compose up -d",
      healthCheck: "docker compose ps",
    },
  },
  {
    id: "py-cord-bot",
    label: "Pycord / discord.py bot",
    runtime_type: "python",
    required_env: ["DISCORD_TOKEN"],
    commands: {
      install: ".venv/bin/pip install -r requirements.txt",
      build: ".venv/bin/python -m compileall .",
      start: ".venv/bin/python main.py",
      healthCheck: ".venv/bin/python healthcheck.py",
    },
  },
  {
    id: "nextcord-bot",
    label: "Nextcord bot",
    runtime_type: "python",
    required_env: ["DISCORD_TOKEN"],
    commands: {
      install: ".venv/bin/pip install -r requirements.txt",
      build: ".venv/bin/python -m compileall .",
      start: ".venv/bin/python bot.py",
      healthCheck: ".venv/bin/python healthcheck.py",
    },
  },
];
