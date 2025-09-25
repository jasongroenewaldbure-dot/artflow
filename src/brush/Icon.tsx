import React from 'react'

interface BrushIconProps {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'muted' | 'danger' | 'warning' | 'success'
  className?: string
  style?: React.CSSProperties
}

// Icon size mappings using CSS custom properties
const sizeMap = {
  xs: 'var(--icon-xs)', // 12px
  sm: 'var(--icon-sm)', // 16px  
  md: 'var(--icon-md)', // 20px
  lg: 'var(--icon-lg)', // 24px
  xl: 'var(--icon-xl)'  // 32px
}

// Color variant mappings using CSS custom properties
const variantMap = {
  default: 'var(--fg)',
  primary: 'var(--primary)',
  secondary: 'var(--secondary)', 
  accent: 'var(--accent)',
  muted: 'var(--muted)',
  danger: 'var(--danger)',
  warning: 'var(--warning)',
  success: 'var(--success)'
}

// SVG icon mappings - using the existing SVG assets
const iconSvgs: Record<string, string> = {
  'star': '/src/components/icons/star.svg',
  'artworks': '/src/components/icons/artworks.svg',
  'catalogue': '/src/components/icons/catalogue.svg',
  'contacts': '/src/components/icons/contacts.svg',
  'dashboard': '/src/components/icons/dashboard.svg',
  'drag': '/src/components/icons/drag.svg',
  'favourite': '/src/components/icons/favourite.svg',
  'file': '/src/components/icons/file.svg',
  'inbox': '/src/components/icons/inbox.svg',
  'insights': '/src/components/icons/insights.svg',
  'location': '/src/components/icons/location.svg',
  'login': '/src/components/icons/login.svg',
  'natural-search': '/src/components/icons/natural-search.svg',
  'roadmap': '/src/components/icons/roadmap.svg',
  'security': '/src/components/icons/security.svg',
  'settings': '/src/components/icons/settings.svg'
}

// Fallback icons using Unicode symbols that match Brush design
const fallbackIcons: Record<string, string> = {
  // Navigation
  'home': '⌂',
  'search': '⌕',
  'user': '👤',
  'menu': '☰',
  'close': '✕',
  'back': '←',
  'forward': '→',
  'up': '↑',
  'down': '↓',
  'chevron-left': '‹',
  'chevron-right': '›',
  'chevron-up': '⌃',
  'chevron-down': '⌄',
  
  // Actions
  'plus': '✚',
  'minus': '−',
  'edit': '✎',
  'delete': '🗑',
  'save': '💾',
  'copy': '⧉',
  'share': '⤴',
  'download': '⬇',
  'upload': '⬆',
  'refresh': '⟲',
  'sync': '⟳',
  
  // Status
  'check': '✓',
  'check-circle': '✅',
  'x': '✗',
  'x-circle': '❌',
  'alert': '⚠',
  'info': 'ℹ',
  'question': '?',
  'exclamation': '!',
  
  // Content
  'heart': '♡',
  'heart-filled': '♥',
  'star': '☆',
  'star-filled': '★',
  'bookmark': '🔖',
  'tag': '🏷',
  'image': '🖼',
  'camera': '📷',
  'video': '🎥',
  'music': '♪',
  'document': '📄',
  'folder': '📁',
  
  // Art specific
  'palette': '🎨',
  'brush': '🖌',
  'canvas': '🖼',
  'frame': '🖼',
  'gallery': '🏛',
  'auction': '🔨',
  'collection': '📚',
  'artwork': '🎨',
  'artist': '👨‍🎨',
  'collector': '🎭',
  
  // Communication
  'mail': '✉',
  'phone': '☎',
  'message': '💬',
  'notification': '🔔',
  'bell': '🔔',
  
  // Settings
  'settings': '⚙',
  'gear': '⚙',
  'preferences': '⚙',
  'profile': '👤',
  'account': '👤',
  
  // Social
  'instagram': '📷',
  'twitter': '🐦',
  'facebook': '📘',
  'linkedin': '💼',
  'website': '🌐',
  
  // Utility
  'loading': '⟳',
  'spinner': '⟳',
  'clock': '🕐',
  'calendar': '📅',
  'location': '📍',
  'map': '🗺',
  'globe': '🌍',
  'link': '🔗',
  'external': '↗',
  
  // Media controls
  'play': '▶',
  'pause': '⏸',
  'stop': '⏹',
  'volume': '🔊',
  'mute': '🔇',
  
  // Layout
  'grid': '⊞',
  'list': '☰',
  'columns': '▦',
  'rows': '☰',
  'sidebar': '⊟',
  'fullscreen': '⛶',
  'minimize': '−',
  'maximize': '□',
  
  // Trends & Analytics
  'trending-up': '📈',
  'trending-down': '📉',
  'analytics': '📊',
  'chart': '📈',
  'graph': '📊',
  'data': '📊'
}

/**
 * Brush Design System Icon Component
 * 
 * Provides consistent iconography across the application using:
 * - CSS custom properties for sizing and colors
 * - SVG assets when available
 * - Unicode fallbacks for universal compatibility
 * - Semantic color variants
 */
export const BrushIcon: React.FC<BrushIconProps> = ({ 
  name, 
  size = 'md', 
  variant = 'default', 
  className = '', 
  style = {} 
}) => {
  // Determine size value
  const sizeValue = typeof size === 'number' ? `${size}px` : sizeMap[size]
  
  // Determine color value
  const colorValue = variantMap[variant]
  
  // Check if we have an SVG for this icon
  const svgPath = iconSvgs[name]
  
  if (svgPath) {
    return (
      <img
        src={svgPath}
        alt={name}
        className={`brush-icon brush-icon--${variant} ${className}`}
        style={{
          width: sizeValue,
          height: sizeValue,
          display: 'inline-block',
          verticalAlign: 'middle',
          filter: `brightness(0) saturate(100%)`,
          color: colorValue,
          ...style
        }}
        data-icon={name}
        data-variant={variant}
        data-size={size}
      />
    )
  }
  
  // Use Unicode fallback
  const fallbackIcon = fallbackIcons[name]
  
  return (
    <span 
      className={`brush-icon brush-icon--${variant} brush-icon--fallback ${className}`}
      style={{
        width: sizeValue,
        height: sizeValue,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: typeof size === 'number' ? `${size * 0.8}px` : `calc(${sizeValue} * 0.8)`,
        color: colorValue,
        lineHeight: 1,
        ...style
      }}
      data-icon={name}
      data-variant={variant}
      data-size={size}
    >
      {fallbackIcon || name}
    </span>
  )
}

// Export as default for compatibility
export default BrushIcon
