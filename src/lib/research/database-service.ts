import { logger } from '@/lib/logging/production-logger';
/**
 * Research Database Service - Academic Literature Integration
 * Provides access to PubMed, Google Scholar, and arXiv APIs
 */

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  publication: string;
  year: number;
  doi?: string;
  pmid?: string;
  arxivId?: string;
  keywords: string[];
  fullTextUrl?: string;
  citations: number;
  source: 'pubmed' | 'scholar' | 'arxiv' | 'local';
  relevanceScore: number;
}

export interface SearchOptions {
  query: string;
  source?: 'pubmed' | 'scholar' | 'arxiv' | 'all';
  limit?: number;
  startYear?: number;
  endYear?: number;
  sortBy?: 'relevance' | 'date' | 'citations';
}

export class ResearchDatabaseService {
  private readonly baseUrls = {
    pubmed: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils',
    scholar: 'https://serpapi.com/search.json', // Requires API key
    arxiv: 'http://export.arxiv.org/api/query'
  };

  /**
   * Search across academic databases
   */
  async searchPapers(options: SearchOptions): Promise<ResearchPaper[]> {
    const results: ResearchPaper[] = [];

    if (options.source === 'all' || !options.source) {
      // Search all sources in parallel
      const [pubmedResults, scholarResults, arxivResults] = await Promise.allSettled([
        this.searchPubMed(options),
        this.searchGoogleScholar(options),
        this.searchArXiv(options)
      ]);

      if (pubmedResults.status === 'fulfilled') results.push(...pubmedResults.value);
      if (scholarResults.status === 'fulfilled') results.push(...scholarResults.value);
      if (arxivResults.status === 'fulfilled') results.push(...arxivResults.value);
    } else {
      switch (options.source) {
        case 'pubmed':
          results.push(...await this.searchPubMed(options));
          break;
        case 'scholar':
          results.push(...await this.searchGoogleScholar(options));
          break;
        case 'arxiv':
          results.push(...await this.searchArXiv(options));
          break;
      }
    }

    // Remove duplicates and sort by relevance
    return this.deduplicateAndSort(results, options.sortBy || 'relevance');
  }

  /**
   * Search PubMed database
   */
  private async searchPubMed(options: SearchOptions): Promise<ResearchPaper[]> {
    try {
      const query = this.buildPubMedQuery(options);
      const searchUrl = `${this.baseUrls.pubmed}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=${options.limit || 20}`;
      
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (!searchData.esearchresult?.idlist?.length) {
        return [];
      }

      // Fetch details for each paper
      const ids = searchData.esearchresult.idlist.join(',');
      const detailsUrl = `${this.baseUrls.pubmed}/efetch.fcgi?db=pubmed&id=${ids}&retmode=xml`;
      
      const detailsResponse = await fetch(detailsUrl);
      const xmlText = await detailsResponse.text();
      
      return this.parsePubMedXML(xmlText);
    } catch (error) {
      logger.error('api', 'PubMed search error:', error );
      return [];
    }
  }

  /**
   * Search Google Scholar via SerpAPI
   */
  private async searchGoogleScholar(options: SearchOptions): Promise<ResearchPaper[]> {
    try {
      const apiKey = process.env.SERPAPI_KEY;
      if (!apiKey) {
        logger.warn('api', 'SerpAPI key not configured, skipping Google Scholar search');
        return [];
      }

      const params = new URLSearchParams({
        engine: 'google_scholar',
        q: options.query,
        api_key: apiKey,
        num: (options.limit || 20).toString()
      });

      if (options.startYear) {
        params.append('as_ylo', options.startYear.toString());
      }
      if (options.endYear) {
        params.append('as_yhi', options.endYear.toString());
      }

      const response = await fetch(`${this.baseUrls.scholar}?${params}`);
      const data = await response.json();

      return this.parseScholarResults(data);
    } catch (error) {
      logger.error('api', 'Google Scholar search error:', error );
      return [];
    }
  }

  /**
   * Search arXiv database
   */
  private async searchArXiv(options: SearchOptions): Promise<ResearchPaper[]> {
    try {
      const query = `search_query=all:${encodeURIComponent(options.query)}`;
      const params = `${query}&start=0&max_results=${options.limit || 20}&sortBy=relevance&sortOrder=descending`;
      
      const response = await fetch(`${this.baseUrls.arxiv}?${params}`);
      const xmlText = await response.text();
      
      return this.parseArXivXML(xmlText);
    } catch (error) {
      logger.error('api', 'arXiv search error:', error );
      return [];
    }
  }

