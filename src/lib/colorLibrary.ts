/**
 * Comprehensive Color Library for ArtFlow
 * 
 * This library provides a complete color taxonomy system including:
 * - Color definitions with hex codes, RGB, HSL, and LAB values
 * - Color families and relationships
 * - Mood associations and psychological effects
 * - Synonyms and alternative names
 * - Cultural and artistic context
 * - Temperature classifications
 * - Saturation and lightness variations
 */

export interface ColorDefinition {
  name: string
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  lab: { l: number; a: number; b: number }
  synonyms: string[]
  mood: string[]
  temperature: 'warm' | 'cool' | 'neutral'
  saturation: 'low' | 'medium' | 'high'
  lightness: 'dark' | 'medium' | 'light'
  cultural: string[]
  artistic: string[]
  complementary: string[]
  analogous: string[]
  triadic: string[]
  tetradic: string[]
}

export interface ColorFamily {
  name: string
  colors: string[]
  characteristics: string[]
  mood: string[]
  usage: string[]
}

export interface MoodDefinition {
  name: string
  colors: string[]
  characteristics: string[]
  psychological: string[]
  artistic: string[]
  synonyms: string[]
}

// Comprehensive Color Definitions
export const COLOR_DEFINITIONS: Record<string, ColorDefinition> = {
  // Primary Colors
  red: {
    name: 'red',
    hex: '#FF0000',
    rgb: { r: 255, g: 0, b: 0 },
    hsl: { h: 0, s: 100, l: 50 },
    lab: { l: 53, a: 80, b: 67 },
    synonyms: ['crimson', 'scarlet', 'ruby', 'cherry', 'fire', 'blood', 'rose'],
    mood: ['passionate', 'energetic', 'bold', 'urgent', 'romantic', 'powerful'],
    temperature: 'warm',
    saturation: 'high',
    lightness: 'medium',
    cultural: ['love', 'luck', 'celebration', 'danger', 'stop'],
    artistic: ['expressionism', 'fauvism', 'pop art'],
    complementary: ['green'],
    analogous: ['orange', 'magenta'],
    triadic: ['yellow', 'cyan'],
    tetradic: ['green', 'yellow', 'magenta']
  },
  
  crimson: {
    name: 'crimson',
    hex: '#DC143C',
    rgb: { r: 220, g: 20, b: 60 },
    hsl: { h: 348, s: 83, l: 47 },
    lab: { l: 47, a: 70, b: 25 },
    synonyms: ['deep red', 'cardinal', 'burgundy', 'maroon'],
    mood: ['sophisticated', 'luxurious', 'dramatic', 'elegant'],
    temperature: 'warm',
    saturation: 'high',
    lightness: 'dark',
    cultural: ['royalty', 'wealth', 'prestige'],
    artistic: ['baroque', 'renaissance', 'victorian'],
    complementary: ['teal'],
    analogous: ['red', 'rose'],
    triadic: ['yellow-green', 'blue-violet'],
    tetradic: ['teal', 'yellow-green', 'rose']
  },

  orange: {
    name: 'orange',
    hex: '#FFA500',
    rgb: { r: 255, g: 165, b: 0 },
    hsl: { h: 39, s: 100, l: 50 },
    lab: { l: 74, a: 23, b: 78 },
    synonyms: ['amber', 'tangerine', 'peach', 'coral', 'apricot', 'golden'],
    mood: ['energetic', 'creative', 'optimistic', 'friendly', 'warm'],
    temperature: 'warm',
    saturation: 'high',
    lightness: 'medium',
    cultural: ['autumn', 'harvest', 'energy', 'creativity'],
    artistic: ['impressionism', 'post-impressionism'],
    complementary: ['blue'],
    analogous: ['red', 'yellow'],
    triadic: ['green', 'purple'],
    tetradic: ['blue', 'green', 'red']
  },

  yellow: {
    name: 'yellow',
    hex: '#FFFF00',
    rgb: { r: 255, g: 255, b: 0 },
    hsl: { h: 60, s: 100, l: 50 },
    lab: { l: 97, a: -21, b: 94 },
    synonyms: ['gold', 'lemon', 'amber', 'canary', 'sunshine', 'golden'],
    mood: ['cheerful', 'optimistic', 'energetic', 'creative', 'intellectual'],
    temperature: 'warm',
    saturation: 'high',
    lightness: 'light',
    cultural: ['wisdom', 'joy', 'sun', 'wealth', 'caution'],
    artistic: ['van gogh', 'impressionism', 'expressionism'],
    complementary: ['purple'],
    analogous: ['orange', 'lime'],
    triadic: ['red', 'blue'],
    tetradic: ['purple', 'red', 'lime']
  },

  green: {
    name: 'green',
    hex: '#00FF00',
    rgb: { r: 0, g: 255, b: 0 },
    hsl: { h: 120, s: 100, l: 50 },
    lab: { l: 88, a: -86, b: 83 },
    synonyms: ['emerald', 'forest', 'lime', 'mint', 'sage', 'olive'],
    mood: ['calm', 'natural', 'balanced', 'fresh', 'peaceful'],
    temperature: 'cool',
    saturation: 'high',
    lightness: 'medium',
    cultural: ['nature', 'growth', 'harmony', 'money', 'go'],
    artistic: ['landscape', 'naturalism', 'environmental'],
    complementary: ['magenta'],
    analogous: ['yellow-green', 'blue-green'],
    triadic: ['orange', 'purple'],
    tetradic: ['magenta', 'orange', 'blue-green']
  },

  blue: {
    name: 'blue',
    hex: '#0000FF',
    rgb: { r: 0, g: 0, b: 255 },
    hsl: { h: 240, s: 100, l: 50 },
    lab: { l: 32, a: 79, b: -107 },
    synonyms: ['azure', 'navy', 'cobalt', 'sapphire', 'royal', 'cerulean'],
    mood: ['calm', 'trustworthy', 'professional', 'serene', 'stable'],
    temperature: 'cool',
    saturation: 'high',
    lightness: 'medium',
    cultural: ['sky', 'ocean', 'trust', 'technology', 'peace'],
    artistic: ['classical', 'neoclassical', 'minimalism'],
    complementary: ['orange'],
    analogous: ['blue-violet', 'blue-green'],
    triadic: ['red', 'yellow'],
    tetradic: ['orange', 'red', 'blue-green']
  },

  purple: {
    name: 'purple',
    hex: '#800080',
    rgb: { r: 128, g: 0, b: 128 },
    hsl: { h: 300, s: 100, l: 25 },
    lab: { l: 30, a: 58, b: -36 },
    synonyms: ['violet', 'lavender', 'plum', 'mauve', 'amethyst', 'magenta'],
    mood: ['mysterious', 'creative', 'spiritual', 'luxurious', 'imaginative'],
    temperature: 'cool',
    saturation: 'high',
    lightness: 'dark',
    cultural: ['royalty', 'spirituality', 'creativity', 'mystery'],
    artistic: ['art nouveau', 'symbolism', 'surrealism'],
    complementary: ['yellow'],
    analogous: ['blue-violet', 'red-violet'],
    triadic: ['orange', 'green'],
    tetradic: ['yellow', 'orange', 'red-violet']
  },

  // Neutral Colors
  black: {
    name: 'black',
    hex: '#000000',
    rgb: { r: 0, g: 0, b: 0 },
    hsl: { h: 0, s: 0, l: 0 },
    lab: { l: 0, a: 0, b: 0 },
    synonyms: ['ebony', 'charcoal', 'jet', 'ink', 'midnight', 'obsidian'],
    mood: ['sophisticated', 'mysterious', 'elegant', 'powerful', 'dramatic'],
    temperature: 'neutral',
    saturation: 'low',
    lightness: 'dark',
    cultural: ['mourning', 'elegance', 'power', 'mystery'],
    artistic: ['minimalism', 'monochrome', 'chiaroscuro'],
    complementary: ['white'],
    analogous: ['gray', 'dark gray'],
    triadic: ['white', 'white'],
    tetradic: ['white', 'white', 'white']
  },

  white: {
    name: 'white',
    hex: '#FFFFFF',
    rgb: { r: 255, g: 255, b: 255 },
    hsl: { h: 0, s: 0, l: 100 },
    lab: { l: 100, a: 0, b: 0 },
    synonyms: ['ivory', 'cream', 'pearl', 'snow', 'alabaster', 'bone'],
    mood: ['pure', 'clean', 'peaceful', 'innocent', 'minimal'],
    temperature: 'neutral',
    saturation: 'low',
    lightness: 'light',
    cultural: ['purity', 'peace', 'innocence', 'simplicity'],
    artistic: ['minimalism', 'zen', 'clean design'],
    complementary: ['black'],
    analogous: ['gray', 'light gray'],
    triadic: ['black', 'black'],
    tetradic: ['black', 'black', 'black']
  },

  gray: {
    name: 'gray',
    hex: '#808080',
    rgb: { r: 128, g: 128, b: 128 },
    hsl: { h: 0, s: 0, l: 50 },
    lab: { l: 53, a: 0, b: 0 },
    synonyms: ['grey', 'silver', 'slate', 'ash', 'charcoal', 'pewter'],
    mood: ['neutral', 'professional', 'sophisticated', 'calm'],
    temperature: 'neutral',
    saturation: 'low',
    lightness: 'medium',
    cultural: ['balance', 'neutrality', 'professionalism'],
    artistic: ['monochrome', 'photography', 'minimalism'],
    complementary: ['gray'],
    analogous: ['dark gray', 'light gray'],
    triadic: ['gray', 'gray'],
    tetradic: ['gray', 'gray', 'gray']
  },

  // Extended Color Palette
  pink: {
    name: 'pink',
    hex: '#FFC0CB',
    rgb: { r: 255, g: 192, b: 203 },
    hsl: { h: 350, s: 100, l: 88 },
    lab: { l: 84, a: 25, b: 5 },
    synonyms: ['rose', 'magenta', 'fuchsia', 'salmon', 'coral'],
    mood: ['romantic', 'gentle', 'playful', 'feminine', 'sweet'],
    temperature: 'warm',
    saturation: 'medium',
    lightness: 'light',
    cultural: ['love', 'femininity', 'romance', 'youth'],
    artistic: ['rococo', 'romanticism', 'pop art'],
    complementary: ['mint green'],
    analogous: ['red', 'purple'],
    triadic: ['yellow-green', 'blue-violet'],
    tetradic: ['mint green', 'yellow-green', 'purple']
  },

  brown: {
    name: 'brown',
    hex: '#A52A2A',
    rgb: { r: 165, g: 42, b: 42 },
    hsl: { h: 0, s: 60, l: 41 },
    lab: { l: 42, a: 45, b: 25 },
    synonyms: ['tan', 'beige', 'copper', 'rust', 'chocolate', 'mahogany'],
    mood: ['earthy', 'warm', 'stable', 'reliable', 'natural'],
    temperature: 'warm',
    saturation: 'medium',
    lightness: 'dark',
    cultural: ['earth', 'stability', 'reliability', 'nature'],
    artistic: ['earth tones', 'naturalism', 'landscape'],
    complementary: ['teal'],
    analogous: ['red', 'orange'],
    triadic: ['yellow-green', 'blue-violet'],
    tetradic: ['teal', 'yellow-green', 'orange']
  },

  teal: {
    name: 'teal',
    hex: '#008080',
    rgb: { r: 0, g: 128, b: 128 },
    hsl: { h: 180, s: 100, l: 25 },
    lab: { l: 48, a: -28, b: -8 },
    synonyms: ['turquoise', 'cyan', 'aqua', 'mint', 'seafoam'],
    mood: ['refreshing', 'calm', 'balanced', 'sophisticated'],
    temperature: 'cool',
    saturation: 'high',
    lightness: 'medium',
    cultural: ['water', 'balance', 'healing', 'tranquility'],
    artistic: ['art deco', 'modern', 'contemporary'],
    complementary: ['coral'],
    analogous: ['blue', 'green'],
    triadic: ['magenta', 'yellow'],
    tetradic: ['coral', 'magenta', 'green']
  }
}

