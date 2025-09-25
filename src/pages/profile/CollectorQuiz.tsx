import React, { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { Heart, X, RotateCcw, CheckCircle, ArrowRight, Sparkles, Palette, Home, Users, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from "../brush/components/feedback/LoadingSpinner"
import { useAuth } from '@/contexts/AuthProvider'
import toast from 'react-hot-toast'

interface Artwork {
  id: string
  title: string
  image_url: string
  artist_name: string
  medium: string
  year: number
  price: number
  currency: string
  dimensions: {
    width: number
    height: number
    unit: string
  }
  style: string
  genre: string
  color_palette: string[]
  mood: string
  technique: string
}

interface QuizQuestion {
  id: string
  type: 'artwork' | 'style' | 'color' | 'mood' | 'budget' | 'space'
  question: string
  options?: string[]
  artworks?: Artwork[]
  required: boolean
}

interface QuizResult {
  preferred_styles: string[]
  preferred_genres: string[]
  preferred_mediums: string[]
  color_preferences: string[]
  mood_preferences: string[]
  budget_range: {
    min: number
    max: number
  }
  space_preferences: string[]
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  collecting_focus: 'investment' | 'personal' | 'decorative' | 'cultural'
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
}

const CollectorQuiz: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [currentArtworkIndex, setCurrentArtworkIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const quizSteps: QuizQuestion[] = [
    {
      id: 'welcome',
      type: 'artwork',
      question: 'Welcome! Let\'s discover your art taste. Swipe right on artworks you love, left on ones you don\'t.',
      required: false
    },
    {
      id: 'artwork_preferences',
      type: 'artwork',
      question: 'Which artworks appeal to you?',
      required: true
    },
    {
      id: 'style_preferences',
      type: 'style',
      question: 'What art styles do you prefer?',
      options: ['Abstract', 'Realism', 'Impressionism', 'Contemporary', 'Minimalist', 'Pop Art', 'Surrealism', 'Expressionism', 'Cubism', 'Photorealism'],
      required: true
    },
    {
      id: 'color_preferences',
      type: 'color',
      question: 'Which color palettes speak to you?',
      options: ['Warm & Vibrant', 'Cool & Calm', 'Monochrome', 'Pastel', 'Bold & Contrasting', 'Earth Tones', 'Neon & Bright', 'Muted & Subtle'],
      required: true
    },
    {
      id: 'mood_preferences',
      type: 'mood',
      question: 'What mood do you want your art to evoke?',
      options: ['Calm & Peaceful', 'Energetic & Dynamic', 'Mysterious & Intriguing', 'Joyful & Uplifting', 'Thoughtful & Contemplative', 'Bold & Confident', 'Romantic & Dreamy', 'Edgy & Provocative'],
      required: true
    },
    {
      id: 'budget_range',
      type: 'budget',
      question: 'What\'s your budget range for art purchases?',
      options: ['Under $500', '$500 - $2,000', '$2,000 - $10,000', '$10,000 - $50,000', '$50,000+', 'No specific budget'],
      required: true
    },
    {
      id: 'space_preferences',
      type: 'space',
      question: 'Where will you display your art?',
      options: ['Living Room', 'Bedroom', 'Office', 'Dining Room', 'Hallway', 'Outdoor Space', 'Multiple Rooms', 'Gallery Wall'],
      required: true
    }
  ]

  useEffect(() => {
    loadArtworks()
  }, [])

  const loadArtworks = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('artworks')
        .select(`
          id,
          title,
          image_url,
          primary_image_url,
          medium,
          year,
          price,
          currency,
          dimensions,
          user:profiles!artworks_user_id_fkey(
            full_name,
            display_name
          )
        `)
        .eq('status', 'Available')
        .limit(50)

      if (error) throw error

      const processedArtworks: Artwork[] = (data || []).map(artwork => ({
        id: artwork.id,
        title: artwork.title,
        image_url: artwork.primary_image_url || artwork.image_url || '',
        artist_name: artwork.user?.full_name || artwork.user?.display_name || 'Unknown Artist',
        medium: artwork.medium || 'Mixed Media',
        year: artwork.year || new Date().getFullYear(),
        price: artwork.price || 0,
        currency: artwork.currency || 'USD',
        dimensions: artwork.dimensions || { width: 0, height: 0, unit: 'cm' },
        style: 'Contemporary', // This would be determined by AI analysis
        genre: 'Fine Art',
        color_palette: ['#000000', '#FFFFFF'], // This would be extracted from image
        mood: 'Neutral',
        technique: 'Mixed Media'
      }))

      setArtworks(processedArtworks)
    } catch (error) {
      console.error('Error loading artworks:', error)
      toast.error('Failed to load artworks')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwipe = (direction: 'left' | 'right') => {
    if (currentStep === 1) { // Artwork preference step
      const currentArtwork = artworks[currentArtworkIndex]
      if (currentArtwork) {
        const currentAnswers = answers.artwork_preferences || []
        if (direction === 'right') {
          setAnswers(prev => ({
            ...prev,
            artwork_preferences: [...currentAnswers, currentArtwork.id]
          }))
        }
        
        // Move to next artwork
        if (currentArtworkIndex < artworks.length - 1) {
          setCurrentArtworkIndex(prev => prev + 1)
        } else {
          // Move to next step
          setCurrentStep(prev => prev + 1)
        }
      }
    } else {
      // For other steps, just move forward
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.clientX)
  }

  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    
    const currentX = e.clientX
    const diff = currentX - startX
    setSwipeOffset(diff)
    
    if (Math.abs(diff) > 50) {
      setSwipeDirection(diff > 0 ? 'right' : 'left')
    } else {
      setSwipeDirection(null)
    }
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    
    setIsDragging(false)
    
    if (Math.abs(swipeOffset) > 100) {
      handleSwipe(swipeOffset > 0 ? 'right' : 'left')
    }
    
    setSwipeOffset(0)
    setSwipeDirection(null)
  }

  const handleOptionSelect = (option: string) => {
    const currentQuestion = quizSteps[currentStep]
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: [...(prev[currentQuestion.id] || []), option]
    }))
  }

  const handleNext = () => {
    if (currentStep < quizSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      generateResults()
    }
  }

  const generateResults = async () => {
    try {
      setIsSubmitting(true)
      
      // Analyze answers to generate intelligent results
      const result: QuizResult = {
        preferred_styles: answers.style_preferences || [],
        preferred_genres: ['Fine Art'], // Would be determined by AI analysis
        preferred_mediums: ['Oil', 'Acrylic', 'Mixed Media'], // Would be extracted from liked artworks
        color_preferences: answers.color_preferences || [],
        mood_preferences: answers.mood_preferences || [],
        budget_range: {
          min: 0,
          max: 100000
        },
        space_preferences: answers.space_preferences || [],
        experience_level: 'intermediate',
        collecting_focus: 'personal',
        risk_tolerance: 'moderate'
      }

      // Save results to user profile
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            collector_preferences: result,
            quiz_completed: true,
            quiz_completed_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (error) throw error
      }

      toast.success('Quiz completed! Your preferences have been saved.')
      navigate('/u/dashboard')
    } catch (error) {
      console.error('Error saving quiz results:', error)
      toast.error('Failed to save quiz results')
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentQuestion = quizSteps[currentStep]
  const currentArtwork = artworks[currentArtworkIndex]

  if (isLoading) {
    return (
      <div className="quiz-container">
        <div className="quiz-loading">
          <LoadingSpinner size="lg" text="Loading artworks..." />
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Art Taste Quiz | ArtFlow</title>
        <meta name="description" content="Discover your unique art taste with our intelligent quiz" />
      </Helmet>

      <div className="quiz-container">
        {/* Progress Bar */}
        <div className="quiz-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentStep + 1) / quizSteps.length) * 100}%` }}
            />
          </div>
          <span className="progress-text">
            {currentStep + 1} of {quizSteps.length}
          </span>
        </div>

        {/* Question Header */}
        <div className="quiz-header">
          <h1 className="quiz-title">{currentQuestion.question}</h1>
          {currentStep === 1 && (
            <p className="quiz-subtitle">
              Swipe right on artworks you love, left on ones you don't
            </p>
          )}
        </div>

        {/* Main Content */}
        <div className="quiz-content">
          {currentQuestion.type === 'artwork' && currentArtwork ? (
            <div className="artwork-card-container">
              <div 
                ref={cardRef}
                className={`artwork-card ${swipeDirection ? `swipe-${swipeDirection}` : ''}`}
                style={{
                  transform: `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.1}deg)`,
                  opacity: isDragging ? 0.8 : 1
                }}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
                <div className="artwork-image">
                  <img 
                    src={currentArtwork.image_url || 'https://placehold.co/400x600?text=No+Image'} 
                    alt={currentArtwork.title}
                    draggable={false}
                  />
                  <div className="artwork-overlay">
                    <div className="artwork-info">
                      <h3 className="artwork-title">{currentArtwork.title}</h3>
                      <p className="artwork-artist">{currentArtwork.artist_name}</p>
                      <p className="artwork-details">
                        {currentArtwork.medium} • {currentArtwork.year}
                      </p>
                      {currentArtwork.price > 0 && (
                        <p className="artwork-price">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: currentArtwork.currency
                          }).format(currentArtwork.price)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Swipe Actions */}
              <div className="swipe-actions">
                <button 
                  className="swipe-btn swipe-left"
                  onClick={() => handleSwipe('left')}
                >
                  <X size={24} />
                </button>
                <button 
                  className="swipe-btn swipe-right"
                  onClick={() => handleSwipe('right')}
                >
                  <Heart size={24} />
                </button>
              </div>
            </div>
          ) : (
            <div className="quiz-options">
              {currentQuestion.options?.map((option, index) => (
                <button
                  key={index}
                  className={`option-btn ${answers[currentQuestion.id]?.includes(option) ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="quiz-navigation">
          {currentStep > 0 && (
            <button 
              className="quiz-btn secondary"
              onClick={() => setCurrentStep(prev => prev - 1)}
            >
              <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
              Back
            </button>
          )}
          
          <button 
            className="quiz-btn primary"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LoadingSpinner size="sm" />
            ) : currentStep === quizSteps.length - 1 ? (
              <>
                Complete Quiz
                <CheckCircle size={16} />
              </>
            ) : (
              <>
                Next
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* Skip Option */}
        {currentStep > 0 && (
          <button 
            className="quiz-skip"
            onClick={handleNext}
          >
            Skip this step
          </button>
        )}
      </div>
    </>
  )
}

export default CollectorQuiz