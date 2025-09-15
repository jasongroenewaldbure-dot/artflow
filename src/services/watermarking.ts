import { supabase } from '../lib/supabase'

export interface WatermarkOptions {
  text?: string
  logo?: string
  opacity?: number
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'
  size?: 'small' | 'medium' | 'large'
  color?: string
  font?: string
}

export interface WatermarkResult {
  watermarkedImageUrl: string
  originalImageUrl: string
  watermarkApplied: boolean
  metadata: {
    watermarkType: string
    position: string
    opacity: number
    size: string
  }
}

class WatermarkingService {
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
   * Apply watermark to an image
   */
  async applyWatermark(
    imageFile: File, 
    options: WatermarkOptions = {}
  ): Promise<WatermarkResult> {
    const image = await this.loadImage(imageFile)
    const watermarkedImage = await this.createWatermarkedImage(image, options)
    
    return {
      watermarkedImageUrl: watermarkedImage,
      originalImageUrl: URL.createObjectURL(imageFile),
      watermarkApplied: true,
      metadata: {
        watermarkType: options.text ? 'text' : 'logo',
        position: options.position || 'bottom-right',
        opacity: options.opacity || 0.7,
        size: options.size || 'medium'
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

  private async createWatermarkedImage(
    image: HTMLImageElement, 
    options: WatermarkOptions
  ): Promise<string> {
    if (!this.canvas || !this.ctx) {
      throw new Error('Canvas not initialized')
    }

    // Set canvas size to image size
    this.canvas.width = image.width
    this.canvas.height = image.height

    // Draw the original image
    this.ctx.drawImage(image, 0, 0)

    // Apply watermarks
    if (options.text) {
      await this.applyTextWatermark(options)
    } else if (options.logo) {
      await this.applyLogoWatermark(options)
    }
    
    // Always add Artflow logo watermark (bottom right)
    await this.addArtflowWatermark()
    
    // Add artist name watermark (bottom left) if text is provided
    if (options.text) {
      await this.addArtistWatermark(options.text)
    }

    // Convert to blob and return URL
    return new Promise((resolve, reject) => {
      this.canvas!.toBlob((blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob))
        } else {
          reject(new Error('Failed to create watermarked image'))
        }
      }, 'image/jpeg', 0.9)
    })
  }

  private async applyTextWatermark(options: WatermarkOptions) {
    if (!this.ctx || !options.text) return

    const { text, position = 'bottom-right', opacity = 0.7, size = 'medium', color = '#ffffff', font = 'Arial' } = options
    
    // Calculate font size based on image dimensions
    const fontSize = this.calculateFontSize(size)
    
    // Set font properties
    this.ctx.font = `bold ${fontSize}px ${font}`
    this.ctx.fillStyle = color
    this.ctx.globalAlpha = opacity
    
    // Calculate text position
    const textMetrics = this.ctx.measureText(text)
    const textWidth = textMetrics.width
    const textHeight = fontSize
    
    const positionCoords = this.calculateTextPosition(
      this.canvas!.width,
      this.canvas!.height,
      textWidth,
      textHeight,
      position
    )
    
    // Add text shadow for better visibility
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    this.ctx.shadowBlur = 2
    this.ctx.shadowOffsetX = 1
    this.ctx.shadowOffsetY = 1
    
    // Draw the text
    this.ctx.fillText(text, positionCoords.x, positionCoords.y)
    
    // Reset shadow
    this.ctx.shadowColor = 'transparent'
    this.ctx.shadowBlur = 0
    this.ctx.shadowOffsetX = 0
    this.ctx.shadowOffsetY = 0
    this.ctx.globalAlpha = 1
  }

