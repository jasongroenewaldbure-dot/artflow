// Artsy Palette Design Tokens
// Centralized design system tokens

import { colors } from './colors'
import { typography } from './typography'
import { spacing } from './spacing'

export const tokens = {
  colors,
  typography,
  spacing,

  // Breakpoints
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Border Radius
  borderRadius: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    '3xl': '32px',
    full: '9999px',
  },

  // Shadows
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },

  // Z-Index
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    normal: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },

  // Animation
  animation: {
    fadeIn: 'fadeIn 0.2s ease-in-out',
    fadeOut: 'fadeOut 0.2s ease-in-out',
    slideIn: 'slideIn 0.3s ease-out',
    slideOut: 'slideOut 0.3s ease-in',
    scaleIn: 'scaleIn 0.2s ease-out',
    scaleOut: 'scaleOut 0.2s ease-in',
  },
} as const

export type Tokens = typeof tokens
export type Breakpoint = keyof typeof tokens.breakpoints
export type BorderRadius = keyof typeof tokens.borderRadius
export type Shadow = keyof typeof tokens.shadows
export type ZIndex = keyof typeof tokens.zIndex
export type Transition = keyof typeof tokens.transitions
export type Animation = keyof typeof tokens.animation
