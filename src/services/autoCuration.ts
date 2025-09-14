import { supabase } from '@/lib/supabase';

export interface CurationAnalysis {
  catalogueId: string;
  gaps: {
    mediums: string[];
    priceRanges: string[];
    styles: string[];
    colors: string[];
    sizes: string[];
  };
  balance: {
    mediumDistribution: Record<string, number>;
    priceDistribution: Record<string, number>;
    styleDistribution: Record<string, number>;
    colorDistribution: Record<string, number>;
  };
  recommendations: CurationRecommendation[];
  score: number; // 0-100, higher is better
}

export interface CurationRecommendation {
  id: string;
  type: 'add_artwork' | 'remove_artwork' | 'reorder' | 'theme_suggestion';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  artworkId?: string;
  suggestedArtworks?: any[];
  reason: string;
  impact: number; // 0-100, expected improvement
}

export interface CatalogueSendRecommendation {
  catalogueId: string;
  contacts: string[];
  sendTime: string;
  reason: string;
  expectedEngagement: number;
  personalization: {
    customMessage?: string;
    highlightedArtworks: string[];
    contactSegments: string[];
  };
}

class AutoCurationService {
  // Analyze catalogue for curation opportunities
  async analyzeCatalogue(catalogueId: string): Promise<CurationAnalysis> {
    try {
      // Get catalogue and its artworks
      const { data: catalogue, error: catalogueError } = await supabase
        .from('catalogues')
        .select(`
          *,
          artworks:catalogue_artworks(
            artwork:artwork_id(
              id, title, medium, price, dimensions, dominant_colors, genre, subject
            )
          )
        `)
        .eq('id', catalogueId)
        .single();

      if (catalogueError) throw catalogueError;

      const artworks = catalogue.artworks?.map(ca => ca.artwork).filter(Boolean) || [];

      // Analyze gaps
      const gaps = await this.analyzeGaps(artworks);

      // Analyze balance
      const balance = this.analyzeBalance(artworks);

      // Generate recommendations
      const recommendations = await this.generateRecommendations(catalogueId, artworks, gaps, balance);

      // Calculate overall score
      const score = this.calculateCurationScore(artworks, gaps, balance);

      return {
        catalogueId,
        gaps,
        balance,
        recommendations,
        score
      };
    } catch (error) {
      console.error('Error analyzing catalogue:', error);
      throw error;
    }
  }

