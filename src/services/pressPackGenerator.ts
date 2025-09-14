import { supabase } from '@/lib/supabase';
import PDFDocument from 'pdfkit';

export interface PressPackData {
  artist: {
    id: string;
    full_name: string;
    bio: string;
    artist_statement: string;
    avatar_url?: string;
    logo_url?: string;
    website?: string;
    instagram?: string;
    twitter?: string;
  };
  selectedWorks: Array<{
    id: string;
    title: string;
    year: number;
    medium: string;
    dimensions: string;
    image_url: string;
    description?: string;
  }>;
  exhibitions: Array<{
    title: string;
    venue: string;
    city: string;
    country: string;
    start_date: string;
    end_date?: string;
    is_solo_show: boolean;
  }>;
  highlights: {
    totalArtworks: number;
    totalExhibitions: number;
    recentSales: number;
    followers: number;
    featuredIn: string[];
  };
}

class PressPackGeneratorService {
  // Generate press pack PDF
  async generatePressPack(artistId: string): Promise<string> {
    try {
      // Get artist data
      const pressPackData = await this.getPressPackData(artistId);
      
      // Create PDF
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      // Generate PDF content
      this.addCoverPage(doc, pressPackData);
      this.addArtistBio(doc, pressPackData);
      this.addSelectedWorks(doc, pressPackData);
      this.addExhibitions(doc, pressPackData);
      this.addHighlights(doc, pressPackData);
      this.addContactInfo(doc, pressPackData);

      // Save to Supabase Storage
      const pdfBuffer = await this.pdfToBuffer(doc);
      const fileName = `press-pack-${artistId}-${Date.now()}.pdf`;
      const filePath = `press-packs/${artistId}/${fileName}`;

      const { error } = await supabase.storage
        .from('press-packs')
        .upload(filePath, pdfBuffer, {
          contentType: 'application/pdf'
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from('press-packs')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error generating press pack:', error);
      throw error;
    }
  }

  // Generate exhibition pack PDF
  async generateExhibitionPack(exhibitionId: string): Promise<string> {
    try {
      const exhibitionData = await this.getExhibitionData(exhibitionId);
      
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      this.addExhibitionCover(doc, exhibitionData);
      this.addExhibitionDetails(doc, exhibitionData);
      this.addExhibitionWorks(doc, exhibitionData);
      this.addExhibitionPress(doc, exhibitionData);

      const pdfBuffer = await this.pdfToBuffer(doc);
      const fileName = `exhibition-pack-${exhibitionId}-${Date.now()}.pdf`;
      const filePath = `exhibition-packs/${exhibitionId}/${fileName}`;

      const { error } = await supabase.storage
        .from('exhibition-packs')
        .upload(filePath, pdfBuffer, {
          contentType: 'application/pdf'
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from('exhibition-packs')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error generating exhibition pack:', error);
      throw error;
    }
  }

  // Private helper methods
  private async getPressPackData(artistId: string): Promise<PressPackData> {
    // Get artist profile
    const { data: artist, error: artistError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', artistId)
      .single();

    if (artistError) throw artistError;

    // Get selected works (most recent 10)
    const { data: artworks, error: artworksError } = await supabase
      .from('artworks')
      .select(`
        id, title, year, medium, dimensions, description,
        images:artwork_images(image_url, is_primary)
      `)
      .eq('user_id', artistId)
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(10);

    if (artworksError) throw artworksError;

    // Get exhibitions
    const { data: exhibitions, error: exhibitionsError } = await supabase
      .from('exhibitions')
      .select('*')
      .eq('artist_id', artistId)
      .order('start_date', { ascending: false })
      .limit(20);

    if (exhibitionsError) throw exhibitionsError;

    // Get highlights
    const highlights = await this.calculateHighlights(artistId);

    return {
      artist: {
        id: artist.id,
        full_name: artist.full_name,
        bio: artist.bio || '',
        artist_statement: artist.artist_statement || '',
        avatar_url: artist.avatar_url,
        logo_url: artist.logo_url,
        website: artist.website,
        instagram: artist.instagram,
        twitter: artist.twitter
      },
      selectedWorks: artworks?.map(artwork => ({
        id: artwork.id,
        title: artwork.title,
        year: artwork.year || new Date().getFullYear(),
        medium: artwork.medium,
        dimensions: this.formatDimensions(artwork.dimensions),
        image_url: artwork.images?.find(img => img.is_primary)?.image_url || '',
        description: artwork.description
      })) || [],
      exhibitions: exhibitions?.map(exhibition => ({
        title: exhibition.title,
        venue: exhibition.venue,
        city: exhibition.city,
        country: exhibition.country,
        start_date: exhibition.start_date,
        end_date: exhibition.end_date,
        is_solo_show: exhibition.is_solo_show
      })) || [],
      highlights
    };
  }

  private async getExhibitionData(exhibitionId: string): Promise<any> {
    // Implementation for exhibition data
    return {};
  }

  private async calculateHighlights(artistId: string): Promise<any> {
    const [artworks, exhibitions, sales, followers] = await Promise.all([
      supabase.from('artworks').select('id').eq('user_id', artistId),
      supabase.from('exhibitions').select('id').eq('artist_id', artistId),
      supabase.from('sales').select('id').eq('artist_id', artistId),
      supabase.from('followers').select('id').eq('following_id', artistId)
    ]);

    return {
      totalArtworks: artworks.data?.length || 0,
      totalExhibitions: exhibitions.data?.length || 0,
      recentSales: sales.data?.length || 0,
      followers: followers.data?.length || 0,
      featuredIn: ['Art Magazine', 'Gallery Weekly', 'Contemporary Art Review']
    };
  }

  private addCoverPage(doc: PDFDocument, data: PressPackData): void {
    // Title
    doc.fontSize(32)
       .font('Helvetica-Bold')
       .text(data.artist.full_name, 50, 100);

    // Subtitle
    doc.fontSize(16)
       .font('Helvetica')
       .text('Press Kit & Portfolio', 50, 140);

    // Date
    doc.fontSize(12)
       .text(`Generated ${new Date().toLocaleDateString()}`, 50, 170);

    // Logo if available
    if (data.artist.logo_url) {
      // Add logo placeholder
      doc.rect(450, 100, 100, 100)
         .stroke();
      doc.fontSize(10)
         .text('Artist Logo', 450, 210, { width: 100, align: 'center' });
    }
  }

  private addArtistBio(doc: PDFDocument, data: PressPackData): void {
    doc.addPage();
    
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('Artist Biography', 50, 50);

    doc.fontSize(12)
       .font('Helvetica')
       .text(data.artist.bio, 50, 80, { width: 500 });

    if (data.artist.artist_statement) {
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Artist Statement', 50, 200);

      doc.fontSize(12)
         .font('Helvetica')
         .text(data.artist.artist_statement, 50, 230, { width: 500 });
    }
  }

  private addSelectedWorks(doc: PDFDocument, data: PressPackData): void {
    doc.addPage();
    
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('Selected Works', 50, 50);

    let yPosition = 80;
    data.selectedWorks.forEach((work, index) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      // Work title
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text(work.title, 50, yPosition);

      // Work details
      doc.fontSize(10)
         .font('Helvetica')
         .text(`${work.year} • ${work.medium} • ${work.dimensions}`, 50, yPosition + 20);

      // Work description
      if (work.description) {
        doc.text(work.description, 50, yPosition + 40, { width: 400 });
        yPosition += 60;
      } else {
        yPosition += 50;
      }

      // Add separator
      if (index < data.selectedWorks.length - 1) {
        doc.moveTo(50, yPosition)
           .lineTo(550, yPosition)
           .stroke();
        yPosition += 20;
      }
    });
  }

  private addExhibitions(doc: PDFDocument, data: PressPackData): void {
    if (data.exhibitions.length === 0) return;

    doc.addPage();
    
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('Exhibition History', 50, 50);

    let yPosition = 80;
    data.exhibitions.forEach((exhibition, index) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      // Exhibition title
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text(exhibition.title, 50, yPosition);

      // Venue and location
      doc.fontSize(12)
         .font('Helvetica')
         .text(`${exhibition.venue}, ${exhibition.city}, ${exhibition.country}`, 50, yPosition + 20);

      // Dates
      const startDate = new Date(exhibition.start_date).toLocaleDateString();
      const endDate = exhibition.end_date ? new Date(exhibition.end_date).toLocaleDateString() : 'Ongoing';
      doc.fontSize(10)
         .text(`${startDate} - ${endDate}`, 50, yPosition + 40);

      // Solo show indicator
      if (exhibition.is_solo_show) {
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('Solo Exhibition', 400, yPosition + 40);
      }

      yPosition += 80;
    });
  }

  private addHighlights(doc: PDFDocument, data: PressPackData): void {
    doc.addPage();
    
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('Career Highlights', 50, 50);

    const highlights = [
      `${data.highlights.totalArtworks} artworks created`,
      `${data.highlights.totalExhibitions} exhibitions participated`,
      `${data.highlights.recentSales} recent sales`,
      `${data.highlights.followers} followers`
    ];

    let yPosition = 80;
    highlights.forEach(highlight => {
      doc.fontSize(12)
         .font('Helvetica')
         .text(`• ${highlight}`, 50, yPosition);
      yPosition += 25;
    });

    if (data.highlights.featuredIn.length > 0) {
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Featured In', 50, yPosition + 20);

      yPosition += 50;
      data.highlights.featuredIn.forEach(publication => {
        doc.fontSize(12)
           .font('Helvetica')
           .text(`• ${publication}`, 50, yPosition);
        yPosition += 25;
      });
    }
  }

  private addContactInfo(doc: PDFDocument, data: PressPackData): void {
    doc.addPage();
    
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('Contact Information', 50, 50);

    const contactInfo = [
      `Name: ${data.artist.full_name}`,
      data.artist.website ? `Website: ${data.artist.website}` : null,
      data.artist.instagram ? `Instagram: @${data.artist.instagram}` : null,
      data.artist.twitter ? `Twitter: @${data.artist.twitter}` : null
    ].filter(Boolean);

    let yPosition = 80;
    contactInfo.forEach(info => {
      doc.fontSize(12)
         .font('Helvetica')
         .text(info, 50, yPosition);
      yPosition += 25;
    });
  }

  private addExhibitionCover(doc: PDFDocument, data: any): void {
    // Implementation for exhibition cover
  }

  private addExhibitionDetails(doc: PDFDocument, data: any): void {
    // Implementation for exhibition details
  }

  private addExhibitionWorks(doc: PDFDocument, data: any): void {
    // Implementation for exhibition works
  }

  private addExhibitionPress(doc: PDFDocument, data: any): void {
    // Implementation for exhibition press
  }

  private formatDimensions(dimensions: any): string {
    if (!dimensions) return 'Dimensions not specified';
    return `${dimensions.width} × ${dimensions.height} ${dimensions.unit || 'cm'}`;
  }

  private async pdfToBuffer(doc: PDFDocument): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.end();
    });
  }
}

export const pressPackGenerator = new PressPackGeneratorService();
