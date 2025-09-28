// Artsy Palette Colors
// Based on Artsy's design system

export const colors = {
  // Primary Colors
  black100: '#000000',
  black80: '#333333',
  black60: '#666666',
  black40: '#999999',
  black20: '#CCCCCC',
  black10: '#E5E5E5',
  black5: '#F5F5F5',

  // White
  white100: '#FFFFFF',
  white90: '#F8F8F8',
  white80: '#F0F0F0',

  // Brand Colors
  purple100: '#6E1EFF',
  purple80: '#8B4FFF',
  purple60: '#A87FFF',
  purple40: '#C5AFFF',
  purple20: '#E2DFFF',
  purple10: '#F1EFFF',

  // Semantic Colors
  red100: '#F7625A',
  red80: '#F9817A',
  red60: '#FBA19B',
  red40: '#FCC1BD',
  red20: '#FDE1DE',
  red10: '#FEF0EF',

  yellow100: '#F5A623',
  yellow80: '#F7B84F',
  yellow60: '#F9CA7B',
  yellow40: '#FBDCA7',
  yellow20: '#FDEDD3',
  yellow10: '#FEF6E9',

  green100: '#00C853',
  green80: '#33D375',
  green60: '#66DE97',
  green40: '#99E9B9',
  green20: '#CCF4DB',
  green10: '#E6FAED',

  blue100: '#0066CC',
  blue80: '#3385D6',
  blue60: '#66A3E0',
  blue40: '#99C2EA',
  blue20: '#CCE1F5',
  blue10: '#E6F0FA',

  // Neutral Grays
  gray100: '#1A1A1A',
  gray90: '#2C2C2C',
  gray80: '#3E3E3E',
  gray70: '#505050',
  gray60: '#626262',
  gray50: '#747474',
  gray40: '#868686',
  gray30: '#989898',
  gray20: '#AAAAAA',
  gray10: '#BCBCBC',
  gray5: '#CECECE',

  // Text Colors
  text: {
    primary: '#1A1A1A',
    secondary: '#626262',
    tertiary: '#989898',
    disabled: '#BCBCBC',
    inverse: '#FFFFFF',
    link: '#6E1EFF',
    linkHover: '#8B4FFF',
  },

  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F8F8',
    tertiary: '#F0F0F0',
    inverse: '#1A1A1A',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Border Colors
  border: {
    primary: '#E5E5E5',
    secondary: '#CCCCCC',
    tertiary: '#999999',
    focus: '#6E1EFF',
    error: '#F7625A',
    success: '#00C853',
    warning: '#F5A623',
  },

  // Status Colors
  status: {
    success: '#00C853',
    warning: '#F5A623',
    error: '#F7625A',
    info: '#0066CC',
  },
} as const

export type Color = typeof colors
export type ColorKey = keyof typeof colors
