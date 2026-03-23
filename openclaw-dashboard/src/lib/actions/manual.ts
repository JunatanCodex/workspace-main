export interface ActionStubResult {
  ok: boolean;
  mode: "stub";
  action: string;
  message: string;
}

export async function stubAction(action: string, detail: string): Promise<ActionStubResult> {
  return {
    ok: true,
    mode: "stub",
    action,
    message: `${detail} is not wired to runtime execution yet. This placeholder confirms the UI path and keeps the action explicit instead of fake-working.`,
  };
}
