// tailwindcss-animate plugin (inline to avoid dependency)
module.exports = function({ addUtilities, matchUtilities, theme }) {
  addUtilities({
    '.animate-in': {
      animation: 'fade-in 0.2s ease-out',
    },
    '.animate-out': {
      animation: 'fade-out 0.2s ease-in',
    },
    '.fade-in-0': {
      animationName: 'fade-in',
    },
    '.fade-out-0': {
      animationName: 'fade-out',
    },
    '.zoom-in-95': {
      animationName: 'zoom-in',
    },
    '.zoom-out-95': {
      animationName: 'zoom-out',
    },
  });

  matchUtilities(
    {
      'animation-delay': (value) => ({
        animationDelay: value,
      }),
    },
    { values: theme('transitionDelay') }
  );
};
