import { supabase } from '@/lib/supabase';

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

      const preferenceVector = this.createPreferenceVector(userPrefs.learned_preferences);

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
    const mockPreferences = {
      mediums: { 'Oil on Canvas': 0.8, 'Acrylic': 0.6, 'Watercolor': 0.4 },
      styles: { 'Abstract': 0.7, 'Realistic': 0.5, 'Contemporary': 0.6 },
      colors: { 'Blue': 0.8, 'Red': 0.6, 'Green': 0.4 },
      priceRanges: { '1000-5000': 0.7, '5000-10000': 0.5 },
      artists: {},
      subjects: { 'Landscape': 0.6, 'Portrait': 0.4 },
      genres: { 'Fine Art': 0.8, 'Photography': 0.3 }
    };

    for (const [category, values] of Object.entries(mockPreferences)) {
      for (const [key, value] of Object.entries(values)) {
        if (!preferences[category][key]) {
          preferences[category][key] = 0;
        }
        preferences[category][key] += value * weightedValue;
      }
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

  private createPreferenceVector(preferences: any): number[] {
    const vector = [];
    
    const mediums = ['Oil on Canvas', 'Acrylic', 'Watercolor', 'Digital', 'Photography', 'Sculpture'];
    for (const medium of mediums) {
      vector.push(preferences.mediums[medium] || 0);
    }
    
    const styles = ['Abstract', 'Realistic', 'Contemporary', 'Traditional', 'Minimalist'];
    for (const style of styles) {
      vector.push(preferences.styles[style] || 0);
    }
    
    const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Black', 'White'];
    for (const color of colors) {
      vector.push(preferences.colors[color] || 0);
    }
    
    return vector;
  }
}

export const learningLoops = new LearningLoopsService();