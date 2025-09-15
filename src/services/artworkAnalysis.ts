import { supabase } from '../lib/supabase'

export interface ColorAnalysis {
  dominant: string
  palette: string[]
  mood: 'warm' | 'cool' | 'neutral' | 'vibrant' | 'muted'
  complementary: string
  analogous: string[]
}

export interface GenreAnalysis {
  primary: string
  secondary: string[]
  confidence: number
  keywords: string[]
}

export interface OrientationAnalysis {
  type: 'landscape' | 'portrait' | 'square'
  aspectRatio: number
  recommendedCrop: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface SubjectAnalysis {
  primary: string
  secondary: string[]
  objects: string[]
  style: string
  technique: string
}

export interface ArtworkAnalysis {
  colors: ColorAnalysis
  genre: GenreAnalysis
  orientation: OrientationAnalysis
  subject: SubjectAnalysis
  metadata: {
    dimensions: { width: number; height: number }
    fileSize: number
    format: string
    createdAt: Date
  }
}

class ArtworkAnalysisService {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null

  constructor() {
    this.initializeCanvas()
  }

  private initializeCanvas() {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
  }

  /**
   * Analyze an artwork image and extract comprehensive metadata
   */
  async analyzeArtwork(imageFile: File): Promise<ArtworkAnalysis> {
    const image = await this.loadImage(imageFile)
    const imageData = this.getImageData(image)
    
    const colors = await this.analyzeColors(imageData)
    const genre = await this.analyzeGenre(imageData, image)
    const orientation = this.analyzeOrientation(image)
    const subject = await this.analyzeSubject(imageData, image)

    return {
      colors,
      genre,
      orientation,
      subject,
      metadata: {
        dimensions: { width: image.width, height: image.height },
        fileSize: imageFile.size,
        format: imageFile.type,
        createdAt: new Date()
      }
    }
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  private getImageData(image: HTMLImageElement): ImageData {
    if (!this.canvas || !this.ctx) {
      throw new Error('Canvas not initialized')
    }

    this.canvas.width = image.width
    this.canvas.height = image.height
    this.ctx.drawImage(image, 0, 0)
    
    return this.ctx.getImageData(0, 0, image.width, image.height)
  }

  /**
   * Analyze dominant colors and create a color palette
   */
  private async analyzeColors(imageData: ImageData): Promise<ColorAnalysis> {
    const colors = this.extractColors(imageData)
    const dominant = this.findDominantColor(colors)
    const palette = this.createColorPalette(colors)
    const mood = this.determineColorMood(palette)
    const complementary = this.findComplementaryColor(dominant)
    const analogous = this.findAnalogousColors(dominant)

    return {
      dominant,
      palette,
      mood,
      complementary,
      analogous
    }
  }

  private extractColors(imageData: ImageData): string[] {
    const data = imageData.data
    const colors: string[] = []
    
    // Sample every 10th pixel for performance
    for (let i = 0; i < data.length; i += 40) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]
      
      if (a > 128) { // Only include non-transparent pixels
        colors.push(`rgb(${r}, ${g}, ${b})`)
      }
    }
    
    return colors
  }

  private findDominantColor(colors: string[]): string {
    const colorCounts: { [key: string]: number } = {}
    
    colors.forEach(color => {
      colorCounts[color] = (colorCounts[color] || 0) + 1
    })
    
    return Object.keys(colorCounts).reduce((a, b) => 
      colorCounts[a] > colorCounts[b] ? a : b
    )
  }

  private createColorPalette(colors: string[]): string[] {
    // Group similar colors and return the most distinct ones
    const uniqueColors = [...new Set(colors)]
    return uniqueColors.slice(0, 8) // Return top 8 colors
  }

  private determineColorMood(palette: string[]): ColorAnalysis['mood'] {
    let warmCount = 0
    let coolCount = 0
    let vibrantCount = 0
    let mutedCount = 0

    palette.forEach(color => {
      const rgb = this.hexToRgb(color)
      if (rgb) {
        const { r, g, b } = rgb
        const brightness = (r + g + b) / 3
        const saturation = Math.max(r, g, b) - Math.min(r, g, b)
        
        if (r > g && r > b) warmCount++
        if (b > r && b > g) coolCount++
        if (brightness > 180 && saturation > 100) vibrantCount++
        if (brightness < 120 || saturation < 50) mutedCount++
      }
    })

    if (vibrantCount > palette.length / 2) return 'vibrant'
    if (mutedCount > palette.length / 2) return 'muted'
    if (warmCount > coolCount) return 'warm'
    if (coolCount > warmCount) return 'cool'
    return 'neutral'
  }

  private findComplementaryColor(color: string): string {
    const rgb = this.hexToRgb(color)
    if (!rgb) return color
    
    const { r, g, b } = rgb
    return `rgb(${255 - r}, ${255 - g}, ${255 - b})`
  }

