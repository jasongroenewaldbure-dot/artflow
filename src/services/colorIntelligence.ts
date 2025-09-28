import { supabase } from '../lib/supabase'

export interface OKLCHColor {
  l: number // Lightness (0-1)
  c: number // Chroma (0-0.4)
  h: number // Hue (0-360)
  alpha?: number // Alpha (0-1)
}

export interface ColorPalette {
  dominant: OKLCHColor[]
  accent: OKLCHColor[]
  neutral: OKLCHColor[]
  temperature: 'warm' | 'cool' | 'neutral'
  saturation: 'vibrant' | 'muted' | 'balanced'
  brightness: 'light' | 'dark' | 'balanced'
  harmony: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'split-complementary'
}

export interface ColorMatch {
  artworkId: string
  compatibilityScore: number // 0-1
  colorHarmony: string
  reasons: string[]
  complementaryColors: OKLCHColor[]
}

export interface RoomPalette {
  dominantColors: OKLCHColor[]
  lightingType: 'warm' | 'cool' | 'natural'
  roomSize: 'small' | 'medium' | 'large'
  style: 'modern' | 'traditional' | 'eclectic' | 'minimalist'
}

/**
 * Advanced Color Intelligence Service using OKLCH color space
 * Provides perceptually uniform color matching and palette analysis
 */
export class ColorIntelligenceService {
  
  /**
   * Extract OKLCH palette from image with advanced color analysis
   */
  async extractOKLCHPalette(imageFile: File): Promise<ColorPalette> {
    try {
      // Create canvas for color analysis
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      
      // Load image
      const img = await this.loadImage(imageFile)
      
      // Use optimal canvas size for color analysis
      const maxSize = 300
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      
      // Draw image to canvas with high quality
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imageData.data
      
      // Advanced color extraction with multiple sampling strategies
      const colors: OKLCHColor[] = []
      const colorCounts = new Map<string, number>()
      
      // Strategy 1: Grid sampling for even distribution
      const gridStep = Math.max(4, Math.floor(Math.sqrt(canvas.width * canvas.height) / 50))
      for (let y = 0; y < canvas.height; y += gridStep) {
        for (let x = 0; x < canvas.width; x += gridStep) {
          const i = (y * canvas.width + x) * 4
          const r = pixels[i] / 255
          const g = pixels[i + 1] / 255
          const b = pixels[i + 2] / 255
          const a = pixels[i + 3] / 255
          
          if (a > 0.3) { // Include semi-transparent pixels
            const oklch = this.rgbToOKLCH(r, g, b)
            const key = `${Math.round(oklch.l * 100)}-${Math.round(oklch.c * 100)}-${Math.round(oklch.h)}`
            colorCounts.set(key, (colorCounts.get(key) || 0) + 1)
            colors.push(oklch)
          }
        }
      }
      
      // Strategy 2: Edge detection for important colors
      const edgeColors = this.extractEdgeColors(imageData, canvas.width, canvas.height)
      edgeColors.forEach(oklch => {
        const key = `${Math.round(oklch.l * 100)}-${Math.round(oklch.c * 100)}-${Math.round(oklch.h)}`
        colorCounts.set(key, (colorCounts.get(key) || 0) + 2) // Weight edge colors more
        colors.push(oklch)
      })
      
      // Strategy 3: Center focus for main subject colors
      const centerColors = this.extractCenterColors(imageData, canvas.width, canvas.height)
      centerColors.forEach(oklch => {
        const key = `${Math.round(oklch.l * 100)}-${Math.round(oklch.c * 100)}-${Math.round(oklch.h)}`
        colorCounts.set(key, (colorCounts.get(key) || 0) + 1.5) // Weight center colors
        colors.push(oklch)
      })
      
      // Cluster colors and analyze palette with weighted importance
      return this.analyzePalette(colors, colorCounts)
      
    } catch (error) {
      console.error('Error extracting OKLCH palette:', error)
      throw error
    }
  }

  /**
   * Extract colors from image edges (important for composition)
   */
  private extractEdgeColors(imageData: ImageData, width: number, height: number): OKLCHColor[] {
    const colors: OKLCHColor[] = []
    const pixels = imageData.data
    const edgeThreshold = 30 // Sensitivity for edge detection
    
    for (let y = 1; y < height - 1; y += 3) {
      for (let x = 1; x < width - 1; x += 3) {
        const i = (y * width + x) * 4
        
        // Sobel edge detection
        const gx = this.getGradientX(pixels, x, y, width)
        const gy = this.getGradientY(pixels, x, y, width)
        const magnitude = Math.sqrt(gx * gx + gy * gy)
        
        if (magnitude > edgeThreshold) {
          const r = pixels[i] / 255
          const g = pixels[i + 1] / 255
          const b = pixels[i + 2] / 255
          const a = pixels[i + 3] / 255
          
          if (a > 0.3) {
            colors.push(this.rgbToOKLCH(r, g, b))
          }
        }
      }
    }
    
    return colors
  }

