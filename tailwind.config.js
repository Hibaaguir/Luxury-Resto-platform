/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Luxury color palette
        primary: {
          DEFAULT: '#D4AF37', // Gold
          light: '#F4C430',   // Bright gold
          dark: '#B8941F',    // Deep gold
        },
        champagne: {
          DEFAULT: '#F5E6D3',
          light: '#FDF8F0',
          dark: '#E8D4BC',
        },
        charcoal: {
          DEFAULT: '#1A1A1A',
          light: '#2D2D2D',
          dark: '#0F0F0F',
        },
        forest: {
          DEFAULT: '#2D5016',
          light: '#3D6B1F',
          dark: '#1E3610',
        },
        taupe: {
          DEFAULT: '#3D3D3D',
          light: '#4A4A4A',
          dark: '#2A2A2A',
        },
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        garamond: ['EB Garamond', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      fontSize: {
        'display': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h1': ['36px', { lineHeight: '1.3', fontWeight: '700' }],
        'h2': ['28px', { lineHeight: '1.4', fontWeight: '600' }],
        'h3': ['24px', { lineHeight: '1.5', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'small': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'tiny': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'luxury': '8px',
      },
      boxShadow: {
        'luxury': '2px 4px 12px rgba(0, 0, 0, 0.3)',
        'luxury-hover': '4px 8px 24px rgba(212, 175, 55, 0.2)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.4)',
      },
      transitionDuration: {
        '300': '300ms',
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-in-out',
        'slide-up': 'slideUp 400ms ease-out',
        'scale-in': 'scaleIn 300ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