// Color Families
export const COLOR_FAMILIES: Record<string, ColorFamily> = {
  warm: {
    name: 'warm',
    colors: ['red', 'orange', 'yellow', 'crimson', 'pink', 'brown'],
    characteristics: ['energetic', 'inviting', 'stimulating', 'cozy'],
    mood: ['passionate', 'energetic', 'optimistic', 'romantic'],
    usage: ['accent walls', 'dining rooms', 'social spaces', 'art galleries']
  },
  
  cool: {
    name: 'cool',
    colors: ['blue', 'green', 'purple', 'teal', 'cyan'],
    characteristics: ['calming', 'professional', 'serene', 'refreshing'],
    mood: ['peaceful', 'trustworthy', 'balanced', 'sophisticated'],
    usage: ['bedrooms', 'offices', 'bathrooms', 'meditation spaces']
  },
  
  neutral: {
    name: 'neutral',
    colors: ['black', 'white', 'gray', 'beige', 'taupe'],
    characteristics: ['versatile', 'timeless', 'sophisticated', 'balanced'],
    mood: ['calm', 'professional', 'elegant', 'minimal'],
    usage: ['backgrounds', 'framing', 'minimalist spaces', 'gallery walls']
  },
  
  earth: {
    name: 'earth',
    colors: ['brown', 'tan', 'beige', 'olive', 'rust', 'terracotta'],
    characteristics: ['grounded', 'natural', 'organic', 'stable'],
    mood: ['earthy', 'warm', 'reliable', 'natural'],
    usage: ['natural materials', 'rustic spaces', 'outdoor themes']
  },
  
  jewel: {
    name: 'jewel',
    colors: ['emerald', 'sapphire', 'ruby', 'amethyst', 'topaz', 'garnet'],
    characteristics: ['luxurious', 'rich', 'sophisticated', 'precious'],
    mood: ['luxurious', 'dramatic', 'elegant', 'opulent'],
    usage: ['luxury spaces', 'formal rooms', 'art collections']
  }
}

