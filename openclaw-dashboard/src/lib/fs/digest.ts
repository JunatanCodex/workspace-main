import { DIGEST_FILE } from "@/lib/config";
import { readTextIfExists, statIfExists } from "./safe-read";

export async function getDigest() {
  const [content, stat] = await Promise.all([readTextIfExists(DIGEST_FILE), statIfExists(DIGEST_FILE)]);
  return {
    content: content || "# Daily Digest\n\nNo digest generated yet.",
    updatedAt: stat?.mtime.toISOString(),
  };
}
