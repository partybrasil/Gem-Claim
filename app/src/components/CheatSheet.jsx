import { AnimatePresence, motion } from 'framer-motion';
import { Award, BookOpenText, Gamepad2, LockKeyhole, Shield, Sparkles, X } from 'lucide-react';
import {
  buildAchievements,
  buildCodexStats,
  buildVisibleSecrets,
  CONTROL_TRICKS,
  TACTICAL_COMBOS
} from '../utils/codex';

function SectionCard({ title, icon: Icon, children, tone = 'cyan' }) {
  const tones = {
    cyan: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100',
    violet: 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-100',
    green: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
    amber: 'border-amber-400/20 bg-amber-400/10 text-amber-100'
  };

  return (
    <div className={['rounded-[24px] border p-4', tones[tone] ?? tones.cyan].join(' ')}>
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em]">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      {children}
    </div>
  );
}

export function CheatSheet({ isOpen, onClose, state, onToggleSecretMode }) {
  const achievements = buildAchievements(state);
  const secrets = buildVisibleSecrets(state.discoveredSecrets);
  const stats = buildCodexStats(state);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/78 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ opacity: 0, x: 28, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 28, scale: 0.98 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-3 top-3 z-50 h-[calc(100vh-1.5rem)] w-[min(460px,calc(100vw-1.5rem))] overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/90 shadow-[0_0_50px_rgba(34,211,238,0.18)] backdrop-blur-2xl"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/85">
                    <Gamepad2 className="h-4 w-4" />
                    World Gaming HQ
                  </div>
                  <h2 className="mt-2 font-display text-2xl font-black uppercase tracking-[0.12em] text-white text-glow">
                    Codex
                  </h2>
                  <p className="mt-1 text-sm text-slate-300">
                    Archivo táctico del operador Gem-Claim: controles, logros y secretos del QG gamer.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-cyan-400/45 hover:bg-cyan-400/10 hover:text-white"
                  aria-label="Cerrar cheatsheet"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                <SectionCard title="Estado del QG" icon={Shield} tone="amber">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200/80">
                        Secretos descubiertos
                      </div>
                      <div className="mt-2 font-display text-3xl font-bold uppercase tracking-[0.08em] text-white">
                        {stats.discoveredSecrets}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200/80">
                        Logros activos
                      </div>
                      <div className="mt-2 font-display text-3xl font-bold uppercase tracking-[0.08em] text-white">
                        {stats.unlockedAchievements}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200/80">
                        Aperturas de Codex
                      </div>
                      <div className="mt-2 font-display text-3xl font-bold uppercase tracking-[0.08em] text-white">
                        {stats.codexVisits}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200/80">
                        Reactor Overdrive
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="font-display text-lg font-bold uppercase tracking-[0.08em] text-white">
                          {state.secretModeEnabled ? 'Activo' : stats.overdriveUnlocked ? 'Listo' : 'Bloqueado'}
                        </span>
                        <button
                          type="button"
                          onClick={() => onToggleSecretMode(!state.secretModeEnabled)}
                          disabled={!stats.overdriveUnlocked}
                          className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-amber-100 transition enabled:hover:bg-amber-400/15 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {state.secretModeEnabled ? 'Desarmar' : 'Activar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Trucos" icon={BookOpenText} tone="cyan">
                  <div className="space-y-3 text-sm text-slate-100">
                    {CONTROL_TRICKS.map((trick) => (
                      <div key={trick.title} className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-semibold uppercase tracking-[0.15em] text-white">{trick.title}</div>
                          <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-cyan-200">
                            {trick.input}
                          </span>
                        </div>
                        <div className="mt-2 text-slate-300">{trick.detail}</div>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Combos" icon={Sparkles} tone="violet">
                  <div className="space-y-2 text-sm text-slate-100">
                    {TACTICAL_COMBOS.map((combo) => (
                      <div key={combo} className="rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-3 text-slate-300">
                        {combo}
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Logros" icon={Award} tone="amber">
                  <div className="space-y-3 text-sm text-slate-100">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-semibold uppercase tracking-[0.15em] text-white">{achievement.name}</div>
                          <span
                            className={[
                              'rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.25em]',
                              achievement.unlocked
                                ? 'border border-amber-400/30 bg-amber-400/10 text-amber-100'
                                : 'border border-white/10 bg-white/5 text-slate-400'
                            ].join(' ')}
                          >
                            {achievement.progressLabel}
                          </span>
                        </div>
                        <div className="mt-2 text-slate-300">{achievement.description}</div>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Secretos" icon={LockKeyhole} tone="green">
                  <div className="space-y-3 text-sm text-slate-100">
                    {secrets.map((secret) => (
                      <div key={secret.id} className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-semibold uppercase tracking-[0.15em] text-white">{secret.name}</div>
                          <span
                            className={[
                              'rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.25em]',
                              secret.isUnlocked
                                ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                                : 'border border-cyan-400/30 bg-cyan-400/10 text-cyan-200'
                            ].join(' ')}
                          >
                            {secret.status}
                          </span>
                        </div>
                        <div className="mt-2 text-slate-300">{secret.description}</div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
                            Input {secret.code}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
                            Recompensa {secret.rewardText}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}