  private findAnalogousColors(color: string): string[] {
    const rgb = this.hexToRgb(color)
    if (!rgb) return []
    
    const { r, g, b } = rgb
    const hsv = this.rgbToHsv(r, g, b)
    
    return [
      this.hsvToRgb((hsv.h + 30) % 360, hsv.s, hsv.v),
      this.hsvToRgb((hsv.h - 30 + 360) % 360, hsv.s, hsv.v)
    ]
  }

  /**
   * Analyze artistic genre and style
   */
  private async analyzeGenre(imageData: ImageData, image: HTMLImageElement): Promise<GenreAnalysis> {
    // Analyze visual characteristics to determine genre
    const characteristics = this.analyzeVisualCharacteristics(imageData, image)
    
    // Use a simple rule-based approach for genre detection
    const genre = this.determineGenreFromCharacteristics(characteristics)
    
    return {
      primary: genre.primary,
      secondary: genre.secondary,
      confidence: genre.confidence,
      keywords: characteristics.keywords
    }
  }

  private analyzeVisualCharacteristics(imageData: ImageData, image: HTMLImageElement) {
    const data = imageData.data
    let edgeCount = 0
    let smoothCount = 0
    let colorVariation = 0
    let brightness = 0
    
    // Analyze edges and texture
    for (let y = 1; y < image.height - 1; y++) {
      for (let x = 1; x < image.width - 1; x++) {
        const idx = (y * image.width + x) * 4
        
        // Calculate gradient
        const gx = Math.abs(
          (data[idx + 4] || 0) - (data[idx - 4] || 0) +
          (data[idx + 5] || 0) - (data[idx - 3] || 0) +
          (data[idx + 6] || 0) - (data[idx - 2] || 0)
        )
        
        const gy = Math.abs(
          (data[idx + image.width * 4] || 0) - (data[idx - image.width * 4] || 0) +
          (data[idx + image.width * 4 + 1] || 0) - (data[idx - image.width * 4 + 1] || 0) +
          (data[idx + image.width * 4 + 2] || 0) - (data[idx - image.width * 4 + 2] || 0)
        )
        
        const gradient = Math.sqrt(gx * gx + gy * gy)
        
        if (gradient > 50) edgeCount++
        else smoothCount++
        
        brightness += (data[idx] + data[idx + 1] + data[idx + 2]) / 3
      }
    }
    
    const totalPixels = image.width * image.height
    const edgeRatio = edgeCount / totalPixels
    const avgBrightness = brightness / totalPixels
    
    return {
      edgeRatio,
      smoothRatio: smoothCount / totalPixels,
      avgBrightness,
      keywords: this.generateKeywords(edgeRatio, avgBrightness)
    }
  }

  private determineGenreFromCharacteristics(characteristics: any): { primary: string; secondary: string[]; confidence: number } {
    const { edgeRatio, avgBrightness } = characteristics
    
    if (edgeRatio > 0.3) {
      return {
        primary: 'Abstract',
        secondary: ['Contemporary', 'Modern'],
        confidence: 0.8
      }
    } else if (avgBrightness > 200) {
      return {
        primary: 'Impressionist',
        secondary: ['Landscape', 'Light'],
        confidence: 0.7
      }
    } else if (edgeRatio < 0.1) {
      return {
        primary: 'Minimalist',
        secondary: ['Contemporary', 'Clean'],
        confidence: 0.9
      }
    } else {
      return {
        primary: 'Contemporary',
        secondary: ['Mixed Media', 'Modern'],
        confidence: 0.6
      }
    }
  }

  private generateKeywords(edgeRatio: number, brightness: number): string[] {
    const keywords: string[] = []
    
    if (edgeRatio > 0.3) keywords.push('textured', 'dynamic', 'bold')
    if (edgeRatio < 0.1) keywords.push('smooth', 'minimal', 'clean')
    if (brightness > 200) keywords.push('bright', 'luminous', 'light')
    if (brightness < 100) keywords.push('dark', 'moody', 'dramatic')
    
    return keywords
  }

  /**
   * Analyze image orientation and recommend crop
   */
  private analyzeOrientation(image: HTMLImageElement): OrientationAnalysis {
    const aspectRatio = image.width / image.height
    let type: 'landscape' | 'portrait' | 'square'
    
    if (aspectRatio > 1.2) type = 'landscape'
    else if (aspectRatio < 0.8) type = 'portrait'
    else type = 'square'
    
    // Recommend crop for optimal display
    const recommendedCrop = this.calculateOptimalCrop(image.width, image.height, aspectRatio)
    
    return {
      type,
      aspectRatio,
      recommendedCrop
    }
  }

  private calculateOptimalCrop(width: number, height: number, aspectRatio: number) {
    // Calculate crop that maintains aspect ratio and focuses on center
    const targetRatio = 1.0 // Square crop for artwork display
    
    let cropWidth, cropHeight, x, y
    
    if (aspectRatio > targetRatio) {
      cropHeight = height
      cropWidth = height * targetRatio
      x = (width - cropWidth) / 2
      y = 0
    } else {
      cropWidth = width
      cropHeight = width / targetRatio
      x = 0
      y = (height - cropHeight) / 2
    }
    
    return { x, y, width: cropWidth, height: cropHeight }
  }

