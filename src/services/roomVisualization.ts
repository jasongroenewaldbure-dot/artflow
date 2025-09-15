import { supabase } from '../lib/supabase'

export interface RoomDimensions {
  width: number // in centimeters
  height: number // in centimeters
  depth?: number // in centimeters (for 3D rooms)
}

export interface ArtworkPlacement {
  x: number // position from left (0-1)
  y: number // position from top (0-1)
  width: number // relative width (0-1)
  height: number // relative height (0-1)
  rotation?: number // rotation in degrees
  zIndex?: number // layering order
}

export interface RoomVisualization {
  id: string
  roomType: 'living-room' | 'bedroom' | 'office' | 'gallery' | 'custom'
  dimensions: RoomDimensions
  wallColor: string
  floorType: 'hardwood' | 'carpet' | 'tile' | 'concrete'
  lighting: 'natural' | 'warm' | 'cool' | 'mixed'
  furniture: FurnitureItem[]
  artworks: ArtworkPlacement[]
  previewImageUrl?: string
  createdAt: Date
}

export interface FurnitureItem {
  id: string
  type: 'sofa' | 'chair' | 'table' | 'shelf' | 'bed' | 'desk' | 'custom'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  color: string
  name: string
}

export interface RoomTemplate {
  id: string
  name: string
  roomType: string
  dimensions: RoomDimensions
  furniture: Omit<FurnitureItem, 'id'>[]
  wallColor: string
  floorType: string
  lighting: string
  description: string
  previewImageUrl: string
}

class RoomVisualizationService {
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
   * Create a room visualization with artwork placement
   */
  async createRoomVisualization(
    artworkImage: File,
    roomType: RoomVisualization['roomType'] = 'living-room',
    customDimensions?: RoomDimensions,
    artworkMedium?: string,
    artistName?: string
  ): Promise<RoomVisualization> {
    const template = this.getRoomTemplate(roomType)
    const dimensions = customDimensions || template.dimensions
    
    // Load artwork image
    const artworkImg = await this.loadImage(artworkImage)
    
    // Create room visualization
    const visualization = await this.generateRoomVisualization(
      artworkImg,
      template,
      dimensions,
      artworkMedium,
      artistName
    )
    
    return visualization
  }

  /**
   * Generate room visualization image
   */
  private async generateRoomVisualization(
    artworkImage: HTMLImageElement,
    template: RoomTemplate,
    dimensions: RoomDimensions,
    artworkMedium?: string,
    artistName?: string
  ): Promise<RoomVisualization> {
    if (!this.canvas || !this.ctx) {
      throw new Error('Canvas not initialized')
    }

    // Set canvas size (higher resolution for better quality)
    const scale = 2
    this.canvas.width = 800 * scale
    this.canvas.height = 600 * scale
    this.ctx.scale(scale, scale)

    // Draw room background
    this.drawRoomBackground(template, dimensions)
    
    // Draw furniture
    this.drawFurniture(template.furniture)
    
    // Draw artwork
    const artworkPlacement = this.calculateOptimalArtworkPlacement(
      artworkImage,
      template.furniture,
      dimensions
    )
    
    this.renderArtworkByMedia(artworkImage, artworkPlacement, artworkMedium, artistName)
    
    // Add lighting effects
    this.addLightingEffects(template.lighting)
    
    // Generate preview image
    const previewImageUrl = this.canvas.toDataURL('image/jpeg', 0.9)
    
    return {
      id: this.generateId(),
      roomType: template.roomType as RoomVisualization['roomType'],
      dimensions,
      wallColor: template.wallColor,
      floorType: template.floorType as any,
      lighting: template.lighting as any,
      furniture: template.furniture.map(item => ({ ...item, id: this.generateId() })),
      artworks: [artworkPlacement],
      previewImageUrl,
      createdAt: new Date()
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

  private drawRoomBackground(template: RoomTemplate, dimensions: RoomDimensions) {
    if (!this.ctx) return

    // Draw walls
    this.ctx.fillStyle = template.wallColor
    this.ctx.fillRect(0, 0, 800, 600)
    
    // Draw floor
    this.drawFloor(template.floorType)
    
    // Add wall texture
    this.addWallTexture()
  }

  private drawFloor(floorType: string) {
    if (!this.ctx) return

    const floorY = 400 // Floor starts at this Y position
    const floorHeight = 200
    
    switch (floorType) {
      case 'hardwood':
        this.drawHardwoodFloor(floorY, floorHeight)
        break
      case 'carpet':
        this.drawCarpetFloor(floorY, floorHeight)
        break
      case 'tile':
        this.drawTileFloor(floorY, floorHeight)
        break
      case 'concrete':
        this.drawConcreteFloor(floorY, floorHeight)
        break
    }
  }

  private drawHardwoodFloor(y: number, height: number) {
    if (!this.ctx) return

    this.ctx.fillStyle = '#8B4513'
    this.ctx.fillRect(0, y, 800, height)
    
    // Draw wood planks
    this.ctx.strokeStyle = '#654321'
    this.ctx.lineWidth = 1
    
    for (let i = 0; i < 800; i += 60) {
      this.ctx.beginPath()
      this.ctx.moveTo(i, y)
      this.ctx.lineTo(i, y + height)
      this.ctx.stroke()
    }
  }

  private drawCarpetFloor(y: number, height: number) {
    if (!this.ctx) return

    this.ctx.fillStyle = '#2F4F4F'
    this.ctx.fillRect(0, y, 800, height)
    
    // Add carpet texture
    this.ctx.fillStyle = '#1C3A3A'
    for (let i = 0; i < 800; i += 20) {
      for (let j = y; j < y + height; j += 20) {
        if ((i + j) % 40 === 0) {
          this.ctx.fillRect(i, j, 10, 10)
        }
      }
    }
  }

  private drawTileFloor(y: number, height: number) {
    if (!this.ctx) return

    this.ctx.fillStyle = '#F5F5DC'
    this.ctx.fillRect(0, y, 800, height)
    
    // Draw tile grid
    this.ctx.strokeStyle = '#D3D3D3'
    this.ctx.lineWidth = 1
    
    for (let i = 0; i < 800; i += 40) {
      this.ctx.beginPath()
      this.ctx.moveTo(i, y)
      this.ctx.lineTo(i, y + height)
      this.ctx.stroke()
    }
    
    for (let j = y; j < y + height; j += 40) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, j)
      this.ctx.lineTo(800, j)
      this.ctx.stroke()
    }
  }

