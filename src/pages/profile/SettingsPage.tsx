// Enhanced Collector Settings Page with AI Intelligence
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthProvider';
import Container from "../../brush/components/forms/Container";
import Toggle from '../../components/common/Toggle';
import LivePreferenceControls from '../../components/common/LivePreferenceControls';
import { logger, useLogger } from '../../services/logger';
import { 
  Trash2, User, Lock, Shield, Mail, Clock, Bell, Brain, Palette, 
  TrendingUp, BarChart3, Download, Camera, Eye, Heart, ShoppingBag,
  Target, Sparkles, Zap, Globe, FileText, HelpCircle, LogOut
} from 'lucide-react';
import type { 
  UserPreferences, 
  LearnedPreferences, 
  LivePreferences,
  NotificationEntityTypeSettings,
  Profile 
} from '../../types';

// --- Type Definitions ---

// Notification type settings within JSONB (e.g., artwork: true, artist: false)
interface NotificationEntityTypeSettings {
  artwork: boolean;
  artist: boolean;
  catalogue: boolean;
}

// Learned budget range structure (from learned_preferences)
interface LearnedBudgetRange {
  min: number;
  max: number;
  confidence?: string;
}

// Enhanced LearnedPreferences with all AI insights
interface LearnedPreferences {
  top_liked_mediums?: { name: string; count: number; confidence: number }[];
  top_liked_styles?: { name: string; count: number; confidence: number }[];
  preferred_price_range_from_behavior?: LearnedBudgetRange;
  overall_engagement_score?: number;
  
  // Color Intelligence
  color_preferences?: Array<{ 
    color: string; 
    hex: string; 
    oklch: any; 
    frequency: number;
    confidence: number;
  }>;
  
  // Behavioral Patterns
  behavioral_patterns?: {
    peak_browsing_hours: string[];
    session_duration_avg: number;
    decision_speed: 'fast' | 'moderate' | 'slow';
    research_depth: 'surface' | 'moderate' | 'deep';
    price_sensitivity: number;
    social_influence_factor: number;
  };
  
  // AI Performance Metrics
  ai_performance?: {
    recommendation_accuracy: number;
    discovery_success_rate: number;
    total_interactions: number;
    learning_velocity: number;
    exploration_rate: number;
    last_updated: string;
  };
  
  // Market Intelligence
  market_intelligence?: {
    collection_gaps: string[];
    investment_opportunities: Array<{ 
      artist: string; 
      confidence: number; 
      reasoning: string;
      potential_return: number;
    }>;
    optimal_buying_times: string[];
    budget_optimization_suggestions: string[];
  };
  
  // Negative Preferences
  negative_preferences?: {
    disliked_mediums?: string[];
    disliked_styles?: string[];
    disliked_colors?: string[];
    rejected_artists?: string[];
  };
  
  top_followed_artists?: { artist_id: string; full_name: string }[];
  last_learned_update?: string;
  [key: string]: any;
}

// Full UserPreferences structure
interface UserPreferences {
  user_id: string;
  preferred_mediums: string[] | null;
  preferred_styles: string[] | null;
  min_budget: number | null;
  max_budget: number | null;
  use_learned_budget: boolean | null;
  learned_preferences: LearnedPreferences | null;
  live_preferences: LivePreferences | null;
  
  // Enhanced notification settings
  notification_real_time: NotificationEntityTypeSettings | null;
  notification_daily: NotificationEntityTypeSettings | null;
  notification_weekly: NotificationEntityTypeSettings | null;
  
  // Granular alert lists & exclusion filters
  alert_specific_artists: string[] | null;
  alert_specific_mediums: string[] | null;
  alert_specific_styles: string[] | null;
  exclude_mediums: string[] | null;
  exclude_styles: string[] | null;
  exclude_artists: string[] | null;
  
  // Enhanced notification preferences
  notify_by_email: boolean | null;
  notify_price_drops: boolean | null;
  notify_new_works: boolean | null;
  notify_auction_reminders: boolean | null;
  notify_collection_insights: boolean | null;
  preferred_digest_time: string | null;

  updated_at: string;
}

