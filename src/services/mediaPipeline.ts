import { supabase } from '@/lib/supabase';

export interface ImageProcessingResult {
  originalUrl: string;
  watermarkedUrl?: string;
  visualizationUrl?: string;
  dominantColors: string[];
  perceptualHash?: string;
  exifData?: any;
  subjectTags?: string[];
  genreTags?: string[];
}

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  similarImages: Array<{
    id: string;
    title: string;
    similarity: number;
    imageUrl: string;
  }>;
}

class MediaPipelineService {
  // Process uploaded image
  async processImage(
    imageFile: File,
    artworkId: string,
    isPrimary: boolean = false,
    artistName?: string
  ): Promise<ImageProcessingResult> {
    try {
      // Upload original image
      const originalUrl = await this.uploadImage(imageFile, artworkId, 'original');

      // Extract EXIF data
      const exifData = await this.extractExifData(imageFile);

      // Generate perceptual hash
      const perceptualHash = await this.generatePerceptualHash(imageFile);

      // Extract dominant colors
      const dominantColors = await this.extractDominantColors(imageFile);

      // Generate watermarked version
      const watermarkedUrl = await this.generateWatermark(imageFile, artworkId, artistName);

      // Generate visualization (only for primary images of hangable media)
      let visualizationUrl;
      if (isPrimary && this.isHangableMedium(artworkId)) {
        visualizationUrl = await this.generateVisualization(imageFile, artworkId);
      }

      // Extract subject/genre tags using AI
      const { subjectTags, genreTags } = await this.extractAITags(imageFile);

      return {
        originalUrl,
        watermarkedUrl,
        visualizationUrl,
        dominantColors,
        perceptualHash,
        exifData,
        subjectTags,
        genreTags
      };
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }

  // Check for duplicate images
  async checkForDuplicates(
    imageFile: File,
    excludeArtworkId?: string
  ): Promise<DuplicateDetectionResult> {
    try {
      const perceptualHash = await this.generatePerceptualHash(imageFile);
      
      // Query for similar images using perceptual hash
      const { data: similarImages, error } = await supabase
        .from('artwork_images')
        .select(`
          id, perceptual_hash, artwork_id,
          artwork:artwork_id(title, primary_image_url)
        `)
        .not('artwork_id', 'eq', excludeArtworkId || '')
        .not('perceptual_hash', 'is', null);

      if (error) throw error;

      const duplicates = [];
      for (const image of similarImages || []) {
        if (image.perceptual_hash) {
          const similarity = this.calculateHashSimilarity(perceptualHash, image.perceptual_hash);
          if (similarity > 0.8) { // 80% similarity threshold
            duplicates.push({
              id: image.id,
              title: image.artwork?.title || 'Unknown',
              similarity,
              imageUrl: image.artwork?.primary_image_url || ''
            });
          }
        }
      }

      return {
        isDuplicate: duplicates.length > 0,
        similarImages: duplicates.sort((a, b) => b.similarity - a.similarity)
      };
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      throw error;
    }
  }

  // Regenerate watermarks for all images when artist name changes
  async regenerateWatermarks(artistId: string, newArtistName: string): Promise<void> {
    try {
      // Get all artworks by this artist
      const { data: artworks, error } = await supabase
        .from('artworks')
        .select('id, title')
        .eq('user_id', artistId);

      if (error) throw error;

      // Get all images for these artworks
      const artworkIds = artworks?.map(a => a.id) || [];
      const { data: images, error: imagesError } = await supabase
        .from('artwork_images')
        .select('id, image_url, artwork_id')
        .in('artwork_id', artworkIds);

      if (imagesError) throw imagesError;

      // Regenerate watermarks for each image
      for (const image of images || []) {
        try {
          const newWatermarkedUrl = await this.generateWatermark(
            null, // We'll fetch the original image
            image.artwork_id,
            newArtistName,
            image.image_url
          );

          // Update the watermarked URL in database
          await supabase
            .from('artwork_images')
            .update({ watermarked_image_url: newWatermarkedUrl })
            .eq('id', image.id);
        } catch (error) {
          console.error(`Error regenerating watermark for image ${image.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error regenerating watermarks:', error);
      throw error;
    }
  }

  // Private helper methods
  private async uploadImage(file: File, artworkId: string, type: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${artworkId}_${type}_${Date.now()}.${fileExt}`;
    const filePath = `artworks/${artworkId}/${fileName}`;

    const { error } = await supabase.storage
      .from('artwork-images')
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from('artwork-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  private async extractExifData(file: File): Promise<any> {
    // TODO: Implement real EXIF data extraction using exifr library
    return {};
  }

  private async generatePerceptualHash(file: File): Promise<string> {
    // TODO: Implement real perceptual hash generation using imghash library
    return '';
  }

  private async extractDominantColors(file: File): Promise<string[]> {
    // TODO: Implement real color extraction using color-thief or similar library
    return [];
  }

  private async generateWatermark(
    file: File | null,
    artworkId: string,
    artistName: string,
    originalUrl?: string
  ): Promise<string> {
    // TODO: Implement real watermark generation using sharp or canvas library
    return '';
  }

  private async generateVisualization(file: File, artworkId: string): Promise<string> {
    // TODO: Implement real room visualization service
    return '';
  }

  private async extractAITags(file: File): Promise<{ subjectTags: string[], genreTags: string[] }> {
    // TODO: Implement real AI tag extraction using Google Vision API or similar
    return {
      subjectTags: [],
      genreTags: []
    };
  }

  private isHangableMedium(artworkId: string): boolean {
    // TODO: Implement real medium checking logic
    return false;
  }

  private calculateHashSimilarity(hash1: string, hash2: string): number {
    // TODO: Implement real Hamming distance calculation between perceptual hashes
    return 0;
  }
}

export const mediaPipeline = new MediaPipelineService();
