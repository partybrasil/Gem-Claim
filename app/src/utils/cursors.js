function svgCursor(svg, fallback = 'pointer') {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 16 16, ${fallback}`;
}

export const cursorPresets = [
  {
    id: 'crosshair',
    label: 'Crosshair',
    cursor: 'crosshair'
  },
  {
    id: 'pixel-hand',
    label: 'Anime Hand',
    cursor: svgCursor(
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="#22d3ee" d="M11 3h3v10h1V5h3v8h1V7h3v10h1v-5h3v10c0 4-3 7-7 7h-4c-2 0-4-1-5-3L7 18c-1-1-1-3 1-4s3 0 4 1V3Z"/><path fill="#a855f7" d="M11 3h2v11h-2zm4 2h2v11h-2zm4 2h2v11h-2z"/></svg>'
    )
  },
  {
    id: 'katana',
    label: 'Katana',
    cursor: svgCursor(
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="#e2e8f0" d="M26 3 9 20l3 3L29 6l-3-3Z"/><path fill="#22d3ee" d="m7 22 3 3-5 4-2-2 4-5Z"/><path fill="#16a34a" d="m24 5 3 3 2-2-3-3-2 2Z"/></svg>',
      'crosshair'
    )
  },
  {
    id: 'gem',
    label: 'Gem',
    cursor: svgCursor(
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="#22d3ee" d="M16 2 5 12l11 18 11-18L16 2Z"/><path fill="#cffafe" d="m16 2-4 10h8L16 2Z"/><path fill="#c084fc" d="m5 12 7 0 4 18L5 12Zm22 0h-7l-4 18 11-18Z"/></svg>',
      'pointer'
    )
  },
  {
    id: 'blaster',
    label: 'Blaster',
    cursor: svgCursor(
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="#e2e8f0" d="M6 20 18 8l8 2-4 4 2 2-4 4-2-2-8 8-4-6Z"/><path fill="#22d3ee" d="m24 8 4 4-2 2-4-4 2-2Z"/><path fill="#f97316" d="M4 26 2 30l4-2 2-4-4 2Z"/></svg>',
      'crosshair'
    )
  },
  {
    id: 'gauntlet',
    label: 'Gauntlet',
    cursor: svgCursor(
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="#22c55e" d="M8 5h5v6h2V7h4v6h2V9h4v12c0 4-3 6-7 6h-4c-3 0-5-1-6-4L5 15c-1-1 0-3 2-4 2 0 3 1 3 2V5Z"/><path fill="#bef264" d="M8 5h4v7H8zm7 2h3v8h-3zm6 2h3v7h-3z"/></svg>',
      'pointer'
    )
  }
];

export function applyCursorPreset(presetId) {
  const selectedPreset = cursorPresets.find((preset) => preset.id === presetId) ?? cursorPresets[0];
  document.documentElement.style.cursor = selectedPreset.cursor;
  document.body.style.cursor = selectedPreset.cursor;
}