import { prisma } from '@/lib/db'
import { cache } from '@/lib/cache'

export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, any>
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  meta?: {
    cacheHit?: boolean
    queryTime?: number
  }
}

export interface CursorPaginationOptions {
  cursor?: string
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, any>
}

export interface CursorPaginatedResult<T> {
  data: T[]
  pagination: {
    limit: number
    hasNext: boolean
    nextCursor?: string
    prevCursor?: string
  }
  meta?: {
    cacheHit?: boolean
    queryTime?: number
  }
}

export class PaginationService {
  // Offset-based pagination (for small to medium datasets)
  static async paginate<T>(
    model: any,
    options: PaginationOptions = {},
    cacheKey?: string,
    cacheTTL: number = 300
  ): Promise<PaginatedResult<T>> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      filters = {}
    } = options

    // Validate pagination parameters
    const validatedPage = Math.max(1, page)
    const validatedLimit = Math.min(Math.max(1, limit), 100) // Max 100 items per page
    const skip = (validatedPage - 1) * validatedLimit

    // Generate cache key if provided
    const fullCacheKey = cacheKey 
      ? `pagination:${cacheKey}:${JSON.stringify({ page: validatedPage, limit: validatedLimit, sortBy, sortOrder, search, filters })}`
      : null

    // Try to get from cache first
    if (fullCacheKey) {
      const cached = await cache.get<PaginatedResult<T>>(fullCacheKey)
      if (cached) {
        return {
          ...cached,
          meta: { ...cached.meta, cacheHit: true }
        }
      }
    }

    const startTime = Date.now()

    // Build where clause
    const where: any = { ...filters }
    if (search) {
      // Add search functionality - this would need to be customized per model
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Build order by clause
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    try {
      // Execute queries in parallel
      const [data, total] = await Promise.all([
        model.findMany({
          where,
          skip,
          take: validatedLimit,
          orderBy,
          // Include related data efficiently
          include: this.getOptimizedIncludes(model.name)
        }),
        model.count({ where })
      ])

      const queryTime = Date.now() - startTime
      const totalPages = Math.ceil(total / validatedLimit)

      const result: PaginatedResult<T> = {
        data,
        pagination: {
          page: validatedPage,
          limit: validatedLimit,
          total,
          totalPages,
          hasNext: validatedPage < totalPages,
          hasPrev: validatedPage > 1
        },
        meta: {
          cacheHit: false,
          queryTime
        }
      }

      // Cache the result
      if (fullCacheKey) {
        await cache.set(fullCacheKey, result, { ttl: cacheTTL })
      }

      return result
    } catch (error) {
      logger.error('api', 'Pagination error:', error )
      throw new Error('Failed to paginate data')
    }
  }

  // Cursor-based pagination (for large datasets and real-time updates)
  static async cursorPaginate<T>(
    model: any,
    options: CursorPaginationOptions = {},
    cacheKey?: string,
    cacheTTL: number = 60
  ): Promise<CursorPaginatedResult<T>> {
    const {
      cursor,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      filters = {}
    } = options

    const validatedLimit = Math.min(Math.max(1, limit), 100)

    // Generate cache key
    const fullCacheKey = cacheKey 
      ? `cursor:${cacheKey}:${JSON.stringify({ cursor, limit: validatedLimit, sortBy, sortOrder, search, filters })}`
      : null

    // Try cache first
    if (fullCacheKey) {
      const cached = await cache.get<CursorPaginatedResult<T>>(fullCacheKey)
      if (cached) {
        return {
          ...cached,
          meta: { ...cached.meta, cacheHit: true }
        }
      }
    }

    const startTime = Date.now()

    // Build where clause
    const where: any = { ...filters }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Add cursor condition
    if (cursor) {
      const cursorCondition = sortOrder === 'desc' 
        ? { [sortBy]: { lt: cursor } }
        : { [sortBy]: { gt: cursor } }
      where.AND = where.AND ? [...where.AND, cursorCondition] : [cursorCondition]
    }

    // Build order by
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    try {
      // Fetch one extra item to check if there's a next page
      const data = await model.findMany({
        where,
        take: validatedLimit + 1,
        orderBy,
        include: this.getOptimizedIncludes(model.name)
      })

      const queryTime = Date.now() - startTime
      const hasNext = data.length > validatedLimit
      const items = hasNext ? data.slice(0, validatedLimit) : data

      // Generate cursors
      const nextCursor = hasNext && items.length > 0 
        ? items[items.length - 1][sortBy]
        : undefined
      
      const prevCursor = items.length > 0 
        ? items[0][sortBy]
        : undefined

      const result: CursorPaginatedResult<T> = {
        data: items,
        pagination: {
          limit: validatedLimit,
          hasNext,
          nextCursor,
          prevCursor
        },
        meta: {
          cacheHit: false,
          queryTime
        }
      }

      // Cache for a shorter time since cursor pagination is more dynamic
      if (fullCacheKey) {
        await cache.set(fullCacheKey, result, { ttl: cacheTTL })
      }

      return result
    } catch (error) {
      logger.error('api', 'Cursor pagination error:', error )
      throw new Error('Failed to paginate data with cursor')
    }
  }

  // Get optimized includes based on model type
  private static getOptimizedIncludes(modelName: string): any {
    const includeMap: Record<string, any> = {
      User: {
        facilities: {
          select: {
            id: true,
            name: true,
            location: true
          }
        }
      },
      Facility: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true
          },
          take: 5 // Limit related data
        }
      },
      Project: {
        facility: {
          select: {
            id: true,
            name: true,
            location: true
          }
        },
        lightingDesigns: {
          select: {
            id: true,
            name: true,
            status: true
          },
          take: 3
        }
      },
      LightingDesign: {
        project: {
          select: {
            id: true,
            name: true,
            facility: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    }

    return includeMap[modelName] || {}
  }

  // Bulk operations for large datasets
  static async bulkOperation<T>(
    operation: (batch: T[]) => Promise<any>,
    data: T[],
    batchSize: number = 1000
  ): Promise<any[]> {
    const results: any[] = []
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize)
      try {
        const result = await operation(batch)
        results.push(result)
        
        // Add small delay to prevent overwhelming the database
        if (i + batchSize < data.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      } catch (error) {
        logger.error('api', `Bulk operation failed for batch ${i}-${i + batchSize}:`, error)
        throw error
      }
    }
    
    return results
  }

  // Stream large datasets
  static async *streamData<T>(
    model: any,
    batchSize: number = 1000,
    filters: any = {}
  ): AsyncGenerator<T[], void, unknown> {
    let cursor: any = null
    let hasMore = true

    while (hasMore) {
      const where = { ...filters }
      if (cursor) {
        where.id = { gt: cursor }
      }

      const batch = await model.findMany({
        where,
        take: batchSize,
        orderBy: { id: 'asc' },
        include: this.getOptimizedIncludes(model.name)
      })

      if (batch.length === 0) {
        hasMore = false
      } else {
        cursor = batch[batch.length - 1].id
        hasMore = batch.length === batchSize
        yield batch
      }
    }
  }

  // Advanced search with full-text search capabilities
  static async advancedSearch<T>(
    model: any,
    query: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<T>> {
    const {
      page = 1,
      limit = 20,
      sortBy = '_relevance',
      filters = {}
    } = options

    const validatedPage = Math.max(1, page)
    const validatedLimit = Math.min(Math.max(1, limit), 100)
    const skip = (validatedPage - 1) * validatedLimit

    // Use PostgreSQL full-text search if available
    const searchQuery = {
      OR: [
        // Text search across multiple fields
        {
          name: {
            search: query
          }
        },
        {
          description: {
            search: query
          }
        },
        // Fallback to LIKE search
        {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: query,
            mode: 'insensitive'
          }
        }
      ],
      ...filters
    }

    try {
      const [data, total] = await Promise.all([
        model.findMany({
          where: searchQuery,
          skip,
          take: validatedLimit,
          orderBy: sortBy === '_relevance' 
            ? { _relevance: { search: query, sort: 'desc' } }
            : { [sortBy]: 'desc' },
          include: this.getOptimizedIncludes(model.name)
        }),
        model.count({ where: searchQuery })
      ])

      const totalPages = Math.ceil(total / validatedLimit)

      return {
        data,
        pagination: {
          page: validatedPage,
          limit: validatedLimit,
          total,
          totalPages,
          hasNext: validatedPage < totalPages,
          hasPrev: validatedPage > 1
        }
      }
    } catch (error) {
      logger.error('api', 'Advanced search error:', error )
      // Fallback to basic search
      return this.paginate(model, { ...options, search: query })
    }
  }
}