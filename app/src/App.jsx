import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import {
  AudioLines,
  BookOpenText,
  Crown,
  Flame,
  Printer,
  LayoutGrid,
  List,
  Search,
  Radar,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  Trash2
} from 'lucide-react';
import { CheatSheet } from './components/CheatSheet';
import { GameCard } from './components/GameCard';
import { PerformanceAuditPanel } from './components/PerformanceAuditPanel';
import { Badge } from './components/ui/Badge';
import { CursorSwitcher } from './components/ui/CursorSwitcher';
import { NeonButton } from './components/ui/NeonButton';
import { SoundControls } from './components/ui/SoundControls';
import { ThemeSwitcher } from './components/ui/ThemeSwitcher';
import { useGemClaimStore } from './hooks/useGemClaimStore';
import { useUiAudio } from './hooks/useUiAudio';
import { SECRET_IDS } from './utils/codex';
import { applyCursorPreset } from './utils/cursors';
import { formatDateTime, isExpired } from './utils/date';
import { runPerformanceAudit } from './utils/performanceAudit';
import { applyThemePreset } from './utils/themes';

const KONAMI_SEQUENCE = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06
    }
  }
};

function StatPanel({ label, value, tone = 'cyan' }) {
  const styles = {
    cyan: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100',
    violet: 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-100',
    green: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
    red: 'border-red-400/20 bg-red-400/10 text-red-100'
  };

  return (
    <div className={[ 'rounded-[24px] border p-4', styles[tone] ?? styles.cyan ].join(' ')}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.32em] opacity-75">{label}</div>
      <div className="mt-2 font-display text-3xl font-bold uppercase tracking-[0.08em]">{value}</div>
    </div>
  );
}

