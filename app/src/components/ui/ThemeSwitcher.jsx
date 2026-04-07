import { useState } from 'react';
import { ChevronDown, Palette } from 'lucide-react';
import { themePresets } from '../../utils/themes';

export function ThemeSwitcher({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const activeTheme = themePresets.find((theme) => theme.id === value) ?? themePresets[0];

  return (
    <div className="glass-panel flex h-full w-full min-w-0 flex-col gap-3 rounded-3xl border-white/10 p-4 text-sm text-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[rgb(var(--accent-rgb))]">
            <Palette className="h-4 w-4" />
            Theme Deck
          </div>
          <div className="mt-2 flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-200">
            <span className="truncate">{activeTheme.label}</span>
            <span className="ml-auto flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: activeTheme.accent }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: activeTheme.secondary }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: activeTheme.success }} />
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-[rgba(var(--accent-rgb),0.45)] hover:bg-[rgba(var(--accent-rgb),0.1)]"
          aria-label={isOpen ? 'Cerrar Theme Deck' : 'Abrir Theme Deck'}
        >
          <ChevronDown className={[ 'h-4 w-4 transition-transform duration-200', isOpen ? 'rotate-180' : '' ].join(' ')} />
        </button>
      </div>

      {isOpen ? (
        <div className="grid gap-2">
          {themePresets.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => {
                onChange(theme.id);
                setIsOpen(false);
              }}
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
      ) : null}
    </div>
  );
}