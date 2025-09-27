import { supabase } from '../lib/supabase'
import { webScraper } from './webScraper'
import { GALLERY_NAMES, ART_FAIR_NAMES, PUBLICATION_NAMES, GALLERIES, ART_FAIRS, PUBLICATIONS } from './dataSources'

export interface AuctionResult {
  id: string
  artist_name: string
  artwork_title: string
  sale_price: number
  currency: string
  sale_date: string
  auction_house: string
  lot_number?: string
  medium?: string
  dimensions?: string
  estimate_low?: number
  estimate_high?: number
  hammer_price?: number
  buyer_premium?: number
  provenance?: string
  exhibition_history?: string
  literature?: string
  condition?: string
  image_url?: string
  lot_url?: string
}

export interface GalleryRepresentation {
  id: string
  gallery_name: string
  artist_name: string
  representation_type: 'primary' | 'secondary' | 'exhibition'
  start_date: string
  end_date?: string
  is_active: boolean
  gallery_location: string
  gallery_website?: string
  gallery_email?: string
  gallery_phone?: string
}

export interface ArtFairParticipation {
  id: string
  fair_name: string
  artist_name: string
  gallery_name?: string
  booth_number?: string
  participation_type: 'solo' | 'group' | 'curated'
  fair_year: number
  fair_location: string
  fair_dates: string
  artworks_shown?: string[]
  press_coverage?: string[]
}

export interface PressArticle {
  id: string
  title: string
  artist_name: string
  publication: string
  author?: string
  published_date: string
  article_url?: string
  excerpt?: string
  tags?: string[]
  image_url?: string
}

class ExternalDataScrapersService {
  private readonly USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  private readonly REQUEST_DELAY = 1000 // 1 second delay between requests
  private readonly MAX_CONCURRENT_REQUESTS = 5 // Limit concurrent requests
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours cache
  private readonly RETRY_ATTEMPTS = 3
  private readonly RETRY_DELAY = 2000 // 2 seconds between retries
  
