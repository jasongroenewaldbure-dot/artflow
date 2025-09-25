import { JSDOM } from 'jsdom'

export interface ScrapingResult {
  success: boolean
  data: any
  error?: string
  source: string
  scrapedAt: string
}

export interface ScrapingOptions {
  headers?: Record<string, string>
  timeout?: number
  retries?: number
  delay?: number
  userAgent?: string
}

class WebScraperService {
  private readonly DEFAULT_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  private readonly DEFAULT_TIMEOUT = 10000 // 10 seconds
  private readonly DEFAULT_RETRIES = 3
  private readonly DEFAULT_DELAY = 1000 // 1 second

  async scrapeUrl(url: string, options: ScrapingOptions = {}): Promise<ScrapingResult> {
    const {
      headers = {},
      timeout = this.DEFAULT_TIMEOUT,
      retries = this.DEFAULT_RETRIES,
      delay = this.DEFAULT_DELAY,
      userAgent = this.DEFAULT_USER_AGENT
    } = options

    const defaultHeaders = {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      ...headers
    }

    let lastError: Error | null = null

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Scraping ${url} (attempt ${attempt}/${retries})`)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(url, {
          headers: defaultHeaders,
          signal: controller.signal,
          method: 'GET'
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const html = await response.text()
        const dom = new JSDOM(html)
        const document = dom.window.document

        return {
          success: true,
          data: document,
          source: url,
          scrapedAt: new Date().toISOString()
        }

      } catch (error) {
        lastError = error as Error
        console.error(`Scraping attempt ${attempt} failed for ${url}:`, error)

        if (attempt < retries) {
          console.log(`Waiting ${delay}ms before retry...`)
          await this.delay(delay)
        }
      }
    }

    return {
      success: false,
      data: null,
      error: lastError?.message || 'Unknown error',
      source: url,
      scrapedAt: new Date().toISOString()
    }
  }

  async scrapeMultipleUrls(urls: string[], options: ScrapingOptions = {}): Promise<ScrapingResult[]> {
    const results: ScrapingResult[] = []
    const { delay = this.DEFAULT_DELAY } = options

    for (const url of urls) {
      const result = await this.scrapeUrl(url, options)
      results.push(result)

      // Add delay between requests to be respectful
      if (delay > 0) {
        await this.delay(delay)
      }
    }

    return results
  }

  // Christie's specific scraper
  async scrapeChristiesArtist(artistName: string): Promise<any[]> {
    try {
      const searchUrl = `https://www.christies.com/lot-finder-api/search?query=${encodeURIComponent(artistName)}&page=1&pageSize=50`
      
      const result = await this.scrapeUrl(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'Referer': 'https://www.christies.com/',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      // Parse JSON response
      const data = JSON.parse(result.data.textContent || '{}')
      return data.lots || []
    } catch (error) {
      console.error('Error scraping Christie\'s:', error)
      return []
    }
  }