// --- Modals ---
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  isDestructive?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen, onClose, onConfirm, title, message, confirmText, cancelText = 'Cancel', isDestructive = false
}) => {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <h3 style={{ 
          color: isDestructive ? '#ef4444' : 'var(--fg)',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {isDestructive && <Shield size={20} />}
          {title}
        </h3>
        <p style={{ marginBottom: '1.5rem', lineHeight: '1.5' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="button button-secondary" onClick={onClose}>{cancelText}</button>
          <button 
            className={`button ${isDestructive ? 'button-danger' : 'button-primary'}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Enhanced Collector Settings Page ---
const EnhancedCollectorSettingsPage: React.FC = () => {
  const { user, profile, signOut, updateProfile } = useAuth();
  const queryClient = useQueryClient();
  const componentLogger = useLogger('EnhancedCollectorSettingsPage');
  const [activeTab, setActiveTab] = useState<'account' | 'ai-intelligence' | 'notifications' | 'preferences' | 'security'>('account');

  // --- Account Tab States ---
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // --- AI Intelligence States ---
  const [livePreferences, setLivePreferences] = useState<LivePreferences>();

  // --- Preferences Tab States ---
  const [preferredMediums, setPreferredMediums] = useState('');
  const [preferredStyles, setPreferredStyles] = useState('');
  const [useLearnedBudget, setUseLearnedBudget] = useState(false);
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  
  // Specific alert lists
  const [alertSpecificArtists, setAlertSpecificArtists] = useState('');
  const [alertSpecificMediums, setAlertSpecificMediums] = useState('');
  const [alertSpecificStyles, setAlertSpecificStyles] = useState('');
  
  // Exclusion filters
  const [excludeMediums, setExcludeMediums] = useState('');
  const [excludeStyles, setExcludeStyles] = useState('');
  const [excludeArtists, setExcludeArtists] = useState('');

  // --- Enhanced Notification Settings ---
  const [realTimeSettings, setRealTimeSettings] = useState<NotificationEntityTypeSettings>({ 
    artwork: true, artist: true, catalogue: true 
  });
  const [dailySettings, setDailySettings] = useState<NotificationEntityTypeSettings>({ 
    artwork: false, artist: false, catalogue: false 
  });
  const [weeklySettings, setWeeklySettings] = useState<NotificationEntityTypeSettings>({ 
    artwork: false, artist: false, catalogue: false 
  });
  const [notifyByEmail, setNotifyByEmail] = useState(true);
  const [notifyPriceDrops, setNotifyPriceDrops] = useState(true);
  const [notifyNewWorks, setNotifyNewWorks] = useState(true);
  const [notifyAuctionReminders, setNotifyAuctionReminders] = useState(false);
  const [notifyCollectionInsights, setNotifyCollectionInsights] = useState(true);
  const [preferredDigestTime, setPreferredDigestTime] = useState("08:00");

  // --- Modals State ---
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showClearLearnedDataConfirm, setShowClearLearnedDataConfirm] = useState(false);
  const [showResetPreferencesConfirm, setShowResetPreferencesConfirm] = useState(false);

  // --- Data Fetching (User Preferences) ---
  const { data: preferences, isLoading } = useQuery<UserPreferences | null, Error>({
    queryKey: ['userPreferences', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data: existingPrefs, error: fetchError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (fetchError && fetchError.code === 'PGRST116') {
        // If preferences don't exist, create default ones
        const { data: newPrefs, error: insertError } = await supabase
          .from('user_preferences')
          .insert({ 
            user_id: user.id,
            preferred_mediums: [],
            preferred_styles: [],
            notification_real_time: { artwork: true, artist: true, catalogue: true },
            notification_daily: { artwork: false, artist: false, catalogue: false },
            notification_weekly: { artwork: false, artist: false, catalogue: false },
            notify_by_email: true,
            notify_price_drops: true,
            notify_new_works: true,
            notify_collection_insights: true,
            preferred_digest_time: "08:00"
          })
          .select('*')
          .single();
        if (insertError) throw insertError;
        return newPrefs;
      }
      if (fetchError) throw fetchError;
      return existingPrefs;
    },
    enabled: !!user,
  });

  // --- Populate States from Fetched Preferences ---
  useEffect(() => {
    if (preferences) {
      // General preferences
      setPreferredMediums((preferences.preferred_mediums || []).join(', '));
      setPreferredStyles((preferences.preferred_styles || []).join(', '));
      setMinBudget(preferences.min_budget?.toString() || '');
      setMaxBudget(preferences.max_budget?.toString() || '');
      setUseLearnedBudget(preferences.use_learned_budget ?? false);

      // Live preferences
      setLivePreferences(preferences.live_preferences || undefined);

      // Enhanced notification settings
      setRealTimeSettings(preferences.notification_real_time || { artwork: true, artist: true, catalogue: true });
      setDailySettings(preferences.notification_daily || { artwork: false, artist: false, catalogue: false });
      setWeeklySettings(preferences.notification_weekly || { artwork: false, artist: false, catalogue: false });
      setNotifyByEmail(preferences.notify_by_email ?? true);
      setNotifyPriceDrops(preferences.notify_price_drops ?? true);
      setNotifyNewWorks(preferences.notify_new_works ?? true);
      setNotifyAuctionReminders(preferences.notify_auction_reminders ?? false);
      setNotifyCollectionInsights(preferences.notify_collection_insights ?? true);
      setPreferredDigestTime(preferences.preferred_digest_time || "08:00");

      // Specific alert lists & exclusion filters
      setAlertSpecificArtists((preferences.alert_specific_artists || []).join(', '));
      setAlertSpecificMediums((preferences.alert_specific_mediums || []).join(', '));
      setAlertSpecificStyles((preferences.alert_specific_styles || []).join(', '));
      setExcludeMediums((preferences.exclude_mediums || []).join(', '));
      setExcludeStyles((preferences.exclude_styles || []).join(', '));
      setExcludeArtists((preferences.exclude_artists || []).join(', '));
    }
  }, [preferences]);

  // --- Mutations for Saving ---
  const updatePreferencesMutation = useMutation<UserPreferences, Error, Partial<UserPreferences>>({
    mutationFn: async (updatedPrefs) => {
      if (!user) throw new Error("User not found");
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: user.id,
            ...updatedPrefs,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      alert('Settings saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['userPreferences', user?.id] });
    },
    onError: (error: any) => {
      alert(`Error saving settings: ${error.message}`);
    }
  });

  const updateProfileMutation = useMutation<any, Error, { 
    full_name?: string; 
    display_name?: string;
    location?: string;
    bio?: string;
    avatar_url?: string; 
    email?: string; 
    password?: string;
  }>({
    mutationFn: async (updatedProfile) => {
      if (!user) throw new Error("User not found");
      
      const { full_name, display_name, location, bio, avatar_url, email, password } = updatedProfile;

      // Update auth.users (email, password)
      if (email || password) {
        const updateAuthPayload: { email?: string; password?: string } = {};
        if (email && email !== user.email) updateAuthPayload.email = email;
        if (password) updateAuthPayload.password = password;

        if (Object.keys(updateAuthPayload).length > 0) {
          const { error: authError } = await supabase.auth.updateUser(updateAuthPayload);
          if (authError) throw authError;
        }
      }

      // Update public.profiles
      const profileUpdates: any = { updated_at: new Date().toISOString() };
      if (full_name !== undefined && full_name !== profile?.full_name) profileUpdates.full_name = full_name;
      if (display_name !== undefined && display_name !== profile?.display_name) profileUpdates.display_name = display_name;
      if (location !== undefined && location !== profile?.location) profileUpdates.location = location;
      if (bio !== undefined && bio !== profile?.bio) profileUpdates.bio = bio;
      if (avatar_url !== undefined) profileUpdates.avatar_url = avatar_url;

      if (Object.keys(profileUpdates).length > 1) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('user_id', user.id)
          .select()
          .single();
        if (profileError) throw profileError;
        
        // Update local auth context
        await updateProfile(profileUpdates);
        return profileData;
      }
      return null;
    },
    onSuccess: () => {
      alert('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      alert(`Error updating profile: ${error.message}`);
    }
  });

  // --- Handlers ---
  const handleSaveAccountSettings = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }
    
    const updates: any = {};
    if (fullName !== profile?.full_name) updates.full_name = fullName;
    if (displayName !== profile?.display_name) updates.display_name = displayName;
    if (location !== profile?.location) updates.location = location;
    if (bio !== profile?.bio) updates.bio = bio;
    if (email !== user?.email) updates.email = email;
    if (newPassword) updates.password = newPassword;

    if (Object.keys(updates).length > 0) {
      updateProfileMutation.mutate(updates);
    } else {
      alert('No changes to save.');
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) {
      alert('Please select an image to upload.');
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    setIsUploadingAvatar(true);
    try {
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = publicUrlData.publicUrl;

      updateProfileMutation.mutate({ avatar_url: publicUrl });

    } catch (error: any) {
      alert(`Avatar upload error: ${error.message}`);
    } finally {
      setIsUploadingAvatar(false);
      if (avatarFileInputRef.current) {
        avatarFileInputRef.current.value = '';
      }
    }
  };

  const handleSavePreferences = () => {
    const parsedAlertSpecificArtists = alertSpecificArtists.split(',').map(s => s.trim()).filter(Boolean);
    const parsedAlertSpecificMediums = alertSpecificMediums.split(',').map(s => s.trim()).filter(Boolean);
    const parsedAlertSpecificStyles = alertSpecificStyles.split(',').map(s => s.trim()).filter(Boolean);
    const parsedExcludeMediums = excludeMediums.split(',').map(s => s.trim()).filter(Boolean);
    const parsedExcludeStyles = excludeStyles.split(',').map(s => s.trim()).filter(Boolean);
    const parsedExcludeArtists = excludeArtists.split(',').map(s => s.trim()).filter(Boolean);

    const mediums = preferredMediums.split(',').map(s => s.trim()).filter(Boolean);
    const styles = preferredStyles.split(',').map(s => s.trim()).filter(Boolean);

    updatePreferencesMutation.mutate({
      preferred_mediums: mediums,
      preferred_styles: styles,
      min_budget: useLearnedBudget ? null : (minBudget ? parseFloat(minBudget) : null),
      max_budget: useLearnedBudget ? null : (maxBudget ? parseFloat(maxBudget) : null),
      use_learned_budget: useLearnedBudget,
      alert_specific_artists: parsedAlertSpecificArtists,
      alert_specific_mediums: parsedAlertSpecificMediums,
      alert_specific_styles: parsedAlertSpecificStyles,
      exclude_mediums: parsedExcludeMediums,
      exclude_styles: parsedExcludeStyles,
      exclude_artists: parsedExcludeArtists,
      live_preferences: livePreferences,
    });
  };

  const handleSaveNotificationSettings = () => {
    updatePreferencesMutation.mutate({
      notification_real_time: realTimeSettings,
      notification_daily: dailySettings,
      notification_weekly: weeklySettings,
      notify_by_email: notifyByEmail,
      notify_price_drops: notifyPriceDrops,
      notify_new_works: notifyNewWorks,
      notify_auction_reminders: notifyAuctionReminders,
      notify_collection_insights: notifyCollectionInsights,
      preferred_digest_time: preferredDigestTime,
    });
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;
      alert('Your account has been deleted successfully.');
      signOut();
    } catch (error: any) {
      alert(`Error deleting account: ${error.message}`);
    }
  };

  const handleClearLearnedData = async () => {
    if (!user) return;
    try {
      await updatePreferencesMutation.mutateAsync({ 
        learned_preferences: {
          last_learned_update: new Date().toISOString(),
          reset_reason: 'User requested reset'
        }
      });
      alert('AI learned data cleared. The system will start learning fresh.');
      setShowClearLearnedDataConfirm(false);
    } catch (error: any) {
      alert(`Error clearing data: ${error.message}`);
    }
  };

  const handleResetAllPreferences = async () => {
    if (!user) return;
    try {
      await updatePreferencesMutation.mutateAsync({
        preferred_mediums: [],
        preferred_styles: [],
        min_budget: null,
        max_budget: null,
        use_learned_budget: false,
        alert_specific_artists: [],
        alert_specific_mediums: [],
        alert_specific_styles: [],
        exclude_mediums: [],
        exclude_styles: [],
        exclude_artists: [],
        notification_real_time: { artwork: true, artist: true, catalogue: true },
        notification_daily: { artwork: false, artist: false, catalogue: false },
        notification_weekly: { artwork: false, artist: false, catalogue: false },
        notify_by_email: true,
        notify_price_drops: true,
        notify_new_works: true,
        notify_auction_reminders: false,
        notify_collection_insights: true,
        preferred_digest_time: "08:00",
      });
      alert('All preferences reset to default.');
      setShowResetPreferencesConfirm(false);
    } catch (error: any) {
      alert(`Error resetting preferences: ${error.message}`);
    }
  };

  const exportAllData = async () => {
    try {
      const exportData = {
        profile: profile,
        preferences: preferences,
        learned_insights: preferences?.learned_preferences,
        export_metadata: {
          exported_at: new Date().toISOString(),
          version: '2.0',
          platform: 'ArtFlow',
          user_id: user?.id
        }
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `artflow-collector-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      alert('Data exported successfully!');
    } catch (error) {
      alert('Failed to export data');
    }
  };

  const learnedBudget = preferences?.learned_preferences?.preferred_price_range_from_behavior || null;
  const aiPerformance = preferences?.learned_preferences?.ai_performance;
  const behavioralPatterns = preferences?.learned_preferences?.behavioral_patterns;
  const colorPreferences = preferences?.learned_preferences?.color_preferences || [];
  const marketIntelligence = preferences?.learned_preferences?.market_intelligence;

  if (isLoading) {
    return (
      <Container>
        <div className="loading-state">
          <Brain size={48} className="loading-icon" />
          <h2>Loading Your Collector Intelligence...</h2>
          <p>Gathering your AI learnings and preferences</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Helmet>
        <title>Collector Settings & AI Intelligence - ArtFlow</title>
        <meta name="description" content="Comprehensive collector settings with AI learnings, preferences, and intelligence insights" />
      </Helmet>

      <div className="enhanced-collector-settings">
        {/* Header with Profile Summary */}
        <div className="settings-header">
          <div className="profile-overview">
            <div className="avatar-section">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="profile-avatar" />
              ) : (
                <div className="avatar-placeholder">
                  <User size={32} />
                </div>
              )}
            </div>
            
            <div className="profile-summary">
              <h1>{profile?.display_name || profile?.full_name || 'Collector'}</h1>
              <p className="profile-meta">
                {profile?.location && `📍 ${profile.location}`}
                {profile?.created_at && ` • Member since ${new Date(profile.created_at).getFullYear()}`}
              </p>
              
              {aiPerformance && (
                <div className="ai-summary-badges">
                  <div className="ai-badge">
                    <Brain size={14} />
                    <span>{aiPerformance.total_interactions || 0} AI interactions</span>
                  </div>
                  <div className="ai-badge">
                    <Target size={14} />
                    <span>{Math.round((aiPerformance.recommendation_accuracy || 0) * 100)}% accuracy</span>
                  </div>
                  <div className="ai-badge">
                    <Sparkles size={14} />
                    <span>{Math.round((aiPerformance.discovery_success_rate || 0) * 100)}% discovery success</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="header-actions">
            <button onClick={exportAllData} className="export-btn">
              <Download size={16} />
              Export All Data
            </button>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="settings-tabs">
          {[
            { key: 'account', label: 'Account', icon: User, description: 'Profile and basic settings' },
            { key: 'ai-intelligence', label: 'AI Intelligence', icon: Brain, description: 'Your AI learnings and insights' },
            { key: 'notifications', label: 'Notifications', icon: Bell, description: 'Email and alert preferences' },
            { key: 'preferences', label: 'Preferences', icon: Palette, description: 'Taste and filtering preferences' },
            { key: 'security', label: 'Security', icon: Shield, description: 'Privacy and data controls' }
          ].map(({ key, label, icon: Icon, description }) => (
            <button
              key={key}
              className={`tab-button ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key as any)}
            >
              <Icon size={18} />
              <div className="tab-content">
                <span className="tab-label">{label}</span>
                <span className="tab-description">{description}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content-area">
          {/* Account Settings Tab */}
          {activeTab === 'account' && (
            <div className="account-section">
              <div className="section-card">
                <h3>
                  <User size={20} />
                  Profile Information
                </h3>
                
                {/* Avatar Upload */}
                <div className="avatar-upload-section">
                  <img
                    src={profile?.avatar_url || 'https://via.placeholder.com/80x80?text=Avatar'}
                    alt="Avatar"
                    className="current-avatar"
                  />
                  <div className="avatar-controls">
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      ref={avatarFileInputRef}
                      onChange={handleAvatarUpload}
                      style={{ display: 'none' }}
                      disabled={isUploadingAvatar}
                    />
                    <button
                      className="avatar-upload-btn"
                      onClick={() => avatarFileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                    >
                      <Camera size={16} />
                      {isUploadingAvatar ? 'Uploading...' : 'Change Avatar'}
                    </button>
                  </div>
                </div>

                {/* Profile Fields */}
                <div className="form-grid">
                  <div className="form-field">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)} 
                    />
                  </div>
                  
                  <div className="form-field">
                    <label>Display Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)} 
                    />
                  </div>
                  
                  <div className="form-field">
                    <label>Location</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={location} 
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                  
                  <div className="form-field">
                    <label>Email</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="form-field full-width">
                  <label>Bio</label>
                  <textarea
                    className="form-textarea"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Tell us about your collecting journey and interests..."
                  />
                </div>

                <div className="password-section">
                  <h4>
                    <Lock size={18} />
                    Change Password
                  </h4>
                  <div className="password-grid">
                    <div className="form-field">
                      <label>New Password</label>
                      <input 
                        type="password" 
                        className="form-input" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        placeholder="Leave blank to keep current password" 
                      />
                    </div>
                    
                    <div className="form-field">
                      <label>Confirm New Password</label>
                      <input 
                        type="password" 
                        className="form-input" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    onClick={handleSaveAccountSettings} 
                    disabled={updateProfileMutation.isPending} 
                    className="save-btn"
                  >
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Account Settings'}
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="section-card danger-zone">
                <h3>
                  <Trash2 size={20} />
                  Danger Zone
                </h3>
                <p>Permanent actions that cannot be undone</p>
                
                <button 
                  className="delete-account-btn" 
                  onClick={() => setShowDeleteAccountModal(true)}
                >
                  <Trash2 size={16} />
                  Delete My Account
                </button>
              </div>
            </div>
          )}

          {/* AI Intelligence Tab */}
          {activeTab === 'ai-intelligence' && (
            <div className="ai-intelligence-section">
              <div className="section-card">
                <h3>
                  <Brain size={20} />
                  Your AI Intelligence Profile
                </h3>
                <p>Comprehensive insights about your collecting behavior learned by our AI</p>

                {/* Live Preference Controls */}
                <div className="live-preferences-section">
                  <h4>Live AI Preference Controls</h4>
                  <p>These controls adjust your recommendations in real-time</p>
                  <LivePreferenceControls
                    onPreferencesChange={setLivePreferences}
                    initialPreferences={livePreferences}
                  />
                </div>

                {/* AI Performance Metrics */}
                {aiPerformance && (
                  <div className="ai-performance-section">
                    <h4>AI Performance</h4>
                    <div className="performance-grid">
                      <div className="performance-card">
                        <TrendingUp size={24} color="var(--accent)" />
                        <div className="performance-content">
                          <span className="performance-value">
                            {Math.round(aiPerformance.recommendation_accuracy * 100)}%
                          </span>
                          <span className="performance-label">Recommendation Accuracy</span>
                          <span className="performance-description">
                            How often our AI suggestions match your interests
                          </span>
                        </div>
                      </div>

                      <div className="performance-card">
                        <Sparkles size={24} color="#f59e0b" />
                        <div className="performance-content">
                          <span className="performance-value">
                            {Math.round(aiPerformance.discovery_success_rate * 100)}%
                          </span>
                          <span className="performance-label">Discovery Success</span>
                          <span className="performance-description">
                            Success rate when AI suggests new artists or styles
                          </span>
                        </div>
                      </div>

                      <div className="performance-card">
                        <Zap size={24} color="#10b981" />
                        <div className="performance-content">
                          <span className="performance-value">
                            {Math.round(aiPerformance.learning_velocity * 100)}%
                          </span>
                          <span className="performance-label">Learning Velocity</span>
                          <span className="performance-description">
                            How quickly AI adapts to your evolving preferences
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Learned Taste Profile */}
                {preferences?.learned_preferences && (
                  <div className="learned-taste-section">
                    <h4>AI-Learned Taste Profile</h4>
                    
                    {/* Medium Preferences */}
                    {preferences.learned_preferences.top_liked_mediums && (
                      <div className="taste-category">
                        <h5>Medium Preferences</h5>
                        <div className="preference-list">
                          {preferences.learned_preferences.top_liked_mediums.map((medium, index) => (
                            <div key={index} className="preference-item">
                              <div className="preference-header">
                                <span className="preference-name">{medium.name}</span>
                                <span className="confidence-score">
                                  {Math.round((medium.confidence || 0) * 100)}% confident
                                </span>
                              </div>
                              <div className="preference-bar">
                                <div 
                                  className="preference-fill"
                                  style={{ width: `${(medium.confidence || 0) * 100}%` }}
                                />
                              </div>
                              <span className="interaction-count">{medium.count} interactions</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Color Intelligence */}
                    {colorPreferences.length > 0 && (
                      <div className="taste-category">
                        <h5>Color Intelligence</h5>
                        <div className="color-grid">
                          {colorPreferences.map((color, index) => (
                            <div key={index} className="color-item">
                              <div 
                                className="color-swatch"
                                style={{ backgroundColor: color.hex }}
                              />
                              <div className="color-details">
                                <span className="color-name">{color.color}</span>
                                <span className="color-frequency">{color.frequency}x</span>
                                <span className="color-confidence">
                                  {Math.round((color.confidence || 0) * 100)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Behavioral Insights */}
                    {behavioralPatterns && (
                      <div className="taste-category">
                        <h5>Behavioral Intelligence</h5>
                        <div className="behavior-insights">
                          <div className="insight-item">
                            <Clock size={18} />
                            <div className="insight-content">
                              <span className="insight-label">Peak Browsing Hours</span>
                              <span className="insight-value">
                                {behavioralPatterns.peak_browsing_hours?.join(', ') || 'Learning...'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="insight-item">
                            <Eye size={18} />
                            <div className="insight-content">
                              <span className="insight-label">Avg Session Duration</span>
                              <span className="insight-value">
                                {behavioralPatterns.session_duration_avg || 0} minutes
                              </span>
                            </div>
                          </div>
                          
                          <div className="insight-item">
                            <TrendingUp size={18} />
                            <div className="insight-content">
                              <span className="insight-label">Decision Speed</span>
                              <span className="insight-value">
                                {behavioralPatterns.decision_speed || 'Learning...'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="insight-item">
                            <BarChart3 size={18} />
                            <div className="insight-content">
                              <span className="insight-label">Price Sensitivity</span>
                              <span className="insight-value">
                                {Math.round((behavioralPatterns.price_sensitivity || 0) * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Market Intelligence */}
                    {marketIntelligence && (
                      <div className="taste-category">
                        <h5>Market Intelligence</h5>
                        
                        {marketIntelligence.collection_gaps && marketIntelligence.collection_gaps.length > 0 && (
                          <div className="intelligence-subsection">
                            <h6>Collection Gaps AI Identified</h6>
                            <div className="gaps-list">
                              {marketIntelligence.collection_gaps.map((gap, index) => (
                                <div key={index} className="gap-item">
                                  <Target size={14} />
                                  <span>{gap}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {marketIntelligence.investment_opportunities && marketIntelligence.investment_opportunities.length > 0 && (
                          <div className="intelligence-subsection">
                            <h6>Investment Opportunities</h6>
                            <div className="opportunities-list">
                              {marketIntelligence.investment_opportunities.map((opp, index) => (
                                <div key={index} className="opportunity-item">
                                  <div className="opportunity-header">
                                    <span className="artist-name">{opp.artist}</span>
                                    <span className="confidence-badge">
                                      {Math.round(opp.confidence * 100)}% confidence
                                    </span>
                                  </div>
                                  <p className="opportunity-reasoning">{opp.reasoning}</p>
                                  {opp.potential_return && (
                                    <span className="potential-return">
                                      Potential: +{Math.round(opp.potential_return * 100)}%
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* AI Controls */}
                <div className="ai-controls-section">
                  <h4>AI Learning Controls</h4>
                  <div className="ai-control-buttons">
                    <button 
                      className="control-btn secondary"
                      onClick={() => setShowClearLearnedDataConfirm(true)}
                    >
                      Clear AI Learning Data
                    </button>
                    <button 
                      className="control-btn secondary"
                      onClick={() => setShowResetPreferencesConfirm(true)}
                    >
                      Reset All Preferences
                    </button>
                  </div>
                  <p className="control-warning">
                    ⚠️ These actions will affect your personalized recommendations
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="notifications-section">
              <div className="section-card">
                <h3>
                  <Bell size={20} />
                  Intelligent Notifications
                </h3>
                <p>Choose how and when you want to receive AI-powered updates</p>

                {/* Smart Alerts */}
                <div className="notification-category">
                  <h4>Smart Alerts</h4>
                  <div className="notification-options">
                    <div className="notification-option">
                      <div className="option-content">
                        <span className="option-label">Price Drop Alerts</span>
                        <span className="option-description">When saved artworks drop in price</span>
                      </div>
                      <Toggle checked={notifyPriceDrops} onChange={setNotifyPriceDrops} />
                    </div>

                    <div className="notification-option">
                      <div className="option-content">
                        <span className="option-label">New Works from Followed Artists</span>
                        <span className="option-description">Fresh artworks from artists you follow</span>
                      </div>
                      <Toggle checked={notifyNewWorks} onChange={setNotifyNewWorks} />
                    </div>

                    <div className="notification-option">
                      <div className="option-content">
                        <span className="option-label">Collection Insights</span>
                        <span className="option-description">Weekly AI insights about your collection and market</span>
                      </div>
                      <Toggle checked={notifyCollectionInsights} onChange={setNotifyCollectionInsights} />
                    </div>

                    <div className="notification-option">
                      <div className="option-content">
                        <span className="option-label">Auction Reminders</span>
                        <span className="option-description">Upcoming auctions for works matching your taste</span>
                      </div>
                      <Toggle checked={notifyAuctionReminders} onChange={setNotifyAuctionReminders} />
                    </div>
                  </div>
                </div>

                {/* Real-time Notifications */}
                <div className="notification-category">
                  <h4>Real-Time Alerts</h4>
                  <p className="category-description">
                    Instant notifications for new items matching your preferences
                  </p>
                  {['artwork', 'artist', 'catalogue'].map(type => (
                    <div key={type} className="notification-option">
                      <span className="option-label">New {type.charAt(0).toUpperCase() + type.slice(1)}</span>
                      <Toggle
                        checked={realTimeSettings[type as keyof NotificationEntityTypeSettings]}
                        onChange={(val) => setRealTimeSettings(prev => ({ ...prev, [type]: val }))}
                      />
                    </div>
                  ))}
                </div>

                {/* Email Preferences */}
                <div className="notification-category">
                  <h4>
                    <Mail size={18} />
                    Email Preferences
                  </h4>
                  <div className="email-settings">
                    <div className="notification-option">
                      <div className="option-content">
                        <span className="option-label">Receive notifications by email</span>
                        <span className="option-description">Primary email: {user?.email}</span>
                      </div>
                      <Toggle checked={notifyByEmail} onChange={setNotifyByEmail} />
                    </div>

                    <div className="digest-time-setting">
                      <label>
                        <Clock size={16} />
                        Preferred Digest Time
                      </label>
                      <input 
                        type="time" 
                        className="time-input" 
                        value={preferredDigestTime} 
                        onChange={(e) => setPreferredDigestTime(e.target.value)} 
                      />
                      <small>Digests will be sent around this time in your timezone</small>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    onClick={handleSaveNotificationSettings} 
                    disabled={updatePreferencesMutation.isPending} 
                    className="save-btn"
                  >
                    {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Notification Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="preferences-section">
              <div className="section-card">
                <h3>
                  <Palette size={20} />
                  Your Collecting Preferences
                </h3>

                {/* Manual Preferences */}
                <div className="manual-preferences">
                  <h4>Manual Preferences</h4>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Preferred Mediums (comma-separated)</label>
                      <input
                        type="text"
                        value={preferredMediums}
                        onChange={(e) => setPreferredMediums(e.target.value)}
                        className="form-input"
                        placeholder="Oil, Acrylic, Photography"
                      />
                    </div>
                    
                    <div className="form-field">
                      <label>Preferred Styles (comma-separated)</label>
                      <input
                        type="text"
                        value={preferredStyles}
                        onChange={(e) => setPreferredStyles(e.target.value)}
                        className="form-input"
                        placeholder="Abstract, Contemporary, Landscape"
                      />
                    </div>
                  </div>
                </div>

                {/* Budget Preferences */}
                <div className="budget-preferences">
                  <h4>Budget Preferences</h4>
                  <div className="budget-toggle">
                    <Toggle checked={useLearnedBudget} onChange={setUseLearnedBudget} />
                    <span>Use AI-Learned Budget Range</span>
                  </div>

                  {useLearnedBudget ? (
                    learnedBudget ? (
                      <div className="learned-budget-display">
                        <p>
                          <strong>AI-Estimated Range:</strong> R{learnedBudget.min.toLocaleString()} – R{learnedBudget.max.toLocaleString()}
                        </p>
                        <p className="confidence-note">
                          Confidence: {learnedBudget.confidence || 'Learning...'}
                        </p>
                      </div>
                    ) : (
                      <p className="learning-note">
                        AI is still learning your budget preferences. Keep interacting with artworks!
                      </p>
                    )
                  ) : (
                    <div className="manual-budget">
                      <div className="budget-inputs">
                        <div className="form-field">
                          <label>Min Budget (ZAR)</label>
                          <input
                            type="number"
                            value={minBudget}
                            onChange={(e) => setMinBudget(e.target.value)}
                            className="form-input"
                            placeholder="1000"
                          />
                        </div>
                        <div className="form-field">
                          <label>Max Budget (ZAR)</label>
                          <input
                            type="number"
                            value={maxBudget}
                            onChange={(e) => setMaxBudget(e.target.value)}
                            className="form-input"
                            placeholder="50000"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Exclusion Filters */}
                <div className="exclusion-filters">
                  <h4>Exclusion Filters</h4>
                  <p className="section-description">
                    Tell us what you absolutely DO NOT want to see in recommendations
                  </p>
                  
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Exclude Mediums</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={excludeMediums} 
                        onChange={(e) => setExcludeMediums(e.target.value)} 
                        placeholder="Photography, Digital Art" 
                      />
                    </div>
                    
                    <div className="form-field">
                      <label>Exclude Styles</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={excludeStyles} 
                        onChange={(e) => setExcludeStyles(e.target.value)} 
                        placeholder="Pop Art, Graffiti" 
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    onClick={handleSavePreferences} 
                    disabled={updatePreferencesMutation.isPending} 
                    className="save-btn"
                  >
                    {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security & Privacy Tab */}
          {activeTab === 'security' && (
            <div className="security-section">
              <div className="section-card">
                <h3>
                  <Shield size={20} />
                  Security & Privacy Controls
                </h3>
                
                <div className="security-options">
                  <div className="security-category">
                    <h4>Data Export & Portability</h4>
                    <p>Download all your data in a portable format</p>
                    <button onClick={exportAllData} className="export-full-btn">
                      <Download size={16} />
                      Export Complete Profile & AI Data
                    </button>
                  </div>

                  <div className="security-category">
                    <h4>Privacy Policy & Terms</h4>
                    <p>Review our data handling practices</p>
                    <div className="policy-links">
                      <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="policy-link">
                        <FileText size={16} />
                        Privacy Policy
                      </a>
                      <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="policy-link">
                        <FileText size={16} />
                        Terms of Service
                      </a>
                    </div>
                  </div>

                  <div className="security-category">
                    <h4>Data Management</h4>
                    <p>Control how your data is used for personalization</p>
                    <div className="data-controls">
                      <button className="control-btn secondary">
                        <Shield size={16} />
                        Manage Cookie Preferences
                      </button>
                      <button className="control-btn secondary">
                        <Download size={16} />
                        Request Data Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Modals */}
        <ConfirmationModal
          isOpen={showDeleteAccountModal}
          onClose={() => setShowDeleteAccountModal(false)}
          onConfirm={handleDeleteAccount}
          title="Confirm Account Deletion"
          message="Are you absolutely sure you want to delete your account? All your data, AI learnings, preferences, and activity will be permanently lost. This action cannot be undone."
          confirmText="Delete Account"
          isDestructive
        />
        
        <ConfirmationModal
          isOpen={showClearLearnedDataConfirm}
          onClose={() => setShowClearLearnedDataConfirm(false)}
          onConfirm={handleClearLearnedData}
          title="Clear AI Learning Data"
          message="This will erase all data the AI has learned about your preferences. Your recommendations will start fresh, but you'll lose all personalization. Are you sure?"
          confirmText="Clear AI Data"
          isDestructive
        />
        
        <ConfirmationModal
          isOpen={showResetPreferencesConfirm}
          onClose={() => setShowResetPreferencesConfirm(false)}
          onConfirm={handleResetAllPreferences}
          title="Reset All Preferences"
          message="This will reset all your preferences (mediums, styles, budget, alerts, exclusions) to their default values. Your AI learning data will be preserved. Are you sure?"
          confirmText="Reset Preferences"
          isDestructive
        />

        <style jsx>{`
          .enhanced-collector-settings {
            max-width: 1200px;
            margin: 0 auto;
            padding: 24px;
          }

          .settings-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 1px solid var(--border);
          }

          .profile-overview {
            display: flex;
            gap: 20px;
            align-items: flex-start;
          }

          .avatar-section {
            flex-shrink: 0;
          }

          .profile-avatar, .current-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid var(--border);
          }

          .avatar-placeholder {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: var(--bg-alt);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid var(--border);
          }

          .profile-summary h1 {
            margin: 0 0 8px 0;
            font-size: 28px;
            font-weight: 700;
          }

          .profile-meta {
            margin: 0 0 16px 0;
            color: var(--muted);
            font-size: 14px;
          }

          .ai-summary-badges {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .ai-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            background: var(--accent-bg);
            color: var(--accent);
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 13px;
            font-weight: 500;
          }

          .export-btn, .export-full-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 20px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
          }

          .export-btn:hover, .export-full-btn:hover {
            background: var(--accent-hover);
            transform: translateY(-1px);
          }

          .settings-tabs {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 12px;
            margin-bottom: 32px;
          }

          .tab-button {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: var(--card);
            border: 2px solid var(--border);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
          }

          .tab-button.active {
            border-color: var(--accent);
            background: var(--accent-bg);
          }

          .tab-button:hover:not(.active) {
            border-color: var(--border-hover);
            transform: translateY(-1px);
          }

          .tab-content {
            display: flex;
            flex-direction: column;
          }

          .tab-label {
            font-weight: 600;
            margin-bottom: 2px;
          }

          .tab-description {
            font-size: 13px;
            color: var(--muted);
          }

          .section-card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
          }

          .section-card.danger-zone {
            border-color: #fecaca;
            background: #fef2f2;
          }

          .section-card h3 {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0 0 16px 0;
            font-size: 20px;
            font-weight: 600;
          }

          .section-card h4 {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 24px 0 12px 0;
            font-size: 16px;
            font-weight: 600;
          }

          .section-card h5 {
            margin: 20px 0 12px 0;
            font-size: 15px;
            font-weight: 600;
            color: var(--accent);
          }

          .section-card h6 {
            margin: 16px 0 8px 0;
            font-size: 14px;
            font-weight: 500;
            color: var(--muted);
          }

          .avatar-upload-section {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 24px;
          }

          .avatar-controls {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .avatar-upload-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            background: var(--bg-alt);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 8px 16px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
          }

          .avatar-upload-btn:hover:not(:disabled) {
            background: var(--accent-bg);
            border-color: var(--accent);
          }

          .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }

          .form-field {
            display: flex;
            flex-direction: column;
          }

          .form-field.full-width {
            grid-column: 1 / -1;
          }

          .form-field label {
            font-weight: 500;
            margin-bottom: 8px;
            color: var(--fg);
            font-size: 14px;
          }

          .form-input, .form-textarea, .time-input {
            padding: 12px;
            border: 1px solid var(--border);
            border-radius: 8px;
            background: var(--bg);
            color: var(--fg);
            transition: border-color 0.2s;
            font-size: 14px;
          }

          .form-input:focus, .form-textarea:focus, .time-input:focus {
            outline: none;
            border-color: var(--accent);
            box-shadow: 0 0 0 3px var(--accent-bg);
          }

          .time-input {
            max-width: 150px;
          }

          .performance-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-top: 16px;
          }

          .performance-card {
            display: flex;
            gap: 16px;
            padding: 20px;
            background: var(--bg-alt);
            border-radius: 12px;
            border: 1px solid var(--border);
          }

          .performance-content {
            display: flex;
            flex-direction: column;
          }

          .performance-value {
            font-size: 24px;
            font-weight: 700;
            color: var(--accent);
            margin-bottom: 4px;
          }

          .performance-label {
            font-weight: 600;
            margin-bottom: 4px;
          }

          .performance-description {
            font-size: 13px;
            color: var(--muted);
            line-height: 1.4;
          }

          .preference-list {
            margin-top: 12px;
          }

          .preference-item {
            margin-bottom: 16px;
          }

          .preference-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }

          .preference-name {
            font-weight: 500;
            text-transform: capitalize;
          }

          .confidence-score, .confidence-badge {
            background: var(--accent-bg);
            color: var(--accent);
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          }

          .preference-bar {
            height: 6px;
            background: var(--bg-alt);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 4px;
          }

          .preference-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--accent), var(--accent-hover));
            transition: width 0.3s ease;
          }

          .interaction-count {
            font-size: 12px;
            color: var(--muted);
          }

          .color-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 12px;
            margin-top: 12px;
          }

          .color-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: var(--bg-alt);
            border-radius: 8px;
            border: 1px solid var(--border);
          }

          .color-swatch {
            width: 28px;
            height: 28px;
            border-radius: 6px;
            border: 1px solid var(--border);
            flex-shrink: 0;
          }

          .color-details {
            display: flex;
            flex-direction: column;
            min-width: 0;
          }

          .color-name {
            font-weight: 500;
            font-size: 14px;
            text-transform: capitalize;
          }

          .color-frequency, .color-confidence {
            font-size: 11px;
            color: var(--muted);
          }

          .behavior-insights {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-top: 12px;
          }

          .insight-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: var(--bg-alt);
            border-radius: 8px;
          }

          .insight-content {
            display: flex;
            flex-direction: column;
          }

          .insight-label {
            font-size: 13px;
            color: var(--muted);
            margin-bottom: 2px;
          }

          .insight-value {
            font-weight: 600;
            color: var(--fg);
          }

          .notification-category {
            margin-bottom: 32px;
          }

          .category-description {
            font-size: 14px;
            color: var(--muted);
            margin-bottom: 16px;
          }

          .notification-options {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .notification-option {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: var(--bg-alt);
            border-radius: 8px;
            border: 1px solid var(--border);
          }

          .option-content {
            display: flex;
            flex-direction: column;
          }

          .option-label {
            font-weight: 500;
            margin-bottom: 2px;
          }

          .option-description {
            font-size: 13px;
            color: var(--muted);
          }

          .save-btn {
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 24px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 600;
          }

          .save-btn:hover:not(:disabled) {
            background: var(--accent-hover);
            transform: translateY(-1px);
          }

          .save-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .delete-account-btn {
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 20px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .delete-account-btn:hover {
            background: #dc2626;
          }

          .control-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
            border: 1px solid var(--border);
          }

          .control-btn.secondary {
            background: var(--bg-alt);
            color: var(--fg);
          }

          .control-btn.secondary:hover {
            background: var(--bg);
            border-color: var(--accent);
          }

          .ai-control-buttons {
            display: flex;
            gap: 12px;
            margin-bottom: 12px;
          }

          .control-warning {
            font-size: 13px;
            color: #f59e0b;
            margin: 0;
          }

          .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .modal-content {
            background: var(--card);
            border-radius: 12px;
            padding: 24px;
            border: 1px solid var(--border);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }

          .button {
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
            border: 1px solid var(--border);
          }

          .button-primary {
            background: var(--accent);
            color: white;
            border-color: var(--accent);
          }

          .button-secondary {
            background: var(--bg-alt);
            color: var(--fg);
          }

          .button-danger {
            background: #ef4444;
            color: white;
            border-color: #ef4444;
          }

          .loading-state {
            text-align: center;
            padding: 80px 24px;
          }

          .loading-icon {
            animation: pulse 2s infinite;
            margin-bottom: 16px;
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }

          @media (max-width: 768px) {
            .settings-header {
              flex-direction: column;
              gap: 16px;
            }

            .profile-overview {
              flex-direction: column;
              text-align: center;
            }

            .settings-tabs {
              grid-template-columns: 1fr;
            }

            .performance-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </Container>
  );
};

export default EnhancedCollectorSettingsPage;
