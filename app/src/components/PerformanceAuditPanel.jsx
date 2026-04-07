import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Gauge, Radar, ScanSearch, Timer, Zap } from 'lucide-react';
import { NeonButton } from './ui/NeonButton';

const toneByScore = {
  S: 'border-cyan-300/30 bg-cyan-400/10 text-cyan-50',
  A: 'border-emerald-300/30 bg-emerald-400/10 text-emerald-50',
  B: 'border-amber-300/30 bg-amber-400/10 text-amber-50',
  C: 'border-orange-300/30 bg-orange-400/10 text-orange-50',
  D: 'border-red-300/30 bg-red-400/10 text-red-50'
};

function metricTone(score) {
  if (score >= 90) {
    return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100';
  }

  if (score >= 75) {
    return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100';
  }

  if (score >= 60) {
    return 'border-amber-400/20 bg-amber-400/10 text-amber-100';
  }

  return 'border-red-400/20 bg-red-400/10 text-red-100';
}

export function PerformanceAuditPanel({ result, isRunning, onRun }) {
  return (
    <section className="glass-panel mt-10 rounded-[32px] border-white/10 p-5 sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.34em] text-amber-200/85">
            <Gauge className="h-4 w-4" />
            Tactical Performance Probe
          </div>
          <h2 className="mt-3 font-display text-2xl font-black uppercase tracking-[0.12em] text-white text-glow">
            Auditoría real del reactor y del HUD
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Ejecuta una medición real con Performance API, benchmark de refresh del feed y muestreo de frame rate para decidir si hace falta optimizar.
          </p>
        </div>

        <NeonButton icon={isRunning ? Radar : ScanSearch} onClick={onRun} disabled={isRunning} className="min-w-[240px]">
          {isRunning ? 'Auditando rendimiento' : 'Test de Performance'}
        </NeonButton>
      </div>

      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key={result.completedAt}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mt-6 space-y-5"
          >
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)]">
              <div className={[ 'rounded-[28px] border p-5', toneByScore[result.rank] ?? toneByScore.B ].join(' ')}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.3em] opacity-80">Rango del sistema</div>
                    <div className="mt-3 font-display text-6xl font-black uppercase leading-none">{result.rank}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.3em] opacity-80">Score global</div>
                    <div className="mt-3 font-display text-4xl font-black leading-none">{result.score}</div>
                  </div>
                </div>
                <div className="mt-5 text-sm text-slate-100/90">
                  Última sonda: {new Date(result.completedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-slate-100">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
                    <Zap className="h-4 w-4" />
                    FPS medio
                  </div>
                  <div className="mt-3 font-display text-3xl font-black uppercase tracking-[0.08em] text-white">
                    {Math.round(result.summary.averageFps)}
                  </div>
                  <div className="mt-2 text-sm text-slate-300">Frame time medio {Math.round(result.summary.averageFrameTime)} ms</div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-slate-100">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/80">
                    <Timer className="h-4 w-4" />
                    Fuente de refresh
                  </div>
                  <div className="mt-3 font-display text-xl font-black uppercase tracking-[0.08em] text-white">
                    {result.summary.refreshSource}
                  </div>
                  <div className="mt-2 text-sm text-slate-300">{result.summary.refreshCount} giveaways auditados</div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-slate-100">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-200/80">
                    <Activity className="h-4 w-4" />
                    Diagnóstico
                  </div>
                  <div className="mt-3 font-display text-xl font-black uppercase tracking-[0.08em] text-white">
                    {result.score >= 88 ? 'Muy sólido' : result.score >= 75 ? 'Estable' : result.score >= 60 ? 'Optimizable' : 'Crítico'}
                  </div>
                  <div className="mt-2 text-sm text-slate-300">El panel decide con datos reales, no por apariencia.</div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {result.metrics.map((metric) => (
                <div key={metric.id} className={[ 'rounded-[24px] border p-4', metricTone(metric.score) ].join(' ')}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.28em] opacity-80">{metric.label}</div>
                    <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white">
                      {metric.score}
                    </span>
                  </div>
                  <div className="mt-3 font-display text-2xl font-black uppercase tracking-[0.08em] text-white">
                    {metric.displayValue}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-200/80">{metric.detail}</div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm text-slate-300"
          >
            El monitor todavía no tiene lectura. Lanza el test para medir carga inicial, FCP, consistencia de frames y refresh real del feed.
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
