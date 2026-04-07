import { Volume2, VolumeX, Waves } from 'lucide-react';
import { NeonButton } from './NeonButton';

const soundOptions = [
  { id: 'reactor', label: 'Reactor' },
  { id: 'arcade', label: 'Arcade' },
  { id: 'stealth', label: 'Stealth' }
];

export function SoundControls({ enabled, preset, onToggle, onPresetChange }) {
  return (
    <div className="glass-panel flex flex-col gap-3 rounded-3xl border-white/10 p-4 text-sm text-slate-300 sm:min-w-[220px]">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[rgb(var(--secondary-rgb))]">
        <Waves className="h-4 w-4" />
        Sound FX
      </div>

      <NeonButton
        icon={enabled ? Volume2 : VolumeX}
        variant="ghost"
        active={enabled}
        onClick={onToggle}
        className="justify-start"
      >
        {enabled ? 'Audio On' : 'Audio Off'}
      </NeonButton>

      <div className="grid grid-cols-3 gap-2">
        {soundOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onPresetChange(option.id)}
            className={[
              'rounded-2xl border px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] transition duration-300',
              preset === option.id
                ? 'border-[rgba(var(--secondary-rgb),0.68)] bg-[rgba(var(--secondary-rgb),0.16)] text-white'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-[rgba(var(--secondary-rgb),0.4)] hover:bg-[rgba(var(--secondary-rgb),0.1)]'
            ].join(' ')}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}