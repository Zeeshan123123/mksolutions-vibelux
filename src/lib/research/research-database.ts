import { PrismaClient, ResearchPaper, Experiment, DataEntry } from '@prisma/client';
import { PubMedAPI } from './pubmed-api';
import { ArxivAPI } from './arxiv-api';
import { GoogleScholarAPI } from './google-scholar-api';
import { StatisticalAnalysis } from './statistical-analysis';
import { ExperimentDesigner } from './experiment-designer';

export interface SearchParams {
  query: string;
  sources?: ('pubmed' | 'arxiv' | 'scholar')[];
  limit?: number;
  offset?: number;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  includeFullText?: boolean;
}

export interface ResearchStats {
  totalPapers: number;
  totalExperiments: number;
  totalDataPoints: number;
  papersBySource: Record<string, number>;
  recentActivity: {
    date: Date;
    papers: number;
    experiments: number;
    dataEntries: number;
  }[];
}

export class ResearchDatabase {
  private prisma: PrismaClient;
  private pubmedApi: PubMedAPI;
  private arxivApi: ArxivAPI;
  private scholarApi: GoogleScholarAPI;

  constructor(
    prisma: PrismaClient,
    apiKeys?: {
      pubmed?: string;
      serpApi?: string;
    }
  ) {
    this.prisma = prisma;
    this.pubmedApi = new PubMedAPI(apiKeys?.pubmed);
    this.arxivApi = new ArxivAPI();
    this.scholarApi = new GoogleScholarAPI(apiKeys?.serpApi);
  }

  // Search across all sources
  async searchPapers(params: SearchParams): Promise<ResearchPaper[]> {
    const sources = params.sources || ['pubmed', 'arxiv', 'scholar'];
    const results: ResearchPaper[] = [];

    // Search each source in parallel
    const searchPromises = sources.map(async (source) => {
      try {
        switch (source) {
          case 'pubmed':
            return await this.searchPubMed(params);
          case 'arxiv':
            return await this.searchArxiv(params);
          case 'scholar':
            return await this.searchGoogleScholar(params);
          default:
            return [];
        }
      } catch (error) {
        logger.error('api', `Error searching ${source}:`, error);
        return [];
      }
    });

    const sourceResults = await Promise.all(searchPromises);
    sourceResults.forEach(papers => results.push(...papers));

    // Also search local database
    const localResults = await this.searchLocalDatabase(params);
    results.push(...localResults);

    // Remove duplicates based on title similarity
    return this.deduplicatePapers(results);
  }

  // Search PubMed
  private async searchPubMed(params: SearchParams): Promise<ResearchPaper[]> {
    const articles = await this.pubmedApi.search({
      query: params.query,
      limit: params.limit,
      offset: params.offset,
      minDate: params.dateRange?.start,
      maxDate: params.dateRange?.end,
    });

    // Save to database
    const papers: ResearchPaper[] = [];
    for (const article of articles) {
      const paper = await this.upsertPaper(this.pubmedApi.toResearchPaper(article));
      papers.push(paper);
    }

    return papers;
  }

  // Search arXiv
  private async searchArxiv(params: SearchParams): Promise<ResearchPaper[]> {
    const articles = await this.arxivApi.search({
      query: params.query,
      limit: params.limit,
      offset: params.offset,
    });

    // Save to database
    const papers: ResearchPaper[] = [];
    for (const article of articles) {
      const paper = await this.upsertPaper(this.arxivApi.toResearchPaper(article));
      
      // Optionally fetch full text PDF
      if (params.includeFullText && article.pdfUrl) {
        // In production, you'd download and process the PDF
        // For now, we'll just store the URL
        await this.prisma.researchPaper.update({
          where: { id: paper.id },
          data: { fullText: `PDF available at: ${article.pdfUrl}` },
        });
      }
      
      papers.push(paper);
    }

    return papers;
  }

  // Search Google Scholar
  private async searchGoogleScholar(params: SearchParams): Promise<ResearchPaper[]> {
    const yearRange = params.dateRange
      ? {
          yearMin: params.dateRange.start?.getFullYear(),
          yearMax: params.dateRange.end?.getFullYear(),
        }
      : {};

    const articles = await this.scholarApi.search({
      query: params.query,
      limit: params.limit,
      offset: params.offset,
      ...yearRange,
    });

    // Save to database
    const papers: ResearchPaper[] = [];
    for (const article of articles) {
      const paper = await this.upsertPaper(this.scholarApi.toResearchPaper(article));
      papers.push(paper);
    }

    return papers;
  }

