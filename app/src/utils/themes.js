export const themePresets = [
  {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    accent: '#22d3ee',
    secondary: '#c084fc',
    success: '#22c55e'
  },
  {
    id: 'arcade',
    label: 'Arcade',
    accent: '#f97316',
    secondary: '#fb7185',
    success: '#facc15'
  },
  {
    id: 'xbox-nebula',
    label: 'Xbox Nebula',
    accent: '#22c55e',
    secondary: '#22d3ee',
    success: '#bef264'
  }
];

export function applyThemePreset(themeId) {
  const root = document.documentElement;
  const selectedTheme = themePresets.find((theme) => theme.id === themeId) ?? themePresets[0];

  root.dataset.theme = selectedTheme.id;
}