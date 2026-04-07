const UNKNOWN_VALUES = new Set(['', 'N/A', 'Never', null, undefined]);

export function parseDate(value) {
  if (UNKNOWN_VALUES.has(value)) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function isExpired(endDate) {
  const parsedDate = parseDate(endDate);

  if (!parsedDate) {
    return false;
  }

  return parsedDate.getTime() < Date.now();
}

export function formatDate(value) {
  const parsedDate = parseDate(value);

  if (!parsedDate) {
    return 'Sin límite';
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(parsedDate);
}

export function formatDateTime(value) {
  const parsedDate = parseDate(value);

  if (!parsedDate) {
    return 'No informado';
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(parsedDate);
}

export function formatPlayers(value) {
  return new Intl.NumberFormat('es-ES', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value ?? 0);
}