// Comprehensive Mood Definitions
export const MOOD_DEFINITIONS: Record<string, MoodDefinition> = {
  passionate: {
    name: 'passionate',
    colors: ['red', 'crimson', 'magenta', 'deep pink'],
    characteristics: ['intense', 'emotional', 'dramatic', 'bold'],
    psychological: ['energy', 'excitement', 'urgency', 'love'],
    artistic: ['expressionism', 'fauvism', 'romanticism'],
    synonyms: ['intense', 'fiery', 'dramatic', 'emotional', 'bold']
  },
  
  calm: {
    name: 'calm',
    colors: ['blue', 'teal', 'sage', 'lavender', 'mint'],
    characteristics: ['peaceful', 'serene', 'tranquil', 'relaxing'],
    psychological: ['relaxation', 'peace', 'stability', 'trust'],
    artistic: ['minimalism', 'zen', 'meditation spaces'],
    synonyms: ['peaceful', 'serene', 'tranquil', 'relaxing', 'soothing']
  },
  
  energetic: {
    name: 'energetic',
    colors: ['orange', 'yellow', 'bright red', 'lime'],
    characteristics: ['vibrant', 'dynamic', 'stimulating', 'active'],
    psychological: ['enthusiasm', 'creativity', 'optimism', 'energy'],
    artistic: ['pop art', 'expressionism', 'contemporary'],
    synonyms: ['vibrant', 'dynamic', 'stimulating', 'active', 'lively']
  },
  
  mysterious: {
    name: 'mysterious',
    colors: ['purple', 'deep blue', 'black', 'dark gray'],
    characteristics: ['enigmatic', 'intriguing', 'sophisticated', 'dramatic'],
    psychological: ['curiosity', 'intrigue', 'sophistication', 'depth'],
    artistic: ['symbolism', 'surrealism', 'noir'],
    synonyms: ['enigmatic', 'intriguing', 'sophisticated', 'dramatic', 'moody']
  },
  
  romantic: {
    name: 'romantic',
    colors: ['pink', 'rose', 'lavender', 'peach', 'coral'],
    characteristics: ['gentle', 'soft', 'intimate', 'sweet'],
    psychological: ['love', 'tenderness', 'intimacy', 'affection'],
    artistic: ['rococo', 'romanticism', 'impressionism'],
    synonyms: ['gentle', 'soft', 'intimate', 'sweet', 'tender']
  },
  
  sophisticated: {
    name: 'sophisticated',
    colors: ['black', 'white', 'gray', 'navy', 'burgundy'],
    characteristics: ['elegant', 'refined', 'polished', 'classic'],
    psychological: ['confidence', 'authority', 'refinement', 'status'],
    artistic: ['minimalism', 'classical', 'modern'],
    synonyms: ['elegant', 'refined', 'polished', 'classic', 'urbane']
  },
  
  cheerful: {
    name: 'cheerful',
    colors: ['yellow', 'bright orange', 'lime', 'sky blue'],
    characteristics: ['bright', 'happy', 'uplifting', 'optimistic'],
    psychological: ['happiness', 'joy', 'optimism', 'positivity'],
    artistic: ['impressionism', 'pop art', 'contemporary'],
    synonyms: ['bright', 'happy', 'uplifting', 'optimistic', 'joyful']
  },
  
  earthy: {
    name: 'earthy',
    colors: ['brown', 'tan', 'olive', 'rust', 'terracotta'],
    characteristics: ['natural', 'grounded', 'organic', 'stable'],
    psychological: ['stability', 'reliability', 'connection', 'grounding'],
    artistic: ['naturalism', 'landscape', 'rustic'],
    synonyms: ['natural', 'grounded', 'organic', 'stable', 'reliable']
  }
}