  private drawConcreteFloor(y: number, height: number) {
    if (!this.ctx) return

    this.ctx.fillStyle = '#708090'
    this.ctx.fillRect(0, y, 800, height)
    
    // Add concrete texture
    this.ctx.fillStyle = '#5F6A6A'
    for (let i = 0; i < 800; i += 10) {
      for (let j = y; j < y + height; j += 10) {
        if (Math.random() > 0.7) {
          this.ctx.fillRect(i, j, 2, 2)
        }
      }
    }
  }

  private addWallTexture() {
    if (!this.ctx) return

    // Add subtle wall texture
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    for (let i = 0; i < 800; i += 30) {
      for (let j = 0; j < 400; j += 30) {
        if (Math.random() > 0.8) {
          this.ctx.fillRect(i, j, 15, 15)
        }
      }
    }
  }

  private drawFurniture(furniture: Omit<FurnitureItem, 'id'>[]) {
    if (!this.ctx) return

    furniture.forEach(item => {
      this.drawFurnitureItem(item)
    })
  }

  private drawFurnitureItem(item: Omit<FurnitureItem, 'id'>) {
    if (!this.ctx) return

    this.ctx.save()
    this.ctx.translate(item.x + item.width / 2, item.y + item.height / 2)
    this.ctx.rotate((item.rotation * Math.PI) / 180)
    this.ctx.fillStyle = item.color
    this.ctx.fillRect(-item.width / 2, -item.height / 2, item.width, item.height)
    
    // Add furniture details
    this.ctx.strokeStyle = '#000'
    this.ctx.lineWidth = 1
    this.ctx.strokeRect(-item.width / 2, -item.height / 2, item.width, item.height)
    
    this.ctx.restore()
  }

  private calculateOptimalArtworkPlacement(
    artworkImage: HTMLImageElement,
    furniture: Omit<FurnitureItem, 'id'>[],
    dimensions: RoomDimensions
  ): ArtworkPlacement {
    // Find the best wall space for the artwork
    const wallSpaces = this.findAvailableWallSpaces(furniture, dimensions)
    const bestSpace = this.selectBestWallSpace(wallSpaces, artworkImage)
    
    return {
      x: bestSpace.x,
      y: bestSpace.y,
      width: bestSpace.width,
      height: bestSpace.height,
      rotation: 0,
      zIndex: 1
    }
  }