  // Search local database
  private async searchLocalDatabase(params: SearchParams): Promise<ResearchPaper[]> {
    const where: any = {
      OR: [
        { title: { contains: params.query, mode: 'insensitive' } },
        { abstract: { contains: params.query, mode: 'insensitive' } },
        { keywords: { has: params.query } },
      ],
    };

    if (params.dateRange?.start || params.dateRange?.end) {
      where.publicationDate = {};
      if (params.dateRange.start) {
        where.publicationDate.gte = params.dateRange.start;
      }
      if (params.dateRange.end) {
        where.publicationDate.lte = params.dateRange.end;
      }
    }

    return this.prisma.researchPaper.findMany({
      where,
      skip: params.offset,
      take: params.limit,
      orderBy: { publicationDate: 'desc' },
    });
  }

  // Upsert paper to avoid duplicates
  private async upsertPaper(paperData: Partial<ResearchPaper>): Promise<ResearchPaper> {
    const { source, sourceId, ...data } = paperData;
    
    return this.prisma.researchPaper.upsert({
      where: {
        source_sourceId: {
          source: source!,
          sourceId: sourceId!,
        },
      },
      create: {
        source: source!,
        sourceId: sourceId!,
        ...data,
      } as any,
      update: data,
    });
  }

  // Deduplicate papers based on title similarity
  private deduplicatePapers(papers: ResearchPaper[]): ResearchPaper[] {
    const seen = new Map<string, ResearchPaper>();
    
    for (const paper of papers) {
      const normalizedTitle = paper.title.toLowerCase().replace(/[^\w\s]/g, '');
      
      // Check if we've seen a similar title
      let isDuplicate = false;
      for (const [seenTitle, seenPaper] of seen) {
        if (this.calculateSimilarity(normalizedTitle, seenTitle) > 0.8) {
          isDuplicate = true;
          // Keep the one with more information
          if (paper.abstract && !seenPaper.abstract) {
            seen.set(seenTitle, paper);
          }
          break;
        }
      }
      
      if (!isDuplicate) {
        seen.set(normalizedTitle, paper);
      }
    }
    
    return Array.from(seen.values());
  }

  // Calculate string similarity (Dice coefficient)
  private calculateSimilarity(str1: string, str2: string): number {
    const bigrams1 = this.getBigrams(str1);
    const bigrams2 = this.getBigrams(str2);
    
    const intersection = bigrams1.filter(bg => bigrams2.includes(bg)).length;
    return (2 * intersection) / (bigrams1.length + bigrams2.length);
  }

