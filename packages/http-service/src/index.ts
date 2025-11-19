/**
 * @mini/http-service
 * 
 * HTTP Service for Mini Framework
 * Provides a reactive HTTP client that returns Signals and supports request cancellation
 */

export { HttpService } from './HttpService';
export { FetchAdapter } from './adapters/FetchAdapter';
export type {
  HttpAdapter,
  HttpRequestConfig,
  HttpResponse,
  HttpError,
} from './types';
