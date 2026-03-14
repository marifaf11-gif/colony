/**
 * Colony OS Design Tokens
 * Industrial Skeuomorphism 2.0 - Brushed Gunmetal, Frosted Smoked Glass, CNC machined surfaces
 */

export const designTokens = {
  colors: {
    metal: {
      base: '#C0C5CE',
      dark: '#65737E',
      highlight: '#E8ECF0',
      shadow: '#4F5B66',
    },
    gunmetal: {
      50: '#D4D8DC',
      100: '#B8BEC4',
      200: '#9AA2AA',
      300: '#7C8690',
      400: '#606A75',
      500: '#454F5A',
      600: '#363F49',
      700: '#272F38',
      800: '#1A2028',
      900: '#0D1117',
      950: '#070B10',
    },
    glass: {
      light: 'rgba(255, 255, 255, 0.10)',
      medium: 'rgba(255, 255, 255, 0.05)',
      dark: 'rgba(0, 0, 0, 0.15)',
      smoked: 'rgba(10, 14, 20, 0.72)',
      frosted: 'rgba(20, 26, 34, 0.68)',
    },
    leather: {
      dark: '#2B2D30',
      base: '#3C3F41',
      light: '#4A4D50',
    },
    neon: {
      green: '#39FF14',
      greenDim: 'rgba(57,255,20,0.55)',
      greenGlow: 'rgba(57,255,20,0.18)',
      blue: '#4A9EFF',
      blueDim: 'rgba(74,158,255,0.55)',
      blueGlow: 'rgba(74,158,255,0.18)',
      amber: '#FFB830',
      amberDim: 'rgba(255,184,48,0.55)',
      red: '#FF3B3B',
      redDim: 'rgba(255,59,59,0.55)',
    },
    accent: {
      blue: '#4A9EFF',
      blueLight: '#6BB1FF',
      blueDark: '#3A8EEF',
      green: '#5FB04B',
      greenLight: '#7FC565',
      greenDark: '#4F9E3B',
      red: '#E74C3C',
      redLight: '#FF6B5B',
      redDark: '#D73C2C',
      amber: '#F39C12',
      amberLight: '#FFB332',
      amberDark: '#E38C02',
    },
    neutral: {
      50: '#F8F9FA',
      100: '#E9ECEF',
      200: '#DEE2E6',
      300: '#CED4DA',
      400: '#ADB5BD',
      500: '#6C757D',
      600: '#495057',
      700: '#343A40',
      800: '#212529',
      900: '#0D1117',
    },
  },

  shadows: {
    inner: {
      subtle: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)',
      medium: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
      deep: 'inset 0 3px 6px rgba(0, 0, 0, 0.5)',
      cnc: 'inset 0 2px 8px rgba(0,0,0,0.6), inset 0 -1px 0 rgba(255,255,255,0.04)',
    },
    outer: {
      subtle: '0 1px 3px rgba(0, 0, 0, 0.2)',
      raised: '0 4px 8px rgba(0, 0, 0, 0.35)',
      floating: '0 8px 24px rgba(0, 0, 0, 0.45)',
      modal: '0 16px 48px rgba(0, 0, 0, 0.55)',
    },
    highlight: 'inset 0 1px 0 rgba(255, 255, 255, 0.12)',
    combined: {
      button: 'inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 3px 6px rgba(0, 0, 0, 0.4)',
      panel: 'inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 4px 16px rgba(0, 0, 0, 0.45)',
      input: 'inset 0 2px 6px rgba(0, 0, 0, 0.45), inset 0 -1px 0 rgba(255, 255, 255, 0.06)',
      gunmetal: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.5), 0 6px 20px rgba(0,0,0,0.6)',
    },
    glow: {
      green: '0 0 16px rgba(57,255,20,0.35), 0 0 32px rgba(57,255,20,0.15)',
      blue: '0 0 16px rgba(74,158,255,0.35), 0 0 32px rgba(74,158,255,0.15)',
      amber: '0 0 16px rgba(255,184,48,0.35), 0 0 32px rgba(255,184,48,0.15)',
    },
  },

  elevation: {
    0: { shadow: 'none', translateY: '0px' },
    1: { shadow: '0 1px 3px rgba(0, 0, 0, 0.3)', translateY: '-1px' },
    2: { shadow: '0 4px 10px rgba(0, 0, 0, 0.4)', translateY: '-2px' },
    3: { shadow: '0 8px 28px rgba(0, 0, 0, 0.5)', translateY: '-4px' },
    4: { shadow: '0 16px 48px rgba(0, 0, 0, 0.6)', translateY: '-8px' },
  },

  blur: {
    glass: '12px',
    frosted: '20px',
    smoked: '28px',
    heavy: '40px',
  },

  radius: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    round: '9999px',
  },

  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '24px',
      '2xl': '32px',
      '3xl': '48px',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  spacing: {
    0: '0px',
    1: '8px',
    2: '16px',
    3: '24px',
    4: '32px',
    5: '40px',
    6: '48px',
    7: '56px',
    8: '64px',
    9: '72px',
    10: '80px',
  },

  transitions: {
    fast: '120ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '220ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '380ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '480ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    inertia: '600ms cubic-bezier(0.23, 1, 0.32, 1)',
  },

  gradients: {
    metal: 'linear-gradient(135deg, #E8ECF0 0%, #C0C5CE 50%, #A0A5AE 100%)',
    metalDark: 'linear-gradient(145deg, #454F5A 0%, #363F49 50%, #272F38 100%)',
    gunmetal: 'linear-gradient(145deg, #363F49 0%, #272F38 40%, #1A2028 100%)',
    gunmetalPanel: 'linear-gradient(160deg, #2a3040 0%, #1e2530 45%, #141921 100%)',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%)',
    smokedGlass: 'linear-gradient(145deg, rgba(20,26,34,0.75) 0%, rgba(10,14,20,0.85) 100%)',
    leather: 'linear-gradient(135deg, #3C3F41 0%, #2B2D30 100%)',
    button: {
      blue: 'linear-gradient(135deg, #6BB1FF 0%, #4A9EFF 50%, #3A8EEF 100%)',
      green: 'linear-gradient(135deg, #7FC565 0%, #5FB04B 50%, #4F9E3B 100%)',
      neonGreen: 'linear-gradient(135deg, #2a5c30 0%, #1a3d1e 50%, #0f2515 100%)',
      red: 'linear-gradient(135deg, #FF6B5B 0%, #E74C3C 50%, #D73C2C 100%)',
      gunmetal: 'linear-gradient(135deg, #454F5A 0%, #363F49 50%, #272F38 100%)',
    },
    brushedMetal: `repeating-linear-gradient(
      90deg,
      transparent,
      transparent 1px,
      rgba(255,255,255,0.015) 1px,
      rgba(255,255,255,0.015) 2px
    ), linear-gradient(145deg, #2e3540 0%, #222830 50%, #181e26 100%)`,
  },

  materials: {
    gunmetalPanel: {
      background: 'linear-gradient(160deg, #2a3040 0%, #1e2530 45%, #141921 100%)',
      border: '1px solid rgba(255,255,255,0.06)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.5), 0 6px 20px rgba(0,0,0,0.5)',
    },
    smokedGlassPanel: {
      background: 'rgba(14, 18, 26, 0.72)',
      backdropFilter: 'blur(20px) saturate(1.4)',
      border: '1px solid rgba(255,255,255,0.07)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
    },
    cncSurface: {
      background: `repeating-linear-gradient(
        90deg,
        transparent,
        transparent 1px,
        rgba(255,255,255,0.012) 1px,
        rgba(255,255,255,0.012) 2px
      ), linear-gradient(145deg, #2e3540 0%, #222830 50%, #181e26 100%)`,
      border: '1px solid rgba(255,255,255,0.05)',
      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6), inset 0 -1px 0 rgba(255,255,255,0.04)',
    },
  },
} as const;

export type DesignTokens = typeof designTokens;
