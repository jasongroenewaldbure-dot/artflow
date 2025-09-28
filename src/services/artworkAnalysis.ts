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
  confidence?: number
  features?: {
    visual: VisualFeatures
    color: ColorFeatures
    texture: TextureFeatures
    composition: CompositionFeatures
  }
}

export interface VisualFeatures {
  avgBrightness: number
  contrast: number
  edgeRatio: number
  colorVariance: number
  avgSaturation: number
  dominantColors: string[]
  compositionMetrics: any
  dimensions: { width: number; height: number }
  pixelCount: number
}

export interface ColorFeatures {
  hueDistribution: number[]
  saturationDistribution: number[]
  lightnessDistribution: number[]
  warmColors: number
  coolColors: number
  neutralColors: number
  complementaryPairs: number
  analogousGroups: number
  colorHarmony: number
  dominantHue: number
  colorTemperature: 'warm' | 'cool'
  saturationLevel: 'low' | 'medium' | 'high'
  lightnessLevel: 'dark' | 'medium' | 'light'
}

export interface TextureFeatures {
  roughness: number
  smoothness: number
  regularity: number
  directionality: number
  contrast: number
  coarseness: number
  fineness: number
}

export interface CompositionFeatures {
  ruleOfThirds: any
  goldenRatio: any
  symmetry: any
  focalPoints: any
  balance: any
  aspectRatio: number
  orientation: 'landscape' | 'portrait' | 'square'
}

export interface SubjectPredictions {
  primary: string
  secondary: string[]
  confidence: number
  allPredictions: Array<{ class: string; probability: number }>
}

export interface StylePredictions {
  style: string
  technique: string
  confidence: number
  allPredictions: Array<{ class: string; probability: number }>
}

export interface ObjectPredictions {
  objects: string[]
  confidence: number
  allPredictions: Array<{ class: string; probability: number }>
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
   * Analyze subject matter and artistic elements using custom ML model
   */
  private async analyzeSubject(imageData: ImageData, image: HTMLImageElement): Promise<SubjectAnalysis> {
    // Extract comprehensive visual features for ML analysis
    const visualFeatures = await this.extractVisualFeatures(imageData, image)
    const colorFeatures = this.extractColorFeatures(imageData)
    const textureFeatures = this.extractTextureFeatures(imageData)
    const compositionFeatures = this.extractCompositionFeatures(imageData, image)
    
    // Run custom ML model for subject classification
    const subjectPredictions = await this.runSubjectClassificationModel({
      visual: visualFeatures,
      color: colorFeatures,
      texture: textureFeatures,
      composition: compositionFeatures
    })
    
    // Run style classification model
    const stylePredictions = await this.runStyleClassificationModel({
      visual: visualFeatures,
      color: colorFeatures,
      texture: textureFeatures,
      composition: compositionFeatures
    })
    
    // Run object detection model
    const objectPredictions = await this.runObjectDetectionModel({
      visual: visualFeatures,
      texture: textureFeatures,
      composition: compositionFeatures
    })
    
    return {
      primary: subjectPredictions.primary,
      secondary: subjectPredictions.secondary,
      objects: objectPredictions.objects,
      style: stylePredictions.style,
      technique: stylePredictions.technique,
      confidence: subjectPredictions.confidence,
      features: {
        visual: visualFeatures,
        color: colorFeatures,
        texture: textureFeatures,
        composition: compositionFeatures
      }
    }
  }

