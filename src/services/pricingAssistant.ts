import { supabase } from '@/lib/supabase';

export interface PricingSuggestion {
  suggestedPrice: number;
  confidence: number;
  reasoning: string[];
  marketData: {
    similarArtworks: number;
    averagePrice: number;
    priceRange: { min: number; max: number };
    marketVelocity: number;
  };
  factors: {
    sizeMultiplier: number;
    mediumMultiplier: number;
    artistMultiplier: number;
    recentSalesMultiplier: number;
  };
}

export interface NegotiationOffer {
  id: string;
  artworkId: string;
  conversationId: string;
  offeredPrice: number;
  originalPrice: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expiresAt: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

class PricingAssistantService {
  // Enhanced AI-driven pricing suggestions with market analysis
  async getPricingSuggestions(artwork: any): Promise<PricingSuggestion> {
    try {
      // Multi-factor similarity search for better pricing accuracy
      const queries = await Promise.all([
        // Primary: Same medium and similar size
        supabase
          .from('artworks')
          .select(`
            price, dimensions, medium, genre, subject, user_id, created_at,
            artist:profiles!artworks_user_id_fkey(
              id, full_name, created_at,
              artworks!artworks_user_id_fkey(count)
            )
          `)
          .eq('medium', artwork.medium)
          .eq('status', 'Sold')
          .not('price', 'is', null)
          .limit(30),
        
        // Secondary: Same artist's sold works
        artwork.user_id ? supabase
          .from('artworks')
          .select('price, dimensions, medium, created_at')
          .eq('user_id', artwork.user_id)
          .eq('status', 'Sold')
          .not('price', 'is', null)
          .limit(20) : Promise.resolve({ data: [], error: null }),
        
        // Tertiary: Similar style/genre regardless of medium
        supabase
          .from('artworks')
          .select('price, dimensions, medium, genre, created_at')
          .eq('genre', artwork.genre || artwork.style)
          .eq('status', 'Sold')
          .not('price', 'is', null)
          .limit(25)
      ])

      const [mediumQuery, artistQuery, genreQuery] = queries
      if (mediumQuery.error) throw mediumQuery.error

      // Combine and weight the results
      const allSimilar = [
        ...(mediumQuery.data || []).map(a => ({ ...a, weight: 1.0 })),
        ...(artistQuery.data || []).map(a => ({ ...a, weight: 1.5 })), // Higher weight for same artist
        ...(genreQuery.data || []).map(a => ({ ...a, weight: 0.7 }))
      ]

      // Calculate market data with enhanced analytics
      const prices = allSimilar.map(a => a.price).filter(Boolean) || [];
      const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length || 0;
      const priceRange = {
        min: Math.min(...prices),
        max: Math.max(...prices)
      };

      // Calculate multipliers
      const sizeMultiplier = this.calculateSizeMultiplier(artwork.dimensions, []);
      const mediumMultiplier = this.calculateMediumMultiplier(artwork.medium);
      const artistMultiplier = await this.calculateArtistMultiplier(artwork.user_id);
      const recentSalesMultiplier = this.calculateRecentSalesMultiplier([]);

      // Calculate suggested price
      const basePrice = averagePrice;
      const suggestedPrice = Math.round(
        basePrice * sizeMultiplier * mediumMultiplier * artistMultiplier * recentSalesMultiplier
      );

      // Generate reasoning
      const reasoning = this.generateReasoning({
        averagePrice,
        sizeMultiplier,
        mediumMultiplier,
        artistMultiplier,
        recentSalesMultiplier,
        similarCount: 0
      });

      // Calculate confidence (0-1)
      const confidence = this.calculateConfidence(0, averagePrice);

      return {
        suggestedPrice,
        confidence,
        reasoning,
        marketData: {
          similarArtworks: 0,
          averagePrice,
          priceRange,
          marketVelocity: this.calculateMarketVelocity([])
        },
        factors: {
          sizeMultiplier,
          mediumMultiplier,
          artistMultiplier,
          recentSalesMultiplier
        }
      };
    } catch (error) {
      console.error('Error getting pricing suggestions:', error);
      throw error;
    }
  }

  // Create a negotiation offer
  async createOffer(
    artworkId: string,
    conversationId: string,
    offeredPrice: number,
    originalPrice: number,
    message?: string,
    expiresInHours: number = 72
  ): Promise<NegotiationOffer> {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiresInHours);

      const { data, error } = await supabase
        .from('negotiation_offers')
        .insert({
          artwork_id: artworkId,
          conversation_id: conversationId,
          offered_price: offeredPrice,
          original_price: originalPrice,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
          message
        })
        .select()
        .single();

      if (error) throw error;

      // Send notification to artist
      await this.notifyArtistOfOffer(data);