  /**
   * Analyze subject matter and artistic elements
   */
  private async analyzeSubject(imageData: ImageData, image: HTMLImageElement): Promise<SubjectAnalysis> {
    // This is a simplified analysis - in a real implementation, you'd use ML models
    const characteristics = this.analyzeVisualCharacteristics(imageData, image)
    
    return {
      primary: this.determinePrimarySubject(characteristics),
      secondary: this.determineSecondarySubjects(characteristics),
      objects: this.detectObjects(characteristics),
      style: this.determineArtisticStyle(characteristics),
      technique: this.determineTechnique(characteristics)
    }
  }

  private determinePrimarySubject(characteristics: any): string {
    if (characteristics.avgBrightness > 180) return 'Landscape'
    if (characteristics.edgeRatio > 0.4) return 'Abstract'
    if (characteristics.edgeRatio < 0.1) return 'Minimalist'
    return 'Contemporary'
  }

  private determineSecondarySubjects(characteristics: any): string[] {
    const subjects: string[] = []
    
    if (characteristics.avgBrightness > 150) subjects.push('Light', 'Color')
    if (characteristics.edgeRatio > 0.2) subjects.push('Texture', 'Form')
    if (characteristics.edgeRatio < 0.15) subjects.push('Space', 'Simplicity')
    
    return subjects
  }

  private detectObjects(characteristics: any): string[] {
    // Simplified object detection based on visual characteristics
    const objects: string[] = []
    
    if (characteristics.avgBrightness > 200) objects.push('Light Source')
    if (characteristics.edgeRatio > 0.3) objects.push('Geometric Shapes')
    if (characteristics.edgeRatio < 0.1) objects.push('Negative Space')
    
    return objects
  }

  private determineArtisticStyle(characteristics: any): string {
    if (characteristics.edgeRatio > 0.4) return 'Expressionist'
    if (characteristics.avgBrightness > 200) return 'Impressionist'
    if (characteristics.edgeRatio < 0.1) return 'Minimalist'
    return 'Contemporary'
  }

  private determineTechnique(characteristics: any): string {
    if (characteristics.edgeRatio > 0.3) return 'Mixed Media'
    if (characteristics.avgBrightness > 180) return 'Oil Painting'
    if (characteristics.edgeRatio < 0.15) return 'Digital Art'
    return 'Acrylic'
  }

  // Utility functions
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(hex)
    return result ? {
      r: parseInt(result[1]),
      g: parseInt(result[2]),
      b: parseInt(result[3])
    } : null
  }

  private rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
    r /= 255
    g /= 255
    b /= 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min
    
    let h = 0
    if (diff !== 0) {
      if (max === r) h = ((g - b) / diff) % 6
      else if (max === g) h = (b - r) / diff + 2
      else h = (r - g) / diff + 4
    }
    
    h = Math.round(h * 60)
    if (h < 0) h += 360
    
    const s = max === 0 ? 0 : diff / max
    const v = max
    
    return { h, s: Math.round(s * 100), v: Math.round(v * 100) }
  }

  private hsvToRgb(h: number, s: number, v: number): string {
    s /= 100
    v /= 100
    
    const c = v * s
    const x = c * (1 - Math.abs((h / 60) % 2 - 1))
    const m = v - c
    
    let r = 0, g = 0, b = 0
    
    if (0 <= h && h < 60) { r = c; g = x; b = 0 }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0 }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x }
    
    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)
    
    return `rgb(${r}, ${g}, ${b})`
  }

  /**
   * Save analysis results to database
   */
  async saveAnalysis(artworkId: string, analysis: ArtworkAnalysis): Promise<void> {
    try {
      const { error } = await supabase
        .from('artwork_analysis')
        .insert({
          artwork_id: artworkId,
          color_analysis: analysis.colors,
          genre_analysis: analysis.genre,
          orientation_analysis: analysis.orientation,
          subject_analysis: analysis.subject,
          metadata: analysis.metadata,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving artwork analysis:', error)
        throw error
      }
    } catch (error) {
      console.error('Failed to save artwork analysis:', error)
      throw error
    }
  }

  /**
   * Get analysis results for an artwork
   */
  async getAnalysis(artworkId: string): Promise<ArtworkAnalysis | null> {
    try {
      const { data, error } = await supabase
        .from('artwork_analysis')
        .select('*')
        .eq('artwork_id', artworkId)
        .single()

      if (error) {
        console.error('Error fetching artwork analysis:', error)
        return null
      }

      return {
        colors: data.color_analysis,
        genre: data.genre_analysis,
        orientation: data.orientation_analysis,
        subject: data.subject_analysis,
        metadata: data.metadata
      }
    } catch (error) {
      console.error('Failed to fetch artwork analysis:', error)
      return null
    }
  }
}

export const artworkAnalysisService = new ArtworkAnalysisService()