// Color Temperature Classifications
export const COLOR_TEMPERATURE = {
  warm: {
    colors: ['red', 'orange', 'yellow', 'crimson', 'pink', 'brown', 'amber', 'gold'],
    characteristics: ['advancing', 'stimulating', 'cozy', 'inviting'],
    psychological: ['energy', 'excitement', 'warmth', 'passion'],
    usage: ['social spaces', 'dining areas', 'accent elements']
  },
  
  cool: {
    colors: ['blue', 'green', 'purple', 'teal', 'cyan', 'mint', 'lavender'],
    characteristics: ['receding', 'calming', 'professional', 'serene'],
    psychological: ['calm', 'trust', 'stability', 'peace'],
    usage: ['bedrooms', 'offices', 'meditation spaces', 'backgrounds']
  },
  
  neutral: {
    colors: ['black', 'white', 'gray', 'beige', 'taupe', 'cream'],
    characteristics: ['versatile', 'balanced', 'timeless', 'sophisticated'],
    psychological: ['balance', 'neutrality', 'elegance', 'minimalism'],
    usage: ['foundations', 'framing', 'minimalist designs']
  }
}

// Comprehensive Color Synonyms
export const COLOR_SYNONYMS: Record<string, string[]> = {
  red: ['crimson', 'scarlet', 'ruby', 'cherry', 'fire', 'blood', 'rose', 'burgundy', 'cardinal', 'maroon'],
  orange: ['amber', 'tangerine', 'peach', 'coral', 'apricot', 'golden', 'copper', 'rust', 'terracotta'],
  yellow: ['gold', 'lemon', 'amber', 'canary', 'sunshine', 'golden', 'mustard', 'honey', 'butter'],
  green: ['emerald', 'forest', 'lime', 'mint', 'sage', 'olive', 'jade', 'kelly', 'hunter', 'fern'],
  blue: ['azure', 'navy', 'cobalt', 'sapphire', 'royal', 'cerulean', 'sky', 'ocean', 'midnight', 'indigo'],
  purple: ['violet', 'lavender', 'plum', 'mauve', 'amethyst', 'magenta', 'lilac', 'orchid', 'eggplant'],
  pink: ['rose', 'magenta', 'fuchsia', 'salmon', 'coral', 'blush', 'peach', 'strawberry'],
  black: ['ebony', 'charcoal', 'jet', 'ink', 'midnight', 'obsidian', 'raven', 'coal', 'onyx'],
  white: ['ivory', 'cream', 'pearl', 'snow', 'alabaster', 'bone', 'chalk', 'milk', 'vanilla'],
  gray: ['grey', 'silver', 'slate', 'ash', 'charcoal', 'pewter', 'steel', 'smoke', 'mist'],
  brown: ['tan', 'beige', 'copper', 'rust', 'chocolate', 'mahogany', 'walnut', 'cognac', 'espresso'],
  teal: ['turquoise', 'cyan', 'aqua', 'mint', 'seafoam', 'peacock', 'jade', 'emerald']
}

