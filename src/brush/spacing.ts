// Artsy Palette Spacing
// Based on Artsy's design system

export const spacing = {
  // Base spacing scale (8px base unit)
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
  40: '160px',
  48: '192px',
  56: '224px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',

  // Semantic spacing
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '96px',
  '5xl': '128px',
  '6xl': '192px',

  // Component-specific spacing
  component: {
    padding: {
      xs: '4px 8px',
      sm: '8px 12px',
      md: '12px 16px',
      lg: '16px 24px',
      xl: '20px 32px',
    },
    margin: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    },
    gap: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    },
  },

  // Layout spacing
  layout: {
    container: {
      padding: '0 16px',
      maxWidth: '1200px',
    },
    section: {
      padding: '64px 0',
    },
    grid: {
      gap: '24px',
    },
  },
} as const

export type Spacing = typeof spacing
export type SpacingKey = keyof typeof spacing
