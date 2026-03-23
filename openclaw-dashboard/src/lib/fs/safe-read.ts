import { promises as fs } from "node:fs";

export async function readTextIfExists(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

export async function readJsonIfExists<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function statIfExists(filePath: string) {
  try {
    return await fs.stat(filePath);
  } catch {
    return null;
  }
}