  private findAvailableWallSpaces(
    furniture: Omit<FurnitureItem, 'id'>[],
    dimensions: RoomDimensions
  ): Array<{ x: number; y: number; width: number; height: number }> {
    const spaces: Array<{ x: number; y: number; width: number; height: number }> = []
    
    // Define wall areas (simplified)
    const wallHeight = 300
    const wallWidth = 800
    
    // Check for spaces above furniture
    furniture.forEach(item => {
      if (item.y > 100 && item.y < 300) {
        spaces.push({
          x: item.x,
          y: 50,
          width: item.width,
          height: item.y - 50
        })
      }
    })
    
    // Add default wall spaces
    spaces.push(
      { x: 50, y: 50, width: 200, height: wallHeight },
      { x: 300, y: 50, width: 200, height: wallHeight },
      { x: 550, y: 50, width: 200, height: wallHeight }
    )
    
    return spaces.filter(space => space.width > 100 && space.height > 100)
  }

  private selectBestWallSpace(
    spaces: Array<{ x: number; y: number; width: number; height: number }>,
    artworkImage: HTMLImageElement
  ): { x: number; y: number; width: number; height: number } {
    // Select the largest available space
    return spaces.reduce((best, current) => 
      (current.width * current.height) > (best.width * best.height) ? current : best
    )
  }

  private drawArtwork(artworkImage: HTMLImageElement, placement: ArtworkPlacement) {
    if (!this.ctx) return

    this.ctx.save()
    
    // Draw artwork frame
    const frameWidth = placement.width + 20
    const frameHeight = placement.height + 20
    const frameX = placement.x - 10
    const frameY = placement.y - 10
    
    this.ctx.fillStyle = '#8B4513' // Brown frame
    this.ctx.fillRect(frameX, frameY, frameWidth, frameHeight)
    
    // Draw artwork
    this.ctx.drawImage(
      artworkImage,
      placement.x,
      placement.y,
      placement.width,
      placement.height
    )
    
    // Add frame shadow
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    this.ctx.shadowBlur = 5
    this.ctx.shadowOffsetX = 2
    this.ctx.shadowOffsetY = 2
    
    this.ctx.strokeStyle = '#654321'
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(frameX, frameY, frameWidth, frameHeight)
    
    this.ctx.restore()
  }

  /**
   * Render artwork based on media type
   */
  private renderArtworkByMedia(
    artworkImage: HTMLImageElement,
    placement: ArtworkPlacement,
    artworkMedium?: string,
    artistName?: string
  ) {
    if (!this.ctx) return

    const medium = artworkMedium?.toLowerCase() || ''
    
    // Determine if artwork can hang on wall
    const wallHangableMedia = [
      'oil on canvas', 'acrylic on canvas', 'watercolor on paper', 'ink on paper',
      'charcoal on paper', 'pastel on paper', 'mixed media on canvas', 'digital print',
      'photograph', 'print', 'drawing', 'painting', 'collage on paper', 'canvas',
      'paper', 'board', 'panel'
    ]
    
    const isWallHangable = wallHangableMedia.some(media => medium.includes(media))
    
    if (isWallHangable) {
      this.renderWallArtwork(artworkImage, placement, medium)
    } else {
      this.renderSurfaceArtwork(artworkImage, placement, medium)
    }
    
    // Add watermarks
    this.addWatermarks(artistName)
  }

  /**
   * Render artwork that hangs on wall
   */
  private renderWallArtwork(
    artworkImage: HTMLImageElement,
    placement: ArtworkPlacement,
    medium: string
  ) {
    if (!this.ctx) return

    this.ctx.save()
    
    // Calculate frame dimensions
    const frameWidth = placement.width + 20 // 10px frame on each side
    const frameHeight = placement.height + 20
    const frameX = placement.x - 10
    const frameY = placement.y - 10
    
    // Draw frame (only for certain media types)
    const frameableMedia = ['oil on canvas', 'acrylic on canvas', 'watercolor on paper', 'ink on paper']
    if (frameableMedia.some(media => medium.includes(media))) {
      this.ctx.fillStyle = '#8B4513' // Brown frame
      this.ctx.fillRect(frameX, frameY, frameWidth, frameHeight)
      
      // Add frame shadow
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      this.ctx.shadowBlur = 5
      this.ctx.shadowOffsetX = 2
      this.ctx.shadowOffsetY = 2
      
      this.ctx.strokeStyle = '#654321'
      this.ctx.lineWidth = 2
      this.ctx.strokeRect(frameX, frameY, frameWidth, frameHeight)
    }
    
    // Draw artwork
    this.ctx.drawImage(
      artworkImage,
      placement.x,
      placement.y,
      placement.width,
      placement.height
    )
    
    this.ctx.restore()
  }

