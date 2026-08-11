import type { Config } from 'tailwindcss';

/**
 * Design tokens diambil langsung dari logo Semesta Bumi Jayati.
 * Warna di-sample dari file logo (PNG) agar identik dengan brand.
 *   #011E46 navy tua (busur bumi / langit)
 *   #17418D biru (highlight orbit)
 *   #165326 hijau tua (daun & wordmark)
 *   #6A9929 hijau daun (aksen)
 *   #F1F1EB krem (background logo)
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      // Nilai opacity tambahan yang dipakai pada border/background halus.
      opacity: {
        4: '0.04',
        6: '0.06',
        8: '0.08',
        12: '0.12',
        15: '0.15',
        18: '0.18',
        35: '0.35',
      },
      borderOpacity: {
        8: '0.08',
        12: '0.12',
        15: '0.15',
        18: '0.18',
      },
      colors: {
        navy: {
          50: '#EEF2F9',
          100: '#D6E0F0',
          200: '#A9BEDD',
          300: '#7495C6',
          400: '#3F6AAB',
          500: '#17418D',
          600: '#123670',
          700: '#0B2857',
          800: '#05203F',
          900: '#011E46',
          950: '#001129',
        },
        forest: {
          50: '#EEF6EF',
          100: '#D6E9D9',
          200: '#ADD3B4',
          300: '#7FB78B',
          400: '#4E9762',
          500: '#2C7A43',
          600: '#1F6634',
          700: '#165326',
          800: '#10401D',
          900: '#0A2C14',
        },
        leaf: {
          50: '#F4F8EA',
          100: '#E6EFCF',
          200: '#CDDFA1',
          300: '#AFCB6C',
          400: '#8CB543',
          500: '#6A9929',
          600: '#557B20',
          700: '#425F1A',
          800: '#324715',
          900: '#22300E',
        },
        cream: {
          DEFAULT: '#F1F1EB',
          50: '#FBFBF8',
          100: '#F6F6F2',
          200: '#F1F1EB',
          300: '#E4E4DA',
          400: '#D2D2C4',
        },
        ink: '#0B1220',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: {
        content: '1180px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(1,30,70,.04), 0 8px 24px -12px rgba(1,30,70,.18)',
        lift: '0 2px 4px rgba(1,30,70,.05), 0 18px 40px -18px rgba(1,30,70,.28)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg,#011E46 0%,#0B2857 45%,#165326 100%)',
        'leaf-gradient': 'linear-gradient(135deg,#165326 0%,#6A9929 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .5s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
