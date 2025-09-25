import { Suspense, lazy, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Route, Routes, useLocation, Navigate } from 'react-router-dom'
import { BrushProvider } from './brush/BrushProvider'
import { AuthProvider } from './contexts/AuthProvider'
import NavigationProvider from './brush/components/navigation/NavigationProvider'
import ProtectedRoute from './brush/components/auth/ProtectedRoute'
import DashboardLayout from './brush/components/layout/DashboardLayout'
import ErrorBoundary from './brush/components/forms/ErrorBoundary'
import { addResourceHints, measureWebVitals } from '@/services/performance'
import './brush/theme.css'

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/marketplace/HomePage'))
const SearchResultsPage = lazy(() => import('./pages/marketplace/SearchResultsPage'))
const BrowseArtistsPage = lazy(() => import('./pages/marketplace/BrowseArtistsPage'))
const BrowseArtworksPage = lazy(() => import('./pages/marketplace/BrowseArtworksPage'))
const ArtworkDetailPage = lazy(() => import('./pages/ArtworkDetail'))
const DashboardPage = lazy(() => import('./pages/Dashboard'))
const WaitlistPage = lazy(() => import('./pages/WaitlistPage'))
const StartPage = lazy(() => import('./pages/auth/StartPage'))
const AuthCallbackPage = lazy(() => import('./pages/AuthCallback'))
const ArtworkCreatePage = lazy(() => import('./pages/ArtworkCreate'))
const OnboardingPage = lazy(() => import('./pages/Onboarding'))
const SalesPage = lazy(() => import('./pages/Sales'))
const ArtistSalesPage = lazy(() => import('./pages/Sales'))
const ArtistSettingsPage = lazy(() => import('./pages/profile/ArtistSettings'))
const CollectorQuizPage = lazy(() => import('./pages/profile/CollectorQuiz'))
const CataloguePage = lazy(() => import('./pages/marketplace/CataloguePage'))
const BrowseCataloguesPage = lazy(() => import('./pages/marketplace/BrowseCataloguesPage'))
const CommunityPage = lazy(() => import('./pages/marketplace/CommunityPage'))
const FavoritesPage = lazy(() => import('./pages/profile/FavoritesPage'))
const CollectionPage = lazy(() => import('./pages/profile/CollectionPage'))
const SocialFeaturesPage = lazy(() => import('./pages/profile/SocialFeaturesPage'))
const NotificationsPage = lazy(() => import('./pages/profile/NotificationsPage'))
const ArtworkComparisonPage = lazy(() => import('./pages/profile/ArtworkComparison'))
const CollectorVaultPage = lazy(() => import('./pages/profile/CollectorVault'))
const StudioManagementPage = lazy(() => import('./pages/profile/StudioManagement'))
// ExplorePage removed - replaced by IntelligentExplorePage
const MessagesPage = lazy(() => import('./pages/profile/MessagesPage'))
const SettingsPage = lazy(() => import('./pages/profile/SettingsPage'))
const IntelligentExplorePage = lazy(() => import('./pages/marketplace/IntelligentExplorePage'))
const CollectionRoadmapPage = lazy(() => import('./pages/profile/CollectionRoadmapPage'))
const ArtistProfilePage = lazy(() => import('./pages/profile/ArtistProfile'))
const ErrorPage = lazy(() => import('./pages/ErrorPage'))
// Test pages removed

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
    <ErrorBoundary>
      <AuthProvider>
        <BrushProvider>
        <Helmet>
            <title>ArtFlow - Browse, Buy, and Sell Art</title>
            <meta name="description" content="Browse and collect art from artists around the world. A modern art marketplace platform." />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="canonical" href="/" />
            <link rel="preconnect" href="https://api.supabase.co" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
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
            <Route path="/artworks" element={
              <NavigationProvider>
                <BrowseArtworksPage />
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
                <ArtistProfilePage />
              </NavigationProvider>
            } />
            <Route path="/artists" element={
              <NavigationProvider>
                <BrowseArtistsPage />
              </NavigationProvider>
            } />
            
            {/* Artwork Routes - Friendly URLs */}
            <Route path="/artist/:artistSlug/:artworkSlug" element={
              <NavigationProvider>
                <ArtworkDetailPage />
              </NavigationProvider>
            } />
            <Route path="/artwork/:id" element={
              <NavigationProvider>
                <ArtworkDetailPage />
              </NavigationProvider>
            } />
            
            {/* Catalogue Routes - Friendly URLs */}
            <Route path="/catalogues" element={
              <NavigationProvider>
                <BrowseCataloguesPage />
              </NavigationProvider>
            } />
            <Route path="/browse/catalogues" element={
              <NavigationProvider>
                <BrowseCataloguesPage />
              </NavigationProvider>
            } />
            <Route path="/community" element={
              <NavigationProvider>
                <CommunityPage />
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
            
            {/* Intelligent Explore - Public and Collector */}
            <Route path="/discover" element={
              <NavigationProvider>
                <IntelligentExplorePage />
              </NavigationProvider>
            } />
            <Route path="/marketplace/explore" element={
              <ProtectedRoute>
                <NavigationProvider>
                  <IntelligentExplorePage />
                </NavigationProvider>
              </ProtectedRoute>
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
                  <IntelligentExplorePage />
                </NavigationProvider>
              </ProtectedRoute>
            } />
            <Route path="/favorites" element={
              <ProtectedRoute>
                <NavigationProvider>
                  <FavoritesPage />
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
                  <SalesPage />
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
            <Route path="/u/profile" element={
              <ProtectedRoute>
                <NavigationProvider>
                  <ArtistProfilePage />
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
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/artwork/new" element={
              <ProtectedRoute>
                <NavigationProvider>
                  <ArtworkCreatePage />
                </NavigationProvider>
              </ProtectedRoute>
            } />
            <Route path="/u/sales" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ArtistSalesPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/u/settings/artist" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ArtistSettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/u/collector/quiz" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CollectorQuizPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* User Pages */}
            <Route path="/u/favorites" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <FavoritesPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/u/collection" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CollectionPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/u/notifications" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <NotificationsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/u/settings" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div>Settings Page - Coming Soon</div>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/u/artworks" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div>My Artworks Page - Coming Soon</div>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/u/messages" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div>Messages Page - Coming Soon</div>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/u/help" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div>Help Page - Coming Soon</div>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Test routes removed - using production-ready components */}
            
            {/* 404 Catch-all Route */}
            <Route path="*" element={<ErrorPage statusCode={404} />} />
          </Routes>
        </Suspense>
        </BrushProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}