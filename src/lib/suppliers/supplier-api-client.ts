/**
 * Supplier API Client
 * Handles communication with individual supplier APIs
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { EventEmitter } from 'events';
import { SupplierConfig, SupplierProduct, PriceQuote, PurchaseOrder } from './supplier-integration';

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  requestId: string;
}

export interface ProductSearchParams {
  category?: string;
  keywords?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: boolean;
  page?: number;
  limit?: number;
}

export interface QuoteRequestItem {
  sku: string;
  quantity: number;
  specifications?: Record<string, any>;
  requestedDeliveryDate?: Date;
}

export interface OrderStatusResponse {
  orderId: string;
  status: string;
  items: Array<{
    sku: string;
    status: string;
    tracking?: string;
    estimatedDelivery?: Date;
  }>;
  tracking: {
    carrier: string;
    trackingNumber: string;
    status: string;
    estimatedDelivery: Date;
    updates: Array<{
      timestamp: Date;
      status: string;
      location: string;
      description: string;
    }>;
  };
}

export interface SupplierCapabilities {
  supportsRealTimeInventory: boolean;
  supportsAutomatedOrdering: boolean;
  supportsOrderTracking: boolean;
  supportsBulkPricing: boolean;
  supportsCustomProducts: boolean;
  supportsWebhooks: boolean;
  apiVersion: string;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

class SupplierAPIClient extends EventEmitter {
  private clients: Map<string, AxiosInstance> = new Map();
  private rateLimiters: Map<string, { requests: number; resetTime: Date }> = new Map();
  private requestQueues: Map<string, Array<() => Promise<any>>> = new Map();

  constructor() {
    super();
  }

  /**
   * Initialize API client for supplier
   */
  async initializeClient(supplier: SupplierConfig): Promise<void> {
    try {
      const client = this.createAxiosClient(supplier);
      this.clients.set(supplier.id, client);
      
      // Test connection
      const capabilities = await this.getCapabilities(supplier.id);
      
      // Setup rate limiting
      this.setupRateLimit(supplier.id, capabilities.rateLimit);
      
      // Setup request queue
      this.requestQueues.set(supplier.id, []);
      
      this.emit('client-initialized', { supplierId: supplier.id, capabilities });
      
    } catch (error) {
      this.emit('client-initialization-failed', { supplierId: supplier.id, error });
      throw error;
    }
  }

  /**
   * Create axios client with supplier-specific configuration
   */
  private createAxiosClient(supplier: SupplierConfig): AxiosInstance {
    const client = axios.create({
      baseURL: supplier.apiEndpoint,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${supplier.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'VibeLux-Integration/1.0'
      }
    });

    // Request interceptor
    client.interceptors.request.use(
      (config) => {
        config.metadata = { startTime: new Date() };
        this.emit('request-started', { supplierId: supplier.id, config });
        return config;
      },
      (error) => {
        this.emit('request-error', { supplierId: supplier.id, error });
        return Promise.reject(error);
      }
    );

    // Response interceptor
    client.interceptors.response.use(
      (response) => {
        const duration = Date.now() - response.config.metadata.startTime.getTime();
        this.emit('request-completed', { 
          supplierId: supplier.id, 
          status: response.status, 
          duration 
        });
        return response;
      },
      (error) => {
        const duration = error.config?.metadata ? 
          Date.now() - error.config.metadata.startTime.getTime() : 0;
        
        this.emit('request-failed', { 
          supplierId: supplier.id, 
          error: error.message, 
          status: error.response?.status,
          duration 
        });
        
        return Promise.reject(error);
      }
    );

    return client;
  }

  /**
   * Get supplier capabilities
   */
  async getCapabilities(supplierId: string): Promise<SupplierCapabilities> {
    const client = this.clients.get(supplierId);
    if (!client) {
      throw new Error(`Client not initialized for supplier ${supplierId}`);
    }

    try {
      const response = await this.makeRequest(supplierId, () => 
        client.get('/capabilities')
      );

      return response.data || {
        supportsRealTimeInventory: true,
        supportsAutomatedOrdering: true,
        supportsOrderTracking: true,
        supportsBulkPricing: true,
        supportsCustomProducts: false,
        supportsWebhooks: false,
        apiVersion: '1.0',
        rateLimit: {
          requestsPerMinute: 60,
          requestsPerHour: 1000
        }
      };

    } catch (error) {
      // Return default capabilities if endpoint doesn't exist
      return {
        supportsRealTimeInventory: false,
        supportsAutomatedOrdering: true,
        supportsOrderTracking: false,
        supportsBulkPricing: true,
        supportsCustomProducts: false,
        supportsWebhooks: false,
        apiVersion: '1.0',
        rateLimit: {
          requestsPerMinute: 30,
          requestsPerHour: 500
        }
      };
    }
  }

  /**
   * Search products
   */
  async searchProducts(
    supplierId: string, 
    params: ProductSearchParams
  ): Promise<APIResponse<SupplierProduct[]>> {
    const client = this.clients.get(supplierId);
    if (!client) {
      throw new Error(`Client not initialized for supplier ${supplierId}`);
    }

    try {
      const response = await this.makeRequest(supplierId, () =>
        client.get('/products/search', { params })
      );

      return {
        success: true,
        data: response.data.products || [],
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };
    }
  }

  /**
   * Get product details
   */
  async getProduct(supplierId: string, sku: string): Promise<APIResponse<SupplierProduct>> {
    const client = this.clients.get(supplierId);
    if (!client) {
      throw new Error(`Client not initialized for supplier ${supplierId}`);
    }

    try {
      const response = await this.makeRequest(supplierId, () =>
        client.get(`/products/${sku}`)
      );

      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };
    }
  }

  /**
   * Get real-time inventory
   */
  async getInventory(supplierId: string, skus: string[]): Promise<APIResponse<Array<{
    sku: string;
    quantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    leadTime: number;
    lastUpdated: Date;
  }>>> {
    const client = this.clients.get(supplierId);
    if (!client) {
      throw new Error(`Client not initialized for supplier ${supplierId}`);
    }

    try {
      const response = await this.makeRequest(supplierId, () =>
        client.post('/inventory/check', { skus })
      );

      return {
        success: true,
        data: response.data.inventory || [],
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };
    }
  }

  /**
   * Request price quote
   */
  async requestQuote(
    supplierId: string, 
    items: QuoteRequestItem[],
    customerInfo?: any
  ): Promise<APIResponse<PriceQuote>> {
    const client = this.clients.get(supplierId);
    if (!client) {
      throw new Error(`Client not initialized for supplier ${supplierId}`);
    }

    try {
      const response = await this.makeRequest(supplierId, () =>
        client.post('/quotes/request', { items, customerInfo })
      );

      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };
    }
  }

  /**
   * Get quote status
   */
  async getQuoteStatus(supplierId: string, quoteId: string): Promise<APIResponse<PriceQuote>> {
    const client = this.clients.get(supplierId);
    if (!client) {
      throw new Error(`Client not initialized for supplier ${supplierId}`);
    }

    try {
      const response = await this.makeRequest(supplierId, () =>
        client.get(`/quotes/${quoteId}`)
      );

      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };
    }
  }

  /**
   * Submit purchase order
   */
  async submitOrder(supplierId: string, order: PurchaseOrder): Promise<APIResponse<{
    orderId: string;
    status: string;
    confirmationNumber: string;
    estimatedDelivery: Date;
  }>> {
    const client = this.clients.get(supplierId);
    if (!client) {
      throw new Error(`Client not initialized for supplier ${supplierId}`);
    }

    try {
      const response = await this.makeRequest(supplierId, () =>
        client.post('/orders', order)
      );

      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(supplierId: string, orderId: string): Promise<APIResponse<OrderStatusResponse>> {
    const client = this.clients.get(supplierId);
    if (!client) {
      throw new Error(`Client not initialized for supplier ${supplierId}`);
    }

    try {
      const response = await this.makeRequest(supplierId, () =>
        client.get(`/orders/${orderId}`)
      );

      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(supplierId: string, orderId: string, reason: string): Promise<APIResponse<{
    orderId: string;
    status: string;
    cancellationFee?: number;
  }>> {
    const client = this.clients.get(supplierId);
    if (!client) {
      throw new Error(`Client not initialized for supplier ${supplierId}`);
    }

    try {
      const response = await this.makeRequest(supplierId, () =>
        client.post(`/orders/${orderId}/cancel`, { reason })
      );

      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };
    }
  }

  /**
   * Get order history
   */
  async getOrderHistory(
    supplierId: string, 
    params: {
      startDate?: Date;
      endDate?: Date;
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<APIResponse<PurchaseOrder[]>> {
    const client = this.clients.get(supplierId);
    if (!client) {
      throw new Error(`Client not initialized for supplier ${supplierId}`);
    }

    try {
      const response = await this.makeRequest(supplierId, () =>
        client.get('/orders/history', { params })
      );

      return {
        success: true,
        data: response.data.orders || [],
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };
    }
  }

  /**
   * Get shipping tracking
   */
  async getShippingTracking(
    supplierId: string, 
    trackingNumber: string
  ): Promise<APIResponse<{
    trackingNumber: string;
    carrier: string;
    status: string;
    estimatedDelivery: Date;
    updates: Array<{
      timestamp: Date;
      status: string;
      location: string;
      description: string;
    }>;
  }>> {
    const client = this.clients.get(supplierId);
    if (!client) {
      throw new Error(`Client not initialized for supplier ${supplierId}`);
    }

    try {
      const response = await this.makeRequest(supplierId, () =>
        client.get(`/shipping/track/${trackingNumber}`)
      );

      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };
    }
  }

  /**
   * Setup webhook subscriptions
   */
  async setupWebhooks(
    supplierId: string, 
    webhookUrl: string, 
    events: string[]
  ): Promise<APIResponse<{ webhookId: string; events: string[] }>> {
    const client = this.clients.get(supplierId);
    if (!client) {
      throw new Error(`Client not initialized for supplier ${supplierId}`);
    }

    try {
      const response = await this.makeRequest(supplierId, () =>
        client.post('/webhooks', { url: webhookUrl, events })
      );

      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };
    }
  }

  /**
   * Test API connection
   */
  async testConnection(supplierId: string): Promise<APIResponse<{ status: string; version: string }>> {
    const client = this.clients.get(supplierId);
    if (!client) {
      throw new Error(`Client not initialized for supplier ${supplierId}`);
    }

    try {
      const response = await this.makeRequest(supplierId, () =>
        client.get('/health')
      );

      return {
        success: true,
        data: response.data || { status: 'healthy', version: '1.0' },
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };
    }
  }

  /**
   * Make rate-limited request
   */
  private async makeRequest<T>(
    supplierId: string, 
    requestFn: () => Promise<T>
  ): Promise<T> {
    // Check rate limit
    if (this.isRateLimited(supplierId)) {
      // Queue request
      return new Promise((resolve, reject) => {
        const queue = this.requestQueues.get(supplierId) || [];
        queue.push(async () => {
          try {
            const result = await requestFn();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
        this.requestQueues.set(supplierId, queue);
      });
    }

    // Update rate limit counter
    this.updateRateLimit(supplierId);

    // Execute request
    return await requestFn();
  }

  /**
   * Setup rate limiting
   */
  private setupRateLimit(supplierId: string, rateLimit: { requestsPerMinute: number; requestsPerHour: number }): void {
    this.rateLimiters.set(supplierId, {
      requests: 0,
      resetTime: new Date(Date.now() + 60000) // Reset every minute
    });

    // Process queued requests
    setInterval(() => {
      this.processRequestQueue(supplierId);
    }, 1000);
  }

  /**
   * Check if rate limited
   */
  private isRateLimited(supplierId: string): boolean {
    const rateLimiter = this.rateLimiters.get(supplierId);
    if (!rateLimiter) return false;

    const now = new Date();
    if (now > rateLimiter.resetTime) {
      rateLimiter.requests = 0;
      rateLimiter.resetTime = new Date(now.getTime() + 60000);
    }

    return rateLimiter.requests >= 60; // Default limit
  }

  /**
   * Update rate limit counter
   */
  private updateRateLimit(supplierId: string): void {
    const rateLimiter = this.rateLimiters.get(supplierId);
    if (rateLimiter) {
      rateLimiter.requests++;
    }
  }

  /**
   * Process request queue
   */
  private async processRequestQueue(supplierId: string): Promise<void> {
    const queue = this.requestQueues.get(supplierId) || [];
    
    if (queue.length === 0 || this.isRateLimited(supplierId)) {
      return;
    }

    const request = queue.shift();
    if (request) {
      try {
        await request();
      } catch (error) {
        this.emit('queue-request-failed', { supplierId, error });
      }
    }

    this.requestQueues.set(supplierId, queue);
  }

  /**
   * Generate request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get client statistics
   */
  getClientStats(supplierId: string): {
    rateLimitStatus: { requests: number; resetTime: Date };
    queuedRequests: number;
    isConnected: boolean;
  } {
    const rateLimiter = this.rateLimiters.get(supplierId);
    const queue = this.requestQueues.get(supplierId) || [];
    const isConnected = this.clients.has(supplierId);

    return {
      rateLimitStatus: rateLimiter || { requests: 0, resetTime: new Date() },
      queuedRequests: queue.length,
      isConnected
    };
  }

  /**
   * Remove client
   */
  removeClient(supplierId: string): void {
    this.clients.delete(supplierId);
    this.rateLimiters.delete(supplierId);
    this.requestQueues.delete(supplierId);
    
    this.emit('client-removed', supplierId);
  }

  /**
   * Shutdown all clients
   */
  shutdown(): void {
    this.clients.clear();
    this.rateLimiters.clear();
    this.requestQueues.clear();
    
    this.emit('shutdown');
  }
}

export {
  SupplierAPIClient,
  APIResponse,
  ProductSearchParams,
  QuoteRequestItem,
  OrderStatusResponse,
  SupplierCapabilities
};

export default SupplierAPIClient;