// Mood Word Associations
export const MOOD_WORDS: Record<string, string[]> = {
  passionate: ['passionate', 'intense', 'fiery', 'dramatic', 'emotional', 'bold', 'urgent', 'romantic', 'powerful'],
  calm: ['peaceful', 'serene', 'tranquil', 'quiet', 'gentle', 'relaxing', 'soothing', 'meditative', 'zen'],
  energetic: ['vibrant', 'dynamic', 'bold', 'intense', 'powerful', 'stimulating', 'active', 'lively', 'exciting'],
  romantic: ['romantic', 'passionate', 'intimate', 'loving', 'tender', 'sweet', 'gentle', 'soft', 'affectionate'],
  mysterious: ['mysterious', 'enigmatic', 'dark', 'moody', 'atmospheric', 'intriguing', 'sophisticated', 'dramatic'],
  cheerful: ['bright', 'happy', 'joyful', 'uplifting', 'optimistic', 'sunny', 'radiant', 'positive', 'lighthearted'],
  sophisticated: ['elegant', 'refined', 'polished', 'classic', 'urbane', 'cultured', 'distinguished', 'graceful'],
  earthy: ['natural', 'grounded', 'organic', 'stable', 'reliable', 'rustic', 'authentic', 'down-to-earth'],
  luxurious: ['opulent', 'rich', 'lavish', 'sumptuous', 'grand', 'magnificent', 'splendid', 'regal'],
  minimal: ['clean', 'simple', 'uncluttered', 'sparse', 'essential', 'pure', 'streamlined', 'unadorned']
}

