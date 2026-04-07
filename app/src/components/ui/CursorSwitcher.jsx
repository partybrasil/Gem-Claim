import { MousePointer2 } from 'lucide-react';
import { cursorPresets } from '../../utils/cursors';

export function CursorSwitcher({ value, onChange }) {
  return (
    <div className="glass-panel flex h-full w-full min-w-0 flex-col gap-3 rounded-3xl border-white/10 p-4 text-sm text-slate-300">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/90">
        <MousePointer2 className="h-4 w-4" />
        Cursor Rig
      </div>

      <div className="grid grid-cols-2 gap-2">
        {cursorPresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onChange(preset.id)}
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
    </div>
  );
}