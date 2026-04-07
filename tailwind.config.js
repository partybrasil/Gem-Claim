/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/index.html', './app/src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        abyss: '#020617',
        panel: '#0f172a',
        neon: {
          cyan: '#22d3ee',
          violet: '#c084fc',
          green: '#22c55e',
          red: '#ef4444'
        }
      },
      boxShadow: {
        reactor: '0 0 0 1px rgba(34, 211, 238, 0.35), 0 0 30px rgba(34, 211, 238, 0.28), inset 0 0 22px rgba(192, 132, 252, 0.12)',
        neon: '0 0 0 1px rgba(34, 211, 238, 0.26), 0 0 26px rgba(34, 211, 238, 0.18)',
        violet: '0 0 0 1px rgba(192, 132, 252, 0.25), 0 0 26px rgba(192, 132, 252, 0.22)'
      },
      backgroundImage: {
        'grid-fade': 'radial-gradient(circle at top, rgba(34,211,238,0.1), transparent 32%), linear-gradient(rgba(15,23,42,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.6) 1px, transparent 1px)'
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Rajdhani', 'sans-serif']
      }
    }
  },
  plugins: []
};