// Utility Functions
export function getColorByName(name: string): ColorDefinition | null {
  return COLOR_DEFINITIONS[name.toLowerCase()] || null
}

export function getColorByHex(hex: string): ColorDefinition | null {
  const normalizedHex = hex.toLowerCase()
  return Object.values(COLOR_DEFINITIONS).find(color => 
    color.hex.toLowerCase() === normalizedHex
  ) || null
}

export function getColorsByMood(mood: string): ColorDefinition[] {
  const moodDef = MOOD_DEFINITIONS[mood.toLowerCase()]
  if (!moodDef) return []
  
  return moodDef.colors.map(colorName => 
    COLOR_DEFINITIONS[colorName]
  ).filter(Boolean)
}

export function getColorsByTemperature(temperature: 'warm' | 'cool' | 'neutral'): ColorDefinition[] {
  return Object.values(COLOR_DEFINITIONS).filter(color => 
    color.temperature === temperature
  )
}

export function getColorFamily(familyName: string): ColorFamily | null {
  return COLOR_FAMILIES[familyName.toLowerCase()] || null
}

export function getMoodDefinition(mood: string): MoodDefinition | null {
  return MOOD_DEFINITIONS[mood.toLowerCase()] || null
}

export function findColorSynonyms(colorName: string): string[] {
  return COLOR_SYNONYMS[colorName.toLowerCase()] || [colorName]
}

