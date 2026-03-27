"use client";

import { SolidButton } from "@/components/ui/button-link";

export function RequeueSubmitButton() {
  return <SolidButton type="submit" onClick={(e) => { if (!window.confirm('Requeue this task back into the active queue?')) e.preventDefault(); }}>Requeue task</SolidButton>;
}

export function ApprovalSubmitButton() {
  return <SolidButton type="submit">Mark for approval</SolidButton>;
}
