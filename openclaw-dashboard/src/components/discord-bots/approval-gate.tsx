"use client";

import { useState } from "react";

export function ApprovalGate({ label, confirmText, onApprove }: { label: string; confirmText: string; onApprove: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function run() {
    if (value !== confirmText) return;
    setPending(true);
    setMessage("");
    try {
      await onApprove();
      setMessage("Confirmed action executed.");
      setOpen(false);
      setValue("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <button onClick={() => setOpen((v) => !v)} className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-200">{label}</button>
      {open ? (
        <div className="space-y-3 rounded-xl border border-red-500/15 bg-red-500/5 p-4">
          <div className="text-sm text-zinc-300">Type <span className="font-mono text-red-200">{confirmText}</span> to confirm.</div>
          <input value={value} onChange={(e) => setValue(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2 text-sm text-zinc-300" />
          <div className="flex items-center gap-3">
            <button onClick={run} disabled={pending || value !== confirmText} className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-200 disabled:opacity-50">{pending ? 'Working…' : 'Confirm'}</button>
            {message ? <div className="text-sm text-zinc-400">{message}</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