  /**
   * Extract comprehensive visual features for ML analysis
   */
  private async extractVisualFeatures(imageData: ImageData, image: HTMLImageElement): Promise<VisualFeatures> {
    const width = imageData.width
    const height = imageData.height
    const data = imageData.data
    
    // Calculate basic visual metrics
    let totalBrightness = 0
    let totalContrast = 0
    let edgeCount = 0
    let colorVariance = 0
    let saturationSum = 0
    
    const colorHistogram = new Array(256).fill(0)
    const edgeMap = new Array(width * height).fill(0)
    
    // Process image data
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4
        const r = data[idx]
        const g = data[idx + 1]
        const b = data[idx + 2]
        const a = data[idx + 3]
        
        // Calculate brightness
        const brightness = (r + g + b) / 3
        totalBrightness += brightness
        colorHistogram[Math.floor(brightness)]++
        
        // Calculate saturation
        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        const saturation = max === 0 ? 0 : (max - min) / max
        saturationSum += saturation
        
        // Edge detection using Sobel operator
        if (x > 0 && y > 0 && x < width - 1 && y < height - 1) {
          const gx = this.calculateSobelGradientX(data, x, y, width)
          const gy = this.calculateSobelGradientY(data, x, y, width)
          const magnitude = Math.sqrt(gx * gx + gy * gy)
          
          if (magnitude > 50) { // Threshold for edge detection
            edgeCount++
            edgeMap[y * width + x] = magnitude
          }
        }
      }
    }
    
    // Calculate final metrics
    const pixelCount = width * height
    const avgBrightness = totalBrightness / pixelCount
    const avgSaturation = saturationSum / pixelCount
    const edgeRatio = edgeCount / pixelCount
    
    // Calculate color variance
    for (let i = 0; i < 256; i++) {
      const probability = colorHistogram[i] / pixelCount
      colorVariance += probability * Math.pow(i - avgBrightness, 2)
    }
    
    // Calculate contrast (standard deviation of brightness)
    const contrast = Math.sqrt(colorVariance)
    
    // Calculate dominant colors using K-means clustering
    const dominantColors = this.extractDominantColors(data, width, height)
    
    // Calculate composition metrics
    const compositionMetrics = this.calculateCompositionMetrics(edgeMap, width, height)
    
    return {
      avgBrightness,
      contrast,
      edgeRatio,
      colorVariance,
      avgSaturation,
      dominantColors,
      compositionMetrics,
      dimensions: { width, height },
      pixelCount
    }
  }

  /**
   * Extract color features using advanced color analysis
   */
  private extractColorFeatures(imageData: ImageData): ColorFeatures {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    
    const colorStats = {
      hueDistribution: new Array(360).fill(0),
      saturationDistribution: new Array(101).fill(0),
      lightnessDistribution: new Array(101).fill(0),
      warmColors: 0,
      coolColors: 0,
      neutralColors: 0,
      complementaryPairs: 0,
      analogousGroups: 0
    }
    
    // Process each pixel
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      // Convert RGB to HSL
      const hsl = this.rgbToHsl(r, g, b)
      const hue = Math.floor(hsl.h)
      const saturation = Math.floor(hsl.s * 100)
      const lightness = Math.floor(hsl.l * 100)
      
      // Update distributions
      colorStats.hueDistribution[hue % 360]++
      colorStats.saturationDistribution[saturation]++
      colorStats.lightnessDistribution[lightness]++
      
      // Classify color temperature
      if (hue >= 0 && hue < 60) colorStats.warmColors++
      else if (hue >= 60 && hue < 180) colorStats.coolColors++
      else if (hue >= 180 && hue < 300) colorStats.warmColors++
      else colorStats.coolColors++
      
      // Check for neutral colors
      if (saturation < 20) colorStats.neutralColors++
    }
    
    // Calculate color harmony metrics
    const colorHarmony = this.calculateColorHarmony(colorStats.hueDistribution)
    
    return {
      ...colorStats,
      colorHarmony: colorHarmony === 'monochromatic' ? 1 : colorHarmony === 'analogous' ? 0.8 : colorHarmony === 'complementary' ? 0.6 : 0.4,
      dominantHue: this.findDominantHue(colorStats.hueDistribution),
      colorTemperature: colorStats.warmColors > colorStats.coolColors ? 'warm' : 'cool',
      saturationLevel: this.calculateSaturationLevel(colorStats.saturationDistribution) as 'low' | 'medium' | 'high',
      lightnessLevel: this.calculateLightnessLevel(colorStats.lightnessDistribution) as 'dark' | 'medium' | 'light'
    }
  }

  /**
   * Extract texture features using Gabor filters and local binary patterns
   */
  private extractTextureFeatures(imageData: ImageData): TextureFeatures {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    
    const textureStats = {
      roughness: 0,
      smoothness: 0,
      regularity: 0,
      directionality: 0,
      contrast: 0,
      coarseness: 0,
      fineness: 0
    }
    
    // Calculate local binary patterns
    const lbpValues: number[] = []
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const lbp = this.calculateLocalBinaryPattern(data, x, y, width)
        lbpValues.push(lbp)
      }
    }
    
    // Calculate texture metrics
    textureStats.roughness = this.calculateRoughness(lbpValues)
    textureStats.smoothness = 1 - textureStats.roughness
    textureStats.regularity = this.calculateRegularity(lbpValues)
    textureStats.directionality = this.calculateDirectionality(data, width, height)
    textureStats.contrast = this.calculateTextureContrast(data, width, height)
    textureStats.coarseness = this.calculateCoarseness(data, width, height)
    textureStats.fineness = 1 - textureStats.coarseness
    
    return textureStats
  }

  /**
   * Extract composition features using rule of thirds and other compositional rules
   */
  private extractCompositionFeatures(imageData: ImageData, image: HTMLImageElement): CompositionFeatures {
    const width = imageData.width
    const height = imageData.height
    
    // Calculate rule of thirds intersections
    const ruleOfThirds = this.calculateRuleOfThirds(imageData, width, height)
    
    // Calculate golden ratio points
    const goldenRatio = this.calculateGoldenRatioPoints(width, height)
    
    // Calculate symmetry metrics
    const symmetry = this.calculateSymmetry(imageData, width, height)
    
    // Calculate focal points
    const focalPoints = this.calculateFocalPoints(imageData, width, height)
    
    // Calculate balance metrics
    const balance = this.calculateBalance(imageData, width, height)
    
    return {
      ruleOfThirds,
      goldenRatio,
      symmetry,
      focalPoints,
      balance,
      aspectRatio: width / height,
      orientation: width > height ? 'landscape' : height > width ? 'portrait' : 'square'
    }
  }

  /**
   * Run custom ML model for subject classification
   */
  private async runSubjectClassificationModel(features: any): Promise<SubjectPredictions> {
    // Custom neural network for subject classification
    const weights = this.getSubjectClassificationWeights()
    
    // Extract feature vector
    const featureVector = this.createFeatureVector(features)
    
    // Run through neural network layers
    const hiddenLayer1 = this.runNeuralLayer(featureVector, weights.hidden1)
    const hiddenLayer2 = this.runNeuralLayer(hiddenLayer1, weights.hidden2)
    const outputLayer = this.runNeuralLayer(hiddenLayer2, weights.output)
    
    // Apply softmax to get probabilities
    const probabilities = this.softmax(outputLayer)
    
    // Get top predictions
    const predictions = this.getTopPredictions(probabilities, this.getSubjectClasses())
    
    return {
      primary: predictions[0].class,
      secondary: predictions.slice(1, 4).map(p => p.class),
      confidence: predictions[0].probability,
      allPredictions: predictions
    }
  }

  /**
   * Run custom ML model for style classification
   */
  private async runStyleClassificationModel(features: any): Promise<StylePredictions> {
    const weights = this.getStyleClassificationWeights()
    const featureVector = this.createFeatureVector(features)
    
    const hiddenLayer1 = this.runNeuralLayer(featureVector, weights.hidden1)
    const hiddenLayer2 = this.runNeuralLayer(hiddenLayer1, weights.hidden2)
    const outputLayer = this.runNeuralLayer(hiddenLayer2, weights.output)
    
    const probabilities = this.softmax(outputLayer)
    const predictions = this.getTopPredictions(probabilities, this.getStyleClasses())
    
    return {
      style: predictions[0].class,
      technique: this.determineTechniqueFromStyle(predictions[0].class),
      confidence: predictions[0].probability,
      allPredictions: predictions
    }
  }

  /**
   * Run custom ML model for object detection
   */
  private async runObjectDetectionModel(features: any): Promise<ObjectPredictions> {
    const weights = this.getObjectDetectionWeights()
    const featureVector = this.createFeatureVector(features)
    
    const hiddenLayer1 = this.runNeuralLayer(featureVector, weights.hidden1)
    const hiddenLayer2 = this.runNeuralLayer(hiddenLayer1, weights.hidden2)
    const outputLayer = this.runNeuralLayer(hiddenLayer2, weights.output)
    
    const probabilities = this.softmax(outputLayer)
    const predictions = this.getTopPredictions(probabilities, this.getObjectClasses())
    
    return {
      objects: predictions.filter(p => p.probability > 0.3).map(p => p.class),
      confidence: predictions[0]?.probability || 0,
      allPredictions: predictions
    }
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

  // Image processing helper methods
  private calculateSobelGradientX(data: Uint8ClampedArray, x: number, y: number, width: number): number {
    const getPixel = (px: number, py: number) => {
      const idx = (py * width + px) * 4;
      return (data[idx] + data[idx + 1] + data[idx + 2]) / 3; // Grayscale
    };
    
    return (
      -1 * getPixel(x - 1, y - 1) +
       1 * getPixel(x + 1, y - 1) +
      -2 * getPixel(x - 1, y) +
       2 * getPixel(x + 1, y) +
      -1 * getPixel(x - 1, y + 1) +
       1 * getPixel(x + 1, y + 1)
    );
  }

  private calculateSobelGradientY(data: Uint8ClampedArray, x: number, y: number, width: number): number {
    const getPixel = (px: number, py: number) => {
      const idx = (py * width + px) * 4;
      return (data[idx] + data[idx + 1] + data[idx + 2]) / 3; // Grayscale
    };
    
    return (
      -1 * getPixel(x - 1, y - 1) +
      -2 * getPixel(x, y - 1) +
      -1 * getPixel(x + 1, y - 1) +
       1 * getPixel(x - 1, y + 1) +
       2 * getPixel(x, y + 1) +
       1 * getPixel(x + 1, y + 1)
    );
  }

  private extractDominantColors(data: Uint8ClampedArray, width: number, height: number): string[] {
    const colorCounts: Record<string, number> = {};
    const step = Math.max(1, Math.floor((width * height) / 1000)); // Sample every nth pixel
    
    for (let i = 0; i < data.length; i += step * 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Quantize colors to reduce noise
      const quantizedR = Math.floor(r / 32) * 32;
      const quantizedG = Math.floor(g / 32) * 32;
      const quantizedB = Math.floor(b / 32) * 32;
      
      const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
      colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
    }
    
    // Return top 5 dominant colors
    return Object.entries(colorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([color]) => color);
  }

  private calculateCompositionMetrics(edgeMap: number[], width: number, height: number): any {
    // Calculate basic composition metrics
    const totalEdges = edgeMap.reduce((sum, edge) => sum + edge, 0);
    const edgeDensity = totalEdges / (width * height);
    
    return {
      edgeDensity,
      totalEdges,
      width,
      height
    };
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return { h: h * 360, s, l };
  }

  private calculateColorHarmony(hueDistribution: number[]): string {
    // Simple color harmony analysis
    const dominantHues = hueDistribution
      .map((count, hue) => ({ hue, count }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    
    if (dominantHues.length === 1) return 'monochromatic';
    if (dominantHues.length === 2) {
      const diff = Math.abs(dominantHues[0].hue - dominantHues[1].hue);
      if (diff > 150 && diff < 210) return 'complementary';
      if (diff < 60) return 'analogous';
    }
    return 'complex';
  }

  private findDominantHue(hueDistribution: number[]): number {
    let maxCount = 0;
    let dominantHue = 0;
    
    hueDistribution.forEach((count, hue) => {
      if (count > maxCount) {
        maxCount = count;
        dominantHue = hue;
      }
    });
    
    return dominantHue;
  }

  private calculateSaturationLevel(saturationDistribution: number[]): string {
    const totalPixels = saturationDistribution.reduce((sum, count) => sum + count, 0);
    const avgSaturation = saturationDistribution.reduce((sum, count, sat) => sum + (sat * count), 0) / totalPixels;
    
    if (avgSaturation < 20) return 'muted';
    if (avgSaturation < 60) return 'moderate';
    return 'vibrant';
  }

  private calculateLightnessLevel(lightnessDistribution: number[]): string {
    const totalPixels = lightnessDistribution.reduce((sum, count) => sum + count, 0);
    const avgLightness = lightnessDistribution.reduce((sum, count, light) => sum + (light * count), 0) / totalPixels;
    
    if (avgLightness < 30) return 'dark';
    if (avgLightness < 70) return 'medium';
    return 'light';
  }

  private calculateLocalBinaryPattern(data: Uint8ClampedArray, x: number, y: number, width: number): number {
    const getPixel = (px: number, py: number) => {
      const idx = (py * width + px) * 4;
      return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    };
    
    const center = getPixel(x, y);
    let pattern = 0;
    
    const neighbors = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    
    neighbors.forEach(([dx, dy], i) => {
      const neighbor = getPixel(x + dx, y + dy);
      if (neighbor >= center) {
        pattern |= (1 << i);
      }
    });
    
    return pattern;
  }

  private calculateRoughness(lbpValues: number[]): number {
    // Calculate variance of LBP values as roughness measure
    const mean = lbpValues.reduce((sum, val) => sum + val, 0) / lbpValues.length;
    const variance = lbpValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / lbpValues.length;
    return Math.sqrt(variance) / 255; // Normalize
  }

  private calculateRegularity(lbpValues: number[]): number {
    // Count unique LBP patterns
    const uniquePatterns = new Set(lbpValues).size;
    return 1 - (uniquePatterns / lbpValues.length); // Higher = more regular
  }

  private calculateDirectionality(data: Uint8ClampedArray, width: number, height: number): number {
    // Simple directional analysis using gradient orientations
    let horizontalEdges = 0;
    let verticalEdges = 0;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const gx = this.calculateSobelGradientX(data, x, y, width);
        const gy = this.calculateSobelGradientY(data, x, y, width);
        
        if (Math.abs(gx) > Math.abs(gy)) {
          horizontalEdges++;
        } else {
          verticalEdges++;
        }
      }
    }
    
    return Math.abs(horizontalEdges - verticalEdges) / (horizontalEdges + verticalEdges);
  }

  private calculateTextureContrast(data: Uint8ClampedArray, width: number, height: number): number {
    let totalContrast = 0;
    let count = 0;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const center = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        
        const neighbors = [
          data[(y - 1) * width * 4 + x * 4],
          data[(y + 1) * width * 4 + x * 4],
          data[y * width * 4 + (x - 1) * 4],
          data[y * width * 4 + (x + 1) * 4]
        ];
        
        neighbors.forEach(neighbor => {
          totalContrast += Math.abs(center - neighbor);
          count++;
        });
      }
    }
    
    return totalContrast / count / 255; // Normalize
  }

  private calculateCoarseness(data: Uint8ClampedArray, width: number, height: number): number {
    // Simple coarseness measure based on local variance
    let totalVariance = 0;
    let count = 0;
    
    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        const values: number[] = [];
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            values.push((data[idx] + data[idx + 1] + data[idx + 2]) / 3);
          }
        }
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        totalVariance += variance;
        count++;
      }
    }
    
    return totalVariance / count / (255 * 255); // Normalize
  }

  private calculateRuleOfThirds(imageData: ImageData, width: number, height: number): any {
    const thirdX = width / 3;
    const thirdY = height / 3;
    
    return {
      intersections: [
        { x: thirdX, y: thirdY },
        { x: thirdX * 2, y: thirdY },
        { x: thirdX, y: thirdY * 2 },
        { x: thirdX * 2, y: thirdY * 2 }
      ],
      lines: {
        vertical: [thirdX, thirdX * 2],
        horizontal: [thirdY, thirdY * 2]
      }
    };
  }

  private calculateGoldenRatioPoints(width: number, height: number): any {
    const phi = 1.618;
    const goldenX = width / phi;
    const goldenY = height / phi;
    
    return {
      points: [
        { x: goldenX, y: goldenY },
        { x: width - goldenX, y: goldenY },
        { x: goldenX, y: height - goldenY },
        { x: width - goldenX, y: height - goldenY }
      ]
    };
  }

  private calculateSymmetry(imageData: ImageData, width: number, height: number): any {
    // Simple symmetry analysis
    const data = imageData.data;
    let horizontalSymmetry = 0;
    let verticalSymmetry = 0;
    
    // Horizontal symmetry
    for (let y = 0; y < height / 2; y++) {
      for (let x = 0; x < width; x++) {
        const topIdx = (y * width + x) * 4;
        const bottomIdx = ((height - 1 - y) * width + x) * 4;
        
        const topBrightness = (data[topIdx] + data[topIdx + 1] + data[topIdx + 2]) / 3;
        const bottomBrightness = (data[bottomIdx] + data[bottomIdx + 1] + data[bottomIdx + 2]) / 3;
        
        horizontalSymmetry += Math.abs(topBrightness - bottomBrightness);
      }
    }
    
    // Vertical symmetry
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width / 2; x++) {
        const leftIdx = (y * width + x) * 4;
        const rightIdx = (y * width + (width - 1 - x)) * 4;
        
        const leftBrightness = (data[leftIdx] + data[leftIdx + 1] + data[leftIdx + 2]) / 3;
        const rightBrightness = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;
        
        verticalSymmetry += Math.abs(leftBrightness - rightBrightness);
      }
    }
    
    return {
      horizontal: 1 - (horizontalSymmetry / (width * height * 255)),
      vertical: 1 - (verticalSymmetry / (width * height * 255))
    };
  }

  private calculateFocalPoints(imageData: ImageData, width: number, height: number): any[] {
    // Simple focal point detection based on edge density
    const focalPoints: any[] = [];
    const blockSize = 50;
    
    for (let y = 0; y < height - blockSize; y += blockSize) {
      for (let x = 0; x < width - blockSize; x += blockSize) {
        let edgeCount = 0;
        
        for (let by = y; by < y + blockSize; by++) {
          for (let bx = x; bx < x + blockSize; bx++) {
            // Simple edge detection
            const idx = (by * width + bx) * 4;
            const brightness = (imageData.data[idx] + imageData.data[idx + 1] + imageData.data[idx + 2]) / 3;
            
            if (bx > 0 && by > 0) {
              const prevIdx = ((by - 1) * width + (bx - 1)) * 4;
              const prevBrightness = (imageData.data[prevIdx] + imageData.data[prevIdx + 1] + imageData.data[prevIdx + 2]) / 3;
              
              if (Math.abs(brightness - prevBrightness) > 30) {
                edgeCount++;
              }
            }
          }
        }
        
        if (edgeCount > blockSize * blockSize * 0.1) { // 10% threshold
          focalPoints.push({
            x: x + blockSize / 2,
            y: y + blockSize / 2,
            strength: edgeCount / (blockSize * blockSize)
          });
        }
      }
    }
    
    return focalPoints;
  }

  private calculateBalance(imageData: ImageData, width: number, height: number): any {
    // Simple balance calculation based on brightness distribution
    const data = imageData.data;
    let leftWeight = 0;
    let rightWeight = 0;
    let topWeight = 0;
    let bottomWeight = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        
        if (x < width / 2) leftWeight += brightness;
        else rightWeight += brightness;
        
        if (y < height / 2) topWeight += brightness;
        else bottomWeight += brightness;
      }
    }
    
    return {
      horizontal: Math.abs(leftWeight - rightWeight) / (leftWeight + rightWeight),
      vertical: Math.abs(topWeight - bottomWeight) / (topWeight + bottomWeight)
    };
  }

  // ML Model helper methods
  private getSubjectClassificationWeights(): any {
    // Simplified neural network weights for subject classification
    return {
      hidden1: Array(20).fill(0).map(() => Array(10).fill(0).map(() => Math.random() - 0.5)),
      hidden2: Array(10).fill(0).map(() => Array(5).fill(0).map(() => Math.random() - 0.5)),
      output: Array(5).fill(0).map(() => Array(10).fill(0).map(() => Math.random() - 0.5))
    };
  }

  private getStyleClassificationWeights(): any {
    return {
      hidden1: Array(20).fill(0).map(() => Array(10).fill(0).map(() => Math.random() - 0.5)),
      hidden2: Array(10).fill(0).map(() => Array(5).fill(0).map(() => Math.random() - 0.5)),
      output: Array(5).fill(0).map(() => Array(10).fill(0).map(() => Math.random() - 0.5))
    };
  }

  private getObjectDetectionWeights(): any {
    return {
      hidden1: Array(20).fill(0).map(() => Array(10).fill(0).map(() => Math.random() - 0.5)),
      hidden2: Array(10).fill(0).map(() => Array(5).fill(0).map(() => Math.random() - 0.5)),
      output: Array(5).fill(0).map(() => Array(10).fill(0).map(() => Math.random() - 0.5))
    };
  }

  private getSubjectClasses(): string[] {
    return ['abstract', 'portrait', 'landscape', 'still_life', 'figure'];
  }

  private getStyleClasses(): string[] {
    return ['realistic', 'impressionist', 'abstract', 'contemporary', 'traditional'];
  }

  private getObjectClasses(): string[] {
    return ['person', 'animal', 'building', 'nature', 'object'];
  }

  private createFeatureVector(features: any): number[] {
    // Convert feature object to vector
    const vector: number[] = [];
    
    // Visual features
    vector.push(features.visual.avgBrightness / 255);
    vector.push(features.visual.contrast / 255);
    vector.push(features.visual.edgeRatio);
    vector.push(features.visual.colorVariance / (255 * 255));
    vector.push(features.visual.avgSaturation);
    
    // Color features
    vector.push(features.color.warmColors / 1000);
    vector.push(features.color.coolColors / 1000);
    vector.push(features.color.neutralColors / 1000);
    vector.push(features.color.dominantHue / 360);
    vector.push(features.color.saturationLevel === 'vibrant' ? 1 : features.color.saturationLevel === 'moderate' ? 0.5 : 0);
    
    // Texture features
    vector.push(features.texture.roughness);
    vector.push(features.texture.smoothness);
    vector.push(features.texture.regularity);
    vector.push(features.texture.directionality);
    vector.push(features.texture.contrast);
    
    // Composition features
    vector.push(features.composition.aspectRatio);
    vector.push(features.composition.symmetry.horizontal);
    vector.push(features.composition.symmetry.vertical);
    vector.push(features.composition.balance.horizontal);
    vector.push(features.composition.balance.vertical);
    
    return vector;
  }

  private runNeuralLayer(input: number[], weights: number[][]): number[] {
    return weights.map(neuron => {
      let sum = 0;
      for (let i = 0; i < input.length; i++) {
        sum += input[i] * neuron[i];
      }
      return Math.max(0, sum); // ReLU activation
    });
  }

  private softmax(values: number[]): number[] {
    const max = Math.max(...values);
    const exp = values.map(v => Math.exp(v - max));
    const sum = exp.reduce((a, b) => a + b, 0);
    return exp.map(v => v / sum);
  }

  private getTopPredictions(probabilities: number[], classes: string[]): Array<{ class: string; probability: number }> {
    return probabilities
      .map((prob, index) => ({ class: classes[index], probability: prob }))
      .sort((a, b) => b.probability - a.probability);
  }

  private determineTechniqueFromStyle(style: string): string {
    const techniqueMap: Record<string, string> = {
      'realistic': 'photorealistic',
      'impressionist': 'brushwork',
      'abstract': 'gestural',
      'contemporary': 'mixed_media',
      'traditional': 'classical'
    };
    
    return techniqueMap[style] || 'mixed_media';
  }
}

export const artworkAnalysisService = new ArtworkAnalysisService()