import { ResearchPaper } from '@prisma/client';
import axios from 'axios';
import { parseString } from 'xml2js';
import { promisify } from 'util';

const parseXML = promisify(parseString);

export interface ArxivSearchParams {
  query: string;
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'lastUpdatedDate' | 'submittedDate';
  sortOrder?: 'ascending' | 'descending';
  category?: string; // e.g., 'q-bio', 'physics', 'cs'
}

export interface ArxivArticle {
  arxivId: string;
  title: string;
  authors: string[];
  abstract: string;
  publicationDate: Date;
  updatedDate?: Date;
  categories: string[];
  doi?: string;
  journalRef?: string;
  comments?: string;
  primaryCategory?: string;
  pdfUrl?: string;
}

export class ArxivAPI {
  private baseUrl = 'http://export.arxiv.org/api/query';

  async search(params: ArxivSearchParams): Promise<ArxivArticle[]> {
    try {
      const searchUrl = this.buildSearchUrl(params);
      const response = await axios.get(searchUrl);
      const result = await parseXML(response.data);
      
      const entries = result.feed?.entry || [];
      return entries.map((entry: any) => this.parseEntry(entry));
    } catch (error) {
      logger.error('api', 'arXiv API error:', error );
      throw new Error(`Failed to search arXiv: ${error.message}`);
    }
  }

  async fetchArticle(arxivId: string): Promise<ArxivArticle | null> {
    try {
      const cleanId = arxivId.replace('arXiv:', '');
      const url = `${this.baseUrl}?id_list=${cleanId}`;
      const response = await axios.get(url);
      const result = await parseXML(response.data);
      
      const entry = result.feed?.entry?.[0];
      if (!entry) return null;
      
      return this.parseEntry(entry);
    } catch (error) {
      logger.error('api', 'arXiv fetch error:', error );
      return null;
    }
  }

  private parseEntry(entry: any): ArxivArticle {
    // Extract arXiv ID
    const id = entry.id?.[0] || '';
    const arxivId = id.split('/abs/')?.pop() || id;

    // Extract authors
    const authors = (entry.author || []).map((author: any) => 
      author.name?.[0] || ''
    ).filter(Boolean);

    // Extract categories
    const categories = (entry.category || []).map((cat: any) => 
      cat.$.term || ''
    ).filter(Boolean);

    // Extract dates
    const published = entry.published?.[0];
    const updated = entry.updated?.[0];

    // Extract DOI from links
    let doi: string | undefined;
    const links = entry.link || [];
    for (const link of links) {
      if (link.$.title === 'doi') {
        doi = link.$.href?.replace('http://dx.doi.org/', '');
        break;
      }
    }

    // PDF URL
    const pdfUrl = links.find((link: any) => 
      link.$.type === 'application/pdf'
    )?.$.href;

    return {
      arxivId,
      title: entry.title?.[0]?.trim() || '',
      authors,
      abstract: entry.summary?.[0]?.trim() || '',
      publicationDate: published ? new Date(published) : new Date(),
      updatedDate: updated ? new Date(updated) : undefined,
      categories,
      doi,
      journalRef: entry['arxiv:journal_ref']?.[0],
      comments: entry['arxiv:comment']?.[0],
      primaryCategory: entry['arxiv:primary_category']?.[0]?.$.term,
      pdfUrl,
    };
  }

  private buildSearchUrl(params: ArxivSearchParams): string {
    const searchParams = new URLSearchParams();
    
    // Build query
    let query = params.query;
    if (params.category) {
      query = `cat:${params.category} AND ${query}`;
    }
    searchParams.append('search_query', query);
    
    // Pagination
    searchParams.append('start', String(params.offset || 0));
    searchParams.append('max_results', String(params.limit || 20));
    
    // Sorting
    if (params.sortBy) {
      searchParams.append('sortBy', params.sortBy);
    }
    if (params.sortOrder) {
      searchParams.append('sortOrder', params.sortOrder);
    }

    return `${this.baseUrl}?${searchParams}`;
  }

  // Convert arXiv article to database format
  toResearchPaper(article: ArxivArticle): Partial<ResearchPaper> {
    return {
      title: article.title,
      authors: article.authors,
      abstract: article.abstract,
      source: 'arxiv',
      sourceId: article.arxivId,
      arxivId: article.arxivId,
      doi: article.doi,
      publicationDate: article.publicationDate,
      journal: article.journalRef,
      keywords: article.categories,
    };
  }

  // Get full-text PDF URL
  getPdfUrl(arxivId: string): string {
    const cleanId = arxivId.replace('arXiv:', '');
    return `https://arxiv.org/pdf/${cleanId}.pdf`;
  }
}