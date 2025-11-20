import { Subject, switchMap, Observable, tap } from 'rxjs';
import { Injectable, InjectionScope, Signal, signal } from '@mini/core';
import type { HttpAdapter, HttpRequestConfig, HttpResponse, HttpError } from './types';
import { FetchAdapter } from './adapters/FetchAdapter';

/**
 * HTTP Service that returns Signals with automatic request cancellation
 * 
 * Automatically cancels previous requests when a new one is made to the same endpoint.
 * Uses switchMap internally so you don't need to worry about cancellation.
 * 
 * @example
 * ```ts
 * const httpService = new HttpService();
 * 
 * // Simple GET request - automatically cancels previous requests to same URL
 * const usersSignal = httpService.get('/api/users');
 * 
 * // If you call get() again with same URL, previous request is automatically cancelled
 * const usersSignal2 = httpService.get('/api/users'); // Cancels usersSignal request
 * ```
 */
@Injectable({ scope: InjectionScope.SINGLETON })
export class HttpService {
  private adapter: HttpAdapter;
  
  /**
   * Map storing Subjects for automatic request cancellation per request key.
   * Each Subject manages requests to the same endpoint using switchMap to cancel previous requests.
   * 
   * When a request completes (success or error), the Subject is completed and removed from this Map
   * to prevent memory leaks. If another request to the same endpoint is made later, a new Subject is created.
   */
  private requestSubjects = new Map<string, Subject<{ config: HttpRequestConfig; signal: Signal<any> }>>();

  constructor(adapter?: HttpAdapter) {
    this.adapter = adapter || new FetchAdapter();
  }

  /**
   * Set a custom HTTP adapter
   */
  setAdapter(adapter: HttpAdapter): void {
    this.adapter = adapter;
  }

  /**
   * Generate a unique key for request cancellation grouping.
   * 
   * By default, uses the full URL to avoid canceling legitimate parallel requests
   * (e.g., GET /api/users?page=1 vs GET /api/users?page=2 won't cancel each other).
   * If cancellationKey is provided, requests with the same key will cancel each other
   * regardless of URL differences.
   * 
   * @param config Request configuration
   * @returns Unique key in format "METHOD:key" where key is cancellationKey or url
   */
  private getRequestKey(config: HttpRequestConfig): string {
    const method = config.method || 'GET';
    // Use custom cancellationKey if provided, otherwise use full URL
    const key = config.cancellationKey || config.url; 
    return `${method}:${key}`;
  }

