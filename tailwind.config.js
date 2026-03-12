/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy:    '#0D1B2A',
        'navy-mid': '#162233',
        'navy-soft': '#1E3050',
        gold:    '#C9A84C',
        'gold-light': '#E8C97A',
        cream:   '#F5F0E8',
        'cream-dark': '#E8E0D0',
        'text-muted': '#B0A898',
      },
      fontFamily: {
        playfair: ['Playfair Display', 'Georgia', 'serif'],
        lato:     ['Lato', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        'fade-in':  'fadeIn 0.5s ease',
        'slide-up': 'slideUp 0.4s ease',
        shimmer:    'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