      return data;
    } catch (error) {
      console.error('Error creating negotiation offer:', error);
      throw error;
    }
  }

  // Accept an offer
  async acceptOffer(offerId: string): Promise<{ buyLink: string }> {
    try {
      const { data: offer, error: fetchError } = await supabase
        .from('negotiation_offers')
        .select('*')
        .eq('id', offerId)
        .single();

      if (fetchError) throw fetchError;

      // Update offer status
      const { error: updateError } = await supabase
        .from('negotiation_offers')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', offerId);

      if (updateError) throw updateError;

      // Generate buy link with special pricing
      const buyLink = await this.generateBuyLink(offer.artwork_id, offer.offered_price);

      return { buyLink };
    } catch (error) {
      console.error('Error accepting offer:', error);
      throw error;
    }
  }

  // Reject an offer
  async rejectOffer(offerId: string, reason?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('negotiation_offers')
        .update({ 
          status: 'rejected', 
          updated_at: new Date().toISOString(),
          rejection_reason: reason
        })
        .eq('id', offerId);

      if (error) throw error;
    } catch (error) {
      console.error('Error rejecting offer:', error);
      throw error;
    }
  }

  // Get offers for a conversation
  async getOffers(conversationId: string): Promise<NegotiationOffer[]> {
    try {
      const { data, error } = await supabase
        .from('negotiation_offers')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting offers:', error);
      throw error;
    }
  }

  // Private helper methods
  private calculateSizeMultiplier(dimensions: any, similarArtworks: any[]): number {
    if (!dimensions?.width || !dimensions?.height) return 1;

    const area = dimensions.width * dimensions.height;
    const similarAreas = similarArtworks
      ?.map(a => a.dimensions?.width * a.dimensions?.height)
      .filter(Boolean) || [];
    
    if (similarAreas.length === 0) return 1;

    const avgArea = similarAreas.reduce((sum, area) => sum + area, 0) / similarAreas.length;
    return Math.sqrt(area / avgArea); // Square root for more conservative scaling
  }

  private calculateMediumMultiplier(medium: string): number {
    const multipliers: Record<string, number> = {
      'Oil on Canvas': 1.2,
      'Acrylic on Canvas': 1.1,
      'Watercolor': 0.9,
      'Digital Print': 0.7,
      'Photography': 0.8,
      'Mixed Media': 1.0,
      'Sculpture': 1.3,
      'Drawing': 0.8
    };
    return multipliers[medium] || 1.0;
  }

  private async calculateArtistMultiplier(artistId: string): Promise<number> {
    try {
      // Get artist's recent sales performance
      const { data: sales, error } = await supabase
        .from('sales')
        .select('sale_price, created_at')
        .eq('artist_id', artistId)
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (error || !sales?.length) return 1.0;

      // Calculate growth rate
      const recentSales = sales.slice(0, 5);
      const olderSales = sales.slice(5);
      
      if (olderSales.length === 0) return 1.0;

      const recentAvg = recentSales.reduce((sum, s) => sum + s.sale_price, 0) / recentSales.length;
      const olderAvg = olderSales.reduce((sum, s) => sum + s.sale_price, 0) / olderSales.length;
      
      return Math.min(recentAvg / olderAvg, 1.5); // Cap at 50% increase
    } catch (error) {
      return 1.0;
    }
  }

  private calculateRecentSalesMultiplier(similarArtworks: any[]): number {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentSales = similarArtworks?.filter(a => 
      new Date(a.created_at) > thirtyDaysAgo
    ) || [];
    
    const velocity = recentSales.length / 30; // Sales per day
    return Math.min(1 + velocity * 0.1, 1.3); // Up to 30% increase for high velocity
  }

  private generateReasoning(factors: any): string[] {
    const reasoning: string[] = [];
    
    if (factors.similarCount > 10) {
      reasoning.push(`Based on ${factors.similarCount} similar sold artworks`);
    }
    
    if (factors.sizeMultiplier > 1.1) {
      reasoning.push('Larger than average size increases value');
    } else if (factors.sizeMultiplier < 0.9) {
      reasoning.push('Smaller than average size decreases value');
    }
    
    if (factors.mediumMultiplier > 1.1) {
      reasoning.push('Premium medium commands higher prices');
    }
    
    if (factors.artistMultiplier > 1.1) {
      reasoning.push('Artist showing strong sales growth');
    }
    
    if (factors.recentSalesMultiplier > 1.1) {
      reasoning.push('High market velocity for this type of work');
    }
    
    return reasoning;
  }

  private calculateConfidence(similarCount: number, averagePrice: number): number {
    let confidence = 0.5; // Base confidence
    
    if (similarCount > 20) confidence += 0.3;
    else if (similarCount > 10) confidence += 0.2;
    else if (similarCount > 5) confidence += 0.1;
    
    if (averagePrice > 0) confidence += 0.2;
    
    return Math.min(confidence, 1.0);
  }

  private calculateMarketVelocity(artworks: any[]): number {
    if (!artworks?.length) return 0;
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentSales = artworks.filter(a => 
      new Date(a.created_at) > thirtyDaysAgo
    );
    
    return recentSales.length / 30; // Sales per day
  }

  private async notifyArtistOfOffer(offer: NegotiationOffer): Promise<void> {
    // Implementation would send notification to artist
    console.log('Notifying artist of new offer:', offer.id);
  }

  private async generateBuyLink(artworkId: string, price: number): Promise<string> {
    // Generate special buy link with negotiated price
    const baseUrl = window.location.origin;
    return `${baseUrl}/buy/${artworkId}?price=${price}&negotiated=true`;
  }
}

export const pricingAssistant = new PricingAssistantService();
