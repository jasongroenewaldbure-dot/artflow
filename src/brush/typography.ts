// Artsy Palette Typography
// Based on Artsy's design system

export const typography = {
  // Font Families
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    serif: ['Georgia', 'Times New Roman', 'serif'],
    mono: ['Monaco', 'Menlo', 'Ubuntu Mono', 'monospace'],
  },

  // Font Sizes
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
    '7xl': '72px',
    '8xl': '96px',
    '9xl': '128px',
  },

  // Font Weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Line Heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Text Styles
  textStyles: {
    // Headings
    h1: {
      fontSize: '48px',
      fontWeight: '700',
      lineHeight: '1.2',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '36px',
      fontWeight: '600',
      lineHeight: '1.25',
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '30px',
      fontWeight: '600',
      lineHeight: '1.3',
      letterSpacing: '0em',
    },
    h4: {
      fontSize: '24px',
      fontWeight: '600',
      lineHeight: '1.35',
      letterSpacing: '0em',
    },
    h5: {
      fontSize: '20px',
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: '0em',
    },
    h6: {
      fontSize: '18px',
      fontWeight: '600',
      lineHeight: '1.45',
      letterSpacing: '0em',
    },

    // Body Text
    body: {
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0em',
    },
    bodyLarge: {
      fontSize: '18px',
      fontWeight: '400',
      lineHeight: '1.6',
      letterSpacing: '0em',
    },
    bodySmall: {
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0em',
    },

    // Captions
    caption: {
      fontSize: '12px',
      fontWeight: '400',
      lineHeight: '1.4',
      letterSpacing: '0.025em',
    },
    captionLarge: {
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '1.4',
      letterSpacing: '0.025em',
    },

    // Labels
    label: {
      fontSize: '12px',
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    },
    labelLarge: {
      fontSize: '14px',
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    },

    // Links
    link: {
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0em',
      textDecoration: 'underline' as const,
    },
    linkLarge: {
      fontSize: '18px',
      fontWeight: '400',
      lineHeight: '1.6',
      letterSpacing: '0em',
      textDecoration: 'underline' as const,
    },
  },
} as const

export type Typography = typeof typography
export type TextStyle = keyof typeof typography.textStyles
