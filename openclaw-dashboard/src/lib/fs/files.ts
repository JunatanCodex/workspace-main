import path from "node:path";
import { promises as fs } from "node:fs";

const TEXT_EXTENSIONS = new Set([".md", ".json", ".txt", ".log", ".yml", ".yaml"]);

export interface FileNode {
  name: string;
  path: string;
  relativePath: string;
  type: "file" | "directory";
  size?: number;
  modifiedAt?: string;
  children?: FileNode[];
}

export async function listTree(root: string, current = root, depth = 0): Promise<FileNode[]> {
  if (depth > 4) return [];
  try {
    const entries = await fs.readdir(current, { withFileTypes: true });
    const nodes = await Promise.all(
      entries
        .filter((entry) => !entry.name.startsWith("."))
        .map(async (entry) => {
          const fullPath = path.join(current, entry.name);
          const stat = await fs.stat(fullPath);
          const relativePath = path.relative(root, fullPath);
          if (entry.isDirectory()) {
            return {
              name: entry.name,
              path: fullPath,
              relativePath,
              type: "directory" as const,
              modifiedAt: stat.mtime.toISOString(),
              children: await listTree(root, fullPath, depth + 1),
            };
          }
          return {
            name: entry.name,
            path: fullPath,
            relativePath,
            type: "file" as const,
            size: stat.size,
            modifiedAt: stat.mtime.toISOString(),
          };
        }),
    );
    return nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  } catch {
    return [];
  }
}

export async function readPreview(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (!TEXT_EXTENSIONS.has(ext)) {
    return { kind: "unsupported" as const, content: null };
  }
  try {
    const content = await fs.readFile(filePath, "utf8");
    return { kind: ext === ".json" ? "json" as const : ext === ".md" ? "markdown" as const : "text" as const, content };
  } catch {
    return { kind: "missing" as const, content: null };
  }
}