  /**
   * Extract colors from image center (main subject area)
   */
  private extractCenterColors(imageData: ImageData, width: number, height: number): OKLCHColor[] {
    const colors: OKLCHColor[] = []
    const pixels = imageData.data
    
    // Focus on center 40% of image
    const centerX = width * 0.3
    const centerY = height * 0.3
    const centerWidth = width * 0.4
    const centerHeight = height * 0.4
    
    for (let y = centerY; y < centerY + centerHeight; y += 2) {
      for (let x = centerX; x < centerX + centerWidth; x += 2) {
        const i = (Math.floor(y) * width + Math.floor(x)) * 4
        const r = pixels[i] / 255
        const g = pixels[i + 1] / 255
        const b = pixels[i + 2] / 255
        const a = pixels[i + 3] / 255
        
        if (a > 0.3) {
          colors.push(this.rgbToOKLCH(r, g, b))
        }
      }
    }
    
    return colors
  }

  /**
   * Calculate gradient in X direction for edge detection
   */
  private getGradientX(pixels: Uint8ClampedArray, x: number, y: number, width: number): number {
    const getPixel = (px: number, py: number) => {
      const i = (py * width + px) * 4
      return (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3 // Grayscale
    }
    
    return getPixel(x + 1, y - 1) + 2 * getPixel(x + 1, y) + getPixel(x + 1, y + 1) -
           getPixel(x - 1, y - 1) - 2 * getPixel(x - 1, y) - getPixel(x - 1, y + 1)
  }

  /**
   * Calculate gradient in Y direction for edge detection
   */
  private getGradientY(pixels: Uint8ClampedArray, x: number, y: number, width: number): number {
    const getPixel = (px: number, py: number) => {
      const i = (py * width + px) * 4
      return (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3 // Grayscale
    }
    
    return getPixel(x - 1, y + 1) + 2 * getPixel(x, y + 1) + getPixel(x + 1, y + 1) -
           getPixel(x - 1, y - 1) - 2 * getPixel(x, y - 1) - getPixel(x + 1, y - 1)
  }

  /**
   * Find artworks that complement a room's color palette
   */
  async findRoomMatches(roomPalette: RoomPalette, limit: number = 20): Promise<ColorMatch[]> {
    try {
      // Get all artworks with color data
      const { data: artworks } = await supabase
        .from('artworks')
        .select(`
          id, title, dominant_colors, oklch_palette, price, medium, genre,
          primary_image_url, user_id
        `)
        .eq('status', 'available')
        .not('oklch_palette', 'is', null)
        .limit(200) // Limit for performance
      
      if (!artworks) return []
      
      const matches: ColorMatch[] = []
      
      for (const artwork of artworks) {
        const artworkPalette = artwork.oklch_palette as ColorPalette
        if (!artworkPalette) continue
        
        const compatibility = this.calculateRoomCompatibility(roomPalette, artworkPalette)
        
        if (compatibility.score > 0.3) { // Only include decent matches
          matches.push({
            artworkId: artwork.id,
            compatibilityScore: compatibility.score,
            colorHarmony: compatibility.harmony,
            reasons: compatibility.reasons,
            complementaryColors: compatibility.complementaryColors
          })
        }
      }
      
      return matches
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, limit)
      
    } catch (error) {
      console.error('Error finding room matches:', error)
      return []
    }
  }

  /**
   * Generate complementary color palette for interior matching
   */
  generateComplementaryPalette(basePalette: OKLCHColor[]): OKLCHColor[] {
    return basePalette.map(color => ({
      l: color.l, // Keep same lightness
      c: color.c * 0.8, // Slightly reduce chroma
      h: (color.h + 180) % 360, // Complementary hue
      alpha: color.alpha
    }))
  }

  /**
   * Generate analogous color palette
   */
  generateAnalogousPalette(basePalette: OKLCHColor[]): OKLCHColor[] {
    const analogous: OKLCHColor[] = []
    
    basePalette.forEach(color => {
      // Add colors 30 degrees on either side
      analogous.push(
        { ...color, h: (color.h + 30) % 360 },
        { ...color, h: (color.h - 30 + 360) % 360 }
      )
    })
    
    return analogous
  }

  /**
   * Calculate perceptual color distance in OKLCH space
   */
  calculateColorDistance(color1: OKLCHColor, color2: OKLCHColor): number {
    // OKLCH provides perceptually uniform color space
    const deltaL = color1.l - color2.l
    const deltaC = color1.c - color2.c
    
    // Handle hue circularity
    let deltaH = Math.abs(color1.h - color2.h)
    if (deltaH > 180) deltaH = 360 - deltaH
    deltaH = deltaH * (Math.PI / 180) // Convert to radians
    
    // Weighted Euclidean distance
    return Math.sqrt(
      deltaL * deltaL + 
      deltaC * deltaC + 
      (color1.c * color2.c * deltaH * deltaH)
    )
  }

  /**
   * Convert RGB to OKLCH color space
   */
  private rgbToOKLCH(r: number, g: number, b: number): OKLCHColor {
    // First convert RGB to Linear RGB
    const linearR = this.sRGBToLinear(r)
    const linearG = this.sRGBToLinear(g)
    const linearB = this.sRGBToLinear(b)
    
    // Convert Linear RGB to OKLab
    const l = 0.4122214708 * linearR + 0.5363325363 * linearG + 0.0514459929 * linearB
    const m = 0.2119034982 * linearR + 0.6806995451 * linearG + 0.1073969566 * linearB
    const s = 0.0883024619 * linearR + 0.2817188376 * linearG + 0.6299787005 * linearB
    
    const l_ = Math.cbrt(l)
    const m_ = Math.cbrt(m)
    const s_ = Math.cbrt(s)
    
    const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
    const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
    const b_lab = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    
    // Convert OKLab to OKLCH
    const C = Math.sqrt(a * a + b_lab * b_lab)
    const h = Math.atan2(b_lab, a) * (180 / Math.PI)
    const H = h < 0 ? h + 360 : h
    
    return {
      l: L,
      c: C,
      h: H
    }
  }

  private sRGBToLinear(value: number): number {
    return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)
  }

