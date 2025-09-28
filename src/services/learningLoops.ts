import { supabase } from '../lib/supabase';

export interface LearningSignal {
  userId: string;
  signalType: 'view' | 'like' | 'dislike' | 'share' | 'inquiry' | 'purchase' | 'follow' | 'unfollow';
  entityType: 'artwork' | 'artist' | 'catalogue';
  entityId: string;
  timestamp: string;
  metadata?: any;
  weight: number;
}

export interface LearnedPreferences {
  userId: string;
  preferences: {
    mediums: Record<string, number>;
    styles: Record<string, number>;
    colors: Record<string, number>;
    priceRanges: Record<string, number>;
    artists: Record<string, number>;
    subjects: Record<string, number>;
    genres: Record<string, number>;
  };
  lastUpdated: string;
  confidence: number;
}

class LearningLoopsService {
  async recordSignal(signal: Omit<LearningSignal, 'weight'>): Promise<void> {
    try {
      const weight = this.calculateSignalWeight(signal);
      
      await supabase
        .from('learning_signals')
        .insert({
          user_id: signal.userId,
          signal_type: signal.signalType,
          entity_type: signal.entityType,
          entity_id: signal.entityId,
          timestamp: signal.timestamp,
          metadata: signal.metadata || {},
          weight
        });
    } catch (error) {
      console.error('Error recording learning signal:', error);
      throw error;
    }
  }

  async runLearningLoop(): Promise<void> {
    try {
      console.log('Starting nightly learning loop...');
      
      const { data: users, error: usersError } = await supabase
        .from('user_preferences')
        .select('user_id')
        .eq('learning_enabled', true);

      if (usersError) throw usersError;

      for (const user of users || []) {
        await this.recomputeUserPreferences(user.user_id);
      }

      console.log('Learning loop completed successfully');
    } catch (error) {
      console.error('Error in learning loop:', error);
      throw error;
    }
  }

  async recomputeUserPreferences(userId: string): Promise<LearnedPreferences> {
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: signals, error } = await supabase
        .from('learning_signals')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', ninetyDaysAgo.toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      const preferences = this.calculateDecayWeightedPreferences(signals || []);