  /**
   * Render artwork on surface (sculptures, ceramics, etc.)
   */
  private renderSurfaceArtwork(
    artworkImage: HTMLImageElement,
    placement: ArtworkPlacement,
    medium: string
  ) {
    if (!this.ctx) return

    this.ctx.save()
    
    // Create surface/stand for the artwork
    const surfaceY = placement.y + placement.height - 20
    const surfaceWidth = placement.width + 40
    const surfaceHeight = 20
    
    // Draw surface/stand
    this.ctx.fillStyle = '#D2B48C' // Tan surface
    this.ctx.fillRect(placement.x - 20, surfaceY, surfaceWidth, surfaceHeight)
    
    // Add surface shadow
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
    this.ctx.shadowBlur = 3
    this.ctx.shadowOffsetX = 1
    this.ctx.shadowOffsetY = 1
    
    // Draw artwork on surface
    this.ctx.drawImage(
      artworkImage,
      placement.x,
      placement.y - 10, // Slightly above surface
      placement.width,
      placement.height
    )
    
    // Add scale reference if needed
    this.addScaleReference(placement, medium)
    
    this.ctx.restore()
  }

  /**
   * Add scale reference for 3D artworks
   */
  private addScaleReference(placement: ArtworkPlacement, medium: string) {
    if (!this.ctx) return

    const scaleableMedia = ['sculpture', 'ceramic', 'glass', 'metal', 'wood', 'stone']
    if (!scaleableMedia.some(media => medium.includes(media))) return

    this.ctx.save()
    this.ctx.fillStyle = '#666'
    this.ctx.font = '12px Arial'
    this.ctx.fillText(
      'Scale reference',
      placement.x + placement.width + 10,
      placement.y + placement.height / 2
    )
    this.ctx.restore()
  }

  /**
   * Add watermarks to the visualization
   */
  private addWatermarks(artistName?: string) {
    if (!this.ctx) return

    this.ctx.save()
    
    // Add Artflow logo watermark (bottom right)
    this.addArtflowWatermark()
    
    // Add artist name watermark (bottom left)
    if (artistName) {
      this.addArtistWatermark(artistName)
    }
    
    this.ctx.restore()
  }

  /**
   * Add Artflow logo watermark
   */
  private addArtflowWatermark() {
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
    
    // Add Artflow text (since we don't have the SVG loaded)
    this.ctx.fillStyle = '#333'
    this.ctx.font = 'bold 12px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.fillText('Artflow', x + logoSize/2, y + logoSize/2 + 4)
  }

  /**
   * Add artist name watermark
   */
  private addArtistWatermark(artistName: string) {
    if (!this.ctx) return

    const canvas = this.ctx.canvas
    const margin = 10
    
    // Position in bottom left
    const x = margin
    const y = canvas.height - margin
    
    // Create watermark background
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    this.ctx.fillRect(x - 5, y - 20, this.ctx.measureText(artistName).width + 10, 20)
    
    // Add artist name
    this.ctx.fillStyle = '#333'
    this.ctx.font = '12px Arial'
    this.ctx.textAlign = 'left'
    this.ctx.fillText(artistName, x, y - 5)
  }

  private addLightingEffects(lighting: string) {
    if (!this.ctx) return

    this.ctx.save()
    
    switch (lighting) {
      case 'warm':
        this.ctx.fillStyle = 'rgba(255, 200, 100, 0.1)'
        break
      case 'cool':
        this.ctx.fillStyle = 'rgba(100, 150, 255, 0.1)'
        break
      case 'natural':
        this.ctx.fillStyle = 'rgba(255, 255, 200, 0.05)'
        break
      default:
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
    }
    
    this.ctx.fillRect(0, 0, 800, 600)
    this.ctx.restore()
  }

