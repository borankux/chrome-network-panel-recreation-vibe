/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Chrome DevTools Theme Colors - Subtle borders
        cdts: {
          border: {
            DEFAULT: '#d3d3d3',
            dark: '#3c3c3c',
          },
          bg: {
            primary: { DEFAULT: '#ffffff', dark: '#1e1e1e' },
            secondary: { DEFAULT: '#f3f3f3', dark: '#252526' },
            tertiary: { DEFAULT: '#e8eaed', dark: '#2d2d2d' },
          },
          text: {
            primary: { DEFAULT: '#202124', dark: '#cccccc' },
            secondary: { DEFAULT: '#5f6368', dark: '#9d9d9d' },
            tertiary: { DEFAULT: '#80868b', dark: '#707070' },
          },
          accent: {
            DEFAULT: '#1a73e8',
            dark: '#4d90fe',
            hover: '#1557b0',
          },
          success: { DEFAULT: '#188038', dark: '#81c995' },
          warning: { DEFAULT: '#f9ab00', dark: '#f9ab00' },
          error: { DEFAULT: '#d93025', dark: '#f48771' },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        mono: ["'SF Mono'", "Monaco", "Inconsolata", "'Fira Code'", "monospace"],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '1.4' }],
        'xs': ['11px', { lineHeight: '1.4' }],
        'sm': ['12px', { lineHeight: '1.5' }],
      },
    },
  },
  plugins: [],
}
