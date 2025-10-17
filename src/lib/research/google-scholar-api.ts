import { ResearchPaper } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface GoogleScholarSearchParams {
  query: string;
  limit?: number;
  offset?: number;
  yearMin?: number;
  yearMax?: number;
  sortBy?: 'relevance' | 'date';
  includePatents?: boolean;
  includeCitations?: boolean;
}

export interface GoogleScholarArticle {
  title: string;
  authors: string[];
  abstract: string;
  year?: number;
  venue?: string; // Journal or conference
  citationCount?: number;
  url?: string;
  pdfUrl?: string;
  citationUrl?: string;
  relatedUrl?: string;
  versionsUrl?: string;
  clusterId?: string;
}

// Note: Google Scholar doesn't provide an official API
// This implementation uses scholarly proxy or serpapi (requires API key)
export class GoogleScholarAPI {
  private serpApiKey?: string;
  private useProxy: boolean;
  private proxyUrl = 'https://scholarly-proxy.herokuapp.com'; // Example proxy

  constructor(apiKey?: string, useProxy = false) {
    this.serpApiKey = apiKey;
    this.useProxy = useProxy || !apiKey;
  }

  async search(params: GoogleScholarSearchParams): Promise<GoogleScholarArticle[]> {
    if (this.serpApiKey && !this.useProxy) {
      return this.searchWithSerpApi(params);
    } else {
      return this.searchWithProxy(params);
    }
  }

  private async searchWithSerpApi(params: GoogleScholarSearchParams): Promise<GoogleScholarArticle[]> {
    try {
      const searchParams = new URLSearchParams({
        engine: 'google_scholar',
        q: params.query,
        api_key: this.serpApiKey!,
        num: String(params.limit || 20),
        start: String(params.offset || 0),
      });

      if (params.yearMin || params.yearMax) {
        const yearMin = params.yearMin || 1900;
        const yearMax = params.yearMax || new Date().getFullYear();
        searchParams.append('as_ylo', String(yearMin));
        searchParams.append('as_yhi', String(yearMax));
      }

      if (params.sortBy === 'date') {
        searchParams.append('scisbd', '1'); // Sort by date
      }

      if (!params.includePatents) {
        searchParams.append('as_sdt', '0,5'); // Exclude patents
      }

      const response = await axios.get(`https://serpapi.com/search?${searchParams}`);
      const results = response.data.organic_results || [];

      return results.map((result: any) => this.parseSerpApiResult(result));
    } catch (error) {
      logger.error('api', 'SerpAPI error:', error );
      throw new Error(`Failed to search Google Scholar: ${error.message}`);
    }
  }

  private async searchWithProxy(params: GoogleScholarSearchParams): Promise<GoogleScholarArticle[]> {
    try {
      // This is a simplified example - in production, you'd need a more robust solution
      const searchParams = new URLSearchParams({
        q: params.query,
        start: String(params.offset || 0),
        num: String(params.limit || 20),
      });

      const response = await axios.get(`${this.proxyUrl}/search?${searchParams}`);
      return response.data.results || [];
    } catch (error) {
      logger.error('api', 'Proxy search error:', error );
      // Fallback to web scraping (not recommended for production)
      return this.scrapeGoogleScholar(params);
    }
  }

  private async scrapeGoogleScholar(params: GoogleScholarSearchParams): Promise<GoogleScholarArticle[]> {
    // Note: This is for demonstration only - Google Scholar blocks automated requests
    // In production, use SerpAPI or another legitimate API service
    try {
      const searchParams = new URLSearchParams({
        q: params.query,
        start: String(params.offset || 0),
        num: String(params.limit || 20),
      });

      const url = `https://scholar.google.com/scholar?${searchParams}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const $ = cheerio.load(response.data);
      const articles: GoogleScholarArticle[] = [];

      $('.gs_r.gs_or.gs_scl').each((index, element) => {
        const $elem = $(element);
        
        // Extract title and URL
        const $title = $elem.find('h3.gs_rt a');
        const title = $title.text();
        const url = $title.attr('href');

        // Extract authors and venue
        const $authorsVenue = $elem.find('.gs_a');
        const authorsVenueText = $authorsVenue.text();
        const parts = authorsVenueText.split(' - ');
        const authors = parts[0]?.split(', ') || [];
        const venue = parts[1];
        const year = parts[2]?.match(/\d{4}/)?.[0];

        // Extract abstract
        const abstract = $elem.find('.gs_rs').text();

        // Extract citation count
        const citationText = $elem.find('.gs_fl a:contains("Cited by")').text();
        const citationCount = parseInt(citationText.match(/\d+/)?.[0] || '0');

        // Extract PDF URL if available
        const pdfUrl = $elem.find('.gs_or_ggsm a').attr('href');

        articles.push({
          title,
          authors,
          abstract,
          year: year ? parseInt(year) : undefined,
          venue,
          citationCount,
          url,
          pdfUrl,
        });
      });

      return articles;
    } catch (error) {
      logger.error('api', 'Web scraping error:', error );
      throw new Error('Failed to scrape Google Scholar');
    }
  }

  private parseSerpApiResult(result: any): GoogleScholarArticle {
    // Extract authors from the snippet
    const snippet = result.publication_info?.summary || '';
    const authors = snippet.split(' - ')[0]?.split(', ') || [];

    return {
      title: result.title || '',
      authors,
      abstract: result.snippet || '',
      year: result.publication_info?.year,
      venue: result.publication_info?.venue,
      citationCount: result.inline_links?.cited_by?.total || 0,
      url: result.link,
      pdfUrl: result.resources?.[0]?.link,
      citationUrl: result.inline_links?.cited_by?.link,
      relatedUrl: result.inline_links?.related_pages_link,
      versionsUrl: result.inline_links?.versions?.link,
      clusterId: result.result_id,
    };
  }

  // Convert Google Scholar article to database format
  toResearchPaper(article: GoogleScholarArticle): Partial<ResearchPaper> {
    const publicationDate = article.year 
      ? new Date(`${article.year}-01-01`) 
      : undefined;

    return {
      title: article.title,
      authors: article.authors,
      abstract: article.abstract,
      source: 'scholar',
      sourceId: article.clusterId || `scholar-${Date.now()}`,
      publicationDate,
      journal: article.venue,
      keywords: [], // Google Scholar doesn't provide keywords directly
    };
  }

  // Get citation information
  async getCitations(articleUrl: string): Promise<GoogleScholarArticle[]> {
    // Implementation would fetch citing articles
    // This requires additional API calls or scraping
    return [];
  }
}