  private async applyLogoWatermark(options: WatermarkOptions) {
    if (!this.ctx || !options.logo) return

    const { logo, position = 'bottom-right', opacity = 0.7, size = 'medium' } = options
    
    // Load logo image
    const logoImage = await this.loadImageFromUrl(logo)
    
    // Calculate logo size
    const logoSize = this.calculateLogoSize(logoImage, size)
    
    // Calculate logo position
    const positionCoords = this.calculateLogoPosition(
      this.canvas!.width,
      this.canvas!.height,
      logoSize.width,
      logoSize.height,
      position
    )
    
    // Set opacity
    this.ctx.globalAlpha = opacity
    
    // Draw the logo
    this.ctx.drawImage(
      logoImage,
      positionCoords.x,
      positionCoords.y,
      logoSize.width,
      logoSize.height
    )
    
    // Reset opacity
    this.ctx.globalAlpha = 1
  }

  private loadImageFromUrl(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }

  private calculateFontSize(size: string): number {
    const baseSize = Math.min(this.canvas!.width, this.canvas!.height) * 0.05
    
    switch (size) {
      case 'small': return baseSize * 0.7
      case 'large': return baseSize * 1.5
      default: return baseSize
    }
  }

  private calculateLogoSize(logoImage: HTMLImageElement, size: string): { width: number; height: number } {
    const maxSize = Math.min(this.canvas!.width, this.canvas!.height) * 0.2
    const aspectRatio = logoImage.width / logoImage.height
    
    let logoWidth: number
    let logoHeight: number
    
    switch (size) {
      case 'small':
        logoWidth = maxSize * 0.5
        break
      case 'large':
        logoWidth = maxSize * 1.5
        break
      default:
        logoWidth = maxSize
    }
    
    logoHeight = logoWidth / aspectRatio
    
    return { width: logoWidth, height: logoHeight }
  }

  private calculateTextPosition(
    canvasWidth: number,
    canvasHeight: number,
    textWidth: number,
    textHeight: number,
    position: string
  ): { x: number; y: number } {
    const padding = 20
    
    switch (position) {
      case 'top-left':
        return { x: padding, y: textHeight + padding }
      case 'top-right':
        return { x: canvasWidth - textWidth - padding, y: textHeight + padding }
      case 'bottom-left':
        return { x: padding, y: canvasHeight - padding }
      case 'bottom-right':
        return { x: canvasWidth - textWidth - padding, y: canvasHeight - padding }
      case 'center':
        return { 
          x: (canvasWidth - textWidth) / 2, 
          y: (canvasHeight + textHeight) / 2 
        }
      default:
        return { x: canvasWidth - textWidth - padding, y: canvasHeight - padding }
    }
  }

  private calculateLogoPosition(
    canvasWidth: number,
    canvasHeight: number,
    logoWidth: number,
    logoHeight: number,
    position: string
  ): { x: number; y: number } {
    const padding = 20
    
    switch (position) {
      case 'top-left':
        return { x: padding, y: padding }
      case 'top-right':
        return { x: canvasWidth - logoWidth - padding, y: padding }
      case 'bottom-left':
        return { x: padding, y: canvasHeight - logoHeight - padding }
      case 'bottom-right':
        return { x: canvasWidth - logoWidth - padding, y: canvasHeight - logoHeight - padding }
      case 'center':
        return { 
          x: (canvasWidth - logoWidth) / 2, 
          y: (canvasHeight - logoHeight) / 2 
        }
      default:
        return { x: canvasWidth - logoWidth - padding, y: canvasHeight - logoHeight - padding }
    }
  }

  /**
   * Generate a default watermark text for artists
   */
  generateDefaultWatermark(artistName: string, website?: string): string {
    const currentYear = new Date().getFullYear()
    if (website) {
      return `© ${currentYear} ${artistName} | ${website}`
    }
    return `© ${currentYear} ${artistName}`
  }

