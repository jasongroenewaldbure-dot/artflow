import React from 'react'
import { Card } from './Card'
import { Typography } from './Typography'
import { Toggle } from './forms/Toggle'
import { tokens } from '../palette-tokens'

export interface LivePreferenceControlsProps {
  preferences?: LivePreferences
  onChange?: (preferences: LivePreferences) => void
  onPreferencesChange?: (preferences: LivePreferences) => void
  initialPreferences?: LivePreferences
  className?: string
}

export interface LivePreferences {
  enableNotifications: boolean
  enableRecommendations: boolean
  enablePriceAlerts: boolean
  enableArtistUpdates: boolean
  enableMarketInsights: boolean
  notificationFrequency: 'immediate' | 'daily' | 'weekly'
  recommendationStrength: 'subtle' | 'moderate' | 'aggressive'
}

const defaultPreferences: LivePreferences = {
  enableNotifications: true,
  enableRecommendations: true,
  enablePriceAlerts: false,
  enableArtistUpdates: true,
  enableMarketInsights: false,
  notificationFrequency: 'daily',
  recommendationStrength: 'moderate'
}

export const LivePreferenceControls: React.FC<LivePreferenceControlsProps> = ({
  preferences,
  onChange,
  onPreferencesChange,
  initialPreferences,
  className = '',
}) => {
  const currentPreferences = preferences || initialPreferences || defaultPreferences
  const handleChange = onChange || onPreferencesChange

  const handleToggle = (key: keyof LivePreferences, value: boolean) => {
    const newPreferences = { ...currentPreferences, [key]: value }
    handleChange?.(newPreferences)
  }

  const handleSelect = (key: keyof LivePreferences, value: unknown) => {
    const newPreferences = { ...currentPreferences, [key]: value }
    handleChange?.(newPreferences)
  }

  return (
    <Card variant="outlined" padding="lg" className={className}>
      <Typography variant="h6" style={{ marginBottom: tokens.spacing.lg }}>
        Live Preferences
      </Typography>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body">Enable Notifications</Typography>
        <Toggle
          checked={currentPreferences.enableNotifications}
          onChange={(checked) => handleToggle('enableNotifications', checked)}
        />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body">Enable Recommendations</Typography>
          <Toggle
            checked={currentPreferences.enableRecommendations}
            onChange={(checked) => handleToggle('enableRecommendations', checked)}
          />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body">Enable Price Alerts</Typography>
          <Toggle
            checked={currentPreferences.enablePriceAlerts}
            onChange={(checked) => handleToggle('enablePriceAlerts', checked)}
          />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body">Enable Artist Updates</Typography>
          <Toggle
            checked={currentPreferences.enableArtistUpdates}
            onChange={(checked) => handleToggle('enableArtistUpdates', checked)}
          />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body">Enable Market Insights</Typography>
          <Toggle
            checked={currentPreferences.enableMarketInsights}
            onChange={(checked) => handleToggle('enableMarketInsights', checked)}
          />
        </div>
        
        {currentPreferences.enableNotifications && (
          <div style={{ marginTop: tokens.spacing.md }}>
            <Typography variant="bodySmall" style={{ marginBottom: tokens.spacing.sm }}>
              Notification Frequency
            </Typography>
            <select
              value={currentPreferences.notificationFrequency}
              onChange={(e) => handleSelect('notificationFrequency', e.target.value)}
              style={{
                width: '100%',
                padding: tokens.spacing.sm,
                border: `1px solid ${tokens.colors.border.primary}`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.base,
              }}
            >
              <option value="immediate">Immediate</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        )}
        
        {currentPreferences.enableRecommendations && (
          <div style={{ marginTop: tokens.spacing.md }}>
            <Typography variant="bodySmall" style={{ marginBottom: tokens.spacing.sm }}>
              Recommendation Strength
            </Typography>
            <select
              value={currentPreferences.recommendationStrength}
              onChange={(e) => handleSelect('recommendationStrength', e.target.value)}
              style={{
                width: '100%',
                padding: tokens.spacing.sm,
                border: `1px solid ${tokens.colors.border.primary}`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.base,
              }}
            >
              <option value="subtle">Subtle</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>
        )}
      </div>
    </Card>
  )
}

export default LivePreferenceControls
