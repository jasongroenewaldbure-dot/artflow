import { Suspense, lazy, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Route, Routes, useLocation, Navigate } from 'react-router-dom'
import { BrushProvider } from './brush/BrushProvider'
import { AuthProvider } from './contexts/AuthProvider'
import { NavigationProvider } from './components/navigation/NavigationProvider'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import { addResourceHints, measureWebVitals } from '@/services/performance'
import './styles/dashboard.css'
import './brush/theme.css'

// Lazy load pages for better performance
const HomePage = lazy(() => import('./routes/marketplace/HomePage'))
const SearchResultsPage = lazy(() => import('./routes/marketplace/SearchResultsPage'))
const ArtistPage = lazy(() => import('./routes/Artist'))
const ArtistsPage = lazy(() => import('./routes/Artists'))
const ArtworkPage = lazy(() => import('./routes/Artwork'))
// const SearchPage = lazy(() => import('./routes/Search'))
// const ComparePage = lazy(() => import('./routes/marketplace/ComparePage'))
const DashboardPage = lazy(() => import('./routes/Dashboard'))
const WaitlistPage = lazy(() => import('./routes/WaitlistPage'))
const StartPage = lazy(() => import('./routes/auth/StartPage'))
const MyArtworksPage = lazy(() => import('./routes/MyArtworks'))
const AuthCallbackPage = lazy(() => import('./routes/AuthCallback'))
const OnboardingPage = lazy(() => import('./routes/Onboarding'))
const ArtistSalesPage = lazy(() => import('./routes/Sales'))
const ArtistSettingsPage = lazy(() => import('./routes/ArtistSettings'))
const CollectorQuizPage = lazy(() => import('./routes/CollectorQuiz'))
const CataloguePage = lazy(() => import('./routes/marketplace/CataloguePage'))
const FavoritesPage = lazy(() => import('./routes/user/FavoritesPage'))
const CollectionPage = lazy(() => import('./routes/user/CollectionPage'))
const SocialFeaturesPage = lazy(() => import('./routes/social/SocialFeaturesPage'))
const NotificationsPage = lazy(() => import('./routes/user/NotificationsPage'))
const ArtworksPage = lazy(() => import('./routes/marketplace/ArtworksPage'))
const ArtworkComparisonPage = lazy(() => import('./routes/collector/ArtworkComparison'))
const CollectorVaultPage = lazy(() => import('./routes/collector/CollectorVault'))
const StudioManagementPage = lazy(() => import('./routes/artist/StudioManagement'))
const ExplorePage = lazy(() => import('./routes/collector/ExplorePage'))
const DiscoverPage = lazy(() => import('./components/marketplace/DiscoverPage'))
const CollectorFavoritesPage = lazy(() => import('./routes/collector/FavoritesPage'))
const MessagesPage = lazy(() => import('./routes/collector/MessagesPage'))
const CollectorSalesPage = lazy(() => import('./routes/Sales'))
const SettingsPage = lazy(() => import('./routes/collector/SettingsPage'))
const CollectionRoadmapPage = lazy(() => import('./routes/collector/CollectionRoadmapPage'))
const NotFoundPage = lazy(() => import('./routes/NotFoundPage'))

