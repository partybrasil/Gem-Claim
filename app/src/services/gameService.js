import { mockGiveaways } from '../data/mockGiveaways';

const API_URL = 'https://www.gamerpower.com/api/giveaways';
const GAMERPOWER_HOME_URL = 'https://www.gamerpower.com';

function splitPlatforms(platforms) {
  return String(platforms ?? '')
    .split(',')
    .map((platform) => platform.trim())
    .filter(Boolean);
}

function buildTags(game, platforms) {
  const text = `${game.title ?? ''} ${game.description ?? ''}`.toLowerCase();
  const keywords = [
    'rpg',
    'shooter',
    'strategy',
    'survival',
    'sim',
    'roguelike',
    'pixel',
    'anime',
    'cyberpunk',
    'pvp',
    'coop',
    'metroidvania',
    'bundle',
    'loot',
    'dlc',
    'access'
  ].filter((keyword) => text.includes(keyword));

  return [...new Set(['free', String(game.type ?? 'game').toLowerCase(), ...platforms.map((platform) => platform.toLowerCase()), ...keywords])];
}

function slugifyGiveawayTitle(title) {
  return String(title ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isGenericGamerPowerUrl(url) {
  const normalizedUrl = String(url ?? '').trim().replace(/\/$/, '');
  return normalizedUrl === GAMERPOWER_HOME_URL;
}

export function normalizeClaimUrl(game) {
  const candidates = [game.open_giveaway_url, game.open_giveaway, game.gamerpower_url]
    .map((url) => String(url ?? '').trim())
    .filter(Boolean);

  const preferredUrl = candidates.find((url) => !isGenericGamerPowerUrl(url));

  if (preferredUrl) {
    return preferredUrl;
  }

  const slug = slugifyGiveawayTitle(game.title);

  if (slug) {
    return `${GAMERPOWER_HOME_URL}/open/${slug}`;
  }

  return GAMERPOWER_HOME_URL;
}

export function normalizeGame(game) {
  const platforms = splitPlatforms(game.platforms);

  return {
    id: Number(game.id),
    title: game.title ?? 'Sin título',
    description: game.description ?? 'Sin descripción',
    image: game.image ?? game.thumbnail,
    thumbnail: game.thumbnail ?? game.image,
    worth: game.worth ?? '$0.00',
    claimUrl: normalizeClaimUrl(game),
    publishedDate: game.published_date ?? null,
    endDate: game.end_date ?? null,
    platforms,
    users: Number(game.users ?? 0),
    type: game.type ?? 'Game',
    isNew: Boolean(game.isNew),
    tags: buildTags(game, platforms)
  };
}

export async function fetchGiveaways() {
  try {
    const response = await fetch(API_URL, {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();

    if (!Array.isArray(payload) || payload.length === 0) {
      throw new Error('Payload vacío');
    }

    return {
      source: 'api',
      games: payload.map(normalizeGame)
    };
  } catch {
    return {
      source: 'fallback',
      games: mockGiveaways.map(normalizeGame)
    };
  }
}