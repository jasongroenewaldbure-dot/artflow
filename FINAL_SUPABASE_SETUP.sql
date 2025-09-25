-- FINAL SUPABASE SETUP FOR ARTFLOW
-- This is the complete, production-ready database schema for ArtFlow
-- Run this once to set up the entire database structure

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create profiles table with all required columns
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    full_name TEXT,
    email TEXT,
    slug TEXT UNIQUE,
    bio TEXT,
    avatar_url TEXT,
    location TEXT,
    website TEXT,
    role TEXT NOT NULL DEFAULT 'collector' CHECK (role IN ('artist', 'collector', 'both')),
    password_set BOOLEAN DEFAULT FALSE,
    profile_completed BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone TEXT,
    birth_date DATE,
    gender TEXT,
    nationality TEXT,
    languages TEXT[],
    social_links JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    is_featured BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    followers_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create artworks table
CREATE TABLE IF NOT EXISTS public.artworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE,
    year INTEGER,
    medium TEXT,
    genre TEXT,
    style TEXT,
    subject TEXT,
    width_cm DECIMAL,
    height_cm DECIMAL,
    depth_cm DECIMAL,
    price DECIMAL,
    currency TEXT DEFAULT 'USD',
    primary_image_url TEXT,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'draft', 'archived')),
    is_for_sale BOOLEAN DEFAULT TRUE,
    is_trending BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    dominant_colors TEXT[],
    analysis_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create catalogues table
CREATE TABLE IF NOT EXISTS public.catalogues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE,
    cover_image_url TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    access_type TEXT DEFAULT 'public' CHECK (access_type IN ('public', 'private', 'password')),
    password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create catalogue_artworks junction table
CREATE TABLE IF NOT EXISTS public.catalogue_artworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catalogue_id UUID NOT NULL REFERENCES public.catalogues(id) ON DELETE CASCADE,
    artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(catalogue_id, artwork_id)
);

-- Create artwork_images table
CREATE TABLE IF NOT EXISTS public.artwork_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    watermarked_image_url TEXT,
    visualization_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_interactions table for analytics
CREATE TABLE IF NOT EXISTS public.user_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    artwork_id UUID REFERENCES public.artworks(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'like', 'save', 'share', 'inquiry')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create search history table
CREATE TABLE IF NOT EXISTS public.search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    filters JSONB DEFAULT '{}',
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_featured ON public.profiles(is_featured);
CREATE INDEX IF NOT EXISTS idx_profiles_followers_count ON public.profiles(followers_count);

CREATE INDEX IF NOT EXISTS idx_artworks_user_id ON public.artworks(user_id);
CREATE INDEX IF NOT EXISTS idx_artworks_slug ON public.artworks(slug);
CREATE INDEX IF NOT EXISTS idx_artworks_status ON public.artworks(status);
CREATE INDEX IF NOT EXISTS idx_artworks_price ON public.artworks(price);
CREATE INDEX IF NOT EXISTS idx_artworks_medium ON public.artworks(medium);
CREATE INDEX IF NOT EXISTS idx_artworks_style ON public.artworks(style);
CREATE INDEX IF NOT EXISTS idx_artworks_subject ON public.artworks(subject);
CREATE INDEX IF NOT EXISTS idx_artworks_genre ON public.artworks(genre);
CREATE INDEX IF NOT EXISTS idx_artworks_trending ON public.artworks(is_trending);
CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON public.artworks(created_at);

CREATE INDEX IF NOT EXISTS idx_catalogues_user_id ON public.catalogues(user_id);
CREATE INDEX IF NOT EXISTS idx_catalogues_slug ON public.catalogues(slug);
CREATE INDEX IF NOT EXISTS idx_catalogues_published ON public.catalogues(is_published);

CREATE INDEX IF NOT EXISTS idx_artwork_images_artwork_id ON public.artwork_images(artwork_id);
CREATE INDEX IF NOT EXISTS idx_catalogue_artworks_catalogue_id ON public.catalogue_artworks(catalogue_id);
CREATE INDEX IF NOT EXISTS idx_catalogue_artworks_artwork_id ON public.catalogue_artworks(artwork_id);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_artwork_id ON public.user_interactions(artwork_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON public.user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON public.user_interactions(created_at);

CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON public.search_history(created_at);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogue_artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artwork_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for artworks
DROP POLICY IF EXISTS "Users can view all artworks" ON public.artworks;
CREATE POLICY "Users can view all artworks" ON public.artworks
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own artworks" ON public.artworks;
CREATE POLICY "Users can manage their own artworks" ON public.artworks
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for catalogues
DROP POLICY IF EXISTS "Users can view published catalogues" ON public.catalogues;
CREATE POLICY "Users can view published catalogues" ON public.catalogues
    FOR SELECT USING (is_published = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own catalogues" ON public.catalogues;
CREATE POLICY "Users can manage their own catalogues" ON public.catalogues
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for catalogue_artworks
DROP POLICY IF EXISTS "Users can view catalogue artworks" ON public.catalogue_artworks;
CREATE POLICY "Users can view catalogue artworks" ON public.catalogue_artworks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.catalogues 
            WHERE id = catalogue_id 
            AND (is_published = true OR user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can manage catalogue artworks" ON public.catalogue_artworks;
CREATE POLICY "Users can manage catalogue artworks" ON public.catalogue_artworks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.catalogues 
            WHERE id = catalogue_id 
            AND user_id = auth.uid()
        )
    );

-- Create RLS policies for artwork_images
DROP POLICY IF EXISTS "Users can view artwork images" ON public.artwork_images;
CREATE POLICY "Users can view artwork images" ON public.artwork_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.artworks 
            WHERE id = artwork_id 
            AND status = 'available'
        )
    );

