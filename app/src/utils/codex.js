export const SECRET_IDS = {
  KONAMI: 'konami-protocol',
  PRINT_TRAP: 'print-trap'
};

export const CONTROL_TRICKS = [
  {
    title: 'Abrir Codex',
    input: 'Z',
    detail: 'Abre o cierra el panel táctico del QG en escritorio sin salir del radar.'
  },
  {
    title: 'Cerrar Overlays',
    input: 'Esc',
    detail: 'Cierra el Codex, recompensas y capas activas con una salida rápida.'
  }
];

export const TACTICAL_COMBOS = [
  'Refresh Reactor + filtro Activos para detectar drops frescos en la primera pasada.',
  'Guardar key + Purge Expired para limpiar ruido sin perder loot blindado.',
  'Theme Deck + Cursor Rig + Sound FX para convertir el panel en tu loadout personal.'
];

export const SECRET_REGISTRY = {
  [SECRET_IDS.KONAMI]: {
    id: SECRET_IDS.KONAMI,
    code: '↑ ↑ ↓ ↓ ← → ← → B A',
    name: 'Konami Protocol',
    hint: 'Secuencia de entrada clásica. Activa Overdrive en el QG y revela una capa secreta del radar.',
    description:
      'Activa el modo Overdrive del reactor, eleva la señal HUD y marca tu terminal como operador legendario.',
    reward: 'Desbloquea el modo secreto Overdrive y un logro de operador retro.',
    visibility: 'listed'
  },
  [SECRET_IDS.PRINT_TRAP]: {
    id: SECRET_IDS.PRINT_TRAP,
    code: 'Ctrl/Cmd + P',
    name: 'World Gaming HQ Print Trap',
    hint: 'Protocolo clasificado.',
    description:
      'El panel detecta intentos de exfiltrar el QG en papel y responde con una ceremonia anti-fugas.',
    reward: 'Desbloquea un secreto oculto del sistema de seguridad del cuartel.',
    visibility: 'hidden'
  }
};

const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first-scan',
    name: 'Radar Inicializado',
    description: 'Lanza al menos un refresh y sincroniza el feed del reactor.',
    isUnlocked: (state) => state.activity.refreshCount >= 1,
    progress: (state) => [Math.min(state.activity.refreshCount, 1), 1]
  },
  {
    id: 'vault-online',
    name: 'Boveda Online',
    description: 'Guarda tu primera key y activa la proteccion del loot.',
    isUnlocked: (state) => Object.values(state.userKeys).some((value) => Boolean(value?.trim())),
    progress: (state) => [
      Math.min(
        Object.values(state.userKeys).filter((value) => Boolean(value?.trim())).length,
        1
      ),
      1
    ]
  },
  {
    id: 'clean-sweep',
    name: 'Barrido Tactico',
    description: 'Ejecuta una purga para despejar giveaways expirados.',
    isUnlocked: (state) => state.activity.purgeCount >= 1,
    progress: (state) => [Math.min(state.activity.purgeCount, 1), 1]
  },
  {
    id: 'ghost-signal',
    name: 'Ghost Signal',
    description: 'Descubre tu primer secreto del QG gamer.',
    isUnlocked: (state) => Object.keys(state.discoveredSecrets).length >= 1,
    progress: (state) => [Math.min(Object.keys(state.discoveredSecrets).length, 1), 1]
  },
  {
    id: 'retro-ace',
    name: 'Retro Ace',
    description: 'Completa el Konami Protocol y enciende Overdrive.',
    isUnlocked: (state) => Boolean(state.discoveredSecrets[SECRET_IDS.KONAMI]),
    progress: (state) => [Boolean(state.discoveredSecrets[SECRET_IDS.KONAMI]) ? 1 : 0, 1]
  }
];

export function buildVisibleSecrets(discoveredSecrets) {
  return Object.values(SECRET_REGISTRY)
    .filter((secret) => secret.visibility === 'listed' || discoveredSecrets[secret.id])
    .map((secret) => {
      const discovery = discoveredSecrets[secret.id];
      const isUnlocked = Boolean(discovery);

      return {
        ...secret,
        isUnlocked,
        status: isUnlocked ? 'Descubierto' : 'Encriptado',
        description: isUnlocked ? secret.description : secret.hint,
        rewardText: secret.reward,
        unlockedAt: discovery?.unlockedAt ?? null,
        discoveryCount: discovery?.count ?? 0
      };
    });
}

export function buildAchievements(state) {
  return ACHIEVEMENT_DEFINITIONS.map((achievement) => {
    const unlocked = achievement.isUnlocked(state);
    const [current, goal] = achievement.progress(state);

    return {
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      unlocked,
      progressLabel: unlocked ? 'Completado' : current === 0 ? 'Pendiente' : current + '/' + goal
    };
  });
}

export function buildCodexStats(state) {
  const unlockedAchievements = buildAchievements(state).filter((entry) => entry.unlocked).length;
  const discoveredSecrets = Object.keys(state.discoveredSecrets).length;

  return {
    discoveredSecrets,
    unlockedAchievements,
    codexVisits: state.activity.codexOpenCount,
    overdriveUnlocked: Boolean(state.discoveredSecrets[SECRET_IDS.KONAMI])
  };
}