      await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          learned_preferences: preferences,
          updated_at: new Date().toISOString()
        });

      return {
        userId,
        preferences,
        lastUpdated: new Date().toISOString(),
        confidence: this.calculateConfidence(signals?.length || 0)
      };
    } catch (error) {
      console.error('Error recomputing user preferences:', error);
      throw error;
    }
  }

  async getVectorRecommendations(
    userId: string,
    entityType: 'artwork' | 'artist' | 'catalogue',
    limit: number = 20
  ): Promise<any[]> {
    try {
      const { data: userPrefs } = await supabase
        .from('user_preferences')
        .select('learned_preferences')
        .eq('user_id', userId)
        .single();

      if (!userPrefs?.learned_preferences) {
        return [];
      }

      const preferenceVector = await this.createPreferenceVector(userPrefs.learned_preferences);

      const { data, error } = await supabase.rpc('get_vector_recommendations', {
        user_id: userId,
        entity_type: entityType,
        preference_vector: preferenceVector,
        match_threshold: 0.7,
        match_count: limit
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting vector recommendations:', error);
      throw error;
    }
  }

  private calculateSignalWeight(signal: Omit<LearningSignal, 'weight'>): number {
    const weights = {
      view: 0.1,
      like: 0.3,
      dislike: -0.2,
      share: 0.4,
      inquiry: 0.6,
      purchase: 1.0,
      follow: 0.2,
      unfollow: -0.1
    };

    return weights[signal.signalType] || 0;
  }

  private calculateDecayWeightedPreferences(signals: any[]): any {
    const now = new Date();
    const preferences = {
      mediums: {},
      styles: {},
      colors: {},
      priceRanges: {},
      artists: {},
      subjects: {},
      genres: {}
    };

    for (const signal of signals) {
      const ageInDays = (now.getTime() - new Date(signal.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      const decayFactor = Math.exp(-ageInDays / 30);
      const weightedValue = signal.weight * decayFactor;

      this.updatePreferencesFromSignal(preferences, signal, weightedValue);
    }

    return this.normalizePreferences(preferences);
  }

  private updatePreferencesFromSignal(preferences: any, signal: any, weightedValue: number): void {
    try {
      // Update preferences based on actual user behavior signals
      const signalType = signal.type
      const signalData = signal.data

      switch (signalType) {
        case 'artwork_view':
          if (signalData.medium) {
            preferences.mediums[signalData.medium] = (preferences.mediums[signalData.medium] || 0) + weightedValue
          }
          if (signalData.genre) {
            preferences.genres[signalData.genre] = (preferences.genres[signalData.genre] || 0) + weightedValue
          }
          if (signalData.colors && signalData.colors.length > 0) {
            signalData.colors.forEach((color: string) => {
              preferences.colors[color] = (preferences.colors[color] || 0) + weightedValue
            })
          }
          break

        case 'artwork_like':
          if (signalData.artist_id) {
            preferences.artists[signalData.artist_id] = (preferences.artists[signalData.artist_id] || 0) + weightedValue * 2
          }
          if (signalData.subject) {
            preferences.subjects[signalData.subject] = (preferences.subjects[signalData.subject] || 0) + weightedValue * 1.5
          }
          break

        case 'price_inquiry':
          if (signalData.price_range) {
            preferences.priceRanges[signalData.price_range] = (preferences.priceRanges[signalData.price_range] || 0) + weightedValue * 1.5
          }
          break

        case 'search_query':
          if (signalData.query) {
            // Extract keywords from search query and update relevant preferences
            const keywords = signalData.query.toLowerCase().split(' ')
            keywords.forEach((keyword: string) => {
              if (keyword.length > 2) {
                // This could be enhanced with more sophisticated keyword analysis
                preferences.searchTerms = preferences.searchTerms || {}
                preferences.searchTerms[keyword] = (preferences.searchTerms[keyword] || 0) + weightedValue * 0.5
              }
            })
          }
          break
      }
    } catch (error) {
      console.error('Error updating preferences from signal:', error)
    }
  }

  private normalizePreferences(preferences: any): any {
    const normalized = {};
    
    for (const [category, values] of Object.entries(preferences)) {
      normalized[category] = {};
      const total = Object.values(values as Record<string, number>).reduce((sum: number, val: number) => sum + val, 0);
      
      if (total > 0) {
        for (const [key, value] of Object.entries(values as Record<string, number>)) {
          normalized[category][key] = value / total;
        }
      }
    }

    return normalized;
  }

  private calculateConfidence(signalCount: number): number {
    if (signalCount >= 100) return 0.9;
    if (signalCount >= 50) return 0.7;
    if (signalCount >= 20) return 0.5;
    if (signalCount >= 10) return 0.3;
    return 0.1;
  }

  private async createPreferenceVector(preferences: any): Promise<number[]> {
    const vector: number[] = [];
    
    try {
      // Get dynamic mediums from database
      const { data: mediumData } = await supabase
        .from('artworks')
        .select('medium')
        .not('medium', 'is', null)
        .limit(1000);
      
      const uniqueMediums = [...new Set(mediumData?.map(item => item.medium).filter(Boolean))];
      
      for (const medium of uniqueMediums) {
        vector.push(preferences.mediums?.[medium] || 0);
      }
      
      // Get dynamic styles from database
      const { data: styleData } = await supabase
        .from('artworks')
        .select('style')
        .not('style', 'is', null)
        .limit(1000);
      
      const uniqueStyles = [...new Set(styleData?.map(item => item.style).filter(Boolean))];
      
      for (const style of uniqueStyles) {
        vector.push(preferences.styles?.[style] || 0);
      }
      
      // Get dynamic colors from database
      const { data: colorData } = await supabase
        .from('artworks')
        .select('dominant_colors')
        .not('dominant_colors', 'is', null)
        .limit(1000);
      
      const allColors = colorData?.flatMap(item => 
        Array.isArray(item.dominant_colors) ? item.dominant_colors : []
      ).filter(Boolean) || [];
      
      const uniqueColors = [...new Set(allColors)];
      
      for (const color of uniqueColors) {
        vector.push(preferences.colors?.[color] || 0);
      }
      
      return vector;
    } catch (error) {
      console.error('Error creating preference vector:', error);
      return [];
    }
  }
}

export const learningLoops = new LearningLoopsService();