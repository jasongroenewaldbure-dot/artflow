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
  type: 'add_artwork' | 'remove_artwork' | 'reorder' | 'theme_suggestion' | 'maintain';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  artworkId?: string;
  suggestedArtworks?: Array<{
    id: string;
    title: string;
    reason: string;
  }>;
  suggestedChanges?: Array<{
    artworkId: string;
    currentPosition: number;
    suggestedPosition: number;
    reason: string;
  }>;
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

    // Get dynamic ideal distributions from database and market data
    const idealDistributions = await this.getIdealDistributions();
    
    // Analyze size categories based on actual dimensions
    const sizeCategories = this.categorizeSizes(sizes);
    const idealSizeCategories = this.getIdealSizeCategories();

    return {
      mediums: idealDistributions.mediums.filter(m => !mediums.has(m)),
      priceRanges: idealDistributions.priceRanges.filter(range => {
        const [min, max] = range.split('-').map(Number);
        return !prices.some(price => price >= min && price <= (max || Infinity));
      }),
      styles: idealDistributions.styles.filter(s => !styles.has(s)),
      colors: idealDistributions.colors.filter(c => !colors.has(c)),
      sizes: idealSizeCategories.filter(size => !sizeCategories.has(size)),
      sizeAnalysis: {
        current: sizeCategories,
        ideal: idealSizeCategories,
        gaps: idealSizeCategories.filter(size => !sizeCategories.has(size))
      }
    };
  }

  private async getIdealDistributions(): Promise<any> {
    try {
      // Get market data for ideal distributions
      const { data: marketData } = await supabase
        .from('artwork_analytics')
        .select('medium, genre, price_range, dominant_colors')
        .eq('status', 'available')
        .limit(1000);

      if (!marketData || marketData.length === 0) {
        return this.getDefaultDistributions();
      }

      // Calculate ideal distributions based on market data
      const mediumCounts: Record<string, number> = {};
      const genreCounts: Record<string, number> = {};
      const priceRanges: Record<string, number> = {};
      const colorCounts: Record<string, number> = {};

      marketData.forEach(artwork => {
        // Count mediums
        if (artwork.medium) {
          mediumCounts[artwork.medium] = (mediumCounts[artwork.medium] || 0) + 1;
        }

        // Count genres
        if (artwork.genre) {
          genreCounts[artwork.genre] = (genreCounts[artwork.genre] || 0) + 1;
        }

        // Count price ranges
        if (artwork.price_range) {
          priceRanges[artwork.price_range] = (priceRanges[artwork.price_range] || 0) + 1;
        }

        // Count colors
        if (artwork.dominant_colors) {
          artwork.dominant_colors.forEach((color: string) => {
            colorCounts[color] = (colorCounts[color] || 0) + 1;
          });
        }
      });

      // Get top categories (most popular in market)
      const topMediums = Object.entries(mediumCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([medium]) => medium);

      const topGenres = Object.entries(genreCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([genre]) => genre);

      const topPriceRanges = Object.entries(priceRanges)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([range]) => range);

      const topColors = Object.entries(colorCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([color]) => color);

      return {
        mediums: topMediums,
        styles: topGenres,
        priceRanges: topPriceRanges,
        colors: topColors
      };
    } catch (error) {
      console.error('Error getting ideal distributions:', error);
      return this.getDefaultDistributions();
    }
  }

  private getDefaultDistributions(): any {
    return {
      mediums: ['Oil on Canvas', 'Acrylic', 'Watercolor', 'Photography', 'Mixed Media', 'Digital Art', 'Sculpture', 'Print'],
      styles: ['Abstract', 'Realistic', 'Contemporary', 'Traditional', 'Minimalist', 'Expressionist'],
      priceRanges: ['0-1000', '1000-5000', '5000-10000', '10000+'],
      colors: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Black', 'White']
    };
  }

  private categorizeSizes(dimensions: string[]): Set<string> {
    const sizeCategories = new Set<string>();
    
    dimensions.forEach(dim => {
      if (!dim) return;
      
      // Parse dimensions (e.g., "24x36", "24 x 36", "24\"x36\"")
      const match = dim.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
      if (!match) return;
      
      const width = parseFloat(match[1]);
      const height = parseFloat(match[2]);
      const area = width * height;
      
      // Categorize based on area (square inches)
      if (area < 100) {
        sizeCategories.add('Small');
      } else if (area < 400) {
        sizeCategories.add('Medium');
      } else if (area < 1000) {
        sizeCategories.add('Large');
      } else {
        sizeCategories.add('Extra Large');
      }
    });
    
    return sizeCategories;
  }

  private getIdealSizeCategories(): string[] {
    return ['Small', 'Medium', 'Large', 'Extra Large'];
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
    const recommendations: CurationRecommendation[] = [];
    
    try {
      // Get artist's available artworks
      const { data: catalogue } = await supabase
        .from('catalogues')
        .select('user_id')
        .eq('id', catalogueId)
        .single();
      
      if (!catalogue) return recommendations;

      const { data: availableArtworks } = await supabase
        .from('artworks')
        .select('id, title, medium, genre, price, dominant_colors, dimensions, status')
        .eq('user_id', catalogue.user_id)
        .eq('status', 'available')
        .not('id', 'in', `(${await this.getCatalogueArtworkIds(catalogueId)})`);

      if (!availableArtworks || availableArtworks.length === 0) {
        return recommendations;
      }

      // Find artworks that fill medium gaps
      if (gaps.mediums.length > 0) {
        const mediumFillers = availableArtworks.filter(artwork => 
          gaps.mediums.includes(artwork.medium)
        );
        
        if (mediumFillers.length > 0) {
          recommendations.push({
            id: `gap_medium_${catalogueId}`,
            type: 'add_artwork',
            priority: 'high',
            title: 'Add Missing Mediums',
            description: `Found ${mediumFillers.length} artworks to fill medium gaps: ${gaps.mediums.slice(0, 3).join(', ')}`,
            reason: 'Medium diversity improves catalogue appeal and market reach',
            impact: 30,
            suggestedArtworks: mediumFillers.slice(0, 5).map(artwork => ({
              id: artwork.id,
              title: artwork.title,
              reason: `Fills ${artwork.medium} gap`
            }))
          });
        }
      }

      // Find artworks that fill style gaps
      if (gaps.styles.length > 0) {
        const styleFillers = availableArtworks.filter(artwork => 
          gaps.styles.includes(artwork.genre)
        );
        
        if (styleFillers.length > 0) {
          recommendations.push({
            id: `gap_style_${catalogueId}`,
            type: 'add_artwork',
            priority: 'medium',
            title: 'Add Missing Styles',
            description: `Found ${styleFillers.length} artworks to fill style gaps: ${gaps.styles.slice(0, 3).join(', ')}`,
            reason: 'Style diversity attracts broader audience',
            impact: 25,
            suggestedArtworks: styleFillers.slice(0, 5).map(artwork => ({
              id: artwork.id,
              title: artwork.title,
              reason: `Fills ${artwork.genre} gap`
            }))
          });
        }
      }

      // Find artworks that fill color gaps
      if (gaps.colors.length > 0) {
        const colorFillers = availableArtworks.filter(artwork => 
          artwork.dominant_colors && 
          gaps.colors.some((color: string) => artwork.dominant_colors.includes(color))
        );
        
        if (colorFillers.length > 0) {
          recommendations.push({
            id: `gap_color_${catalogueId}`,
            type: 'add_artwork',
            priority: 'low',
            title: 'Add Missing Colors',
            description: `Found ${colorFillers.length} artworks to fill color gaps: ${gaps.colors.slice(0, 3).join(', ')}`,
            reason: 'Color diversity creates visual interest',
            impact: 15,
            suggestedArtworks: colorFillers.slice(0, 5).map(artwork => ({
              id: artwork.id,
              title: artwork.title,
              reason: `Adds missing colors: ${artwork.dominant_colors?.slice(0, 2).join(', ')}`
            }))
          });
        }
      }

      // Find artworks that fill size gaps
      if (gaps.sizes.length > 0) {
        const sizeFillers = availableArtworks.filter(artwork => {
          if (!artwork.dimensions) return false;
          const sizeCategory = this.getSizeCategory(artwork.dimensions);
          return gaps.sizes.includes(sizeCategory);
        });
        
        if (sizeFillers.length > 0) {
          recommendations.push({
            id: `gap_size_${catalogueId}`,
            type: 'add_artwork',
            priority: 'medium',
            title: 'Add Missing Sizes',
            description: `Found ${sizeFillers.length} artworks to fill size gaps: ${gaps.sizes.join(', ')}`,
            reason: 'Size variety accommodates different spaces and budgets',
            impact: 20,
            suggestedArtworks: sizeFillers.slice(0, 5).map(artwork => ({
              id: artwork.id,
              title: artwork.title,
              reason: `Fills ${this.getSizeCategory(artwork.dimensions)} size gap`
            }))
          });
        }
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating gap filling recommendations:', error);
      return recommendations;
    }
  }

  private async getCatalogueArtworkIds(catalogueId: string): Promise<string> {
    try {
      const { data: catalogueArtworks } = await supabase
        .from('catalogue_artworks')
        .select('artwork_id')
        .eq('catalogue_id', catalogueId);
      
      return catalogueArtworks?.map(ca => ca.artwork_id).join(',') || '';
    } catch (error) {
      console.error('Error getting catalogue artwork IDs:', error);
      return '';
    }
  }

  private getSizeCategory(dimensions: string): string {
    const match = dimensions.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
    if (!match) return 'Unknown';
    
    const width = parseFloat(match[1]);
    const height = parseFloat(match[2]);
    const area = width * height;
    
    if (area < 100) return 'Small';
    if (area < 400) return 'Medium';
    if (area < 1000) return 'Large';
    return 'Extra Large';
  }

  private async generateBalanceRecommendations(
    catalogueId: string,
    balance: any
  ): Promise<CurationRecommendation[]> {
    const recommendations: CurationRecommendation[] = [];
    
    try {
      // Get current catalogue artworks with order
      const { data: catalogueArtworks } = await supabase
        .from('catalogue_artworks')
        .select(`
          artwork_id,
          position,
          artworks!inner(
            id,
            title,
            medium,
            genre,
            price,
            dominant_colors,
            dimensions
          )
        `)
        .eq('catalogue_id', catalogueId)
        .order('position');

      if (!catalogueArtworks || catalogueArtworks.length === 0) {
        return recommendations;
      }

      const artworks = catalogueArtworks.map(ca => ({
        ...ca.artworks,
        position: ca.position
      }));

      // Analyze imbalances and suggest reordering
      const imbalances = this.detectDetailedImbalances(balance);
      
      // Medium imbalance recommendations
      if (imbalances.mediums.length > 0) {
        const reorderSuggestions = this.suggestMediumReordering(artworks, imbalances.mediums);
        if (reorderSuggestions.length > 0) {
          recommendations.push({
            id: `balance_medium_${catalogueId}`,
            type: 'reorder',
            priority: 'high',
            title: 'Reorder for Medium Balance',
            description: `Suggested reordering to balance medium distribution: ${imbalances.mediums.join(', ')}`,
            reason: 'Balanced medium distribution creates visual flow and professional presentation',
            impact: 35,
            suggestedChanges: reorderSuggestions.map(suggestion => ({
              artworkId: suggestion.artworkId,
              currentPosition: suggestion.currentPosition,
              suggestedPosition: suggestion.suggestedPosition,
              reason: suggestion.reason
            }))
          });
        }
      }

      // Price imbalance recommendations
      if (imbalances.prices.length > 0) {
        const priceSuggestions = this.suggestPriceReordering(artworks, imbalances.prices);
        if (priceSuggestions.length > 0) {
          recommendations.push({
            id: `balance_price_${catalogueId}`,
            type: 'reorder',
            priority: 'medium',
            title: 'Reorder for Price Balance',
            description: `Suggested reordering to balance price distribution: ${imbalances.prices.join(', ')}`,
            reason: 'Balanced price distribution accommodates different budget ranges',
            impact: 25,
            suggestedChanges: priceSuggestions.map(suggestion => ({
              artworkId: suggestion.artworkId,
              currentPosition: suggestion.currentPosition,
              suggestedPosition: suggestion.suggestedPosition,
              reason: suggestion.reason
            }))
          });
        }
      }

      // Style imbalance recommendations
      if (imbalances.styles.length > 0) {
        const styleSuggestions = this.suggestStyleReordering(artworks, imbalances.styles);
        if (styleSuggestions.length > 0) {
          recommendations.push({
            id: `balance_style_${catalogueId}`,
            type: 'reorder',
            priority: 'medium',
            title: 'Reorder for Style Balance',
            description: `Suggested reordering to balance style distribution: ${imbalances.styles.join(', ')}`,
            reason: 'Balanced style distribution creates cohesive narrative flow',
            impact: 30,
            suggestedChanges: styleSuggestions.map(suggestion => ({
              artworkId: suggestion.artworkId,
              currentPosition: suggestion.currentPosition,
              suggestedPosition: suggestion.suggestedPosition,
              reason: suggestion.reason
            }))
          });
        }
      }

      // Color imbalance recommendations
      if (imbalances.colors.length > 0) {
        const colorSuggestions = this.suggestColorReordering(artworks, imbalances.colors);
        if (colorSuggestions.length > 0) {
          recommendations.push({
            id: `balance_color_${catalogueId}`,
            type: 'reorder',
            priority: 'low',
            title: 'Reorder for Color Balance',
            description: `Suggested reordering to balance color distribution: ${imbalances.colors.join(', ')}`,
            reason: 'Balanced color distribution creates visual harmony',
            impact: 20,
            suggestedChanges: colorSuggestions.map(suggestion => ({
              artworkId: suggestion.artworkId,
              currentPosition: suggestion.currentPosition,
              suggestedPosition: suggestion.suggestedPosition,
              reason: suggestion.reason
            }))
          });
        }
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating balance recommendations:', error);
      return recommendations;
    }
  }

  private detectDetailedImbalances(balance: any): any {
    const imbalances = {
      mediums: [] as string[],
      prices: [] as string[],
      styles: [] as string[],
      colors: [] as string[]
    };

    // Detect medium imbalances (more than 40% of one medium)
    const totalArtworks = Object.values(balance.mediumDistribution).reduce((sum: number, count: unknown) => sum + (count as number), 0);
    Object.entries(balance.mediumDistribution).forEach(([medium, count]) => {
      const percentage = (count as number) / totalArtworks;
      if (percentage > 0.4) {
        imbalances.mediums.push(medium);
      }
    });

    // Detect price imbalances (more than 50% in one price range)
    const totalPriceArtworks = Object.values(balance.priceDistribution).reduce((sum: number, count: unknown) => sum + (count as number), 0);
    Object.entries(balance.priceDistribution).forEach(([range, count]) => {
      const percentage = (count as number) / totalPriceArtworks;
      if (percentage > 0.5) {
        imbalances.prices.push(range);
      }
    });

    // Detect style imbalances (more than 40% of one style)
    const totalStyleArtworks = Object.values(balance.styleDistribution).reduce((sum: number, count: unknown) => sum + (count as number), 0);
    Object.entries(balance.styleDistribution).forEach(([style, count]) => {
      const percentage = (count as number) / totalStyleArtworks;
      if (percentage > 0.4) {
        imbalances.styles.push(style);
      }
    });

    // Detect color imbalances (more than 30% of one color)
    const totalColorArtworks = Object.values(balance.colorDistribution).reduce((sum: number, count: unknown) => sum + (count as number), 0);
    Object.entries(balance.colorDistribution).forEach(([color, count]) => {
      const percentage = (count as number) / totalColorArtworks;
      if (percentage > 0.3) {
        imbalances.colors.push(color);
      }
    });

    return imbalances;
  }

  private suggestMediumReordering(artworks: any[], imbalances: string[]): any[] {
    const suggestions: any[] = [];
    
    // Group artworks by medium
    const mediumGroups: Record<string, any[]> = {};
    artworks.forEach(artwork => {
      if (!mediumGroups[artwork.medium]) {
        mediumGroups[artwork.medium] = [];
      }
      mediumGroups[artwork.medium].push(artwork);
    });

    // Find artworks that can be moved to balance distribution
    imbalances.forEach(imbalancedMedium => {
      const imbalancedArtworks = mediumGroups[imbalancedMedium] || [];
      if (imbalancedArtworks.length > 2) {
        // Suggest moving some artworks to different positions
        imbalancedArtworks.slice(2).forEach((artwork, index) => {
          const newPosition = Math.floor(artworks.length / 2) + index;
          suggestions.push({
            artworkId: artwork.id,
            currentPosition: artwork.position,
            suggestedPosition: newPosition,
            reason: `Move ${artwork.medium} artwork to balance distribution`
          });
        });
      }
    });

    return suggestions;
  }

  private suggestPriceReordering(artworks: any[], imbalances: string[]): any[] {
    const suggestions: any[] = [];
    
    // Sort artworks by price
    const sortedByPrice = [...artworks].sort((a, b) => (a.price || 0) - (b.price || 0));
    
    // Suggest alternating price ranges
    imbalances.forEach(imbalancedRange => {
      const rangeArtworks = artworks.filter(artwork => 
        this.getPriceRange(artwork.price) === imbalancedRange
      );
      
      if (rangeArtworks.length > 2) {
        rangeArtworks.slice(2).forEach((artwork, index) => {
          const newPosition = Math.floor(artworks.length / 3) + index;
          suggestions.push({
            artworkId: artwork.id,
            currentPosition: artwork.position,
            suggestedPosition: newPosition,
            reason: `Move ${imbalancedRange} artwork to balance price distribution`
          });
        });
      }
    });

    return suggestions;
  }

  private suggestStyleReordering(artworks: any[], imbalances: string[]): any[] {
    const suggestions: any[] = [];
    
    imbalances.forEach(imbalancedStyle => {
      const styleArtworks = artworks.filter(artwork => artwork.genre === imbalancedStyle);
      
      if (styleArtworks.length > 2) {
        // Suggest spreading style artworks throughout the catalogue
        styleArtworks.slice(2).forEach((artwork, index) => {
          const newPosition = Math.floor(artworks.length / (styleArtworks.length + 1)) * (index + 1);
          suggestions.push({
            artworkId: artwork.id,
            currentPosition: artwork.position,
            suggestedPosition: newPosition,
            reason: `Spread ${imbalancedStyle} artworks throughout catalogue`
          });
        });
      }
    });

    return suggestions;
  }

  private suggestColorReordering(artworks: any[], imbalances: string[]): any[] {
    const suggestions: any[] = [];
    
    imbalances.forEach(imbalancedColor => {
      const colorArtworks = artworks.filter(artwork => 
        artwork.dominant_colors && artwork.dominant_colors.includes(imbalancedColor)
      );
      
      if (colorArtworks.length > 2) {
        // Suggest spacing out color artworks
        colorArtworks.slice(2).forEach((artwork, index) => {
          const newPosition = Math.floor(artworks.length / (colorArtworks.length + 1)) * (index + 1);
          suggestions.push({
            artworkId: artwork.id,
            currentPosition: artwork.position,
            suggestedPosition: newPosition,
            reason: `Space out ${imbalancedColor} artworks for visual balance`
          });
        });
      }
    });

    return suggestions;
  }

  private async generateSizeRecommendations(
    catalogueId: string,
    maxArtworks: number
  ): Promise<CurationRecommendation[]> {
    const recommendations: CurationRecommendation[] = [];
    
    try {
      // Get current catalogue size
      const { data: catalogueArtworks } = await supabase
        .from('catalogue_artworks')
        .select('artwork_id')
        .eq('catalogue_id', catalogueId);

      const currentSize = catalogueArtworks?.length || 0;
      
      // Get optimal size based on catalogue type and market data
      const optimalSize = await this.getOptimalCatalogueSize(catalogueId);
      
      // Analyze size recommendations
      if (currentSize < optimalSize.min) {
        // Suggest adding artworks
        const { data: catalogue } = await supabase
          .from('catalogues')
          .select('user_id')
          .eq('id', catalogueId)
          .single();
        
        if (catalogue) {
          const { data: availableArtworks } = await supabase
            .from('artworks')
            .select('id, title, medium, genre, price, dominant_colors, dimensions')
            .eq('user_id', catalogue.user_id)
            .eq('status', 'available')
            .not('id', 'in', `(${await this.getCatalogueArtworkIds(catalogueId)})`);

          if (availableArtworks && availableArtworks.length > 0) {
            const artworksToAdd = Math.min(
              optimalSize.min - currentSize,
              availableArtworks.length,
              10 // Max 10 suggestions
            );

            recommendations.push({
              id: `size_add_${catalogueId}`,
              type: 'add_artwork',
              priority: 'high',
              title: 'Add Artworks to Reach Optimal Size',
              description: `Catalogue has ${currentSize} artworks, optimal range is ${optimalSize.min}-${optimalSize.max}. Add ${artworksToAdd} more artworks.`,
              reason: 'Optimal catalogue size improves engagement and professional presentation',
              impact: 40,
              suggestedArtworks: availableArtworks.slice(0, artworksToAdd).map(artwork => ({
                id: artwork.id,
                title: artwork.title,
                reason: `Adds to reach optimal catalogue size of ${optimalSize.min}-${optimalSize.max} artworks`
              }))
            });
          }
        }
      } else if (currentSize > optimalSize.max) {
        // Suggest removing artworks
        const { data: catalogueArtworksWithDetails } = await supabase
          .from('catalogue_artworks')
          .select(`
            artwork_id,
            position,
            artworks!inner(
              id,
              title,
              medium,
              genre,
              price,
              views_count,
              likes_count,
              inquiries_count
            )
          `)
          .eq('catalogue_id', catalogueId)
          .order('position');

        if (catalogueArtworksWithDetails && catalogueArtworksWithDetails.length > 0) {
          const artworksToRemove = currentSize - optimalSize.max;
          
          // Find least performing artworks to suggest for removal
          const sortedArtworks = catalogueArtworksWithDetails
            .map(ca => ({
              ...ca.artworks,
              position: ca.position,
              performanceScore: this.calculateArtworkPerformance(ca.artworks)
            }))
            .sort((a, b) => a.performanceScore - b.performanceScore);

          const artworksToSuggestRemoval = sortedArtworks.slice(0, artworksToRemove);

          recommendations.push({
            id: `size_remove_${catalogueId}`,
            type: 'remove_artwork',
            priority: 'medium',
            title: 'Remove Artworks to Reach Optimal Size',
            description: `Catalogue has ${currentSize} artworks, optimal range is ${optimalSize.min}-${optimalSize.max}. Remove ${artworksToRemove} artworks.`,
            reason: 'Optimal catalogue size prevents overwhelming viewers and maintains focus',
            impact: 30,
            suggestedArtworks: artworksToSuggestRemoval.map((artwork: any) => ({
              id: artwork.id,
              title: artwork.title,
              reason: `Lowest performing artwork (score: ${artwork.performanceScore.toFixed(1)})`
            }))
          });
        }
      } else {
        // Size is optimal, suggest maintaining
        recommendations.push({
          id: `size_maintain_${catalogueId}`,
          type: 'maintain',
          priority: 'low',
          title: 'Catalogue Size is Optimal',
          description: `Current size of ${currentSize} artworks is within optimal range of ${optimalSize.min}-${optimalSize.max}.`,
          reason: 'Current catalogue size provides good balance for engagement and presentation',
          impact: 0
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating size recommendations:', error);
      return recommendations;
    }
  }

  private async getOptimalCatalogueSize(catalogueId: string): Promise<{ min: number; max: number; ideal: number }> {
    try {
      // Get catalogue type and artist data
      const { data: catalogue } = await supabase
        .from('catalogues')
        .select(`
          catalogue_type,
          user_id,
          profiles!inner(
            role,
            experience_level
          )
        `)
        .eq('id', catalogueId)
        .single();

      if (!catalogue) {
        return { min: 8, max: 15, ideal: 12 }; // Default
      }

      // Get market data for similar catalogues
      const { data: similarCatalogues } = await supabase
        .from('catalogues')
        .select(`
          id,
          catalogue_type,
          catalogue_artworks(count)
        `)
        .eq('catalogue_type', catalogue.catalogue_type)
        .eq('is_public', true)
        .limit(100);

      if (similarCatalogues && similarCatalogues.length > 0) {
        // Calculate average size from similar catalogues
        const sizes = similarCatalogues
          .map(cat => cat.catalogue_artworks?.[0]?.count || 0)
          .filter(size => size > 0);
        
        if (sizes.length > 0) {
          const avgSize = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;
          const minSize = Math.max(6, Math.floor(avgSize * 0.7));
          const maxSize = Math.min(25, Math.ceil(avgSize * 1.3));
          const idealSize = Math.round(avgSize);
          
          return { min: minSize, max: maxSize, ideal: idealSize };
        }
      }

      // Fallback based on catalogue type and artist experience
      const baseSize = this.getBaseSizeForType(catalogue.catalogue_type);
      const experienceMultiplier = this.getExperienceMultiplier(catalogue.profiles?.[0]?.experience_level);
      
      const minSize = Math.max(6, Math.floor(baseSize * experienceMultiplier * 0.8));
      const maxSize = Math.min(25, Math.ceil(baseSize * experienceMultiplier * 1.2));
      const idealSize = Math.round(baseSize * experienceMultiplier);
      
      return { min: minSize, max: maxSize, ideal: idealSize };
    } catch (error) {
      console.error('Error getting optimal catalogue size:', error);
      return { min: 8, max: 15, ideal: 12 }; // Default
    }
  }

  private getBaseSizeForType(catalogueType: string): number {
    const typeSizes: Record<string, number> = {
      'showcase': 12,
      'portfolio': 15,
      'exhibition': 20,
      'collection': 10,
      'series': 8,
      'mixed': 12
    };
    
    return typeSizes[catalogueType] || 12;
  }

  private getExperienceMultiplier(experienceLevel: string): number {
    const multipliers: Record<string, number> = {
      'beginner': 0.8,
      'intermediate': 1.0,
      'advanced': 1.2,
      'expert': 1.4
    };
    
    return multipliers[experienceLevel] || 1.0;
  }

  private calculateArtworkPerformance(artwork: any): number {
    // Calculate performance score based on engagement metrics
    const views = artwork.views_count || 0;
    const likes = artwork.likes_count || 0;
    const inquiries = artwork.inquiries_count || 0;
    
    // Weighted performance score
    const score = (views * 0.1) + (likes * 0.3) + (inquiries * 0.6);
    
    return score;
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
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
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