  // Performance tracking
  private scrapingStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    cacheHits: 0,
    averageResponseTime: 0
  }

  // Auction House Scrapers
  async scrapeChristiesResults(artistName: string): Promise<AuctionResult[]> {
    try {
      console.log(`Scraping Christie's results for artist: ${artistName}`)
      
      // Use the web scraper to get Christie's data
      const lots = await webScraper.scrapeChristiesArtist(artistName)
      const results: AuctionResult[] = []
      
      if (lots && Array.isArray(lots)) {
        for (const lot of lots) {
          const result: AuctionResult = {
            id: `christies_${lot.id}`,
            artist_name: artistName,
            artwork_title: lot.title || 'Untitled',
            sale_price: lot.price_realized?.value || 0,
            currency: lot.price_realized?.currency || 'USD',
            sale_date: lot.sale_date || new Date().toISOString(),
            auction_house: 'Christie\'s',
            lot_number: lot.lot_number,
            medium: lot.medium,
            dimensions: lot.dimensions,
            estimate_low: lot.estimate?.low?.value,
            estimate_high: lot.estimate?.high?.value,
            hammer_price: lot.hammer_price?.value,
            buyer_premium: lot.buyer_premium?.value,
            provenance: lot.provenance,
            exhibition_history: lot.exhibition_history,
            literature: lot.literature,
            condition: lot.condition,
            image_url: lot.images?.[0]?.url,
            lot_url: lot.url
          }
          results.push(result)
        }
      }

      console.log(`Found ${results.length} Christie's results for ${artistName}`)
      
      // Store results in database
      await this.storeAuctionResults(results)
      
      return results
    } catch (error) {
      console.error('Error scraping Christie\'s results:', error)
      return []
    }
  }

  async scrapeSothebysResults(artistName: string): Promise<AuctionResult[]> {
    try {
      console.log(`Scraping Sotheby's results for artist: ${artistName}`)
      
      // Use the web scraper to get Sotheby's data
      const lots = await webScraper.scrapeSothebysArtist(artistName)
      const results: AuctionResult[] = []
      
      if (lots && Array.isArray(lots)) {
        for (const lot of lots) {
          const result: AuctionResult = {
            id: `sothebys_${lot.id}`,
            artist_name: artistName,
            artwork_title: lot.title || 'Untitled',
            sale_price: lot.sold_price?.amount || 0,
            currency: lot.sold_price?.currency || 'USD',
            sale_date: lot.sale_date || new Date().toISOString(),
            auction_house: 'Sotheby\'s',
            lot_number: lot.lot_number,
            medium: lot.medium,
            dimensions: lot.dimensions,
            estimate_low: lot.estimate?.low?.amount,
            estimate_high: lot.estimate?.high?.amount,
            hammer_price: lot.hammer_price?.amount,
            buyer_premium: lot.buyer_premium?.amount,
            provenance: lot.provenance,
            exhibition_history: lot.exhibition_history,
            literature: lot.literature,
            condition: lot.condition,
            image_url: lot.images?.[0]?.url,
            lot_url: lot.url
          }
          results.push(result)
        }
      }

      console.log(`Found ${results.length} Sotheby's results for ${artistName}`)
      
      // Store results in database
      await this.storeAuctionResults(results)
      
      return results
    } catch (error) {
      console.error('Error scraping Sotheby\'s results:', error)
      return []
    }
  }

  async scrapePhillipsResults(artistName: string): Promise<AuctionResult[]> {
    try {
      console.log(`Scraping Phillips results for artist: ${artistName}`)
      
      // Use the web scraper to get Phillips data
      const lots = await webScraper.scrapePhillipsArtist(artistName)
      const results: AuctionResult[] = []
      
      if (lots && Array.isArray(lots)) {
        for (const lot of lots) {
          const result: AuctionResult = {
            id: `phillips_${lot.id}`,
            artist_name: artistName,
            artwork_title: lot.title || 'Untitled',
            sale_price: lot.price_realized?.value || 0,
            currency: lot.price_realized?.currency || 'USD',
            sale_date: lot.sale_date || new Date().toISOString(),
            auction_house: 'Phillips',
            lot_number: lot.lot_number,
            medium: lot.medium,
            dimensions: lot.dimensions,
            estimate_low: lot.estimate?.low?.value,
            estimate_high: lot.estimate?.high?.value,
            hammer_price: lot.hammer_price?.value,
            buyer_premium: lot.buyer_premium?.value,
            provenance: lot.provenance,
            exhibition_history: lot.exhibition_history,
            literature: lot.literature,
            condition: lot.condition,
            image_url: lot.images?.[0]?.url,
            lot_url: lot.url
          }
          results.push(result)
        }
      }

      console.log(`Found ${results.length} Phillips results for ${artistName}`)
      
      // Store results in database
      await this.storeAuctionResults(results)
      
      return results
    } catch (error) {
      console.error('Error scraping Phillips results:', error)
      return []
    }
  }

  // Additional Auction House Scrapers
  async scrapeBonhamsResults(artistName: string): Promise<AuctionResult[]> {
    try {
      console.log(`Scraping Bonhams results for artist: ${artistName}`)
      
      const lots = await webScraper.scrapeBonhamsArtist(artistName)
      const results: AuctionResult[] = []
      
      if (lots && Array.isArray(lots)) {
        for (const lot of lots) {
          const result: AuctionResult = {
            id: `bonhams_${lot.id}`,
            artist_name: artistName,
            artwork_title: lot.title || 'Untitled',
            sale_price: lot.price_realized?.value || 0,
            currency: lot.price_realized?.currency || 'GBP',
            sale_date: lot.sale_date || new Date().toISOString(),
            auction_house: 'Bonhams',
            lot_number: lot.lot_number,
            medium: lot.medium,
            dimensions: lot.dimensions,
            estimate_low: lot.estimate?.low?.value,
            estimate_high: lot.estimate?.high?.value,
            hammer_price: lot.hammer_price?.value,
            buyer_premium: lot.buyer_premium?.value,
            provenance: lot.provenance,
            exhibition_history: lot.exhibition_history,
            literature: lot.literature,
            condition: lot.condition,
            image_url: lot.images?.[0]?.url,
            lot_url: lot.url
          }
          results.push(result)
        }
      }

      console.log(`Found ${results.length} Bonhams results for ${artistName}`)
      await this.storeAuctionResults(results)
      return results
    } catch (error) {
      console.error('Error scraping Bonhams results:', error)
      return []
    }
  }

  async scrapeSothebysAfricaResults(artistName: string): Promise<AuctionResult[]> {
    try {
      console.log(`Scraping Sotheby's Africa results for artist: ${artistName}`)
      
      const lots = await webScraper.scrapeSothebysAfricaArtist(artistName)
      const results: AuctionResult[] = []
      
      if (lots && Array.isArray(lots)) {
        for (const lot of lots) {
          const result: AuctionResult = {
            id: `sothebys_africa_${lot.id}`,
            artist_name: artistName,
            artwork_title: lot.title || 'Untitled',
            sale_price: lot.price_realized?.value || 0,
            currency: lot.price_realized?.currency || 'ZAR',
            sale_date: lot.sale_date || new Date().toISOString(),
            auction_house: 'Sotheby\'s Africa',
            lot_number: lot.lot_number,
            medium: lot.medium,
            dimensions: lot.dimensions,
            estimate_low: lot.estimate?.low?.value,
            estimate_high: lot.estimate?.high?.value,
            hammer_price: lot.hammer_price?.value,
            buyer_premium: lot.buyer_premium?.value,
            provenance: lot.provenance,
            exhibition_history: lot.exhibition_history,
            literature: lot.literature,
            condition: lot.condition,
            image_url: lot.images?.[0]?.url,
            lot_url: lot.url
          }
          results.push(result)
        }
      }

      console.log(`Found ${results.length} Sotheby's Africa results for ${artistName}`)
      await this.storeAuctionResults(results)
      return results
    } catch (error) {
      console.error('Error scraping Sotheby\'s Africa results:', error)
      return []
    }
  }

  async scrapeStraussResults(artistName: string): Promise<AuctionResult[]> {
    try {
      console.log(`Scraping Strauss & Co results for artist: ${artistName}`)
      
      const lots = await webScraper.scrapeStraussArtist(artistName)
      const results: AuctionResult[] = []
      
      if (lots && Array.isArray(lots)) {
        for (const lot of lots) {
          const result: AuctionResult = {
            id: `strauss_${lot.id}`,
            artist_name: artistName,
            artwork_title: lot.title || 'Untitled',
            sale_price: lot.price_realized?.value || 0,
            currency: lot.price_realized?.currency || 'ZAR',
            sale_date: lot.sale_date || new Date().toISOString(),
            auction_house: 'Strauss & Co',
            lot_number: lot.lot_number,
            medium: lot.medium,
            dimensions: lot.dimensions,
            estimate_low: lot.estimate?.low?.value,
            estimate_high: lot.estimate?.high?.value,
            hammer_price: lot.hammer_price?.value,
            buyer_premium: lot.buyer_premium?.value,
            provenance: lot.provenance,
            exhibition_history: lot.exhibition_history,
            literature: lot.literature,
            condition: lot.condition,
            image_url: lot.images?.[0]?.url,
            lot_url: lot.url
          }
          results.push(result)
        }
      }

      console.log(`Found ${results.length} Strauss & Co results for ${artistName}`)
      await this.storeAuctionResults(results)
      return results
    } catch (error) {
      console.error('Error scraping Strauss & Co results:', error)
      return []
    }
  }

  async scrapeAspireResults(artistName: string): Promise<AuctionResult[]> {
    try {
      console.log(`Scraping Aspire Art Auctions results for artist: ${artistName}`)
      
      const lots = await webScraper.scrapeAspireArtist(artistName)
      const results: AuctionResult[] = []
      
      if (lots && Array.isArray(lots)) {
        for (const lot of lots) {
          const result: AuctionResult = {
            id: `aspire_${lot.id}`,
            artist_name: artistName,
            artwork_title: lot.title || 'Untitled',
            sale_price: lot.price_realized?.value || 0,
            currency: lot.price_realized?.currency || 'ZAR',
            sale_date: lot.sale_date || new Date().toISOString(),
            auction_house: 'Aspire Art Auctions',
            lot_number: lot.lot_number,
            medium: lot.medium,
            dimensions: lot.dimensions,
            estimate_low: lot.estimate?.low?.value,
            estimate_high: lot.estimate?.high?.value,
            hammer_price: lot.hammer_price?.value,
            buyer_premium: lot.buyer_premium?.value,
            provenance: lot.provenance,
            exhibition_history: lot.exhibition_history,
            literature: lot.literature,
            condition: lot.condition,
            image_url: lot.images?.[0]?.url,
            lot_url: lot.url
          }
          results.push(result)
        }
      }

      console.log(`Found ${results.length} Aspire Art Auctions results for ${artistName}`)
      await this.storeAuctionResults(results)
      return results
    } catch (error) {
      console.error('Error scraping Aspire Art Auctions results:', error)
      return []
    }
  }

  async scrapeStephanWelzResults(artistName: string): Promise<AuctionResult[]> {
    try {
      console.log(`Scraping Stephan Welz & Co results for artist: ${artistName}`)
      
      const lots = await webScraper.scrapeStephanWelzArtist(artistName)
      const results: AuctionResult[] = []
      
      if (lots && Array.isArray(lots)) {
        for (const lot of lots) {
          const result: AuctionResult = {
            id: `stephan_welz_${lot.id}`,
            artist_name: artistName,
            artwork_title: lot.title || 'Untitled',
            sale_price: lot.price_realized?.value || 0,
            currency: lot.price_realized?.currency || 'ZAR',
            sale_date: lot.sale_date || new Date().toISOString(),
            auction_house: 'Stephan Welz & Co',
            lot_number: lot.lot_number,
            medium: lot.medium,
            dimensions: lot.dimensions,
            estimate_low: lot.estimate?.low?.value,
            estimate_high: lot.estimate?.high?.value,
            hammer_price: lot.hammer_price?.value,
            buyer_premium: lot.buyer_premium?.value,
            provenance: lot.provenance,
            exhibition_history: lot.exhibition_history,
            literature: lot.literature,
            condition: lot.condition,
            image_url: lot.images?.[0]?.url,
            lot_url: lot.url
          }
          results.push(result)
        }
      }

      console.log(`Found ${results.length} Stephan Welz & Co results for ${artistName}`)
      await this.storeAuctionResults(results)
      return results
    } catch (error) {
      console.error('Error scraping Stephan Welz & Co results:', error)
      return []
    }
  }

  async scrapeArtnetResults(artistName: string): Promise<AuctionResult[]> {
    try {
      console.log(`Scraping Artnet results for artist: ${artistName}`)
      
      const lots = await webScraper.scrapeArtnetArtist(artistName)
      const results: AuctionResult[] = []
      
      if (lots && Array.isArray(lots)) {
        for (const lot of lots) {
          const result: AuctionResult = {
            id: `artnet_${lot.id}`,
            artist_name: artistName,
            artwork_title: lot.title || 'Untitled',
            sale_price: lot.price_realized?.value || 0,
            currency: lot.price_realized?.currency || 'USD',
            sale_date: lot.sale_date || new Date().toISOString(),
            auction_house: 'Artnet',
            lot_number: lot.lot_number,
            medium: lot.medium,
            dimensions: lot.dimensions,
            estimate_low: lot.estimate?.low?.value,
            estimate_high: lot.estimate?.high?.value,
            hammer_price: lot.hammer_price?.value,
            buyer_premium: lot.buyer_premium?.value,
            provenance: lot.provenance,
            exhibition_history: lot.exhibition_history,
            literature: lot.literature,
            condition: lot.condition,
            image_url: lot.images?.[0]?.url,
            lot_url: lot.url
          }
          results.push(result)
        }
      }

      console.log(`Found ${results.length} Artnet results for ${artistName}`)
      await this.storeAuctionResults(results)
      return results
    } catch (error) {
      console.error('Error scraping Artnet results:', error)
      return []
    }
  }

  async scrapeArtcurialResults(artistName: string): Promise<AuctionResult[]> {
    try {
      console.log(`Scraping Artcurial results for artist: ${artistName}`)
      
      const lots = await webScraper.scrapeArtcurialArtist(artistName)
      const results: AuctionResult[] = []
      
      if (lots && Array.isArray(lots)) {
        for (const lot of lots) {
          const result: AuctionResult = {
            id: `artcurial_${lot.id}`,
            artist_name: artistName,
            artwork_title: lot.title || 'Untitled',
            sale_price: lot.price_realized?.value || 0,
            currency: lot.price_realized?.currency || 'EUR',
            sale_date: lot.sale_date || new Date().toISOString(),
            auction_house: 'Artcurial',
            lot_number: lot.lot_number,
            medium: lot.medium,
            dimensions: lot.dimensions,
            estimate_low: lot.estimate?.low?.value,
            estimate_high: lot.estimate?.high?.value,
            hammer_price: lot.hammer_price?.value,
            buyer_premium: lot.buyer_premium?.value,
            provenance: lot.provenance,
            exhibition_history: lot.exhibition_history,
            literature: lot.literature,
            condition: lot.condition,
            image_url: lot.images?.[0]?.url,
            lot_url: lot.url
          }
          results.push(result)
        }
      }

      console.log(`Found ${results.length} Artcurial results for ${artistName}`)
      await this.storeAuctionResults(results)
      return results
    } catch (error) {
      console.error('Error scraping Artcurial results:', error)
      return []
    }
  }

  async scrapeDorotheumResults(artistName: string): Promise<AuctionResult[]> {
    try {
      console.log(`Scraping Dorotheum results for artist: ${artistName}`)
      
      const lots = await webScraper.scrapeDorotheumArtist(artistName)
      const results: AuctionResult[] = []
      
      if (lots && Array.isArray(lots)) {
        for (const lot of lots) {
          const result: AuctionResult = {
            id: `dorotheum_${lot.id}`,
            artist_name: artistName,
            artwork_title: lot.title || 'Untitled',
            sale_price: lot.price_realized?.value || 0,
            currency: lot.price_realized?.currency || 'EUR',
            sale_date: lot.sale_date || new Date().toISOString(),
            auction_house: 'Dorotheum',
            lot_number: lot.lot_number,
            medium: lot.medium,
            dimensions: lot.dimensions,
            estimate_low: lot.estimate?.low?.value,
            estimate_high: lot.estimate?.high?.value,
            hammer_price: lot.hammer_price?.value,
            buyer_premium: lot.buyer_premium?.value,
            provenance: lot.provenance,
            exhibition_history: lot.exhibition_history,
            literature: lot.literature,
            condition: lot.condition,
            image_url: lot.images?.[0]?.url,
            lot_url: lot.url
          }
          results.push(result)
        }
      }

      console.log(`Found ${results.length} Dorotheum results for ${artistName}`)
      await this.storeAuctionResults(results)
      return results
    } catch (error) {
      console.error('Error scraping Dorotheum results:', error)
      return []
    }
  }

  async scrapeKollerResults(artistName: string): Promise<AuctionResult[]> {
    try {
      console.log(`Scraping Koller results for artist: ${artistName}`)
      
      const lots = await webScraper.scrapeKollerArtist(artistName)
      const results: AuctionResult[] = []
      
      if (lots && Array.isArray(lots)) {
        for (const lot of lots) {
          const result: AuctionResult = {
            id: `koller_${lot.id}`,
            artist_name: artistName,
            artwork_title: lot.title || 'Untitled',
            sale_price: lot.price_realized?.value || 0,
            currency: lot.price_realized?.currency || 'CHF',
            sale_date: lot.sale_date || new Date().toISOString(),
            auction_house: 'Koller',
            lot_number: lot.lot_number,
            medium: lot.medium,
            dimensions: lot.dimensions,
            estimate_low: lot.estimate?.low?.value,
            estimate_high: lot.estimate?.high?.value,
            hammer_price: lot.hammer_price?.value,
            buyer_premium: lot.buyer_premium?.value,
            provenance: lot.provenance,
            exhibition_history: lot.exhibition_history,
            literature: lot.literature,
            condition: lot.condition,
            image_url: lot.images?.[0]?.url,
            lot_url: lot.url
          }
          results.push(result)
        }
      }

      console.log(`Found ${results.length} Koller results for ${artistName}`)
      await this.storeAuctionResults(results)
      return results
    } catch (error) {
      console.error('Error scraping Koller results:', error)
      return []
    }
  }

  async scrapeLempertzResults(artistName: string): Promise<AuctionResult[]> {
    try {
      console.log(`Scraping Lempertz results for artist: ${artistName}`)
      
      const lots = await webScraper.scrapeLempertzArtist(artistName)
      const results: AuctionResult[] = []
      
      if (lots && Array.isArray(lots)) {
        for (const lot of lots) {
          const result: AuctionResult = {
            id: `lempertz_${lot.id}`,
            artist_name: artistName,
            artwork_title: lot.title || 'Untitled',
            sale_price: lot.price_realized?.value || 0,
            currency: lot.price_realized?.currency || 'EUR',
            sale_date: lot.sale_date || new Date().toISOString(),
            auction_house: 'Lempertz',
            lot_number: lot.lot_number,
            medium: lot.medium,
            dimensions: lot.dimensions,
            estimate_low: lot.estimate?.low?.value,
            estimate_high: lot.estimate?.high?.value,
            hammer_price: lot.hammer_price?.value,
            buyer_premium: lot.buyer_premium?.value,
            provenance: lot.provenance,
            exhibition_history: lot.exhibition_history,
            literature: lot.literature,
            condition: lot.condition,
            image_url: lot.images?.[0]?.url,
            lot_url: lot.url
          }
          results.push(result)
        }
      }

      console.log(`Found ${results.length} Lempertz results for ${artistName}`)
      await this.storeAuctionResults(results)
      return results
    } catch (error) {
      console.error('Error scraping Lempertz results:', error)
      return []
    }
  }

  // Gallery Representation Scrapers
  async scrapeGalleryRepresentations(artistName: string): Promise<GalleryRepresentation[]> {
    try {
      const representations: GalleryRepresentation[] = []
      
      // Search comprehensive gallery websites including South African, African, and European galleries
      const galleries = GALLERY_NAMES

      for (const galleryName of galleries) {
        try {
          // Search for artist representation on gallery website
          const representation = await this.searchGalleryForArtist(galleryName, artistName)
          if (representation) {
            representations.push(representation)
          }
          
          // Delay between requests to be respectful
          await this.delay(this.REQUEST_DELAY)
        } catch (error) {
          console.error(`Error searching ${galleryName} for ${artistName}:`, error)
        }
      }

      // Store results in database
      await this.storeGalleryRepresentations(representations)
      
      return representations
    } catch (error) {
      console.error('Error scraping gallery representations:', error)
      return []
    }
  }

  private async searchGalleryForArtist(galleryName: string, artistName: string): Promise<GalleryRepresentation | null> {
    try {

      const galleryUrl = GALLERIES[galleryName as keyof typeof GALLERIES]
      if (!galleryUrl) return null

      console.log(`Scraping ${galleryName} for artist: ${artistName}`)
      
      // Use the web scraper to search the gallery website
      const galleryInfo = await webScraper.scrapeGalleryWebsite(galleryUrl, artistName)
      
      if (galleryInfo && galleryInfo.artist_found) {
        const representation: GalleryRepresentation = {
          id: `${galleryName.toLowerCase().replace(/\s+/g, '_')}_${artistName.toLowerCase().replace(/\s+/g, '_')}`,
          gallery_name: galleryName,
          artist_name: artistName,
          representation_type: 'primary', // Would need to determine this from the data
          start_date: new Date().toISOString(),
          is_active: true,
          gallery_location: 'Unknown', // Would extract from gallery info
          gallery_website: galleryUrl,
          exhibitions: galleryInfo.exhibitions || []
        }
        
        console.log(`Found representation for ${artistName} at ${galleryName}`)
        return representation
      }

      return null
    } catch (error) {
      console.error(`Error searching ${galleryName} for ${artistName}:`, error)
      return null
    }
  }

  // Art Fair Participation Scrapers
  async scrapeArtFairParticipation(artistName: string): Promise<ArtFairParticipation[]> {
    try {
      const participations: ArtFairParticipation[] = []
      
      // Search comprehensive art fairs including South African, African, and European art fairs
      const artFairs = ART_FAIR_NAMES

      for (const fairName of artFairs) {
        try {
          const participation = await this.searchArtFairForArtist(fairName, artistName)
          if (participation) {
            participations.push(participation)
          }
          
          // Delay between requests
          await this.delay(this.REQUEST_DELAY)
        } catch (error) {
          console.error(`Error searching ${fairName} for ${artistName}:`, error)
        }
      }

      // Store results in database
      await this.storeArtFairParticipations(participations)
      
      return participations
    } catch (error) {
      console.error('Error scraping art fair participation:', error)
      return []
    }
  }

  private async searchArtFairForArtist(fairName: string, artistName: string): Promise<ArtFairParticipation | null> {
    try {
      // This would implement actual web scraping for each art fair
      // For now, we'll simulate the search
      const fairUrl = ART_FAIRS[fairName as keyof typeof ART_FAIRS]
      if (!fairUrl) return null

      // In a real implementation, you would:
      // 1. Navigate to the art fair's exhibitor/artist page
      // 2. Search for the specific artist
      // 3. Parse the HTML to extract participation details
      // 4. Return structured data

      // For now, return null (no participation found)
      return null
    } catch (error) {
      console.error(`Error searching ${fairName} for ${artistName}:`, error)
      return null
    }
  }

  // Press Coverage Scrapers
  async scrapePressCoverage(artistName: string): Promise<PressArticle[]> {
    try {
      const articles: PressArticle[] = []
      
      // Search comprehensive art publications including South African, African, and European publications
      const publications = PUBLICATION_NAMES

      for (const publication of publications) {
        try {
          const publicationArticles = await this.searchPublicationForArtist(publication, artistName)
          articles.push(...publicationArticles)
          
          // Delay between requests
          await this.delay(this.REQUEST_DELAY)
        } catch (error) {
          console.error(`Error searching ${publication} for ${artistName}:`, error)
        }
      }

      // Store results in database
      await this.storePressArticles(articles)
      
      return articles
    } catch (error) {
      console.error('Error scraping press coverage:', error)
      return []
    }
  }

  private async searchPublicationForArtist(publication: string, artistName: string): Promise<PressArticle[]> {
    try {
      // This would implement actual web scraping for each publication
      // For now, we'll simulate the search
      const publicationUrl = PUBLICATIONS[publication as keyof typeof PUBLICATIONS]
      if (!publicationUrl) return []

      // In a real implementation, you would:
      // 1. Navigate to the publication's search page
      // 2. Search for the specific artist
      // 3. Parse the HTML to extract article details
      // 4. Return structured data

      // For now, return empty array (no articles found)
      return []
    } catch (error) {
      console.error(`Error searching ${publication} for ${artistName}:`, error)
      return []
    }
  }

  // Database Storage Methods
  private async storeAuctionResults(results: AuctionResult[]): Promise<void> {
    try {
      if (results.length === 0) return

      const { error } = await supabase
        .from('auction_results')
        .upsert(results, { onConflict: 'id' })

      if (error) {
        console.error('Error storing auction results:', error)
      }
    } catch (error) {
      console.error('Error in storeAuctionResults:', error)
    }
  }

  private async storeGalleryRepresentations(representations: GalleryRepresentation[]): Promise<void> {
    try {
      if (representations.length === 0) return

      const { error } = await supabase
        .from('gallery_representations')
        .upsert(representations, { onConflict: 'id' })

      if (error) {
        console.error('Error storing gallery representations:', error)
      }
    } catch (error) {
      console.error('Error in storeGalleryRepresentations:', error)
    }
  }

  private async storeArtFairParticipations(participations: ArtFairParticipation[]): Promise<void> {
    try {
      if (participations.length === 0) return

      const { error } = await supabase
        .from('art_fair_participations')
        .upsert(participations, { onConflict: 'id' })

      if (error) {
        console.error('Error storing art fair participations:', error)
      }
    } catch (error) {
      console.error('Error in storeArtFairParticipations:', error)
    }
  }

  private async storePressArticles(articles: PressArticle[]): Promise<void> {
    try {
      if (articles.length === 0) return

      const { error } = await supabase
        .from('press_coverage')
        .upsert(articles, { onConflict: 'id' })

      if (error) {
        console.error('Error storing press articles:', error)
      }
    } catch (error) {
      console.error('Error in storePressArticles:', error)
    }
  }

  // Utility Methods
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Batch processing for multiple artists
  async scrapeMultipleArtists(artistNames: string[]): Promise<{
    [artistName: string]: {
      auctionResults: AuctionResult[]
      galleryRepresentations: GalleryRepresentation[]
      artFairParticipations: ArtFairParticipation[]
      pressArticles: PressArticle[]
      stats: any
    }
  }> {
    const results: any = {}
    const batches = this.chunkArray(artistNames, this.MAX_CONCURRENT_REQUESTS)
    
    for (const batch of batches) {
      const batchPromises = batch.map(async (artistName) => {
        try {
          const data = await this.scrapeAllExternalData(artistName)
          results[artistName] = data
        } catch (error) {
          console.error(`Error scraping data for ${artistName}:`, error)
          results[artistName] = {
            auctionResults: [],
            galleryRepresentations: [],
            artFairParticipations: [],
            pressArticles: [],
            stats: { error: error.message }
          }
        }
      })
      
      await Promise.all(batchPromises)
      
      // Add delay between batches
      if (batches.indexOf(batch) < batches.length - 1) {
        await this.delay(this.REQUEST_DELAY * 2)
      }
    }
    
    return results
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }

  // Data validation and cleaning
  private validateAuctionResult(result: any): AuctionResult | null {
    try {
      if (!result.artist_name || !result.artwork_title) {
        return null
      }
      
      return {
        id: result.id || `auction_${Date.now()}_${Math.random()}`,
        artist_name: result.artist_name.trim(),
        artwork_title: result.artwork_title.trim(),
        sale_price: parseFloat(result.sale_price) || 0,
        currency: result.currency || 'USD',
        sale_date: result.sale_date || new Date().toISOString(),
        auction_house: result.auction_house || 'Unknown',
        lot_number: result.lot_number,
        medium: result.medium,
        dimensions: result.dimensions,
        estimate_low: result.estimate_low ? parseFloat(result.estimate_low) : undefined,
        estimate_high: result.estimate_high ? parseFloat(result.estimate_high) : undefined,
        hammer_price: result.hammer_price ? parseFloat(result.hammer_price) : undefined,
        buyer_premium: result.buyer_premium ? parseFloat(result.buyer_premium) : undefined,
        provenance: result.provenance,
        exhibition_history: result.exhibition_history,
        literature: result.literature,
        condition: result.condition,
        image_url: result.image_url,
        lot_url: result.lot_url
      }
    } catch (error) {
      console.error('Error validating auction result:', error)
      return null
    }
  }

  // Enhanced error handling with retry logic
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = this.RETRY_ATTEMPTS
  ): Promise<T> {
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        console.error(`${operationName} attempt ${attempt} failed:`, error)
        
        if (attempt < maxRetries) {
          const delay = this.RETRY_DELAY * attempt // Exponential backoff
          console.log(`Retrying ${operationName} in ${delay}ms...`)
          await this.delay(delay)
        }
      }
    }
    
    throw new Error(`${operationName} failed after ${maxRetries} attempts: ${lastError?.message}`)
  }

  // Advanced caching system
  private async getCachedData<T>(cacheKey: string, fetchFunction: () => Promise<T>): Promise<T> {
    try {
      // Check database cache first
      const { data: cachedData, error } = await supabase
        .from('scraper_cache')
        .select('data, created_at')
        .eq('cache_key', cacheKey)
        .single()

      if (!error && cachedData) {
        const cacheAge = Date.now() - new Date(cachedData.created_at).getTime()
        if (cacheAge < this.CACHE_DURATION) {
          this.scrapingStats.cacheHits++
          console.log(`Cache hit for ${cacheKey}`)
          return cachedData.data as T
        }
      }

      // Cache miss - fetch fresh data
      console.log(`Cache miss for ${cacheKey}, fetching fresh data`)
      const freshData = await fetchFunction()
      
      // Store in cache
      await this.storeInCache(cacheKey, freshData)
      
      return freshData
    } catch (error) {
      console.error(`Error in caching for ${cacheKey}:`, error)
      return await fetchFunction()
    }
  }

  private async storeInCache(cacheKey: string, data: any): Promise<void> {
    try {
      await supabase
        .from('scraper_cache')
        .upsert({
          cache_key: cacheKey,
          data: data,
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error storing in cache:', error)
    }
  }

  // Performance monitoring
  private trackRequest(success: boolean, responseTime: number): void {
    this.scrapingStats.totalRequests++
    if (success) {
      this.scrapingStats.successfulRequests++
    } else {
      this.scrapingStats.failedRequests++
    }
    
    // Update average response time
    const totalTime = this.scrapingStats.averageResponseTime * (this.scrapingStats.totalRequests - 1)
    this.scrapingStats.averageResponseTime = (totalTime + responseTime) / this.scrapingStats.totalRequests
  }

  getScrapingStats() {
    return {
      ...this.scrapingStats,
      successRate: this.scrapingStats.totalRequests > 0 
        ? (this.scrapingStats.successfulRequests / this.scrapingStats.totalRequests) * 100 
        : 0,
      cacheHitRate: this.scrapingStats.totalRequests > 0 
        ? (this.scrapingStats.cacheHits / this.scrapingStats.totalRequests) * 100 
        : 0
    }
  }

  // Main scraping method that orchestrates all scrapers with advanced features
  async scrapeAllExternalData(artistName: string): Promise<{
    auctionResults: AuctionResult[]
    galleryRepresentations: GalleryRepresentation[]
    artFairParticipations: ArtFairParticipation[]
    pressArticles: PressArticle[]
    stats: any
  }> {
    const startTime = Date.now()
    
    try {
      console.log(`Starting external data scraping for artist: ${artistName}`)
      
      // Use caching for each data type
      const cacheKey = `artist_${artistName.toLowerCase().replace(/\s+/g, '_')}`
      
      const [
        auctionResults,
        galleryRepresentations,
        artFairParticipations,
        pressArticles
      ] = await Promise.all([
        this.getCachedData(`${cacheKey}_auctions`, () => this.scrapeAllAuctionResults(artistName)),
        this.getCachedData(`${cacheKey}_galleries`, () => this.scrapeGalleryRepresentations(artistName)),
        this.getCachedData(`${cacheKey}_artfairs`, () => this.scrapeArtFairParticipation(artistName)),
        this.getCachedData(`${cacheKey}_press`, () => this.scrapePressCoverage(artistName))
      ])

      const totalTime = Date.now() - startTime
      this.trackRequest(true, totalTime)

      console.log(`Completed external data scraping for artist: ${artistName} in ${totalTime}ms`)
      console.log(`Found: ${auctionResults.length} auction results, ${galleryRepresentations.length} gallery representations, ${artFairParticipations.length} art fair participations, ${pressArticles.length} press articles`)

      return {
        auctionResults,
        galleryRepresentations,
        artFairParticipations,
        pressArticles,
        stats: this.getScrapingStats()
      }
    } catch (error) {
      const totalTime = Date.now() - startTime
      this.trackRequest(false, totalTime)
      
      console.error('Error in scrapeAllExternalData:', error)
      return {
        auctionResults: [],
        galleryRepresentations: [],
        artFairParticipations: [],
        pressArticles: [],
        stats: this.getScrapingStats()
      }
    }
  }

  private async scrapeAllAuctionResults(artistName: string): Promise<AuctionResult[]> {
    try {
      const [
        christiesResults, 
        sothebysResults, 
        phillipsResults,
        bonhamsResults,
        sothebysAfricaResults,
        straussResults,
        aspireResults,
        stephanWelzResults,
        artnetResults,
        artcurialResults,
        dorotheumResults,
        kollerResults,
        lempertzResults
      ] = await Promise.all([
        this.scrapeChristiesResults(artistName),
        this.scrapeSothebysResults(artistName),
        this.scrapePhillipsResults(artistName),
        this.scrapeBonhamsResults(artistName),
        this.scrapeSothebysAfricaResults(artistName),
        this.scrapeStraussResults(artistName),
        this.scrapeAspireResults(artistName),
        this.scrapeStephanWelzResults(artistName),
        this.scrapeArtnetResults(artistName),
        this.scrapeArtcurialResults(artistName),
        this.scrapeDorotheumResults(artistName),
        this.scrapeKollerResults(artistName),
        this.scrapeLempertzResults(artistName)
      ])

      return [
        ...christiesResults, 
        ...sothebysResults, 
        ...phillipsResults,
        ...bonhamsResults,
        ...sothebysAfricaResults,
        ...straussResults,
        ...aspireResults,
        ...stephanWelzResults,
        ...artnetResults,
        ...artcurialResults,
        ...dorotheumResults,
        ...kollerResults,
        ...lempertzResults
      ]
    } catch (error) {
      console.error('Error scraping all auction results:', error)
      return []
    }
  }
}

export const externalDataScrapers = new ExternalDataScrapersService()
