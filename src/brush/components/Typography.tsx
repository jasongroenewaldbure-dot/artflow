import React from 'react'
import { tokens } from '../palette-tokens'

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'bodyLarge' | 'bodySmall' | 'caption' | 'captionLarge' | 'label' | 'labelLarge' | 'link' | 'linkLarge'
  color?: 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'inverse' | 'link' | 'linkHover'
  fontWeight?: 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black' | string
  as?: keyof JSX.IntrinsicElements
  children: React.ReactNode
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = 'primary',
  fontWeight,
  as,
  children,
  style = {},
  ...props
}) => {
  const textStyles = tokens.typography.textStyles[variant]
  const colorValue = tokens.colors.text[color] || tokens.colors.text.primary
  const fontWeightValue = fontWeight ? 
    (typeof fontWeight === 'string' && fontWeight in tokens.typography.fontWeight ? 
      tokens.typography.fontWeight[fontWeight as keyof typeof tokens.typography.fontWeight] : 
      fontWeight) : 
    textStyles.fontWeight

  const Component = (as || (variant.startsWith('h') ? variant : 'p')) as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'

  const combinedStyles = {
    ...textStyles,
    color: colorValue,
    fontWeight: fontWeightValue,
    margin: 0,
    ...style,
  }

  return React.createElement(Component, { style: combinedStyles, ...props }, children)
}

export default Typography
