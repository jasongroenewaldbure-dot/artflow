/**
 * Comprehensive Art Styles & Genres Library for ArtFlow
 * 
 * This library provides a complete taxonomy of art styles, genres, and movements including:
 * - Historical art movements and their characteristics
 * - Contemporary art styles and trends
 * - Style relationships and influences
 * - Cultural and temporal context
 * - Visual characteristics and techniques
 * - Associated artists and periods
 */

export interface ArtStyle {
  id: string
  name: string
  description: string
  period: string
  characteristics: string[]
  techniques: string[]
  colors: string[]
  subjects: string[]
  influences: string[]
  influenced: string[]
  artists: string[]
  synonyms: string[]
  keywords: string[]
  culturalContext: string[]
  visualElements: {
    composition: string[]
    brushwork: string[]
    perspective: string[]
    lighting: string[]
    texture: string[]
  }
  mood: string[]
  popularity: 'classic' | 'trending' | 'emerging' | 'niche'
  marketValue: 'high' | 'medium' | 'low' | 'variable'
}

export interface ArtMovement {
  id: string
  name: string
  description: string
  timePeriod: string
  location: string
  styles: string[]
  keyArtists: string[]
  characteristics: string[]
  culturalContext: string[]
  influences: string[]
  legacy: string[]
}

