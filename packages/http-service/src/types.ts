/**
 * Types for HTTP Service
 */

export interface HttpRequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
  signal?: AbortSignal;
  timeout?: number;
  /**
   * Custom cancellation key for request grouping.
   * If provided, requests with the same cancellationKey will cancel each other.
   * If not provided, the full URL is used as the cancellation key.
   * 
   * @example
   * // These will cancel each other (same cancellationKey)
   * httpService.get('/api/search', { cancellationKey: 'search', params: { q: 'term1' } });
   * httpService.get('/api/search', { cancellationKey: 'search', params: { q: 'term2' } });
   * 
   * // These won't cancel each other (different URLs, no cancellationKey)
   * httpService.get('/api/users', { params: { page: 1 } });
   * httpService.get('/api/users', { params: { page: 2 } });
   */
  cancellationKey?: string;
  [key: string]: any; // Allow adapter-specific options
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: HttpRequestConfig;
}

export interface HttpError extends Error {
  response?: HttpResponse;
  config: HttpRequestConfig;
  code?: string;
}

/**
 * Adapter interface for HTTP clients
 * Implement this interface to use different HTTP clients (fetch, axios, etc)
 */
export interface HttpAdapter {
  /**
   * Execute an HTTP request
   * @param config Request configuration
   * @returns Promise that resolves to the response
   */
  request<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>>;
}

