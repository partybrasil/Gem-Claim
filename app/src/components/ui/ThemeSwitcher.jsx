import { Palette } from 'lucide-react';
import { themePresets } from '../../utils/themes';

export function ThemeSwitcher({ value, onChange }) {
  return (
    <div className="glass-panel flex flex-col gap-3 rounded-3xl border-white/10 p-4 text-sm text-slate-300 sm:min-w-[220px]">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[rgb(var(--accent-rgb))]">
        <Palette className="h-4 w-4" />
        Theme Deck
      </div>

      <div className="grid gap-2">
        {themePresets.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => onChange(theme.id)}
            className={[
              'rounded-2xl border px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] transition duration-300',
              value === theme.id
                ? 'border-[rgba(var(--accent-rgb),0.7)] bg-[rgba(var(--accent-rgb),0.16)] text-white shadow-neon'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-[rgba(var(--accent-rgb),0.4)] hover:bg-[rgba(var(--accent-rgb),0.1)]'
            ].join(' ')}
          >
            <div className="flex items-center justify-between gap-3">
              <span>{theme.label}</span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.accent }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.secondary }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.success }} />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}