// Comprehensive Art Styles Definitions
export const ART_STYLES: Record<string, ArtStyle> = {
  // Classical & Traditional Styles
  realism: {
    id: 'realism',
    name: 'Realism',
    description: 'Artistic movement that depicts subjects as they appear in real life',
    period: '1850s-1880s',
    characteristics: ['accurate representation', 'detailed observation', 'natural lighting', 'everyday subjects'],
    techniques: ['careful observation', 'precise brushwork', 'natural color palette', 'detailed rendering'],
    colors: ['natural', 'earth tones', 'muted', 'realistic'],
    subjects: ['landscapes', 'portraits', 'still life', 'everyday scenes'],
    influences: ['romanticism', 'neoclassicism'],
    influenced: ['impressionism', 'photorealism'],
    artists: ['Gustave Courbet', 'Jean-François Millet', 'Honoré Daumier'],
    synonyms: ['naturalistic', 'representational', 'figurative'],
    keywords: ['realistic', 'natural', 'detailed', 'accurate', 'lifelike'],
    culturalContext: ['industrial revolution', 'social change', 'democratic ideals'],
    visualElements: {
      composition: ['balanced', 'traditional', 'focal point'],
      brushwork: ['smooth', 'detailed', 'precise'],
      perspective: ['linear', 'atmospheric', 'realistic'],
      lighting: ['natural', 'dramatic', 'chiaroscuro'],
      texture: ['detailed', 'realistic', 'varied']
    },
    mood: ['serious', 'contemplative', 'grounded', 'authentic'],
    popularity: 'classic',
    marketValue: 'high'
  },

  impressionism: {
    id: 'impressionism',
    name: 'Impressionism',
    description: 'Movement characterized by visible brush strokes and emphasis on light',
    period: '1860s-1880s',
    characteristics: ['visible brushstrokes', 'light effects', 'outdoor painting', 'captured moments'],
    techniques: ['broken color', 'wet-on-wet', 'rapid brushwork', 'plein air'],
    colors: ['bright', 'vibrant', 'light-filled', 'natural'],
    subjects: ['landscapes', 'city scenes', 'portraits', 'daily life'],
    influences: ['realism', 'barbizon school'],
    influenced: ['post-impressionism', 'neo-impressionism', 'fauvism'],
    artists: ['Claude Monet', 'Pierre-Auguste Renoir', 'Edgar Degas', 'Camille Pissarro'],
    synonyms: ['impressionist', 'plein air', 'en plein air'],
    keywords: ['light', 'color', 'brushstrokes', 'outdoor', 'moment'],
    culturalContext: ['modern life', 'urbanization', 'leisure time'],
    visualElements: {
      composition: ['spontaneous', 'cropped', 'asymmetrical'],
      brushwork: ['visible', 'broken', 'rapid'],
      perspective: ['atmospheric', 'color-based'],
      lighting: ['natural', 'changing', 'effects'],
      texture: ['rough', 'visible', 'varied']
    },
    mood: ['joyful', 'light', 'spontaneous', 'optimistic'],
    popularity: 'classic',
    marketValue: 'high'
  },

  abstract: {
    id: 'abstract',
    name: 'Abstract Art',
    description: 'Art that does not attempt to represent external reality',
    period: '1910s-present',
    characteristics: ['non-representational', 'geometric forms', 'color relationships', 'emotional expression'],
    techniques: ['color field', 'gestural painting', 'geometric construction', 'mixed media'],
    colors: ['bold', 'contrasting', 'pure', 'experimental'],
    subjects: ['forms', 'colors', 'emotions', 'concepts'],
    influences: ['cubism', 'fauvism', 'expressionism'],
    influenced: ['minimalism', 'color field', 'conceptual art'],
    artists: ['Wassily Kandinsky', 'Piet Mondrian', 'Jackson Pollock', 'Mark Rothko'],
    synonyms: ['non-representational', 'non-figurative', 'abstract expressionism'],
    keywords: ['abstract', 'geometric', 'color', 'form', 'emotion'],
    culturalContext: ['modernism', 'individual expression', 'spiritual exploration'],
    visualElements: {
      composition: ['dynamic', 'balanced', 'asymmetrical'],
      brushwork: ['gestural', 'varied', 'expressive'],
      perspective: ['flat', 'multiple', 'none'],
      lighting: ['implied', 'color-based', 'none'],
      texture: ['varied', 'experimental', 'mixed']
    },
    mood: ['dynamic', 'emotional', 'energetic', 'contemplative'],
    popularity: 'trending',
    marketValue: 'variable'
  },

  contemporary: {
    id: 'contemporary',
    name: 'Contemporary Art',
    description: 'Art produced in the present time, reflecting current cultural and social issues',
    period: '1970s-present',
    characteristics: ['current themes', 'diverse media', 'conceptual', 'global perspective'],
    techniques: ['mixed media', 'digital', 'installation', 'performance'],
    colors: ['varied', 'experimental', 'bold', 'subtle'],
    subjects: ['social issues', 'identity', 'technology', 'environment'],
    influences: ['all previous movements', 'global cultures', 'technology'],
    influenced: ['emerging trends', 'future movements'],
    artists: ['Ai Weiwei', 'Yayoi Kusama', 'Banksy', 'Damien Hirst'],
    synonyms: ['modern', 'current', 'present-day'],
    keywords: ['contemporary', 'current', 'relevant', 'diverse', 'global'],
    culturalContext: ['globalization', 'technology', 'social media', 'climate change'],
    visualElements: {
      composition: ['experimental', 'varied', 'conceptual'],
      brushwork: ['varied', 'mixed', 'digital'],
      perspective: ['multiple', 'conceptual', 'none'],
      lighting: ['natural', 'artificial', 'digital'],
      texture: ['mixed', 'digital', 'found materials']
    },
    mood: ['provocative', 'thoughtful', 'diverse', 'relevant'],
    popularity: 'trending',
    marketValue: 'variable'
  },

  minimalism: {
    id: 'minimalism',
    name: 'Minimalism',
    description: 'Art movement emphasizing simplicity and reduction to essential elements',
    period: '1960s-1970s',
    characteristics: ['simplicity', 'geometric forms', 'limited color', 'clean lines'],
    techniques: ['reduction', 'precision', 'geometric construction', 'monochrome'],
    colors: ['neutral', 'monochrome', 'limited palette', 'pure'],
    subjects: ['forms', 'space', 'materials', 'relationships'],
    influences: ['abstract expressionism', 'bauhaus', 'constructivism'],
    influenced: ['conceptual art', 'post-minimalism', 'contemporary design'],
    artists: ['Donald Judd', 'Agnes Martin', 'Frank Stella', 'Dan Flavin'],
    synonyms: ['minimal', 'reductive', 'essential'],
    keywords: ['simple', 'clean', 'geometric', 'reduced', 'essential'],
    culturalContext: ['post-war', 'industrial', 'technological'],
    visualElements: {
      composition: ['balanced', 'symmetrical', 'reduced'],
      brushwork: ['smooth', 'precise', 'minimal'],
      perspective: ['flat', 'geometric', 'none'],
      lighting: ['even', 'natural', 'artificial'],
      texture: ['smooth', 'uniform', 'minimal']
    },
    mood: ['calm', 'serene', 'contemplative', 'pure'],
    popularity: 'classic',
    marketValue: 'high'
  },

  pop_art: {
    id: 'pop_art',
    name: 'Pop Art',
    description: 'Movement that incorporated popular culture and mass media imagery',
    period: '1950s-1960s',
    characteristics: ['popular culture', 'bright colors', 'mass media', 'consumerism'],
    techniques: ['screen printing', 'collage', 'bold colors', 'repetition'],
    colors: ['bright', 'primary', 'commercial', 'synthetic'],
    subjects: ['celebrities', 'products', 'comics', 'advertising'],
    influences: ['dada', 'abstract expressionism', 'commercial art'],
    influenced: ['neo-pop', 'street art', 'contemporary art'],
    artists: ['Andy Warhol', 'Roy Lichtenstein', 'Jasper Johns', 'Robert Rauschenberg'],
    synonyms: ['pop', 'popular art', 'commercial art'],
    keywords: ['pop', 'popular', 'commercial', 'bright', 'mass media'],
    culturalContext: ['consumer culture', 'mass media', 'post-war prosperity'],
    visualElements: {
      composition: ['bold', 'graphic', 'repetitive'],
      brushwork: ['mechanical', 'precise', 'commercial'],
      perspective: ['flat', 'graphic', 'none'],
      lighting: ['artificial', 'commercial', 'flat'],
      texture: ['smooth', 'commercial', 'printed']
    },
    mood: ['energetic', 'playful', 'ironic', 'bold'],
    popularity: 'classic',
    marketValue: 'high'
  },

  surrealism: {
    id: 'surrealism',
    name: 'Surrealism',
    description: 'Movement exploring the unconscious mind and dream imagery',
    period: '1920s-1940s',
    characteristics: ['dream imagery', 'unconscious', 'fantasy', 'symbolism'],
    techniques: ['automatism', 'collage', 'frottage', 'decalcomania'],
    colors: ['dreamlike', 'symbolic', 'contrasting', 'mysterious'],
    subjects: ['dreams', 'fantasy', 'symbols', 'unconscious'],
    influences: ['dada', 'psychoanalysis', 'symbolism'],
    influenced: ['magic realism', 'contemporary art', 'conceptual art'],
    artists: ['Salvador Dalí', 'René Magritte', 'Max Ernst', 'Joan Miró'],
    synonyms: ['surreal', 'dreamlike', 'fantastic'],
    keywords: ['surreal', 'dream', 'fantasy', 'unconscious', 'symbolic'],
    culturalContext: ['psychoanalysis', 'world wars', 'modern anxiety'],
    visualElements: {
      composition: ['unexpected', 'symbolic', 'dreamlike'],
      brushwork: ['varied', 'symbolic', 'automatic'],
      perspective: ['multiple', 'impossible', 'dreamlike'],
      lighting: ['dramatic', 'mysterious', 'symbolic'],
      texture: ['varied', 'symbolic', 'dreamlike']
    },
    mood: ['mysterious', 'dreamlike', 'provocative', 'fantastic'],
    popularity: 'classic',
    marketValue: 'high'
  },

  expressionism: {
    id: 'expressionism',
    name: 'Expressionism',
    description: 'Movement emphasizing emotional expression over realistic representation',
    period: '1900s-1920s',
    characteristics: ['emotional intensity', 'distorted forms', 'bold colors', 'subjective'],
    techniques: ['bold brushwork', 'distortion', 'color emphasis', 'emotional'],
    colors: ['bold', 'contrasting', 'emotional', 'non-naturalistic'],
    subjects: ['emotions', 'inner life', 'social issues', 'human condition'],
    influences: ['post-impressionism', 'symbolism', 'fauvism'],
    influenced: ['abstract expressionism', 'neo-expressionism'],
    artists: ['Edvard Munch', 'Ernst Ludwig Kirchner', 'Emil Nolde', 'Wassily Kandinsky'],
    synonyms: ['expressionist', 'emotional', 'subjective'],
    keywords: ['emotional', 'expressive', 'bold', 'distorted', 'intense'],
    culturalContext: ['world wars', 'social upheaval', 'psychological exploration'],
    visualElements: {
      composition: ['dynamic', 'emotional', 'asymmetrical'],
      brushwork: ['bold', 'gestural', 'expressive'],
      perspective: ['distorted', 'emotional', 'subjective'],
      lighting: ['dramatic', 'emotional', 'contrasting'],
      texture: ['rough', 'expressive', 'varied']
    },
    mood: ['intense', 'emotional', 'dramatic', 'provocative'],
    popularity: 'classic',
    marketValue: 'high'
  },

  cubism: {
    id: 'cubism',
    name: 'Cubism',
    description: 'Movement that fragmented objects into geometric forms',
    period: '1907-1914',
    characteristics: ['geometric forms', 'multiple perspectives', 'fragmented', 'analytical'],
    techniques: ['geometric construction', 'multiple viewpoints', 'collage', 'fragmentation'],
    colors: ['muted', 'analytical', 'geometric', 'neutral'],
    subjects: ['still life', 'portraits', 'objects', 'forms'],
    influences: ['cezanne', 'african art', 'primitivism'],
    influenced: ['futurism', 'constructivism', 'abstract art'],
    artists: ['Pablo Picasso', 'Georges Braque', 'Juan Gris', 'Fernand Léger'],
    synonyms: ['cubist', 'geometric', 'analytical'],
    keywords: ['cubist', 'geometric', 'fragmented', 'analytical', 'multiple'],
    culturalContext: ['modernism', 'scientific revolution', 'african influence'],
    visualElements: {
      composition: ['geometric', 'fragmented', 'analytical'],
      brushwork: ['precise', 'geometric', 'analytical'],
      perspective: ['multiple', 'fragmented', 'geometric'],
      lighting: ['analytical', 'geometric', 'flat'],
      texture: ['varied', 'collage', 'mixed']
    },
    mood: ['analytical', 'intellectual', 'revolutionary', 'complex'],
    popularity: 'classic',
    marketValue: 'high'
  },

  photorealism: {
    id: 'photorealism',
    name: 'Photorealism',
    description: 'Movement creating paintings that resemble photographs',
    period: '1960s-1970s',
    characteristics: ['photographic accuracy', 'detailed rendering', 'sharp focus', 'realistic'],
    techniques: ['airbrush', 'detailed brushwork', 'photographic reference', 'precision'],
    colors: ['realistic', 'photographic', 'detailed', 'accurate'],
    subjects: ['urban scenes', 'portraits', 'objects', 'landscapes'],
    influences: ['realism', 'photography', 'pop art'],
    influenced: ['hyperrealism', 'contemporary realism'],
    artists: ['Chuck Close', 'Richard Estes', 'Audrey Flack', 'Ralph Goings'],
    synonyms: ['hyperrealistic', 'super-realistic', 'photo-realistic'],
    keywords: ['photorealistic', 'detailed', 'accurate', 'sharp', 'precise'],
    culturalContext: ['photography', 'mass media', 'consumer culture'],
    visualElements: {
      composition: ['photographic', 'framed', 'detailed'],
      brushwork: ['precise', 'detailed', 'smooth'],
      perspective: ['photographic', 'realistic', 'accurate'],
      lighting: ['photographic', 'realistic', 'detailed'],
      texture: ['detailed', 'realistic', 'photographic']
    },
    mood: ['precise', 'detailed', 'realistic', 'technical'],
    popularity: 'classic',
    marketValue: 'medium'
  }
}