  /**
   * Create multiple watermark variations
   */
  async createWatermarkVariations(
    imageFile: File,
    artistName: string,
    website?: string
  ): Promise<{
    subtle: WatermarkResult
    prominent: WatermarkResult
    minimal: WatermarkResult
  }> {
    const defaultText = this.generateDefaultWatermark(artistName, website)
    
    const [subtle, prominent, minimal] = await Promise.all([
      this.applyWatermark(imageFile, {
        text: defaultText,
        position: 'bottom-right',
        opacity: 0.3,
        size: 'small',
        color: '#ffffff'
      }),
      this.applyWatermark(imageFile, {
        text: defaultText,
        position: 'bottom-right',
        opacity: 0.8,
        size: 'medium',
        color: '#ffffff'
      }),
      this.applyWatermark(imageFile, {
        text: artistName,
        position: 'bottom-right',
        opacity: 0.5,
        size: 'small',
        color: '#ffffff'
      })
    ])
    
    return { subtle, prominent, minimal }
  }

  /**
   * Save watermark preferences for an artist
   */
  async saveWatermarkPreferences(
    userId: string,
    preferences: {
      defaultText?: string
      defaultPosition?: string
      defaultOpacity?: number
      defaultSize?: string
      defaultColor?: string
      logoUrl?: string
    }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('artist_watermark_preferences')
        .upsert({
          user_id: userId,
          preferences,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving watermark preferences:', error)
        throw error
      }
    } catch (error) {
      console.error('Failed to save watermark preferences:', error)
      throw error
    }
  }

  /**
   * Get watermark preferences for an artist
   */
  async getWatermarkPreferences(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('artist_watermark_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching watermark preferences:', error)
        return null
      }

      return data?.preferences || null
    } catch (error) {
      console.error('Failed to fetch watermark preferences:', error)
      return null
    }
  }

  /**
   * Batch process multiple images with watermarks
   */
  async batchWatermarkImages(
    imageFiles: File[],
    options: WatermarkOptions
  ): Promise<WatermarkResult[]> {
    const results: WatermarkResult[] = []
    
    for (const file of imageFiles) {
      try {
        const result = await this.applyWatermark(file, options)
        results.push(result)
      } catch (error) {
        console.error(`Failed to watermark ${file.name}:`, error)
        // Add error result
        results.push({
          watermarkedImageUrl: '',
          originalImageUrl: URL.createObjectURL(file),
          watermarkApplied: false,
          metadata: {
            watermarkType: 'error',
            position: 'none',
            opacity: 0,
            size: 'none'
          }
        })
      }
    }
    
    return results
  }

  /**
   * Add Artflow logo watermark (bottom right)
   */
  private async addArtflowWatermark() {
    if (!this.ctx) return

    const canvas = this.ctx.canvas
    const logoSize = 20
    const margin = 10
    
    // Position in bottom right
    const x = canvas.width - logoSize - margin
    const y = canvas.height - logoSize - margin
    
    // Create watermark background
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    this.ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10)
    
    // Add Artflow text
    this.ctx.fillStyle = '#333'
    this.ctx.font = 'bold 12px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.fillText('Artflow', x + logoSize/2, y + logoSize/2 + 4)
  }

  /**
   * Add artist name watermark (bottom left)
   */
  private async addArtistWatermark(artistName: string) {
    if (!this.ctx) return

    const canvas = this.ctx.canvas
    const margin = 10
    
    // Position in bottom left
    const x = margin
    const y = canvas.height - margin
    
    // Create watermark background
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    const textWidth = this.ctx.measureText(artistName).width
    this.ctx.fillRect(x - 5, y - 20, textWidth + 10, 20)
    
    // Add artist name
    this.ctx.fillStyle = '#333'
    this.ctx.font = '12px Arial'
    this.ctx.textAlign = 'left'
    this.ctx.fillText(artistName, x, y - 5)
  }

  /**
   * Remove watermark from an image (basic implementation)
   * Note: This is a simplified approach and may not work perfectly
   */
  async removeWatermark(imageFile: File): Promise<string> {
    // This is a placeholder - in reality, removing watermarks is very difficult
    // and often impossible without the original image
    console.warn('Watermark removal is not fully implemented')
    return URL.createObjectURL(imageFile)
  }
}

export const watermarkingService = new WatermarkingService()