  /**
   * Parse PubMed XML response
   */
  private parsePubMedXML(xmlText: string): ResearchPaper[] {
    // Simple XML parsing - in production, use a proper XML parser
    const papers: ResearchPaper[] = [];
    
    // Extract basic paper info using regex (simplified)
    const articleRegex = /<PubmedArticle>(.*?)<\/PubmedArticle>/gs;
    let match;
    
    while ((match = articleRegex.exec(xmlText)) !== null) {
      const article = match[1];
      
      const pmid = this.extractXMLValue(article, 'PMID');
      const title = this.extractXMLValue(article, 'ArticleTitle');
      const abstract = this.extractXMLValue(article, 'AbstractText');
      const journal = this.extractXMLValue(article, 'Title'); // Journal title
      const year = parseInt(this.extractXMLValue(article, 'Year') || '0');
      
      // Extract authors
      const authorsMatch = article.match(/<AuthorList.*?>(.*?)<\/AuthorList>/s);
      const authors: string[] = [];
      if (authorsMatch) {
        const authorRegex = /<Author.*?>(.*?)<\/Author>/gs;
        let authorMatch;
        while ((authorMatch = authorRegex.exec(authorsMatch[1])) !== null) {
          const lastName = this.extractXMLValue(authorMatch[1], 'LastName');
          const firstName = this.extractXMLValue(authorMatch[1], 'ForeName');
          if (lastName) authors.push(`${firstName || ''} ${lastName}`.trim());
        }
      }

      if (title && pmid) {
        papers.push({
          id: `pubmed_${pmid}`,
          title: this.cleanText(title),
          authors,
          abstract: this.cleanText(abstract || ''),
          publication: this.cleanText(journal || ''),
          year,
          pmid,
          keywords: this.extractKeywords(title + ' ' + abstract),
          citations: 0, // Would need additional API call
          source: 'pubmed',
          relevanceScore: 0.8
        });
      }
    }
    
    return papers;
  }

  /**
   * Parse Google Scholar results
   */
  private parseScholarResults(data: any): ResearchPaper[] {
    const papers: ResearchPaper[] = [];
    
    if (data.organic_results) {
      for (const result of data.organic_results) {
        papers.push({
          id: `scholar_${result.result_id || Math.random().toString(36)}`,
          title: result.title || '',
          authors: result.publication_info?.authors || [],
          abstract: result.snippet || '',
          publication: result.publication_info?.summary || '',
          year: parseInt(result.publication_info?.summary?.match(/(\d{4})/)?.[1] || '0'),
          keywords: this.extractKeywords(result.title + ' ' + result.snippet),
          citations: parseInt(result.inline_links?.cited_by?.total || '0'),
          fullTextUrl: result.link,
          source: 'scholar',
          relevanceScore: 0.9
        });
      }
    }
    
    return papers;
  }

  /**
   * Parse arXiv XML response
   */
  private parseArXivXML(xmlText: string): ResearchPaper[] {
    const papers: ResearchPaper[] = [];
    
    const entryRegex = /<entry>(.*?)<\/entry>/gs;
    let match;
    
    while ((match = entryRegex.exec(xmlText)) !== null) {
      const entry = match[1];
      
      const id = this.extractXMLValue(entry, 'id');
      const title = this.extractXMLValue(entry, 'title');
      const summary = this.extractXMLValue(entry, 'summary');
      const published = this.extractXMLValue(entry, 'published');
      
      // Extract authors
      const authorRegex = /<author><name>(.*?)<\/name><\/author>/g;
      const authors: string[] = [];
      let authorMatch;
      while ((authorMatch = authorRegex.exec(entry)) !== null) {
        authors.push(authorMatch[1]);
      }
      
      const arxivId = id?.split('/').pop();
      const year = published ? new Date(published).getFullYear() : 0;
      
      if (title && id) {
        papers.push({
          id: `arxiv_${arxivId}`,
          title: this.cleanText(title),
          authors,
          abstract: this.cleanText(summary || ''),
          publication: 'arXiv preprint',
          year,
          arxivId,
          keywords: this.extractKeywords(title + ' ' + summary),
          citations: 0,
          fullTextUrl: id,
          source: 'arxiv',
          relevanceScore: 0.7
        });
      }
    }
    
    return papers;
  }

  /**
   * Build PubMed search query with filters
   */
  private buildPubMedQuery(options: SearchOptions): string {
    let query = options.query;
    
    // Add date filters
    if (options.startYear || options.endYear) {
      const startYear = options.startYear || '1900';
      const endYear = options.endYear || new Date().getFullYear();
      query += ` AND ("${startYear}"[Date - Publication] : "${endYear}"[Date - Publication])`;
    }
    
    // Add relevant subject filters for horticultural research
    query += ' AND (agriculture[MeSH] OR horticulture[MeSH] OR plants[MeSH] OR lighting[MeSH] OR LED[All Fields] OR cultivation[All Fields])';
    
    return query;
  }

  /**
   * Extract value from XML using simple regex
   */
  private extractXMLValue(xml: string, tag: string): string | undefined {
    const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 's');
    const match = xml.match(regex);
    return match ? match[1].replace(/<[^>]*>/g, '').trim() : undefined;
  }

  /**
   * Clean text by removing HTML tags and extra whitespace
   */
  private cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'a', 'an']);
    
    const words = text
      .toLowerCase()
      .replace(/[^a-z\s]/g, '') // Remove non-alphabetic characters
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));
    
    // Count word frequency and return top keywords
    const wordCounts: { [key: string]: number } = {};
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    return Object.entries(wordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Remove duplicates and sort results
   */
  private deduplicateAndSort(papers: ResearchPaper[], sortBy: string): ResearchPaper[] {
    // Remove duplicates based on title similarity
    const uniquePapers = papers.filter((paper, index, array) => {
      return index === array.findIndex(p => 
        this.calculateSimilarity(p.title, paper.title) < 0.9
      );
    });

    // Sort results
    switch (sortBy) {
      case 'date':
        return uniquePapers.sort((a, b) => b.year - a.year);
      case 'citations':
        return uniquePapers.sort((a, b) => b.citations - a.citations);
      case 'relevance':
      default:
        return uniquePapers.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
  }

  /**
   * Calculate text similarity using simple Jaccard coefficient
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }
}

export const researchDatabase = new ResearchDatabaseService();