  // Sotheby's specific scraper
  async scrapeSothebysArtist(artistName: string): Promise<any[]> {
    try {
      const searchUrl = `https://www.sothebys.com/api/search?q=${encodeURIComponent(artistName)}&page=1&size=50`
      
      const result = await this.scrapeUrl(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'Referer': 'https://www.sothebys.com/',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      // Parse JSON response
      const data = JSON.parse(result.data.textContent || '{}')
      return data.results || []
    } catch (error) {
      console.error('Error scraping Sotheby\'s:', error)
      return []
    }
  }

  // Phillips specific scraper
  async scrapePhillipsArtist(artistName: string): Promise<any[]> {
    try {
      const searchUrl = `https://www.phillips.com/api/search?query=${encodeURIComponent(artistName)}&page=1&size=50`
      
      const result = await this.scrapeUrl(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'Referer': 'https://www.phillips.com/',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      // Parse JSON response
      const data = JSON.parse(result.data.textContent || '{}')
      return data.lots || []
    } catch (error) {
      console.error('Error scraping Phillips:', error)
      return []
    }
  }

  // Additional Auction House Scrapers
  async scrapeBonhamsArtist(artistName: string): Promise<any[]> {
    try {
      const searchUrl = `https://www.bonhams.com/api/search?query=${encodeURIComponent(artistName)}&page=1&size=50`
      
      const result = await this.scrapeUrl(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'Referer': 'https://www.bonhams.com/',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      const data = JSON.parse(result.data.textContent || '{}')
      return data.lots || []
    } catch (error) {
      console.error('Error scraping Bonhams:', error)
      return []
    }
  }

  async scrapeSothebysAfricaArtist(artistName: string): Promise<any[]> {
    try {
      const searchUrl = `https://www.sothebys.com/africa/api/search?query=${encodeURIComponent(artistName)}&page=1&size=50`
      
      const result = await this.scrapeUrl(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'Referer': 'https://www.sothebys.com/africa/',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      const data = JSON.parse(result.data.textContent || '{}')
      return data.results || []
    } catch (error) {
      console.error('Error scraping Sotheby\'s Africa:', error)
      return []
    }
  }

  async scrapeStraussArtist(artistName: string): Promise<any[]> {
    try {
      const searchUrl = `https://www.straussart.co.za/api/search?query=${encodeURIComponent(artistName)}&page=1&size=50`
      
      const result = await this.scrapeUrl(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'Referer': 'https://www.straussart.co.za/',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      const data = JSON.parse(result.data.textContent || '{}')
      return data.lots || []
    } catch (error) {
      console.error('Error scraping Strauss & Co:', error)
      return []
    }
  }

  async scrapeAspireArtist(artistName: string): Promise<any[]> {
    try {
      const searchUrl = `https://www.aspireartauctions.com/api/search?query=${encodeURIComponent(artistName)}&page=1&size=50`
      
      const result = await this.scrapeUrl(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'Referer': 'https://www.aspireartauctions.com/',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      const data = JSON.parse(result.data.textContent || '{}')
      return data.lots || []
    } catch (error) {
      console.error('Error scraping Aspire Art Auctions:', error)
      return []
    }
  }

  async scrapeStephanWelzArtist(artistName: string): Promise<any[]> {
    try {
      const searchUrl = `https://www.stephanwelz.co.za/api/search?query=${encodeURIComponent(artistName)}&page=1&size=50`
      
      const result = await this.scrapeUrl(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'Referer': 'https://www.stephanwelz.co.za/',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      const data = JSON.parse(result.data.textContent || '{}')
      return data.lots || []
    } catch (error) {
      console.error('Error scraping Stephan Welz & Co:', error)
      return []
    }
  }

  async scrapeArtnetArtist(artistName: string): Promise<any[]> {
    try {
      const searchUrl = `https://www.artnet.com/api/search?query=${encodeURIComponent(artistName)}&page=1&size=50`
      
      const result = await this.scrapeUrl(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'Referer': 'https://www.artnet.com/',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      const data = JSON.parse(result.data.textContent || '{}')
      return data.results || []
    } catch (error) {
      console.error('Error scraping Artnet:', error)
      return []
    }
  }

  async scrapeArtcurialArtist(artistName: string): Promise<any[]> {
    try {
      const searchUrl = `https://www.artcurial.com/api/search?query=${encodeURIComponent(artistName)}&page=1&size=50`
      
      const result = await this.scrapeUrl(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'Referer': 'https://www.artcurial.com/',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      const data = JSON.parse(result.data.textContent || '{}')
      return data.lots || []
    } catch (error) {
      console.error('Error scraping Artcurial:', error)
      return []
    }
  }

  async scrapeDorotheumArtist(artistName: string): Promise<any[]> {
    try {
      const searchUrl = `https://www.dorotheum.com/api/search?query=${encodeURIComponent(artistName)}&page=1&size=50`
      
      const result = await this.scrapeUrl(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'Referer': 'https://www.dorotheum.com/',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      const data = JSON.parse(result.data.textContent || '{}')
      return data.lots || []
    } catch (error) {
      console.error('Error scraping Dorotheum:', error)
      return []
    }
  }

  async scrapeKollerArtist(artistName: string): Promise<any[]> {
    try {
      const searchUrl = `https://www.kollerauktionen.ch/api/search?query=${encodeURIComponent(artistName)}&page=1&size=50`
      
      const result = await this.scrapeUrl(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'Referer': 'https://www.kollerauktionen.ch/',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      const data = JSON.parse(result.data.textContent || '{}')
      return data.lots || []
    } catch (error) {
      console.error('Error scraping Koller:', error)
      return []
    }
  }

  async scrapeLempertzArtist(artistName: string): Promise<any[]> {
    try {
      const searchUrl = `https://www.lempertz.com/api/search?query=${encodeURIComponent(artistName)}&page=1&size=50`
      
      const result = await this.scrapeUrl(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'Referer': 'https://www.lempertz.com/',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      const data = JSON.parse(result.data.textContent || '{}')
      return data.lots || []
    } catch (error) {
      console.error('Error scraping Lempertz:', error)
      return []
    }
  }

  // Gallery website scraper
  async scrapeGalleryWebsite(galleryUrl: string, artistName: string): Promise<any> {
    try {
      const result = await this.scrapeUrl(galleryUrl)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      const document = result.data
      
      // Search for artist on the gallery website
      // This would need to be customized for each gallery's structure
      const artistLinks = document.querySelectorAll('a[href*="artist"], a[href*="exhibition"]')
      const artistInfo: any = {
        gallery: this.extractGalleryName(galleryUrl),
        artist_found: false,
        exhibitions: [],
        representation_type: null
      }

      for (const link of artistLinks) {
        const linkText = link.textContent?.toLowerCase() || ''
        const href = link.getAttribute('href') || ''
        
        if (linkText.includes(artistName.toLowerCase()) || href.includes(artistName.toLowerCase())) {
          artistInfo.artist_found = true
          artistInfo.exhibitions.push({
            title: link.textContent?.trim(),
            url: href.startsWith('http') ? href : new URL(href, galleryUrl).href,
            date: this.extractDateFromText(linkText)
          })
        }
      }

      return artistInfo
    } catch (error) {
      console.error(`Error scraping gallery ${galleryUrl}:`, error)
      return null
    }
  }

  // Art fair website scraper
  async scrapeArtFairWebsite(fairUrl: string, artistName: string): Promise<any> {
    try {
      const result = await this.scrapeUrl(fairUrl)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      const document = result.data
      
      // Search for artist on the art fair website
      const artistLinks = document.querySelectorAll('a[href*="artist"], a[href*="exhibitor"], a[href*="gallery"]')
      const artistInfo: any = {
        fair: this.extractFairName(fairUrl),
        artist_found: false,
        participations: [],
        gallery: null
      }

      for (const link of artistLinks) {
        const linkText = link.textContent?.toLowerCase() || ''
        const href = link.getAttribute('href') || ''
        
        if (linkText.includes(artistName.toLowerCase()) || href.includes(artistName.toLowerCase())) {
          artistInfo.artist_found = true
          artistInfo.participations.push({
            title: link.textContent?.trim(),
            url: href.startsWith('http') ? href : new URL(href, fairUrl).href,
            year: this.extractYearFromText(linkText)
          })
        }
      }

      return artistInfo
    } catch (error) {
      console.error(`Error scraping art fair ${fairUrl}:`, error)
      return null
    }
  }

  // Press publication scraper
  async scrapePublicationWebsite(publicationUrl: string, artistName: string): Promise<any[]> {
    try {
      const result = await this.scrapeUrl(publicationUrl)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      const document = result.data
      
      // Search for articles about the artist
      const articleLinks = document.querySelectorAll('a[href*="article"], a[href*="news"], a[href*="review"]')
      const articles: any[] = []

      for (const link of articleLinks) {
        const linkText = link.textContent?.toLowerCase() || ''
        const href = link.getAttribute('href') || ''
        
        if (linkText.includes(artistName.toLowerCase())) {
          articles.push({
            title: link.textContent?.trim(),
            url: href.startsWith('http') ? href : new URL(href, publicationUrl).href,
            publication: this.extractPublicationName(publicationUrl),
            published_date: this.extractDateFromText(linkText)
          })
        }
      }

      return articles
    } catch (error) {
      console.error(`Error scraping publication ${publicationUrl}:`, error)
      return []
    }
  }

  // Utility methods
  private extractGalleryName(url: string): string {
    const domain = new URL(url).hostname
    return domain.replace('www.', '').split('.')[0]
  }

  private extractFairName(url: string): string {
    const domain = new URL(url).hostname
    return domain.replace('www.', '').split('.')[0]
  }

  private extractPublicationName(url: string): string {
    const domain = new URL(url).hostname
    return domain.replace('www.', '').split('.')[0]
  }

  private extractDateFromText(text: string): string | null {
    // Simple date extraction - could be enhanced with more sophisticated parsing
    const dateMatch = text.match(/\b(20\d{2})\b/)
    return dateMatch ? dateMatch[1] : null
  }

  private extractYearFromText(text: string): number | null {
    const yearMatch = text.match(/\b(20\d{2})\b/)
    return yearMatch ? parseInt(yearMatch[1]) : null
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Proxy support for scraping (if needed)
  async scrapeWithProxy(url: string, proxyUrl: string, options: ScrapingOptions = {}): Promise<ScrapingResult> {
    // This would implement proxy support for scraping
    // For now, just use regular scraping
    return this.scrapeUrl(url, options)
  }

  // Rate limiting support
  private rateLimitMap = new Map<string, number>()

  async scrapeWithRateLimit(url: string, options: ScrapingOptions = {}): Promise<ScrapingResult> {
    const domain = new URL(url).hostname
    const now = Date.now()
    const lastRequest = this.rateLimitMap.get(domain) || 0
    const minInterval = 2000 // 2 seconds between requests to same domain

    if (now - lastRequest < minInterval) {
      const waitTime = minInterval - (now - lastRequest)
      console.log(`Rate limiting: waiting ${waitTime}ms before scraping ${domain}`)
      await this.delay(waitTime)
    }

    this.rateLimitMap.set(domain, Date.now())
    return this.scrapeUrl(url, options)
  }
}

export const webScraper = new WebScraperService()
