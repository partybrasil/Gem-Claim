import { useState } from 'react';
import { ChevronDown, Volume2, VolumeX, Waves } from 'lucide-react';
import { NeonButton } from './NeonButton';

const soundOptions = [
  { id: 'reactor', label: 'Reactor' },
  { id: 'arcade', label: 'Arcade' },
  { id: 'stealth', label: 'Stealth' }
];

export function SoundControls({ enabled, preset, onToggle, onPresetChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const activePreset = soundOptions.find((option) => option.id === preset) ?? soundOptions[0];

  return (
    <div className="glass-panel flex h-full w-full min-w-0 flex-col gap-3 rounded-3xl border-white/10 p-4 text-sm text-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[rgb(var(--secondary-rgb))]">
            <Waves className="h-4 w-4" />
            Sound FX
          </div>
          <div className="mt-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-200">
            {enabled ? 'Audio On' : 'Audio Off'} / {activePreset.label}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-[rgba(var(--secondary-rgb),0.45)] hover:bg-[rgba(var(--secondary-rgb),0.1)]"
          aria-label={isOpen ? 'Cerrar Sound FX' : 'Abrir Sound FX'}
        >
          <ChevronDown className={[ 'h-4 w-4 transition-transform duration-200', isOpen ? 'rotate-180' : '' ].join(' ')} />
        </button>
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

      {isOpen ? (
        <div className="grid grid-cols-3 gap-2">
          {soundOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onPresetChange(option.id);
                setIsOpen(false);
              }}
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
      ) : null}
    </div>
  );
}