import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, Copy, ExternalLink, KeyRound, Save, Sparkles, Tag, Users } from 'lucide-react';
import { Badge } from './ui/Badge';
import { ExpiredRibbon } from './ui/ExpiredRibbon';
import { formatDate, formatDateTime, formatPlayers, isExpired } from '../utils/date';

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.42,
      delay: index * 0.07,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

export function GameCard({ game, index, viewMode, userKey, onSaveKey, onActionSound }) {
  const [draftKey, setDraftKey] = useState(userKey ?? '');
  const [copied, setCopied] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, scale: 1 });
  const expired = useMemo(() => isExpired(game.endDate), [game.endDate]);

  useEffect(() => {
    setDraftKey(userKey ?? '');
  }, [userKey]);

  async function handleCopy() {
    if (!userKey) {
      return;
    }

    await navigator.clipboard.writeText(userKey);
    onActionSound?.('copy');
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function handleSave() {
    onSaveKey(game.id, draftKey);
    onActionSound?.('save');
  }

  function handleMouseMove(event) {
    const { currentTarget, clientX, clientY } = event;
    const rect = currentTarget.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 7;
    const rotateX = (0.5 - (y / rect.height)) * 7;
    setTilt({ rotateX, rotateY, scale: 1.01 });
  }

  function resetTilt() {
    setTilt({ rotateX: 0, rotateY: 0, scale: 1 });
  }

  return (
    <motion.article
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: 12 }}
      custom={index}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
        scale: tilt.scale
      }}
      className={[
        'game-card glass-panel neon-outline group relative overflow-hidden rounded-[28px] border p-4 sm:p-5',
        viewMode === 'list' ? 'flex flex-col gap-4 lg:flex-row' : 'flex h-full flex-col gap-4',
        expired ? 'opacity-70 saturate-50' : 'opacity-100'
      ].join(' ')}
    >
      {expired ? <ExpiredRibbon /> : null}

      <div className={viewMode === 'list' ? 'lg:w-[290px] lg:flex-shrink-0' : ''}>
        <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/70">
          <img
            src={game.image}
            alt={game.title}
            className={[
              'h-52 w-full object-cover transition duration-500 group-hover:scale-[1.03]',
              viewMode === 'list' ? 'lg:h-full lg:max-h-[270px]' : ''
            ].join(' ')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <Badge tone="green">FREE</Badge>
            {game.isNew ? <Badge tone="violet">Nuevo</Badge> : null}
            <Badge tone={expired ? 'red' : 'cyan'}>{expired ? 'Expirado' : game.type}</Badge>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {game.platforms.map((platform) => (
              <Badge key={platform}>{platform}</Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {(game.tags ?? []).slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="font-display text-2xl font-bold uppercase tracking-[0.08em] text-white">
                {game.title}
              </h3>
              <p className="mt-2 max-w-2xl text-base leading-6 text-slate-300">{game.description}</p>
            </div>

            <div className="flex flex-col items-start rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-left shadow-[0_0_24px_rgba(34,197,94,0.18)]">
              <span className="text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-200/80">
                Valor original
              </span>
              <span className="text-xl font-bold text-emerald-300 line-through">{game.worth}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200/80">
              <CalendarClock className="h-4 w-4" />
              Inicio
            </div>
            <div className="mt-2 text-base text-white">{formatDate(game.publishedDate)}</div>
            <div className="text-xs text-slate-400">{formatDateTime(game.publishedDate)}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-200/80">
              <Sparkles className="h-4 w-4" />
              Finaliza
            </div>
            <div className="mt-2 text-base text-white">{formatDate(game.endDate)}</div>
            <div className="text-xs text-slate-400">{expired ? 'Oferta cerrada' : formatDateTime(game.endDate)}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200/80">
              <Users className="h-4 w-4" />
              Claims
            </div>
            <div className="mt-2 text-base text-white">{formatPlayers(game.users)}</div>
            <div className="text-xs text-slate-400">Jugadores rastreados</div>
          </div>
        </div>

        <div className="rounded-[24px] border border-cyan-400/20 bg-slate-950/65 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/85">
            <KeyRound className="h-4 w-4" />
            Bóveda de key
          </div>

          <div className="flex flex-col gap-3 xl:flex-row">
            <input
              type="text"
              value={draftKey}
              onChange={(event) => setDraftKey(event.target.value)}
              placeholder="Pega tu key o código de canje"
              className="h-12 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 text-base text-white outline-none transition focus:border-cyan-400/50 focus:bg-cyan-400/5"
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-cyan-400/40 bg-cyan-400/10 px-4 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100 transition hover:bg-cyan-400/15"
              >
                <Save className="h-4 w-4" />
                Guardar
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!userKey}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-fuchsia-400/35 bg-fuchsia-400/10 px-4 text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-100 transition hover:bg-fuchsia-400/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Copiada' : 'Copiar'}
              </button>
              <a
                href={game.claimUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-emerald-400/35 bg-emerald-400/10 px-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100 transition hover:bg-emerald-400/15"
              >
                <ExternalLink className="h-4 w-4" />
                Reclamar
              </a>
            </div>
          </div>

          {userKey ? (
            <div className="mt-3 text-sm text-emerald-300">
              Key protegida en localStorage y disponible incluso si la promo expira.
            </div>
          ) : (
            <div className="mt-3 text-sm text-slate-400">
              Guarda tu código para mantener visible este giveaway aunque se purgue por expiración.
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}