  /**
   * Execute an HTTP request and return a Signal.
   * Automatically cancels previous requests to the same endpoint using switchMap internally.
   * 
   * The cancellation is based on the request key (method + cancellationKey or url).
   * When a new request with the same key is made, switchMap automatically:
   * 1. Unsubscribes from the previous Observable (calls cleanup function which aborts the request)
   * 2. Creates a new Observable for the new request
   * 
   * When a request completes (success or error), the Subject is cleaned up to prevent memory leaks.
   * If a request is cancelled by switchMap, the tap operator does not run, keeping the Subject alive
   * for the next request. Only when the Observable completes normally does cleanup occur.
   * 
   * @param config Request configuration
   * @returns Signal that emits the response data
   */
  request<T = any>(config: HttpRequestConfig): Signal<T> {
    const requestKey = this.getRequestKey(config);
    const responseSignal = signal<T>(undefined as T);

    // Get or create Subject for this request key
    let subject = this.requestSubjects.get(requestKey);

    if (!subject) {
      // Create new Subject for this request key
      subject = new Subject<{ config: HttpRequestConfig; signal: Signal<any> }>();
      this.requestSubjects.set(requestKey, subject);

      // Set up switchMap chain for automatic cancellation
      // Each time a new request is emitted to the Subject, switchMap processes it
      subject.pipe(
        switchMap(({ config: requestConfig, signal: targetSignal }) => {
          return new Observable<T>((subscriber) => {
            const abortController = new AbortController();
            
            // Execute the HTTP request
            this.adapter.request<T>({ ...requestConfig, signal: abortController.signal })
              .then((response) => {
                // Only emit if subscriber is still active (not cancelled by switchMap)
                if (!subscriber.closed) {
                  targetSignal.next(response.data);
                  subscriber.next(response.data);
                  subscriber.complete();
                }
              })
              .catch((error) => {
                // Only emit error if not cancelled and not already aborted
                if (!subscriber.closed && error.code !== 'ABORTED') {
                  targetSignal.error(error);
                  subscriber.error(error);
                }
              });

            // Cleanup function: called automatically by switchMap when unsubscribing
            // This happens when a new request is made to the same endpoint (canceling this one)
            return () => abortController.abort();
          }).pipe(
            // Use tap to cleanup Subject when request completes successfully or errors
            // IMPORTANT: tap is NOT called when switchMap cancels (unsubscribes) the Observable
            // This is the desired behavior: if a new request comes while one is pending,
            // switchMap cancels the old one (cleanup function aborts it) but tap doesn't run,
            // keeping the Subject alive for the new request. Only when a request completes
            // normally (success or error) does cleanup occur, removing the Subject from the Map.
            tap({
              next: () => this.cleanup(requestKey),
              error: () => this.cleanup(requestKey)
            })
          );
        })
      ).subscribe({
        error: (err) => {
          // Log critical stream errors (should not normally happen)
          console.error('[HttpService] Critical stream error:', err);
        }
      });
    }

    // Emit the new request config to trigger the switchMap chain
    // This will automatically cancel any previous request with the same key
    subject.next({ config, signal: responseSignal });
    return responseSignal;
  }

  /**
   * Cleanup Subject and remove it from the Map to prevent memory leaks.
   * 
   * This is called when a request completes (success or error) via the tap operator.
   * We complete the Subject first to terminate any internal RxJS subscriptions,
   * then remove it from the Map to free memory.
   * 
   * Note: This is NOT called when switchMap cancels a request (unsubscribe),
   * which is correct - we want to keep the Subject alive for the next request.
   * 
   * @param key Request key to clean up
   */
  private cleanup(key: string) {
    const subject = this.requestSubjects.get(key);
    if (subject) {
      console.log(`🗑️ [LIMPEZA] Removendo: ${key}`); // <--- LOG
      subject.complete(); 
      this.requestSubjects.delete(key); 
      console.log(`✅ Map Size após limpeza: ${this.requestSubjects.size}`); // <--- LOG
    }
  }

  /**
   * GET request - automatically cancels previous GET requests to the same URL
   */
  get<T = any>(url: string, config?: Omit<HttpRequestConfig, 'url' | 'method'>): Signal<T> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }

  /**
   * POST request - automatically cancels previous POST requests to the same URL
   */
  post<T = any>(
    url: string,
    body?: any,
    config?: Omit<HttpRequestConfig, 'url' | 'method' | 'body'>
  ): Signal<T> {
    return this.request<T>({ ...config, url, method: 'POST', body });
  }

  /**
   * PUT request - automatically cancels previous PUT requests to the same URL
   */
  put<T = any>(
    url: string,
    body?: any,
    config?: Omit<HttpRequestConfig, 'url' | 'method' | 'body'>
  ): Signal<T> {
    return this.request<T>({ ...config, url, method: 'PUT', body });
  }

  /**
   * PATCH request - automatically cancels previous PATCH requests to the same URL
   */
  patch<T = any>(
    url: string,
    body?: any,
    config?: Omit<HttpRequestConfig, 'url' | 'method' | 'body'>
  ): Signal<T> {
    return this.request<T>({ ...config, url, method: 'PATCH', body });
  }

  /**
   * DELETE request - automatically cancels previous DELETE requests to the same URL
   */
  delete<T = any>(
    url: string,
    config?: Omit<HttpRequestConfig, 'url' | 'method'>
  ): Signal<T> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }
}