  /**
   * Analyze color palette and determine characteristics with weighted importance
   */
  private analyzePalette(colors: OKLCHColor[], colorCounts?: Map<string, number>): ColorPalette {
    if (colors.length === 0) {
      return {
        dominant: [],
        accent: [],
        neutral: [],
        temperature: 'neutral',
        saturation: 'balanced',
        brightness: 'balanced',
        harmony: 'monochromatic'
      }
    }
    
    // Cluster colors by similarity with weighted importance
    const clusters = this.clusterColors(colors, 5, colorCounts)
    
    // Sort clusters by weighted importance (dominant colors first)
    clusters.sort((a, b) => {
      const weightA = a.reduce((sum, color) => {
        const key = `${Math.round(color.l * 100)}-${Math.round(color.c * 100)}-${Math.round(color.h)}`
        return sum + (colorCounts?.get(key) || 1)
      }, 0)
      const weightB = b.reduce((sum, color) => {
        const key = `${Math.round(color.l * 100)}-${Math.round(color.c * 100)}-${Math.round(color.h)}`
        return sum + (colorCounts?.get(key) || 1)
      }, 0)
      return weightB - weightA
    })
    
    const dominant = clusters[0] ? [this.getClusterCenter(clusters[0], colorCounts)] : []
    const accent = clusters[1] ? [this.getClusterCenter(clusters[1], colorCounts)] : []
    const neutral = clusters.slice(2).map(cluster => this.getClusterCenter(cluster, colorCounts))
    
    // Analyze palette characteristics
    const avgLightness = colors.reduce((sum, c) => sum + c.l, 0) / colors.length
    const avgChroma = colors.reduce((sum, c) => sum + c.c, 0) / colors.length
    const avgHue = this.calculateAverageHue(colors.map(c => c.h))
    
    return {
      dominant,
      accent,
      neutral,
      temperature: this.determineTemperature(avgHue),
      saturation: avgChroma > 0.15 ? 'vibrant' : avgChroma < 0.05 ? 'muted' : 'balanced',
      brightness: avgLightness > 0.7 ? 'light' : avgLightness < 0.3 ? 'dark' : 'balanced',
      harmony: this.determineHarmony(colors)
    }
  }

