import { ResearchPaper } from '@prisma/client';
import axios from 'axios';
import { parseString } from 'xml2js';
import { promisify } from 'util';

const parseXML = promisify(parseString);

export interface PubMedSearchParams {
  query: string;
  limit?: number;
  offset?: number;
  minDate?: Date;
  maxDate?: Date;
  sortBy?: 'relevance' | 'date';
}

export interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string[];
  abstract: string;
  journal?: string;
  publicationDate?: Date;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  keywords?: string[];
}

export class PubMedAPI {
  private baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async search(params: PubMedSearchParams): Promise<PubMedArticle[]> {
    try {
      // Step 1: Search for PMIDs
      const searchUrl = this.buildSearchUrl(params);
      const searchResponse = await axios.get(searchUrl);
      const searchResult = await parseXML(searchResponse.data);
      
      const pmids = searchResult.eSearchResult?.IdList?.[0]?.Id || [];
      if (!pmids.length) return [];

      // Step 2: Fetch article details
      const articles = await this.fetchArticles(pmids);
      return articles;
    } catch (error) {
      logger.error('api', 'PubMed API error:', error );
      throw new Error(`Failed to search PubMed: ${error.message}`);
    }
  }

  async fetchArticle(pmid: string): Promise<PubMedArticle | null> {
    const articles = await this.fetchArticles([pmid]);
    return articles[0] || null;
  }

  private async fetchArticles(pmids: string[]): Promise<PubMedArticle[]> {
    const fetchUrl = `${this.baseUrl}/efetch.fcgi`;
    const params = new URLSearchParams({
      db: 'pubmed',
      id: pmids.join(','),
      retmode: 'xml',
      rettype: 'abstract',
    });

    if (this.apiKey) {
      params.append('api_key', this.apiKey);
    }

    const response = await axios.get(`${fetchUrl}?${params}`);
    const result = await parseXML(response.data);
    
    const articles: PubMedArticle[] = [];
    const pubmedArticles = result.PubmedArticleSet?.PubmedArticle || [];

    for (const article of pubmedArticles) {
      const medlineCitation = article.MedlineCitation?.[0];
      if (!medlineCitation) continue;

      const pmid = medlineCitation.PMID?.[0]?._ || medlineCitation.PMID?.[0];
      const articleData = medlineCitation.Article?.[0];
      
      if (!articleData) continue;

      // Extract authors
      const authorList = articleData.AuthorList?.[0]?.Author || [];
      const authors = authorList.map((author: any) => {
        const lastName = author.LastName?.[0] || '';
        const foreName = author.ForeName?.[0] || '';
        return `${lastName} ${foreName}`.trim();
      }).filter(Boolean);

      // Extract publication date
      const pubDate = articleData.Journal?.[0]?.JournalIssue?.[0]?.PubDate?.[0];
      let publicationDate: Date | undefined;
      if (pubDate) {
        const year = pubDate.Year?.[0];
        const month = pubDate.Month?.[0] || '01';
        const day = pubDate.Day?.[0] || '01';
        if (year) {
          publicationDate = new Date(`${year}-${month}-${day}`);
        }
      }

      // Extract abstract
      const abstractTexts = articleData.Abstract?.[0]?.AbstractText || [];
      const abstract = abstractTexts.map((text: any) => 
        typeof text === 'string' ? text : text._ || ''
      ).join(' ');

      // Extract keywords
      const meshHeadings = medlineCitation.MeshHeadingList?.[0]?.MeshHeading || [];
      const keywords = meshHeadings.map((heading: any) => 
        heading.DescriptorName?.[0]?._ || heading.DescriptorName?.[0]
      ).filter(Boolean);

      // Extract DOI
      const articleIds = article.PubmedData?.[0]?.ArticleIdList?.[0]?.ArticleId || [];
      const doi = articleIds.find((id: any) => id.$.IdType === 'doi')?._ || 
                  articleIds.find((id: any) => id.$.IdType === 'doi');

      articles.push({
        pmid,
        title: articleData.ArticleTitle?.[0] || '',
        authors,
        abstract,
        journal: articleData.Journal?.[0]?.Title?.[0],
        publicationDate,
        volume: articleData.Journal?.[0]?.JournalIssue?.[0]?.Volume?.[0],
        issue: articleData.Journal?.[0]?.JournalIssue?.[0]?.Issue?.[0],
        pages: articleData.Pagination?.[0]?.MedlinePgn?.[0],
        doi,
        keywords,
      });
    }

    return articles;
  }

  private buildSearchUrl(params: PubMedSearchParams): string {
    const searchParams = new URLSearchParams({
      db: 'pubmed',
      term: params.query,
      retmax: String(params.limit || 20),
      retstart: String(params.offset || 0),
      retmode: 'json',
      sort: params.sortBy === 'date' ? 'date' : 'relevance',
    });

    if (this.apiKey) {
      searchParams.append('api_key', this.apiKey);
    }

    if (params.minDate || params.maxDate) {
      const minDate = params.minDate ? this.formatDate(params.minDate) : '1900/01/01';
      const maxDate = params.maxDate ? this.formatDate(params.maxDate) : '3000/12/31';
      searchParams.append('datetype', 'pdat');
      searchParams.append('mindate', minDate);
      searchParams.append('maxdate', maxDate);
    }

    return `${this.baseUrl}/esearch.fcgi?${searchParams}`;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  // Convert PubMed article to database format
  toResearchPaper(article: PubMedArticle): Partial<ResearchPaper> {
    return {
      title: article.title,
      authors: article.authors,
      abstract: article.abstract,
      source: 'pubmed',
      sourceId: article.pmid,
      pmid: article.pmid,
      doi: article.doi,
      publicationDate: article.publicationDate,
      journal: article.journal,
      volume: article.volume,
      issue: article.issue,
      pages: article.pages,
      keywords: article.keywords || [],
    };
  }
}