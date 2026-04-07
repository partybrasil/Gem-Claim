import { useState } from 'react';
import { ChevronDown, MousePointer2 } from 'lucide-react';
import { cursorPresets } from '../../utils/cursors';

export function CursorSwitcher({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const activePreset = cursorPresets.find((preset) => preset.id === value) ?? cursorPresets[0];

  return (
    <div className="glass-panel flex h-full w-full min-w-0 flex-col gap-3 rounded-3xl border-white/10 p-4 text-sm text-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/90">
            <MousePointer2 className="h-4 w-4" />
            Cursor Rig
          </div>
          <div className="mt-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-200">
            {activePreset.label}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
          aria-label={isOpen ? 'Cerrar Cursor Rig' : 'Abrir Cursor Rig'}
        >
          <ChevronDown className={[ 'h-4 w-4 transition-transform duration-200', isOpen ? 'rotate-180' : '' ].join(' ')} />
        </button>
      </div>

      {isOpen ? (
        <div className="grid grid-cols-2 gap-2">
          {cursorPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                onChange(preset.id);
                setIsOpen(false);
              }}
              className={[
                'rounded-2xl border px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.22em] transition duration-300',
                value === preset.id
                  ? 'border-cyan-300/70 bg-cyan-400/15 text-white shadow-neon'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/40 hover:bg-cyan-400/10'
              ].join(' ')}
            >
              {preset.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}