// Art Movements
export const ART_MOVEMENTS: Record<string, ArtMovement> = {
  renaissance: {
    id: 'renaissance',
    name: 'Renaissance',
    description: 'Cultural movement marking the transition from medieval to modern Europe',
    timePeriod: '14th-17th century',
    location: 'Italy, spreading to Europe',
    styles: ['classical', 'humanistic', 'naturalistic'],
    keyArtists: ['Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Titian'],
    characteristics: ['humanism', 'perspective', 'classical influence', 'naturalism'],
    culturalContext: ['rebirth of classical learning', 'scientific revolution', 'humanism'],
    influences: ['classical antiquity', 'byzantine art', 'gothic art'],
    legacy: ['foundation of western art', 'scientific perspective', 'humanistic values']
  },

  baroque: {
    id: 'baroque',
    name: 'Baroque',
    description: 'Dramatic, emotional style emphasizing movement and grandeur',
    timePeriod: '17th-18th century',
    location: 'Europe, especially Italy and Spain',
    styles: ['dramatic', 'ornate', 'emotional'],
    keyArtists: ['Caravaggio', 'Bernini', 'Rubens', 'Rembrandt'],
    characteristics: ['dramatic lighting', 'emotional intensity', 'ornate decoration', 'movement'],
    culturalContext: ['counter-reformation', 'absolutism', 'religious fervor'],
    influences: ['renaissance', 'mannerism', 'religious art'],
    legacy: ['theatrical art', 'emotional expression', 'grand scale']
  },

  romanticism: {
    id: 'romanticism',
    name: 'Romanticism',
    description: 'Movement emphasizing emotion, individualism, and nature',
    timePeriod: '18th-19th century',
    location: 'Europe and America',
    styles: ['emotional', 'dramatic', 'naturalistic'],
    keyArtists: ['Eugène Delacroix', 'J.M.W. Turner', 'Caspar David Friedrich', 'Francisco Goya'],
    characteristics: ['emotional expression', 'nature worship', 'individualism', 'dramatic scenes'],
    culturalContext: ['industrial revolution', 'nationalism', 'individualism'],
    influences: ['neoclassicism', 'gothic revival', 'nature'],
    legacy: ['emotional art', 'nature painting', 'individual expression']
  }
}

