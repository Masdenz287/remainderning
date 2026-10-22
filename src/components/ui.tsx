import React from 'react';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import type { TaskStatus } from '../lib/data';

export function StatusBadge({ status }: { status: TaskStatus }) {
  if (status === 'ok') return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold text-green-800 border border-green-200">
      <CheckCircle2 size={12} /> OK
    </span>
  );
  if (status === 'perlu') return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-200">
      <Clock size={12} /> Perlu Diperiksa
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-700 border border-red-200">
      <AlertTriangle size={12} /> Masalah
    </span>
  );
}

export function ProgressBar({ percent, height = 10 }: { percent: number; height?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-full bg-white/25" style={{ height, background: 'rgba(255,255,255,.22)' }}>
      <div className="h-full rounded-full bg-green-500 transition-all duration-700" style={{ width: `${percent}%`, background: 'linear-gradient(90deg,#22C55E,#16A34A)' }} />
    </div>
  );
}

export function ProgressBarLight({ percent }: { percent: number }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, background: 'linear-gradient(90deg,#22C55E,#15803D)' }} />
    </div>
  );
}

export function Modal({ open, onClose, children, wide }: { open: boolean; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-navy-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className={`anim-pop w-full bg-white shadow-2xl rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-h-[92vh] overflow-y-auto nice-scroll ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'}`}>
        {children}
      </div>
    </div>
  );
}

export function NavyButton({ children, onClick, className = '', disabled }: { children: React.ReactNode; onClick?: () => void; className?: string; disabled?: boolean }) {
  return (
    <button disabled={disabled} onClick={onClick} className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0A2540] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-navy-900/25 transition active:scale-[.98] hover:bg-[#12365C] disabled:opacity-50 ${className}`}>
      {children}
    </button>
  );
}

export function SectionTitle({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        <h3 className="text-[15px] font-extrabold text-slate-900">{title}</h3>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
