export function extractSectionLines(markdown: string, heading: string): string[] {
  const lines = markdown.split(/\r?\n/);
  const target = heading.trim().toLowerCase();
  const start = lines.findIndex((line) => line.replace(/^#+\s*/, "").trim().toLowerCase() === target);
  if (start === -1) return [];
  const out: string[] = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^#{1,6}\s+/.test(line)) break;
    if (line.trim()) out.push(line.trim());
  }
  return out;
}

export function extractRole(markdown: string): string | undefined {
  const match = markdown.match(/## Role\s+([\s\S]*?)(\n##|$)/i);
  if (!match) return undefined;
  return match[1].replace(/\s+/g, " ").trim();
}

export function cleanBullet(line: string): string {
  return line.replace(/^[-*]\s*/, "").trim();
}
