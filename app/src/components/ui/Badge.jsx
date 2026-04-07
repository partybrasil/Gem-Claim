export function Badge({ children, tone = 'default' }) {
  const tones = {
    default: 'border-white/10 bg-white/5 text-slate-200',
    green: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
    cyan: 'border-cyan-400/45 bg-cyan-400/10 text-cyan-200',
    violet: 'border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-200',
    red: 'border-red-500/40 bg-red-500/15 text-red-200',
    amber: 'border-amber-400/40 bg-amber-400/12 text-amber-200'
  };

  return (
    <span
      className={[
        'badge-pill inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]',
        tones[tone] ?? tones.default
      ].join(' ')}
    >
      {children}
    </span>
  );
}