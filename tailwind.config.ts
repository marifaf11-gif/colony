import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'metal-gradient': 'linear-gradient(135deg, hsl(var(--metal-highlight)) 0%, hsl(var(--metal-base)) 50%, hsl(var(--metal-dark)) 100%)',
        'leather-gradient': 'linear-gradient(135deg, hsl(var(--leather-light)) 0%, hsl(var(--leather-base)) 100%)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        metal: {
          base: 'hsl(var(--metal-base))',
          dark: 'hsl(var(--metal-dark))',
          highlight: 'hsl(var(--metal-highlight))',
          shadow: 'hsl(var(--metal-shadow))',
        },
        leather: {
          dark: 'hsl(var(--leather-dark))',
          base: 'hsl(var(--leather-base))',
          light: 'hsl(var(--leather-light))',
        },
      },
      boxShadow: {
        'inner-subtle': 'var(--shadow-inner-subtle)',
        'inner-medium': 'var(--shadow-inner-medium)',
        'inner-deep': 'var(--shadow-inner-deep)',
        'outer-subtle': 'var(--shadow-outer-subtle)',
        'outer-raised': 'var(--shadow-outer-raised)',
        'outer-floating': 'var(--shadow-outer-floating)',
        'outer-modal': 'var(--shadow-outer-modal)',
        'highlight': 'var(--shadow-highlight)',
        'tactile': 'var(--shadow-outer-raised), var(--shadow-highlight)',
      },
      backdropBlur: {
        'glass': 'var(--blur-glass)',
        'frosted': 'var(--blur-frosted)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'press-down': {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(2px)' },
        },
        'press-up': {
          '0%': { transform: 'translateY(2px)' },
          '100%': { transform: 'translateY(0px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'press-down': 'press-down 0.1s ease-out forwards',
        'press-up': 'press-up 0.1s ease-out forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
