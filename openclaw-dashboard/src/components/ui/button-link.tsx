import { ButtonHTMLAttributes, ReactNode } from "react";

export function SolidButton({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; className?: string }) {
  return <button {...props} className={`rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-white hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] disabled:opacity-50 ${className}`}>{children}</button>;
}

export function GhostButton({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; className?: string }) {
  return <button {...props} className={`rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-50 ${className}`}>{children}</button>;
}

export function DangerButton({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; className?: string }) {
  return <button {...props} className={`rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-500/20 hover:text-red-100 disabled:opacity-50 ${className}`}>{children}</button>;
}