  // Get catalogue send recommendations
  async getCatalogueSendRecommendations(artistId: string): Promise<CatalogueSendRecommendation[]> {
    try {
      // Get artist's catalogues
      const { data: catalogues, error: cataloguesError } = await supabase
        .from('catalogues')
        .select('*')
        .eq('user_id', artistId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (cataloguesError) throw cataloguesError;

      const recommendations: CatalogueSendRecommendation[] = [];

      for (const catalogue of catalogues || []) {
        // Analyze catalogue
        const analysis = await this.analyzeCatalogue(catalogue.id);

        // Get potential contacts
        const contacts = await this.getOptimalContacts(artistId, catalogue);

        // Determine best send time
        const sendTime = await this.getOptimalSendTime(artistId);

        // Generate personalization
        const personalization = await this.generatePersonalization(catalogue, contacts);

        if (contacts.length > 0) {
          recommendations.push({
            catalogueId: catalogue.id,
            contacts,
            sendTime,
            reason: this.getSendReason(analysis, catalogue),
            expectedEngagement: this.calculateExpectedEngagement(analysis, contacts),
            personalization
          });
        }
      }

      return recommendations.sort((a, b) => b.expectedEngagement - a.expectedEngagement);
    } catch (error) {
      console.error('Error getting catalogue send recommendations:', error);
      throw error;
    }
  }

  // Auto-curate a catalogue
  async autoCurateCatalogue(catalogueId: string, options: {
    fillGaps?: boolean;
    balanceDistribution?: boolean;
    maxArtworks?: number;
    maintainTheme?: boolean;
  } = {}): Promise<CurationRecommendation[]> {
    try {
      const analysis = await this.analyzeCatalogue(catalogueId);
      const recommendations: CurationRecommendation[] = [];

      if (options.fillGaps) {
        const gapRecommendations = await this.generateGapFillingRecommendations(
          catalogueId, 
          analysis.gaps, 
          analysis.balance
        );
        recommendations.push(...gapRecommendations);
      }

      if (options.balanceDistribution) {
        const balanceRecommendations = await this.generateBalanceRecommendations(
          catalogueId,
          analysis.balance
        );
        recommendations.push(...balanceRecommendations);
      }

      if (options.maxArtworks) {
        const sizeRecommendations = await this.generateSizeRecommendations(
          catalogueId,
          options.maxArtworks
        );
        recommendations.push(...sizeRecommendations);
      }

      return recommendations.sort((a, b) => b.priority === 'high' ? 1 : -1);
    } catch (error) {
      console.error('Error auto-curating catalogue:', error);
      throw error;
    }
  }

  // Private helper methods
  private async analyzeGaps(artworks: any[]): Promise<any> {
    const mediums = new Set(artworks.map(a => a.medium).filter(Boolean));
    const prices = artworks.map(a => a.price).filter(Boolean);
    const styles = new Set(artworks.map(a => a.genre).filter(Boolean));
    const colors = new Set(artworks.flatMap(a => a.dominant_colors || []));
    const sizes = artworks.map(a => a.dimensions).filter(Boolean);

    // Define ideal distributions
    const idealMediums = ['Oil on Canvas', 'Acrylic', 'Watercolor', 'Photography', 'Mixed Media'];
    const idealPriceRanges = ['0-1000', '1000-5000', '5000-10000', '10000+'];
    const idealStyles = ['Abstract', 'Realistic', 'Contemporary', 'Traditional'];
    const idealColors = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Black', 'White'];
    const idealSizes = ['Small', 'Medium', 'Large', 'Extra Large'];

    return {
      mediums: idealMediums.filter(m => !mediums.has(m)),
      priceRanges: idealPriceRanges.filter(range => {
        const [min, max] = range.split('-').map(Number);
        return !prices.some(price => price >= min && price <= (max || Infinity));
      }),
      styles: idealStyles.filter(s => !styles.has(s)),
      colors: idealColors.filter(c => !colors.has(c)),
      sizes: idealSizes.filter(size => {
        // This would check actual dimensions against size categories
        return true; // Simplified for now
      })
    };
  }

  private analyzeBalance(artworks: any[]): any {
    const mediumCounts: Record<string, number> = {};
    const priceCounts: Record<string, number> = {};
    const styleCounts: Record<string, number> = {};
    const colorCounts: Record<string, number> = {};

    artworks.forEach(artwork => {
      // Count mediums
      if (artwork.medium) {
        mediumCounts[artwork.medium] = (mediumCounts[artwork.medium] || 0) + 1;
      }

      // Count price ranges
      if (artwork.price) {
        const range = this.getPriceRange(artwork.price);
        priceCounts[range] = (priceCounts[range] || 0) + 1;
      }

      // Count styles
      if (artwork.genre) {
        styleCounts[artwork.genre] = (styleCounts[artwork.genre] || 0) + 1;
      }

      // Count colors
      if (artwork.dominant_colors) {
        artwork.dominant_colors.forEach((color: string) => {
          colorCounts[color] = (colorCounts[color] || 0) + 1;
        });
      }
    });

    return {
      mediumDistribution: mediumCounts,
      priceDistribution: priceCounts,
      styleDistribution: styleCounts,
      colorDistribution: colorCounts
    };
  }

  private async generateRecommendations(
    catalogueId: string, 
    artworks: any[], 
    gaps: any, 
    balance: any
  ): Promise<CurationRecommendation[]> {
    const recommendations: CurationRecommendation[] = [];

    // Gap-filling recommendations
    if (gaps.mediums.length > 0) {
      recommendations.push({
        id: `gap_medium_${catalogueId}`,
        type: 'add_artwork',
        priority: 'medium',
        title: 'Add Missing Mediums',
        description: `Consider adding artworks in: ${gaps.mediums.join(', ')}`,
        reason: 'Medium diversity improves catalogue appeal',
        impact: 25
      });
    }

    // Balance recommendations
    const mediumImbalance = this.detectImbalance(balance.mediumDistribution);
    if (mediumImbalance.length > 0) {
      recommendations.push({
        id: `balance_medium_${catalogueId}`,
        type: 'reorder',
        priority: 'low',
        title: 'Balance Medium Distribution',
        description: `Consider reordering to better distribute: ${mediumImbalance.join(', ')}`,
        reason: 'Balanced distribution creates visual harmony',
        impact: 15
      });
    }

    // Size recommendations
    if (artworks.length < 5) {
      recommendations.push({
        id: `size_${catalogueId}`,
        type: 'add_artwork',
        priority: 'high',
        title: 'Add More Artworks',
        description: `Catalogue has only ${artworks.length} artworks. Consider adding 3-5 more for better impact.`,
        reason: 'Larger catalogues typically perform better',
        impact: 40
      });
    }

    return recommendations;
  }

  private calculateCurationScore(artworks: any[], gaps: any, balance: any): number {
    let score = 100;

    // Deduct for gaps
    score -= gaps.mediums.length * 5;
    score -= gaps.priceRanges.length * 3;
    score -= gaps.styles.length * 4;
    score -= gaps.colors.length * 2;

    // Deduct for imbalance
    const mediumImbalance = this.detectImbalance(balance.mediumDistribution);
    score -= mediumImbalance.length * 3;

    // Deduct for small size
    if (artworks.length < 5) {
      score -= (5 - artworks.length) * 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private getPriceRange(price: number): string {
    if (price < 1000) return '0-1000';
    if (price < 5000) return '1000-5000';
    if (price < 10000) return '5000-10000';
    return '10000+';
  }

  private detectImbalance(distribution: Record<string, number>): string[] {
    const values = Object.values(distribution);
    if (values.length === 0) return [];

    const max = Math.max(...values);
    const min = Math.min(...values);
    const threshold = max * 0.3; // 30% threshold

    return Object.entries(distribution)
      .filter(([, count]) => count < threshold)
      .map(([key]) => key);
  }

  private async generateGapFillingRecommendations(
    catalogueId: string, 
    gaps: any, 
    balance: any
  ): Promise<CurationRecommendation[]> {
    // This would find artworks that fill specific gaps
    return [];
  }

  private async generateBalanceRecommendations(
    catalogueId: string,
    balance: any
  ): Promise<CurationRecommendation[]> {
    // This would suggest reordering or removing artworks to improve balance
    return [];
  }

  private async generateSizeRecommendations(
    catalogueId: string,
    maxArtworks: number
  ): Promise<CurationRecommendation[]> {
    // This would suggest adding or removing artworks to reach optimal size
    return [];
  }

  private async getOptimalContacts(artistId: string, catalogue: any): Promise<string[]> {
    try {
      // Get contacts with high engagement and matching preferences
      const { data: contacts, error } = await supabase.rpc('get_optimal_contacts_for_catalogue', {
        p_artist_id: artistId,
        p_catalogue_id: catalogue.id,
        p_limit: 50
      });

      if (error) throw error;
      return contacts || [];
    } catch (error) {
      console.error('Error getting optimal contacts:', error);
      return [];
    }
  }

  private async getOptimalSendTime(artistId: string): Promise<string> {
    try {
      const { data: optimization } = await supabase
        .from('send_time_optimizations')
        .select('best_times')
        .eq('user_id', artistId)
        .single();

      if (optimization?.best_times) {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
        const bestTimes = optimization.best_times[today] || [];
        return bestTimes[0] || '09:00';
      }

      return '09:00'; // Default
    } catch (error) {
      return '09:00';
    }
  }

  private async generatePersonalization(catalogue: any, contacts: string[]): Promise<any> {
    return {
      customMessage: `I thought you might be interested in my latest collection: ${catalogue.title}`,
      highlightedArtworks: [], // Would be populated based on contact preferences
      contactSegments: ['high_engagement', 'recent_viewers']
    };
  }

  private getSendReason(analysis: CurationAnalysis, catalogue: any): string {
    if (analysis.score > 80) {
      return 'High-quality catalogue with excellent curation';
    } else if (analysis.score > 60) {
      return 'Good catalogue with room for improvement';
    } else {
      return 'Catalogue needs better curation before sending';
    }
  }

  private calculateExpectedEngagement(analysis: CurationAnalysis, contacts: string[]): number {
    const baseEngagement = Math.min(analysis.score, 100);
    const contactFactor = Math.min(contacts.length / 10, 1); // Cap at 1.0
    return Math.round(baseEngagement * contactFactor);
  }
}

export const autoCuration = new AutoCurationService();