// Style Categories
export const STYLE_CATEGORIES = {
  classical: ['realism', 'renaissance', 'baroque', 'neoclassicism'],
  modern: ['impressionism', 'post-impressionism', 'expressionism', 'cubism'],
  contemporary: ['abstract', 'pop_art', 'minimalism', 'contemporary'],
  experimental: ['surrealism', 'dada', 'conceptual', 'performance']
}

// Utility Functions
export function getStyleById(id: string): ArtStyle | null {
  return ART_STYLES[id] || null
}

export function getMovementById(id: string): ArtMovement | null {
  return ART_MOVEMENTS[id] || null
}

export function getStylesByCategory(category: keyof typeof STYLE_CATEGORIES): ArtStyle[] {
  const styleIds = STYLE_CATEGORIES[category]
  return styleIds.map(id => ART_STYLES[id]).filter(Boolean)
}

export function getStylesByPeriod(period: string): ArtStyle[] {
  return Object.values(ART_STYLES).filter(style => 
    style.period.includes(period) || period.includes(style.period)
  )
}

export function getStylesByMood(mood: string): ArtStyle[] {
  return Object.values(ART_STYLES).filter(style => 
    style.mood.includes(mood.toLowerCase())
  )
}

export function getStylesByPopularity(popularity: ArtStyle['popularity']): ArtStyle[] {
  return Object.values(ART_STYLES).filter(style => style.popularity === popularity)
}