  private calculateRoomCompatibility(roomPalette: RoomPalette, artworkPalette: ColorPalette): {
    score: number
    harmony: string
    reasons: string[]
    complementaryColors: OKLCHColor[]
  } {
    let score = 0
    const reasons: string[] = []
    
    // Temperature compatibility
    if (roomPalette.dominantColors.length > 0 && artworkPalette.dominant.length > 0) {
      const roomTemp = this.determineTemperature(roomPalette.dominantColors[0].h)
      if (roomTemp === artworkPalette.temperature) {
        score += 0.3
        reasons.push(`Matches ${roomTemp} color temperature`)
      } else if (roomTemp !== artworkPalette.temperature) {
        score += 0.4 // Complementary temperatures can work well
        reasons.push(`Provides ${artworkPalette.temperature} contrast to ${roomTemp} room`)
      }
    }
    
    // Saturation compatibility
    if (artworkPalette.saturation === 'muted' && roomPalette.style === 'minimalist') {
      score += 0.2
      reasons.push('Muted colors perfect for minimalist space')
    }
    
    // Brightness compatibility
    if (artworkPalette.brightness === 'light' && roomPalette.lightingType === 'natural') {
      score += 0.2
      reasons.push('Light artwork complements natural lighting')
    }
    
    // Generate complementary colors for the room
    const complementaryColors = this.generateComplementaryPalette(artworkPalette.dominant)
    
    return {
      score: Math.min(1, score),
      harmony: artworkPalette.harmony,
      reasons,
      complementaryColors
    }
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  private clusterColors(colors: OKLCHColor[], k: number, colorCounts?: Map<string, number>): OKLCHColor[][] {
    // Simple k-means clustering in OKLCH space
    if (colors.length <= k) return colors.map(c => [c])
    
    // Initialize centroids
    const centroids = colors.slice(0, k)
    const clusters: OKLCHColor[][] = Array(k).fill(null).map(() => [])
    
    // Run k-means iterations
    for (let iter = 0; iter < 10; iter++) {
      // Clear clusters
      clusters.forEach(cluster => cluster.length = 0)
      
      // Assign colors to nearest centroid
      colors.forEach(color => {
        let minDistance = Infinity
        let closestCluster = 0
        
        centroids.forEach((centroid, i) => {
          const distance = this.calculateColorDistance(color, centroid)
          if (distance < minDistance) {
            minDistance = distance
            closestCluster = i
          }
        })
        
        clusters[closestCluster].push(color)
      })
      
      // Update centroids
      clusters.forEach((cluster, i) => {
        if (cluster.length > 0) {
          centroids[i] = this.getClusterCenter(cluster)
        }
      })
    }
    
    return clusters.filter(cluster => cluster.length > 0)
  }

  private getClusterCenter(colors: OKLCHColor[], colorCounts?: Map<string, number>): OKLCHColor {
    if (colors.length === 0) return { l: 0, c: 0, h: 0 }
    
    if (colorCounts) {
      // Weighted average based on color importance
      let totalWeight = 0
      let weightedL = 0
      let weightedC = 0
      let weightedH = 0
      
      colors.forEach(color => {
        const key = `${Math.round(color.l * 100)}-${Math.round(color.c * 100)}-${Math.round(color.h)}`
        const weight = colorCounts.get(key) || 1
        totalWeight += weight
        weightedL += color.l * weight
        weightedC += color.c * weight
        weightedH += color.h * weight
      })
      
      return {
        l: weightedL / totalWeight,
        c: weightedC / totalWeight,
        h: weightedH / totalWeight
      }
    } else {
      // Simple average
      const avgL = colors.reduce((sum, c) => sum + c.l, 0) / colors.length
      const avgC = colors.reduce((sum, c) => sum + c.c, 0) / colors.length
      const avgH = this.calculateAverageHue(colors.map(c => c.h))
      
      return { l: avgL, c: avgC, h: avgH }
    }
  }

  private calculateAverageHue(hues: number[]): number {
    // Handle circular nature of hue values
    const x = hues.reduce((sum, h) => sum + Math.cos(h * Math.PI / 180), 0) / hues.length
    const y = hues.reduce((sum, h) => sum + Math.sin(h * Math.PI / 180), 0) / hues.length
    
    let avgHue = Math.atan2(y, x) * (180 / Math.PI)
    if (avgHue < 0) avgHue += 360
    
    return avgHue
  }

  private determineTemperature(hue: number): 'warm' | 'cool' | 'neutral' {
    // Warm: red to yellow (0-60, 300-360)
    // Cool: cyan to blue (180-240)
    // Neutral: green and purple (60-180, 240-300)
    
    if ((hue >= 0 && hue <= 60) || (hue >= 300 && hue <= 360)) {
      return 'warm'
    } else if (hue >= 180 && hue <= 240) {
      return 'cool'
    } else {
      return 'neutral'
    }
  }

  private determineHarmony(colors: OKLCHColor[]): ColorPalette['harmony'] {
    if (colors.length < 2) return 'monochromatic'
    
    const hues = colors.map(c => c.h)
    const hueSpread = Math.max(...hues) - Math.min(...hues)
    
    if (hueSpread < 30) return 'monochromatic'
    if (hueSpread < 60) return 'analogous'
    if (hueSpread > 150) return 'complementary'
    
    return 'triadic'
  }

  /**
   * Convert OKLCH back to RGB for display
   */
  oklchToRGB(color: OKLCHColor): { r: number; g: number; b: number } {
    // Convert OKLCH to OKLab
    const a = color.c * Math.cos(color.h * Math.PI / 180)
    const b_lab = color.c * Math.sin(color.h * Math.PI / 180)
    
    // Convert OKLab to Linear RGB
    const l_ = color.l + 0.3963377774 * a + 0.2158037573 * b_lab
    const m_ = color.l - 0.1055613458 * a - 0.0638541728 * b_lab
    const s_ = color.l - 0.0894841775 * a - 1.2914855480 * b_lab
    
    const l = l_ * l_ * l_
    const m = m_ * m_ * m_
    const s = s_ * s_ * s_
    
    const linearR = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    const linearG = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    const linearB = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    
    // Convert Linear RGB to sRGB
    const r = this.linearToSRGB(linearR)
    const g = this.linearToSRGB(linearG)
    const b = this.linearToSRGB(linearB)
    
    return {
      r: Math.max(0, Math.min(1, r)),
      g: Math.max(0, Math.min(1, g)),
      b: Math.max(0, Math.min(1, b))
    }
  }

  private linearToSRGB(value: number): number {
    return value <= 0.0031308 ? 12.92 * value : 1.055 * Math.pow(value, 1 / 2.4) - 0.055
  }

  /**
   * Generate semantic color names
   */
  getColorName(color: OKLCHColor): string {
    const { h, l, c } = color
    
    // Base hue names
    let baseName = ''
    if (h < 30 || h >= 330) baseName = 'red'
    else if (h < 60) baseName = 'orange'
    else if (h < 90) baseName = 'yellow'
    else if (h < 150) baseName = 'green'
    else if (h < 210) baseName = 'cyan'
    else if (h < 270) baseName = 'blue'
    else if (h < 330) baseName = 'purple'
    
    // Add modifiers based on lightness and chroma
    const modifiers: string[] = []
    
    if (l > 0.8) modifiers.push('light')
    else if (l < 0.3) modifiers.push('dark')
    
    if (c > 0.2) modifiers.push('vivid')
    else if (c < 0.05) modifiers.push('muted')
    
    if (l < 0.2 && c < 0.05) return 'black'
    if (l > 0.9 && c < 0.05) return 'white'
    if (c < 0.02) return 'gray'
    
    return modifiers.length > 0 ? `${modifiers.join(' ')} ${baseName}` : baseName
  }

  /**
   * Search artworks by color palette
   */
  async searchByPalette(
    targetPalette: OKLCHColor[],
    tolerance: number = 0.3,
    limit: number = 20
  ): Promise<ColorMatch[]> {
    try {
      const { data: artworks } = await supabase
        .from('artworks')
        .select(`
          id, title, oklch_palette, primary_image_url,
          price, medium, genre, user_id
        `)
        .eq('status', 'available')
        .not('oklch_palette', 'is', null)
        .limit(100)
      
      if (!artworks) return []
      
      const matches: ColorMatch[] = []
      
      for (const artwork of artworks) {
        const artworkPalette = artwork.oklch_palette as ColorPalette
        if (!artworkPalette?.dominant) continue
        
        let bestMatch = 0
        const reasons: string[] = []
        
        // Find best color matches
        for (const targetColor of targetPalette) {
          for (const artworkColor of artworkPalette.dominant) {
            const distance = this.calculateColorDistance(targetColor, artworkColor)
            const similarity = Math.max(0, 1 - distance / tolerance)
            
            if (similarity > bestMatch) {
              bestMatch = similarity
              const colorName = this.getColorName(artworkColor)
              reasons.push(`Contains ${colorName} that matches your palette`)
            }
          }
        }
        
        if (bestMatch > 0.3) {
          matches.push({
            artworkId: artwork.id,
            compatibilityScore: bestMatch,
            colorHarmony: artworkPalette.harmony,
            reasons,
            complementaryColors: this.generateComplementaryPalette(artworkPalette.dominant)
          })
        }
      }
      
      return matches
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, limit)
      
    } catch (error) {
      console.error('Error searching by palette:', error)
      return []
    }
  }
}

export const colorIntelligence = new ColorIntelligenceService()