export default function App() {
  const location = useLocation()

  useEffect(() => {
    // Track page views for analytics - temporarily disabled due to database schema issues
    // analytics.trackPageView(location.pathname + location.search)
  }, [location])

  useEffect(() => {
    // Add resource hints for performance
    addResourceHints()
    
    // Measure web vitals
    measureWebVitals()
  }, [])

  return (
    <AuthProvider>
      <BrushProvider>
      <Helmet>
          <title>ArtFlow - Discover, Buy, and Sell Art</title>
          <meta name="description" content="Discover and collect art from artists around the world. A modern art marketplace platform." />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="/" />
          <link rel="preconnect" href="https://api.supabase.co" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
      </Helmet>
        
        <Suspense fallback={
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            flexDirection: 'column',
            gap: 'var(--space-lg)',
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--border)',
              borderTop: '3px solid var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: 'var(--muted)', fontSize: '16px' }}>Loading ArtFlow...</p>
          </div>
        }>
          <Routes>
            {/* Waitlist Route - No Navigation */}
            <Route path="/" element={<WaitlistPage />} />
            
            {/* Auth Routes - No Navigation */}
            <Route path="/start" element={<StartPage />} />
            <Route path="/auth" element={<Navigate to="/start" replace />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            
            {/* All other routes with Navigation */}
            <Route path="/home" element={
              <NavigationProvider>
                <HomePage />
              </NavigationProvider>
            } />
            <Route path="/discover" element={
              <NavigationProvider>
                <DiscoverPage />
              </NavigationProvider>
            } />
            <Route path="/artworks" element={
              <NavigationProvider>
                <ArtworksPage />
              </NavigationProvider>
            } />
            <Route path="/search" element={
              <NavigationProvider>
                <SearchResultsPage />
              </NavigationProvider>
            } />
            
            {/* Artist Routes */}
            <Route path="/artist/:slug" element={
              <NavigationProvider>
                <ArtistPage />
              </NavigationProvider>
            } />
            <Route path="/artists" element={
              <NavigationProvider>
                <ArtistsPage />
              </NavigationProvider>
            } />
            
            {/* Artwork Routes - Friendly URLs */}
            <Route path="/artist/:artistSlug/:artworkSlug" element={
              <NavigationProvider>
                <ArtworkPage />
              </NavigationProvider>
            } />
            <Route path="/artwork/:id" element={
              <NavigationProvider>
                <ArtworkPage />
              </NavigationProvider>
            } />
            
            {/* Catalogue Routes - Friendly URLs */}
            <Route path="/catalogues" element={
              <NavigationProvider>
                <CataloguePage />
              </NavigationProvider>
            } />
            <Route path="/artist/:artistSlug/catalogue/:catalogueSlug" element={
              <NavigationProvider>
                <CataloguePage />
              </NavigationProvider>
            } />
            <Route path="/catalogue/:id" element={
              <NavigationProvider>
                <CataloguePage />
              </NavigationProvider>
            } />
            
            {/* Social Features */}
            <Route path="/social" element={
              <ProtectedRoute>
                <NavigationProvider>
                  <SocialFeaturesPage />
                </NavigationProvider>
              </ProtectedRoute>
            } />
            
            {/* Collector Features */}
            <Route path="/explore" element={
              <ProtectedRoute>
                <NavigationProvider>
                  <ExplorePage />
                </NavigationProvider>
              </ProtectedRoute>
            } />
            <Route path="/favorites" element={
              <ProtectedRoute>
                <NavigationProvider>
                  <CollectorFavoritesPage />
                </NavigationProvider>
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <NavigationProvider>
                  <MessagesPage />
                </NavigationProvider>
              </ProtectedRoute>
            } />
            <Route path="/sales" element={
              <ProtectedRoute>
                <NavigationProvider>
                  <CollectorSalesPage />
                </NavigationProvider>
              </ProtectedRoute>
            } />
            <Route path="/vault" element={
              <ProtectedRoute>
                <NavigationProvider>
                  <CollectorVaultPage />
                </NavigationProvider>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <NavigationProvider>
                  <SettingsPage />
                </NavigationProvider>
              </ProtectedRoute>
            } />
            <Route path="/roadmap" element={
              <ProtectedRoute>
                <NavigationProvider>
                  <CollectionRoadmapPage />
                </NavigationProvider>
              </ProtectedRoute>
            } />
            <Route path="/compare" element={
              <ProtectedRoute>
                <NavigationProvider>
                  <ArtworkComparisonPage />
                </NavigationProvider>
              </ProtectedRoute>
            } />
            
            {/* Artist Features */}
            <Route path="/studio" element={
              <ProtectedRoute>
                <NavigationProvider>
                  <StudioManagementPage />
                </NavigationProvider>
              </ProtectedRoute>
            } />
            
            {/* Protected Routes */}
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <NavigationProvider>
                  <OnboardingPage />
                </NavigationProvider>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={<Navigate to="/u/dashboard" replace />} />
            <Route path="/u/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardPage />} />
            </Route>
            <Route path="/artwork/new" element={
              <ProtectedRoute>
                <NavigationProvider>
                  <MyArtworksPage />
                </NavigationProvider>
              </ProtectedRoute>
            } />
            <Route path="/u/sales" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<ArtistSalesPage />} />
            </Route>
            <Route path="/u/settings/artist" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<ArtistSettingsPage />} />
            </Route>
            <Route path="/u/collector/quiz" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<CollectorQuizPage />} />
            </Route>
            
            {/* User Pages */}
            <Route path="/u/favorites" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<FavoritesPage />} />
            </Route>
            <Route path="/u/collection" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<CollectionPage />} />
            </Route>
            <Route path="/u/notifications" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<NotificationsPage />} />
            </Route>
            <Route path="/u/settings" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<div>Settings Page - Coming Soon</div>} />
            </Route>
            <Route path="/u/artworks" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<div>My Artworks Page - Coming Soon</div>} />
            </Route>
            <Route path="/u/messages" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<div>Messages Page - Coming Soon</div>} />
            </Route>
            <Route path="/u/help" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<div>Help Page - Coming Soon</div>} />
            </Route>
            
            {/* 404 Catch-all Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrushProvider>
    </AuthProvider>
  )
}