DROP POLICY IF EXISTS "Users can manage their artwork images" ON public.artwork_images;
CREATE POLICY "Users can manage their artwork images" ON public.artwork_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.artworks 
            WHERE id = artwork_id 
            AND user_id = auth.uid()
        )
    );

-- Create RLS policies for user_interactions
DROP POLICY IF EXISTS "Users can view their own interactions" ON public.user_interactions;
CREATE POLICY "Users can view their own interactions" ON public.user_interactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create interactions" ON public.user_interactions;
CREATE POLICY "Users can create interactions" ON public.user_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for search_history
DROP POLICY IF EXISTS "Users can view their own search history" ON public.search_history;
CREATE POLICY "Users can view their own search history" ON public.search_history
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create search history" ON public.search_history;
CREATE POLICY "Users can create search history" ON public.search_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artworks_updated_at 
    BEFORE UPDATE ON public.artworks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_catalogues_updated_at 
    BEFORE UPDATE ON public.catalogues 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artwork_images_updated_at 
    BEFORE UPDATE ON public.artwork_images 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name, email, role, email_verified)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
        NEW.email,
        'collector',
        NEW.email_confirmed_at IS NOT NULL
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function for cross-entity search
CREATE OR REPLACE FUNCTION public.cross_entity_search(
    search_query TEXT,
    entity_types TEXT[] DEFAULT ARRAY['artworks', 'profiles'],
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    entity_type TEXT,
    title TEXT,
    description TEXT,
    metadata JSONB,
    relevance_score REAL
) AS $$
BEGIN
    RETURN QUERY
    WITH search_tokens AS (
        SELECT unnest(string_to_array(lower(trim(search_query)), ' ')) as token
    ),
    artwork_results AS (
        SELECT 
            a.id,
            'artwork'::TEXT as entity_type,
            a.title,
            COALESCE(a.description, '') as description,
            jsonb_build_object(
                'artist_name', p.display_name,
                'artist_slug', p.slug,
                'price', a.price,
                'currency', a.currency,
                'medium', a.medium,
                'style', a.style,
                'genre', a.genre,
                'primary_image_url', a.primary_image_url
            ) as metadata,
            (
                CASE 
                    WHEN a.title ILIKE '%' || search_query || '%' THEN 10
                    WHEN a.description ILIKE '%' || search_query || '%' THEN 8
                    WHEN a.medium ILIKE '%' || search_query || '%' THEN 6
                    WHEN a.style ILIKE '%' || search_query || '%' THEN 6
                    WHEN a.genre ILIKE '%' || search_query || '%' THEN 5
                    WHEN p.display_name ILIKE '%' || search_query || '%' THEN 7
                    ELSE 1
                END
            )::REAL as relevance_score
        FROM public.artworks a
        LEFT JOIN public.profiles p ON a.user_id = p.user_id
        WHERE a.status = 'available'
        AND (
            a.title ILIKE '%' || search_query || '%' OR
            a.description ILIKE '%' || search_query || '%' OR
            a.medium ILIKE '%' || search_query || '%' OR
            a.style ILIKE '%' || search_query || '%' OR
            a.genre ILIKE '%' || search_query || '%' OR
            p.display_name ILIKE '%' || search_query || '%'
        )
    ),
    profile_results AS (
        SELECT 
            p.id,
            'profile'::TEXT as entity_type,
            p.display_name as title,
            COALESCE(p.bio, '') as description,
            jsonb_build_object(
                'slug', p.slug,
                'role', p.role,
                'avatar_url', p.avatar_url,
                'location', p.location,
                'website', p.website
            ) as metadata,
            (
                CASE 
                    WHEN p.display_name ILIKE '%' || search_query || '%' THEN 10
                    WHEN p.bio ILIKE '%' || search_query || '%' THEN 8
                    WHEN p.location ILIKE '%' || search_query || '%' THEN 5
                    ELSE 1
                END
            )::REAL as relevance_score
        FROM public.profiles p
        WHERE (
            p.display_name ILIKE '%' || search_query || '%' OR
            p.bio ILIKE '%' || search_query || '%' OR
            p.location ILIKE '%' || search_query || '%'
        )
    )
    SELECT * FROM (
        SELECT * FROM artwork_results WHERE 'artworks' = ANY(entity_types)
        UNION ALL
        SELECT * FROM profile_results WHERE 'profiles' = ANY(entity_types)
    ) results
    ORDER BY relevance_score DESC, title ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant execute permission on search function
GRANT EXECUTE ON FUNCTION public.cross_entity_search TO authenticated;

-- Insert some sample data for testing (optional)
-- Uncomment these lines if you want sample data

/*
-- Sample artist profile
INSERT INTO public.profiles (user_id, display_name, email, role, bio, profile_completed, onboarding_completed, email_verified)
VALUES (
    gen_random_uuid(),
    'Sample Artist',
    'artist@example.com',
    'artist',
    'Contemporary artist exploring themes of identity and memory.',
    true,
    true,
    true
);

-- Sample collector profile
INSERT INTO public.profiles (user_id, display_name, email, role, bio, profile_completed, onboarding_completed, email_verified)
VALUES (
    gen_random_uuid(),
    'Art Collector',
    'collector@example.com',
    'collector',
    'Passionate collector of contemporary art.',
    true,
    true,
    true
);
*/

-- Final verification
SELECT 'Database setup completed successfully!' as status;