export function findMoodWords(mood: string): string[] {
  return MOOD_WORDS[mood.toLowerCase()] || []
}

export function hexToColorName(hex: string): string | null {
  const normalizedHex = hex.toLowerCase()
  const color = Object.values(COLOR_DEFINITIONS).find(c => 
    c.hex.toLowerCase() === normalizedHex
  )
  return color?.name || null
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')}`
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

export function getComplementaryColor(colorName: string): string[] {
  const color = COLOR_DEFINITIONS[colorName.toLowerCase()]
  return color?.complementary || []
}

export function getAnalogousColors(colorName: string): string[] {
  const color = COLOR_DEFINITIONS[colorName.toLowerCase()]
  return color?.analogous || []
}

export function getTriadicColors(colorName: string): string[] {
  const color = COLOR_DEFINITIONS[colorName.toLowerCase()]
  return color?.triadic || []
}

export function getTetradicColors(colorName: string): string[] {
  const color = COLOR_DEFINITIONS[colorName.toLowerCase()]
  return color?.tetradic || []
}

// Color Harmony Analysis
export function analyzeColorHarmony(colors: string[]): {
  harmony: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'complex'
  score: number
  description: string
} {
  if (colors.length < 2) {
    return { harmony: 'complex', score: 0, description: 'Not enough colors for analysis' }
  }

  const colorDefs = colors.map(c => getColorByName(c)).filter(Boolean)
  
  // Check for monochromatic (same hue family)
  const hues = colorDefs.map(c => Math.floor(c!.hsl.h / 30) * 30) // Group by 30-degree intervals
  const uniqueHues = new Set(hues)
  
  if (uniqueHues.size === 1) {
    return {
      harmony: 'monochromatic',
      score: 0.9,
      description: 'Monochromatic harmony creates a cohesive, unified look'
    }
  }
  
  // Check for complementary
  const complementaryPairs = colorDefs.filter(c => 
    colorDefs.some(other => other!.complementary.includes(c!.name))
  )
  
  if (complementaryPairs.length >= 2) {
    return {
      harmony: 'complementary',
      score: 0.8,
      description: 'Complementary colors create dynamic contrast and visual interest'
    }
  }
  
  // Check for analogous
  const analogousGroups = colorDefs.filter(c => 
    colorDefs.some(other => other!.analogous.includes(c!.name))
  )
  
  if (analogousGroups.length >= 2) {
    return {
      harmony: 'analogous',
      score: 0.7,
      description: 'Analogous colors create smooth, harmonious transitions'
    }
  }
  
  // Check for triadic
  const triadicGroups = colorDefs.filter(c => 
    colorDefs.some(other => other!.triadic.includes(c!.name))
  )
  
  if (triadicGroups.length >= 3) {
    return {
      harmony: 'triadic',
      score: 0.6,
      description: 'Triadic colors create balanced, vibrant compositions'
    }
  }
  
  return {
    harmony: 'complex',
    score: 0.3,
    description: 'Complex color relationships require careful balance'
  }
}

export default {
  COLOR_DEFINITIONS,
  COLOR_FAMILIES,
  MOOD_DEFINITIONS,
  COLOR_TEMPERATURE,
  COLOR_SYNONYMS,
  MOOD_WORDS,
  getColorByName,
  getColorByHex,
  getColorsByMood,
  getColorsByTemperature,
  getColorFamily,
  getMoodDefinition,
  findColorSynonyms,
  findMoodWords,
  hexToColorName,
  rgbToHex,
  hexToRgb,
  getComplementaryColor,
  getAnalogousColors,
  getTriadicColors,
  getTetradicColors,
  analyzeColorHarmony
}
