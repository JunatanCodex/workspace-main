import { ButtonHTMLAttributes, ReactNode } from "react";

export function SolidButton({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; className?: string }) {
  return <button {...props} className={`rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900 transition duration-150 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_30px_rgba(255,255,255,0.08)] focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 ${className}`}>{children}</button>;
}

export function GhostButton({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; className?: string }) {
  return <button {...props} className={`rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition duration-150 hover:-translate-y-0.5 hover:bg-white/[0.08] hover:text-white hover:shadow-[0_10px_30px_rgba(255,255,255,0.05)] focus:outline-none focus:ring-2 focus:ring-white/10 disabled:opacity-50 ${className}`}>{children}</button>;
}

export function DangerButton({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; className?: string }) {
  return <button {...props} className={`rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-200 transition duration-150 hover:-translate-y-0.5 hover:bg-red-500/20 hover:text-red-100 hover:shadow-[0_10px_30px_rgba(239,68,68,0.12)] focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-50 ${className}`}>{children}</button>;
}