export function findStyleSynonyms(styleName: string): string[] {
  const style = Object.values(ART_STYLES).find(s => 
    s.name.toLowerCase() === styleName.toLowerCase() ||
    s.synonyms.some(syn => syn.toLowerCase() === styleName.toLowerCase())
  )
  return style?.synonyms || [styleName]
}

export function getRelatedStyles(styleId: string): ArtStyle[] {
  const style = ART_STYLES[styleId]
  if (!style) return []
  
  const relatedIds = [...style.influences, ...style.influenced]
  return relatedIds.map(id => ART_STYLES[id]).filter(Boolean)
}

export function analyzeStyleCompatibility(styles: string[]): {
  compatibility: 'high' | 'medium' | 'low'
  reasons: string[]
  suggestions: string[]
} {
  if (styles.length < 2) {
    return { compatibility: 'high', reasons: ['Single style'], suggestions: [] }
  }

  const styleObjects = styles.map(id => ART_STYLES[id]).filter(Boolean)
  const periods = styleObjects.map(s => s.period)
  const characteristics = styleObjects.flatMap(s => s.characteristics)
  
  // Check period compatibility
  const periodCompatibility = new Set(periods).size <= 2 ? 'high' : 'medium'
  
  // Check characteristic overlap
  const commonCharacteristics = characteristics.filter((char, index, arr) => 
    arr.indexOf(char) !== index
  )
  
  const compatibility = commonCharacteristics.length > 2 ? 'high' : 
                        commonCharacteristics.length > 0 ? 'medium' : 'low'
  
  const reasons: string[] = []
  if (periodCompatibility === 'high') reasons.push('Similar historical periods')
  if (commonCharacteristics.length > 0) reasons.push('Shared characteristics')
  
  const suggestions: string[] = []
  if (compatibility === 'low') {
    suggestions.push('Consider styles from similar periods')
    suggestions.push('Look for styles with overlapping characteristics')
  }
  
  return { compatibility, reasons, suggestions }
}

export default {
  ART_STYLES,
  ART_MOVEMENTS,
  STYLE_CATEGORIES,
  getStyleById,
  getMovementById,
  getStylesByCategory,
  getStylesByPeriod,
  getStylesByMood,
  getStylesByPopularity,
  findStyleSynonyms,
  getRelatedStyles,
  analyzeStyleCompatibility
}