  private getRoomTemplate(roomType: string): RoomTemplate {
    const templates: { [key: string]: RoomTemplate } = {
      'living-room': {
        id: 'living-room',
        name: 'Modern Living Room',
        roomType: 'living-room',
        dimensions: { width: 12, height: 10 },
        furniture: [
          { type: 'sofa', x: 100, y: 300, width: 200, height: 80, rotation: 0, color: '#8B4513', name: 'Sofa' },
          { type: 'chair', x: 400, y: 320, width: 60, height: 60, rotation: 45, color: '#654321', name: 'Chair' },
          { type: 'table', x: 200, y: 400, width: 100, height: 60, rotation: 0, color: '#D2691E', name: 'Coffee Table' }
        ],
        wallColor: '#F5F5DC',
        floorType: 'hardwood',
        lighting: 'warm',
        description: 'A cozy modern living room',
        previewImageUrl: ''
      },
      'bedroom': {
        id: 'bedroom',
        name: 'Master Bedroom',
        roomType: 'bedroom',
        dimensions: { width: 14, height: 12 },
        furniture: [
          { type: 'bed', x: 150, y: 200, width: 120, height: 180, rotation: 0, color: '#2F4F4F', name: 'Bed' },
          { type: 'shelf', x: 50, y: 100, width: 40, height: 120, rotation: 0, color: '#8B4513', name: 'Bookshelf' }
        ],
        wallColor: '#E6E6FA',
        floorType: 'carpet',
        lighting: 'warm',
        description: 'A peaceful bedroom space',
        previewImageUrl: ''
      },
      'office': {
        id: 'office',
        name: 'Home Office',
        roomType: 'office',
        dimensions: { width: 10, height: 8 },
        furniture: [
          { type: 'desk', x: 100, y: 250, width: 150, height: 80, rotation: 0, color: '#8B4513', name: 'Desk' },
          { type: 'chair', x: 150, y: 350, width: 50, height: 50, rotation: 0, color: '#654321', name: 'Office Chair' },
          { type: 'shelf', x: 50, y: 100, width: 40, height: 120, rotation: 0, color: '#8B4513', name: 'Bookshelf' }
        ],
        wallColor: '#FFFFFF',
        floorType: 'tile',
        lighting: 'cool',
        description: 'A productive office environment',
        previewImageUrl: ''
      },
      'gallery': {
        id: 'gallery',
        name: 'Art Gallery',
        roomType: 'gallery',
        dimensions: { width: 20, height: 15 },
        furniture: [
          { type: 'shelf', x: 50, y: 100, width: 40, height: 200, rotation: 0, color: '#FFFFFF', name: 'Display Shelf' },
          { type: 'shelf', x: 200, y: 100, width: 40, height: 200, rotation: 0, color: '#FFFFFF', name: 'Display Shelf' },
          { type: 'shelf', x: 350, y: 100, width: 40, height: 200, rotation: 0, color: '#FFFFFF', name: 'Display Shelf' }
        ],
        wallColor: '#FFFFFF',
        floorType: 'concrete',
        lighting: 'cool',
        description: 'A professional gallery space',
        previewImageUrl: ''
      }
    }
    
    return templates[roomType] || templates['living-room']
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  /**
   * Save room visualization to database
   */
  async saveRoomVisualization(visualization: RoomVisualization): Promise<void> {
    try {
      const { error } = await supabase
        .from('room_visualizations')
        .insert({
          id: visualization.id,
          room_type: visualization.roomType,
          dimensions: visualization.dimensions,
          wall_color: visualization.wallColor,
          floor_type: visualization.floorType,
          lighting: visualization.lighting,
          furniture: visualization.furniture,
          artworks: visualization.artworks,
          preview_image_url: visualization.previewImageUrl,
          created_at: visualization.createdAt.toISOString()
        })

      if (error) {
        console.error('Error saving room visualization:', error)
        throw error
      }
    } catch (error) {
      console.error('Failed to save room visualization:', error)
      throw error
    }
  }

  /**
   * Get room visualizations for a user
   */
  async getUserRoomVisualizations(userId: string): Promise<RoomVisualization[]> {
    try {
      const { data, error } = await supabase
        .from('room_visualizations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching room visualizations:', error)
        return []
      }

      return data.map(item => ({
        id: item.id,
        roomType: item.room_type,
        dimensions: item.dimensions,
        wallColor: item.wall_color,
        floorType: item.floor_type,
        lighting: item.lighting,
        furniture: item.furniture,
        artworks: item.artworks,
        previewImageUrl: item.preview_image_url,
        createdAt: new Date(item.created_at)
      }))
    } catch (error) {
      console.error('Failed to fetch room visualizations:', error)
      return []
    }
  }

  /**
   * Get available room templates
   */
  async getRoomTemplates(): Promise<RoomTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('room_templates')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching room templates:', error)
        return []
      }

      return data.map(item => ({
        id: item.id,
        name: item.name,
        roomType: item.room_type,
        dimensions: item.dimensions,
        furniture: item.furniture,
        wallColor: item.wall_color,
        floorType: item.floor_type,
        lighting: item.lighting,
        description: item.description,
        previewImageUrl: item.preview_image_url
      }))
    } catch (error) {
      console.error('Failed to fetch room templates:', error)
      return []
    }
  }
}

export const roomVisualizationService = new RoomVisualizationService()