export default function App() {
  const {
    state,
    visibleGames,
    isRefreshing,
    error,
    refreshGames,
    purgeExpiredGames,
    setUserKey,
    setViewMode,
    setPlatformFilter,
    setStatusFilter,
    setCursorPreset,
    setThemePreset,
    toggleSoundEnabled,
    setSoundPreset,
    setSearchQuery,
    registerCodexOpen,
    triggerKonamiProtocol,
    registerPrintTrap,
    setSecretModeEnabled
  } = useGemClaimStore();

  const [isPending, startTransition] = useTransition();
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [isPrintTrapOpen, setIsPrintTrapOpen] = useState(false);
  const [isKonamiRewardOpen, setIsKonamiRewardOpen] = useState(false);
  const [isPerformanceAuditRunning, setIsPerformanceAuditRunning] = useState(false);
  const [performanceAuditResult, setPerformanceAuditResult] = useState(null);
  const konamiProgressRef = useRef([]);
  const previousCheatSheetOpenRef = useRef(false);
  const { playSound } = useUiAudio(state.soundEnabled, state.soundPreset);

  useEffect(() => {
    applyCursorPreset(state.cursorPreset);
  }, [state.cursorPreset]);

  useEffect(() => {
    applyThemePreset(state.themePreset);
  }, [state.themePreset]);

  useEffect(() => {
    document.documentElement.dataset.secretMode = state.secretModeEnabled ? 'overdrive' : 'standard';

    return () => {
      document.documentElement.dataset.secretMode = 'standard';
    };
  }, [state.secretModeEnabled]);

  useEffect(() => {
    if (state.games.length === 0) {
      refreshGames();
    }
  }, [refreshGames, state.games.length]);

  useEffect(() => {
    if (isCheatSheetOpen && !previousCheatSheetOpenRef.current) {
      registerCodexOpen();
    }

    previousCheatSheetOpenRef.current = isCheatSheetOpen;
  }, [isCheatSheetOpen, registerCodexOpen]);

  useEffect(() => {
    function isTypingTarget(target) {
      return target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);
    }

    function advanceKonamiSequence(key) {
      const previousProgress = konamiProgressRef.current;
      const expectedKey = KONAMI_SEQUENCE[previousProgress.length];

      if (key === expectedKey) {
        const nextProgress = [...previousProgress, key];
        konamiProgressRef.current = nextProgress;
        return nextProgress.length === KONAMI_SEQUENCE.length;
      }

      konamiProgressRef.current = key === KONAMI_SEQUENCE[0] ? [key] : [];
      return konamiProgressRef.current.length === KONAMI_SEQUENCE.length;
    }

    function onKeyDown(event) {
      const isDesktop = window.matchMedia('(min-width: 768px) and (pointer: fine)').matches;
      const normalizedKey = event.key.toLowerCase();
      const isTyping = isTypingTarget(event.target);

      if ((event.ctrlKey || event.metaKey) && normalizedKey === 'p') {
        event.preventDefault();
        triggerPrintTrap();
        return;
      }

      if (event.key === 'Escape') {
        setIsCheatSheetOpen(false);
        setIsPrintTrapOpen(false);
        setIsKonamiRewardOpen(false);
        konamiProgressRef.current = [];
        return;
      }

      if (isDesktop && !event.ctrlKey && !event.metaKey && normalizedKey === 'z' && !isTyping) {
        event.preventDefault();
        setIsCheatSheetOpen((current) => !current);
        playSound('switch');
        return;
      }

      if (!event.ctrlKey && !event.metaKey && !event.altKey && !isTyping && KONAMI_SEQUENCE.includes(normalizedKey)) {
        const completedSequence = advanceKonamiSequence(normalizedKey);

        if (completedSequence) {
          triggerKonamiProtocol();
          setIsKonamiRewardOpen(true);
          playSound('refresh');
          playSound('save');
          konamiProgressRef.current = [];
        }
        return;
      }

      if (!isTyping && !event.ctrlKey && !event.metaKey && !event.altKey) {
        konamiProgressRef.current = [];
      }
    }

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [playSound]);

  const platforms = useMemo(() => {
    return Array.from(new Set(state.games.flatMap((game) => game.platforms))).sort((left, right) =>
      left.localeCompare(right)
    );
  }, [state.games]);

  const stats = useMemo(() => {
    const active = visibleGames.filter((game) => !isExpired(game.endDate)).length;
    const expired = visibleGames.length - active;
    const newGames = visibleGames.filter((game) => game.isNew).length;
    const storedKeys = Object.values(state.userKeys).filter((value) => Boolean(value?.trim())).length;

    return {
      active,
      expired,
      newGames,
      storedKeys
    };
  }, [state.userKeys, visibleGames]);

  function handleViewChange(viewMode) {
    startTransition(() => {
      setViewMode(viewMode);
    });
    playSound('switch');
  }

  function handlePlatformChange(event) {
    startTransition(() => {
      setPlatformFilter(event.target.value);
    });
    playSound('switch');
  }

  function handleStatusChange(event) {
    startTransition(() => {
      setStatusFilter(event.target.value);
    });
    playSound('switch');
  }

  function handleCursorChange(cursorPreset) {
    setCursorPreset(cursorPreset);
    playSound('switch');
  }

  function handleThemeChange(themePreset) {
    setThemePreset(themePreset);
    playSound('switch');
  }

  function handleSoundToggle() {
    toggleSoundEnabled();
  }

  function handleSoundPresetChange(soundPreset) {
    setSoundPreset(soundPreset);
    playSound('switch');
  }

  function handleSearchChange(event) {
    setSearchQuery(event.target.value);
  }

  function openCheatSheet() {
    setIsCheatSheetOpen(true);
    playSound('switch');
  }

  function closeCheatSheet() {
    setIsCheatSheetOpen(false);
  }

  function triggerPrintTrap() {
    registerPrintTrap();
    setIsPrintTrapOpen(true);
    playSound('purge');
  }

  function closePrintTrap() {
    setIsPrintTrapOpen(false);
  }

  function closeKonamiReward() {
    setIsKonamiRewardOpen(false);
  }

  async function handleRunPerformanceAudit() {
    if (isPerformanceAuditRunning) {
      return;
    }

    setIsPerformanceAuditRunning(true);

    try {
      const auditResult = await runPerformanceAudit({
        refreshBenchmark: async () => {
          playSound('refresh');
          return refreshGames();
        }
      });

      setPerformanceAuditResult(auditResult);
      playSound(auditResult.score >= 88 ? 'save' : 'switch');
    } catch {
      playSound('purge');
    } finally {
      setIsPerformanceAuditRunning(false);
    }
  }

  return (
    <div className={[ 'app-shell relative min-h-screen overflow-hidden bg-gray-950 text-slate-100', state.secretModeEnabled ? 'secret-mode' : '' ].join(' ')}>
      <div className="print-trap-screen">
        <img src="./world-gaming-print-trap.svg" alt="World Gaming HQ Print Trap" className="print-trap-image" />
      </div>

      <div className="theme-aura pointer-events-none absolute inset-0 opacity-90" />

      <CheatSheet
        isOpen={isCheatSheetOpen}
        onClose={closeCheatSheet}
        state={state}
        onToggleSecretMode={setSecretModeEnabled}
      />

      <AnimatePresence>
        {isKonamiRewardOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeKonamiReward}
              className="fixed inset-0 z-[70] bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.18),rgba(2,6,23,0.92)_58%)] backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 18 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-4 top-1/2 z-[71] mx-auto max-w-2xl -translate-y-1/2 overflow-hidden rounded-[32px] border border-amber-300/20 bg-slate-950/95 p-6 shadow-[0_0_65px_rgba(251,191,36,0.18)]"
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(251,191,36,0.12),transparent_45%,rgba(34,211,238,0.1))]" />
              <div className="relative">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-amber-200/85">
                  <Crown className="h-4 w-4" />
                  Konami Protocol
                </div>
                <h2 className="mt-3 font-display text-3xl font-black uppercase tracking-[0.12em] text-white text-glow">
                  Overdrive desbloqueado
                </h2>
                <p className="mt-3 text-base leading-6 text-slate-200">
                  El reactor del QG cambió de fase. Activaste el primer secreto real de Gem-Claim y el Codex ya registra tu acceso como operador retro de élite.
                </p>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-[24px] border border-amber-300/15 bg-amber-300/10 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-100/80">
                      Recompensa visual
                    </div>
                    <div className="mt-2 text-sm text-slate-100">
                      HUD en modo Overdrive con energía extra, glow reforzado y firma secreta del reactor.
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-cyan-300/15 bg-cyan-300/10 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/80">
                      Recompensa sistémica
                    </div>
                    <div className="mt-2 text-sm text-slate-100">
                      El Codex añade el protocolo a la lista de secretos descubiertos y habilita el toggle permanente.
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheatSheetOpen(true);
                      closeKonamiReward();
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-50 transition hover:bg-amber-300/15"
                  >
                    <BookOpenText className="h-4 w-4" />
                    Ver en Codex
                  </button>
                  <button
                    type="button"
                    onClick={closeKonamiReward}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-100 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
                  >
                    Seguir cazando
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isPrintTrapOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePrintTrap}
              className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-4 top-1/2 z-[61] mx-auto grid max-w-4xl -translate-y-1/2 gap-5 overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/95 p-4 shadow-[0_0_60px_rgba(192,132,252,0.18)] md:grid-cols-[1.15fr_0.85fr] md:p-5"
            >
              <div className="overflow-hidden rounded-[26px] border border-white/10 bg-slate-900/80">
                <img src="./world-gaming-print-trap.svg" alt="Print trap del World Gaming HQ" className="h-full w-full object-cover" />
              </div>

              <div className="flex flex-col justify-between gap-4 rounded-[26px] border border-fuchsia-400/20 bg-fuchsia-400/10 p-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-fuchsia-200/85">
                    <Printer className="h-4 w-4" />
                    Print Trap Triggered
                  </div>
                  <h2 className="mt-3 font-display text-3xl font-black uppercase tracking-[0.12em] text-white">
                    Acceso denegado
                  </h2>
                  <p className="mt-3 text-base leading-6 text-slate-200">
                    Intentaste imprimir los secretos del gran QG del World Gaming. El protocolo ceremonial anti-fugas ya se activó y ahora solo verás la escolta del ataúd del loot perdido.
                  </p>
                  <p className="mt-3 text-sm text-slate-300">
                    Prueba otra cosa: usa el Codex con Z, guarda tus keys o sigue cazando freebies como un operador táctico.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      window.print();
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-100 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
                  >
                    <BookOpenText className="h-4 w-4" />
                    Ver Print Troll
                  </button>
                  <button
                    type="button"
                    onClick={closePrintTrap}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-fuchsia-400/35 bg-fuchsia-400/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-100 transition hover:bg-fuchsia-400/15"
                  >
                    Volver al radar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex h-14 w-14 items-center justify-center rounded-3xl border border-cyan-400/35 bg-cyan-400/10 shadow-reactor"
              >
                <Flame className="h-7 w-7 text-cyan-200" />
              </motion.div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-3xl font-black uppercase tracking-[0.18em] text-white text-glow">
                    Gem-Claim
                  </h1>
                  <Badge tone="violet">PWA</Badge>
                  {state.secretModeEnabled ? <Badge tone="amber">Overdrive</Badge> : null}
                  <Badge tone={state.source === 'api' ? 'green' : 'amber'}>
                    {state.source === 'api' ? 'API Live' : 'Fallback Local'}
                  </Badge>
                </div>

                <p className="mt-2 max-w-3xl text-base text-slate-300">
                  Panel táctico para reclamar freebies de Steam, Epic, GOG y Prime Gaming con resguardo local de keys y purga inteligente.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 xl:justify-end">
              <NeonButton
                onClick={() => {
                  playSound('refresh');
                  refreshGames();
                }}
                disabled={isRefreshing}
                className="min-w-[170px]"
              >
                <motion.span
                  animate={isRefreshing ? { opacity: [0.7, 1, 0.7] } : { opacity: 1 }}
                  transition={{ repeat: isRefreshing ? Infinity : 0, duration: 1.1 }}
                  className="inline-flex items-center gap-2"
                >
                  <RefreshCcw
                    className={[
                      'h-4 w-4',
                      isRefreshing ? 'animate-spin text-cyan-200 drop-shadow-[0_0_10px_rgba(34,211,238,0.75)]' : ''
                    ].join(' ')}
                  />
                  <span>{isRefreshing ? 'Escaneando' : 'Refresh Reactor'}</span>
                </motion.span>
              </NeonButton>

              <NeonButton
                icon={Trash2}
                variant="secondary"
                onClick={() => {
                  playSound('purge');
                  purgeExpiredGames();
                }}
              >
                Purge Expired
              </NeonButton>

              <NeonButton icon={BookOpenText} variant="ghost" onClick={openCheatSheet} className="hidden md:inline-flex">
                Cheat Sheet
              </NeonButton>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-12">
            <div className="glass-panel flex min-w-0 flex-col gap-4 rounded-[30px] border-white/10 p-4 xl:col-span-7 2xl:col-span-8">
              <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)] xl:items-start">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="grid grid-cols-2 gap-2">
                    <NeonButton
                      icon={LayoutGrid}
                      variant="ghost"
                      active={state.viewMode === 'grid'}
                      onClick={() => handleViewChange('grid')}
                      className="justify-center"
                    >
                      Vista Grid
                    </NeonButton>
                    <NeonButton
                      icon={List}
                      variant="ghost"
                      active={state.viewMode === 'list'}
                      onClick={() => handleViewChange('list')}
                      className="justify-center"
                    >
                      Vista Lista
                    </NeonButton>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                    <div className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200/80">
                      Última sincronía
                    </div>
                    <div className="mt-2 text-base text-white break-words">
                      {state.lastUpdated ? formatDateTime(state.lastUpdated) : 'Pendiente'}
                    </div>
                  </div>
                </div>

                <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(150px,0.8fr)_minmax(150px,0.8fr)]">
                  <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                    Scan por título y tags
                    <div className="relative min-w-0">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--accent-rgb))]" />
                      <input
                        type="text"
                        value={state.searchQuery}
                        onChange={handleSearchChange}
                        placeholder="steam, rpg, bundle, neon..."
                        className="h-12 w-full min-w-0 rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none transition focus:border-[rgba(var(--accent-rgb),0.5)]"
                      />
                    </div>
                  </label>

                  <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                    Plataforma
                    <select
                      value={state.platformFilter}
                      onChange={handlePlatformChange}
                      className="h-12 min-w-0 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-cyan-400/50"
                    >
                      <option value="all">Todas</option>
                      {platforms.map((platform) => (
                        <option key={platform} value={platform}>
                          {platform}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex min-w-0 flex-col gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                    Estado
                    <select
                      value={state.statusFilter}
                      onChange={handleStatusChange}
                      className="h-12 min-w-0 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-cyan-400/50"
                    >
                      <option value="all">Todos</option>
                      <option value="active">Activos</option>
                      <option value="expired">Expirados</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="grid gap-3 grid-cols-2 2xl:grid-cols-4">
                <StatPanel label="Activos" value={stats.active} tone="cyan" />
                <StatPanel label="Expirados" value={stats.expired} tone="red" />
                <StatPanel label="Drops nuevos" value={stats.newGames} tone="violet" />
                <StatPanel label="Keys blindadas" value={stats.storedKeys} tone="green" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:col-span-5 xl:grid-cols-1 2xl:col-span-4 2xl:grid-cols-1">
              <CursorSwitcher value={state.cursorPreset} onChange={handleCursorChange} />
              <ThemeSwitcher value={state.themePreset} onChange={handleThemeChange} />
              <SoundControls
                enabled={state.soundEnabled}
                preset={state.soundPreset}
                onToggle={handleSoundToggle}
                onPresetChange={handleSoundPresetChange}
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-slate-300">
          <div className="radar-chip flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2">
            <Radar className="h-4 w-4 text-cyan-300" />
            {visibleGames.length} giveaways visibles
          </div>
          <div className="radar-chip flex items-center gap-2 rounded-full border border-fuchsia-400/25 bg-fuchsia-400/10 px-4 py-2">
            <Sparkles className="h-4 w-4 text-fuchsia-300" />
            Transición de layout {isPending ? 'en curso' : 'estable'}
          </div>
          <div className="radar-chip flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2">
            <BookOpenText className="h-4 w-4 text-cyan-300" />
            Codex gamer con Z en escritorio
          </div>
          <div className={[ 'radar-chip flex items-center gap-2 rounded-full px-4 py-2', state.secretModeEnabled ? 'border border-amber-300/30 bg-amber-300/10 text-amber-50' : 'border border-white/10 bg-white/5 text-slate-300' ].join(' ')}>
            <Crown className="h-4 w-4" />
            Overdrive {state.discoveredSecrets[SECRET_IDS.KONAMI] ? state.secretModeEnabled ? 'activo' : 'desbloqueado' : 'bloqueado'}
          </div>
          <div className="radar-chip flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2">
            <Search className="h-4 w-4 text-emerald-300" />
            Búsqueda sobre título, plataforma y tags
          </div>
          <div className="radar-chip flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <AudioLines className="h-4 w-4 text-slate-200" />
            Audio UI {state.soundEnabled ? `activo (${state.soundPreset})` : 'desactivado'}
          </div>
          <div className="radar-chip flex items-center gap-2 rounded-full border border-red-400/25 bg-red-400/10 px-4 py-2">
            <ShieldAlert className="h-4 w-4 text-red-300" />
            Purga preserva cualquier key guardada
          </div>
        </div>

        <LayoutGroup>
          <motion.section
            layout
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={[
              state.viewMode === 'grid'
                ? 'grid gap-5 md:grid-cols-2 2xl:grid-cols-3'
                : 'grid gap-5'
            ].join(' ')}
          >
            <AnimatePresence mode="popLayout">
              {visibleGames.map((game, index) => (
                <GameCard
                  key={game.id}
                  game={game}
                  index={index}
                  viewMode={state.viewMode}
                  userKey={state.userKeys[game.id]}
                  onSaveKey={setUserKey}
                  onActionSound={playSound}
                />
              ))}
            </AnimatePresence>
          </motion.section>
        </LayoutGroup>

        {visibleGames.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel mx-auto mt-12 max-w-3xl rounded-[32px] border-white/10 p-10 text-center"
          >
            <h2 className="font-display text-2xl font-bold uppercase tracking-[0.16em] text-white">
              Sin giveaways en radar
            </h2>
            <p className="mt-3 text-lg text-slate-300">
              Ajusta filtros, ejecuta un refresh o recupera keys guardadas en localStorage para volver a poblar la consola.
            </p>
          </motion.div>
        ) : null}

        <PerformanceAuditPanel
          result={performanceAuditResult}
          isRunning={isPerformanceAuditRunning}
          onRun={handleRunPerformanceAudit}
        />
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-slate-950/55 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 sm:px-6 lg:px-8">
          Gem-Claim Tactical Footer · usa el probe para medir si el reactor necesita optimización real.
        </div>
      </footer>

      <button
        type="button"
        onClick={openCheatSheet}
        className="fixed bottom-5 right-4 z-30 inline-flex h-14 items-center gap-2 rounded-full border border-cyan-400/30 bg-slate-950/85 px-4 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.2)] backdrop-blur-xl transition hover:border-cyan-300/60 hover:bg-cyan-400/10 md:hidden"
        aria-label="Abrir cheat sheet"
      >
        <BookOpenText className="h-4 w-4" />
        Codex
      </button>
    </div>
  );
}