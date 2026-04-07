import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchGiveaways } from '../services/gameService';
import { isExpired } from '../utils/date';

const STORAGE_KEY = 'gem-claim-store-v2';

const initialState = {
  games: [],
  userKeys: {},
  purgedIds: [],
  discoveredSecrets: {},
  secretModeEnabled: false,
  activity: {
    refreshCount: 0,
    purgeCount: 0,
    codexOpenCount: 0,
    keySaveCount: 0,
    printTrapCount: 0,
    konamiCount: 0
  },
  viewMode: 'grid',
  platformFilter: 'all',
  statusFilter: 'all',
  searchQuery: '',
  cursorPreset: 'crosshair',
  themePreset: 'cyberpunk',
  soundEnabled: false,
  soundPreset: 'reactor',
  lastUpdated: null,
  source: 'fallback'
};

function loadState() {
  if (typeof window === 'undefined') {
    return initialState;
  }

  try {
    const rawState = window.localStorage.getItem(STORAGE_KEY);

    if (!rawState) {
      return initialState;
    }

    return {
      ...initialState,
      ...JSON.parse(rawState)
    };
  } catch {
    return initialState;
  }
}

export function useGemClaimStore() {
  const [state, setState] = useState(loadState);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const visibleGames = useMemo(() => {
    return state.games.filter((game) => {
      const hasSavedKey = Boolean(state.userKeys[game.id]?.trim());

      if (state.purgedIds.includes(game.id) && !hasSavedKey) {
        return false;
      }

      if (state.platformFilter !== 'all' && !game.platforms.includes(state.platformFilter)) {
        return false;
      }

      if (state.statusFilter === 'active' && isExpired(game.endDate)) {
        return false;
      }

      if (state.statusFilter === 'expired' && !isExpired(game.endDate)) {
        return false;
      }

      if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase();
        const searchableText = [
          game.title,
          game.description,
          game.type,
          ...game.platforms,
          ...(game.tags ?? [])
        ]
          .join(' ')
          .toLowerCase();

        if (!searchableText.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [state.games, state.platformFilter, state.purgedIds, state.searchQuery, state.statusFilter, state.userKeys]);

  const refreshGames = useCallback(async () => {
    setIsRefreshing(true);
    setError('');

    try {
      const { games, source } = await fetchGiveaways();

      setState((previousState) => {
        const existingIds = new Set(previousState.games.map((game) => game.id));

        // El motor de refresco marca solo las entradas nuevas frente al snapshot previo.
        // Cualquier juego ya conocido pierde el badge isNew en esta actualización.
        const nextGames = games.map((game) => ({
          ...game,
          isNew: !existingIds.has(game.id)
        }));

        return {
          ...previousState,
          games: nextGames,
          activity: {
            ...previousState.activity,
            refreshCount: previousState.activity.refreshCount + 1
          },
          source,
          lastUpdated: new Date().toISOString()
        };
      });
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'No fue posible actualizar los giveaways.');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  function purgeExpiredGames() {
    setState((previousState) => {
      const protectedIds = new Set(
        Object.entries(previousState.userKeys)
          .filter(([, value]) => Boolean(value?.trim()))
          .map(([gameId]) => Number(gameId))
      );

      // La purga solo oculta expirados sin key guardada.
      // Si el usuario salvó una key, el juego queda visible aunque haya terminado.
      const nextPurgedIds = previousState.games.reduce((ids, game) => {
        if (isExpired(game.endDate) && !protectedIds.has(game.id)) {
          ids.push(game.id);
        }

        return ids;
      }, [...previousState.purgedIds]);

      return {
        ...previousState,
        activity: {
          ...previousState.activity,
          purgeCount: previousState.activity.purgeCount + 1
        },
        purgedIds: [...new Set(nextPurgedIds)]
      };
    });
  }

  function setUserKey(gameId, value) {
    setState((previousState) => {
      const nextKeys = {
        ...previousState.userKeys
      };
      const normalizedValue = value.trim();
      const previousValue = previousState.userKeys[gameId]?.trim() ?? '';
      const isNewSave = Boolean(normalizedValue) && normalizedValue !== previousValue;

      if (!normalizedValue) {
        delete nextKeys[gameId];
      } else {
        nextKeys[gameId] = normalizedValue;
      }

      return {
        ...previousState,
        activity: {
          ...previousState.activity,
          keySaveCount: isNewSave ? previousState.activity.keySaveCount + 1 : previousState.activity.keySaveCount
        },
        userKeys: nextKeys
      };
    });
  }

  function registerCodexOpen() {
    setState((previousState) => ({
      ...previousState,
      activity: {
        ...previousState.activity,
        codexOpenCount: previousState.activity.codexOpenCount + 1
      }
    }));
  }

  function registerSecretDiscovery(secretId) {
    setState((previousState) => {
      const existingSecret = previousState.discoveredSecrets[secretId];

      return {
        ...previousState,
        discoveredSecrets: {
          ...previousState.discoveredSecrets,
          [secretId]: {
            unlockedAt: existingSecret?.unlockedAt ?? new Date().toISOString(),
            count: (existingSecret?.count ?? 0) + 1
          }
        }
      };
    });
  }

  function triggerKonamiProtocol() {
    setState((previousState) => {
      const existingSecret = previousState.discoveredSecrets['konami-protocol'];

      return {
        ...previousState,
        secretModeEnabled: true,
        activity: {
          ...previousState.activity,
          konamiCount: previousState.activity.konamiCount + 1
        },
        discoveredSecrets: {
          ...previousState.discoveredSecrets,
          'konami-protocol': {
            unlockedAt: existingSecret?.unlockedAt ?? new Date().toISOString(),
            count: (existingSecret?.count ?? 0) + 1
          }
        }
      };
    });
  }

  function registerPrintTrap() {
    setState((previousState) => {
      const existingSecret = previousState.discoveredSecrets['print-trap'];

      return {
        ...previousState,
        activity: {
          ...previousState.activity,
          printTrapCount: previousState.activity.printTrapCount + 1
        },
        discoveredSecrets: {
          ...previousState.discoveredSecrets,
          'print-trap': {
            unlockedAt: existingSecret?.unlockedAt ?? new Date().toISOString(),
            count: (existingSecret?.count ?? 0) + 1
          }
        }
      };
    });
  }

  function setSecretModeEnabled(secretModeEnabled) {
    setState((previousState) => ({
      ...previousState,
      secretModeEnabled
    }));
  }

  function setViewMode(viewMode) {
    setState((previousState) => ({
      ...previousState,
      viewMode
    }));
  }

  function setPlatformFilter(platformFilter) {
    setState((previousState) => ({
      ...previousState,
      platformFilter
    }));
  }

  function setStatusFilter(statusFilter) {
    setState((previousState) => ({
      ...previousState,
      statusFilter
    }));
  }

  function setCursorPreset(cursorPreset) {
    setState((previousState) => ({
      ...previousState,
      cursorPreset
    }));
  }

  function setThemePreset(themePreset) {
    setState((previousState) => ({
      ...previousState,
      themePreset
    }));
  }

  function toggleSoundEnabled() {
    setState((previousState) => ({
      ...previousState,
      soundEnabled: !previousState.soundEnabled
    }));
  }

  function setSoundPreset(soundPreset) {
    setState((previousState) => ({
      ...previousState,
      soundPreset
    }));
  }

  function setSearchQuery(searchQuery) {
    setState((previousState) => ({
      ...previousState,
      searchQuery
    }));
  }

  return {
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
    registerSecretDiscovery,
    triggerKonamiProtocol,
    registerPrintTrap,
    setSecretModeEnabled
  };
}