  private getBigrams(str: string): string[] {
    const bigrams: string[] = [];
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.push(str.slice(i, i + 2));
    }
    return bigrams;
  }

  // Create and manage experiments
  async createExperiment(
    userId: string,
    design: {
      title: string;
      description?: string;
      type: 'CRD' | 'RCBD' | 'Factorial' | 'LatinSquare';
      treatments: string[];
      blocks?: number;
      replications?: number;
      factors?: { name: string; levels: string[] }[];
    }
  ): Promise<Experiment> {
    // Generate experiment design
    let experimentDesign;
    switch (design.type) {
      case 'CRD':
        experimentDesign = ExperimentDesigner.createCRD(
          design.treatments,
          design.replications || 3
        );
        break;
      case 'RCBD':
        experimentDesign = ExperimentDesigner.createRCBD(
          design.treatments,
          design.blocks || design.replications || 3
        );
        break;
      case 'Factorial':
        if (!design.factors) throw new Error('Factors required for factorial design');
        experimentDesign = ExperimentDesigner.createFactorial(
          design.factors,
          design.replications || 3
        );
        break;
      case 'LatinSquare':
        experimentDesign = ExperimentDesigner.createLatinSquare(design.treatments);
        break;
      default:
        throw new Error(`Unsupported design type: ${design.type}`);
    }

    // Create experiment in database
    const experiment = await this.prisma.experiment.create({
      data: {
        userId,
        title: design.title,
        description: design.description,
        type: design.type,
        design: experimentDesign as any,
        replications: experimentDesign.replications,
        randomization: experimentDesign.randomization as any,
        treatments: {
          create: experimentDesign.treatments.map(t => ({
            name: t.name,
            description: t.description,
            levels: t.levels as any,
          })),
        },
        blocks: experimentDesign.blocks
          ? {
              create: experimentDesign.blocks.map(b => ({
                name: b.name,
                description: b.description,
              })),
            }
          : undefined,
      },
      include: {
        treatments: true,
        blocks: true,
      },
    });

    return experiment;
  }

  // Record data entry
  async recordData(
    experimentId: string,
    data: {
      treatmentId?: string;
      blockId?: string;
      replication: number;
      measurements: Record<string, any>;
      notes?: string;
      photoUrl?: string;
      enteredBy: string;
      isOffline?: boolean;
    }
  ): Promise<DataEntry> {
    return this.prisma.dataEntry.create({
      data: {
        experimentId,
        treatmentId: data.treatmentId,
        blockId: data.blockId,
        replication: data.replication,
        measurements: data.measurements,
        notes: data.notes,
        photoUrl: data.photoUrl,
        enteredBy: data.enteredBy,
        isOffline: data.isOffline || false,
        syncedAt: data.isOffline ? null : new Date(),
      },
    });
  }

  // Sync offline data
  async syncOfflineData(
    entries: Omit<DataEntry, 'id' | 'createdAt' | 'updatedAt'>[]
  ): Promise<DataEntry[]> {
    const synced: DataEntry[] = [];
    
    for (const entry of entries) {
      try {
        const created = await this.prisma.dataEntry.create({
          data: {
            ...entry,
            isOffline: false,
            syncedAt: new Date(),
          },
        });
        synced.push(created);
      } catch (error) {
        logger.error('api', 'Error syncing entry:', error );
      }
    }
    
    return synced;
  }

  // Run statistical analysis
  async runAnalysis(
    experimentId: string,
    analysisType: 'ANOVA' | 'Regression' | 'PostHoc',
    params?: any
  ): Promise<any> {
    const experiment = await this.prisma.experiment.findUnique({
      where: { id: experimentId },
      include: {
        treatments: true,
        blocks: true,
        dataEntries: true,
      },
    });

    if (!experiment) {
      throw new Error('Experiment not found');
    }

    let results: any;

    switch (analysisType) {
      case 'ANOVA': {
        // Prepare data for ANOVA
        const groups = this.prepareGroupsForANOVA(experiment);
        
        if (experiment.type === 'Factorial' && params?.factorNames) {
          // Factorial ANOVA
          const { data, factorA, factorB } = this.prepareFactorialData(experiment, params.factorNames);
          results = StatisticalAnalysis.factorialANOVA(data, factorA, factorB);
        } else {
          // One-way ANOVA
          results = StatisticalAnalysis.oneWayANOVA(groups);
        }
        break;
      }

      case 'Regression': {
        // Prepare data for regression
        const { y, X, variableNames } = this.prepareRegressionData(experiment, params);
        results = StatisticalAnalysis.multipleRegression(y, X, variableNames);
        break;
      }

      case 'PostHoc': {
        // Run post-hoc tests
        const groups = this.prepareGroupsForANOVA(experiment);
        results = StatisticalAnalysis.tukeyHSD(groups, params?.alpha);
        break;
      }

      default:
        throw new Error(`Unsupported analysis type: ${analysisType}`);
    }

    // Save analysis results
    await this.prisma.statisticalAnalysis.create({
      data: {
        experimentId,
        type: analysisType,
        method: params?.method || analysisType,
        parameters: params || {},
        results,
        summary: this.generateAnalysisSummary(analysisType, results),
        performedBy: params?.userId || 'system',
      },
    });

    return results;
  }

  // Get research statistics
  async getStats(userId?: string): Promise<ResearchStats> {
    const where = userId ? { userId } : {};

    const [
      totalPapers,
      totalExperiments,
      totalDataPoints,
      papersBySource,
      recentPapers,
      recentExperiments,
      recentData,
    ] = await Promise.all([
      this.prisma.researchPaper.count(),
      this.prisma.experiment.count({ where }),
      this.prisma.dataEntry.count({
        where: userId ? { experiment: { userId } } : {},
      }),
      this.prisma.researchPaper.groupBy({
        by: ['source'],
        _count: true,
      }),
      this.getRecentPapers(7),
      this.getRecentExperiments(7, userId),
      this.getRecentDataEntries(7, userId),
    ]);

    // Combine recent activity
    const recentActivity = this.combineRecentActivity(
      recentPapers,
      recentExperiments,
      recentData
    );

    return {
      totalPapers,
      totalExperiments,
      totalDataPoints,
      papersBySource: papersBySource.reduce(
        (acc, item) => ({ ...acc, [item.source]: item._count }),
        {}
      ),
      recentActivity,
    };
  }

  // Helper methods for data preparation
  private prepareGroupsForANOVA(experiment: any): number[][] {
    const groups: Record<string, number[]> = {};
    
    experiment.dataEntries.forEach((entry: any) => {
      const treatment = experiment.treatments.find((t: any) => t.id === entry.treatmentId);
      if (treatment && entry.measurements.value !== undefined) {
        if (!groups[treatment.name]) {
          groups[treatment.name] = [];
        }
        groups[treatment.name].push(Number(entry.measurements.value));
      }
    });
    
    return Object.values(groups);
  }

  private prepareFactorialData(
    experiment: any,
    factorNames: string[]
  ): { data: number[]; factorA: string[]; factorB: string[] } {
    const data: number[] = [];
    const factorA: string[] = [];
    const factorB: string[] = [];
    
    experiment.dataEntries.forEach((entry: any) => {
      if (entry.measurements.value !== undefined) {
        const treatment = experiment.treatments.find((t: any) => t.id === entry.treatmentId);
        if (treatment && treatment.levels) {
          data.push(Number(entry.measurements.value));
          factorA.push(treatment.levels[0]?.level || '');
          factorB.push(treatment.levels[1]?.level || '');
        }
      }
    });
    
    return { data, factorA, factorB };
  }

  private prepareRegressionData(
    experiment: any,
    params: any
  ): { y: number[]; X: number[][]; variableNames: string[] } {
    const y: number[] = [];
    const X: number[][] = [];
    const variableNames = params?.variableNames || [];
    
    experiment.dataEntries.forEach((entry: any) => {
      if (entry.measurements.y !== undefined) {
        y.push(Number(entry.measurements.y));
        const row: number[] = [];
        variableNames.forEach((varName: string) => {
          row.push(Number(entry.measurements[varName] || 0));
        });
        X.push(row);
      }
    });
    
    return { y, X, variableNames };
  }

  private generateAnalysisSummary(type: string, results: any): string {
    switch (type) {
      case 'ANOVA':
        const sig = results.sourcesOfVariation.find((s: any) => s.pValue < 0.05);
        return sig
          ? `Significant effect found (p < 0.05). R² = ${results.rSquared.toFixed(3)}`
          : `No significant effect (p > 0.05). R² = ${results.rSquared.toFixed(3)}`;
      
      case 'Regression':
        return `R² = ${results.rSquared.toFixed(3)}, F = ${results.fStatistic.toFixed(2)}, p = ${results.fPValue.toFixed(4)}`;
      
      case 'PostHoc':
        const sigComparisons = results.filter((r: any) => r.significant).length;
        return `${sigComparisons} of ${results.length} comparisons significant`;
      
      default:
        return 'Analysis completed';
    }
  }

  private async getRecentPapers(days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    return this.prisma.researchPaper.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: since } },
      _count: true,
    });
  }

  private async getRecentExperiments(days: number, userId?: string) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    return this.prisma.experiment.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: since },
        ...(userId ? { userId } : {}),
      },
      _count: true,
    });
  }

  private async getRecentDataEntries(days: number, userId?: string) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    return this.prisma.dataEntry.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: since },
        ...(userId ? { experiment: { userId } } : {}),
      },
      _count: true,
    });
  }

  private combineRecentActivity(papers: any[], experiments: any[], data: any[]) {
    const activityMap = new Map<string, any>();
    
    // Process each type
    papers.forEach(item => {
      const date = item.createdAt.toISOString().split('T')[0];
      if (!activityMap.has(date)) {
        activityMap.set(date, { date: new Date(date), papers: 0, experiments: 0, dataEntries: 0 });
      }
      activityMap.get(date)!.papers += item._count;
    });
    
    experiments.forEach(item => {
      const date = item.createdAt.toISOString().split('T')[0];
      if (!activityMap.has(date)) {
        activityMap.set(date, { date: new Date(date), papers: 0, experiments: 0, dataEntries: 0 });
      }
      activityMap.get(date)!.experiments += item._count;
    });
    
    data.forEach(item => {
      const date = item.createdAt.toISOString().split('T')[0];
      if (!activityMap.has(date)) {
        activityMap.set(date, { date: new Date(date), papers: 0, experiments: 0, dataEntries: 0 });
      }
      activityMap.get(date)!.dataEntries += item._count;
    });
    
    return Array.from(activityMap.values()).sort((a, b) => 
      b.date.getTime() - a.date.getTime()
    );
  }
}