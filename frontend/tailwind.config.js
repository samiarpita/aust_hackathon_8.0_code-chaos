/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        radar: {
          light: {
            base: '#F8F6FD',
            glass: 'rgba(255, 255, 255, 0.70)',
            border: 'rgba(180, 155, 222, 0.28)',
            heading: '#231735',
            body: '#3E2E54',
            muted: '#6C5B82',
            primary: '#7847EB',
          },
          dark: {
            base: '#0F0A19',
            glass: 'rgba(28, 19, 44, 0.65)',
            border: 'rgba(196, 171, 240, 0.15)',
            heading: '#FAF7FD',
            body: '#EDE4F8',
            muted: '#CAB7E4',
            primary: '#B388FF',
          },
          insight: {
            light: {
              text: '#5B21B6',
              border: '#C4B5FD',
              bg: 'rgba(124, 58, 237, 0.08)',
            },
            dark: {
              text: '#DDD6FE',
              border: '#8B5CF6',
              bg: 'rgba(139, 92, 246, 0.14)',
            }
          },
          intervention: {
            light: {
              text: '#9D174D',
              border: '#FBCFE8',
              bg: 'rgba(244, 63, 94, 0.08)',
            },
            dark: {
              text: '#FBCFE8',
              border: '#F472B6',
              bg: 'rgba(244, 114, 182, 0.14)',
            }
          }
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(120, 71, 235, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glow-primary': '0 0 25px rgba(120, 71, 235, 0.35)',
        'glow-violet': '0 0 25px rgba(179, 136, 255, 0.35)',
        'glow-rose': '0 0 25px rgba(244, 114, 182, 0.3)',
      },
      animation: {
        'radar-sweep': 'sweep 4s linear infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
