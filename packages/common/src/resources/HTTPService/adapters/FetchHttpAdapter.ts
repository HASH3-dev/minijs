import { Signal } from "@mini/core";
import { Observable } from "rxjs";
import type {
  HttpAdapter,
  HttpMethod,
  RequestConfig,
  Result,
  HTTPConfig,
} from "../types";

/**
 * Fetch-based HTTP adapter
 * Uses the native Fetch API with AbortController for cancellation support
 */
export class FetchHttpAdapter implements HttpAdapter {
  constructor(private config: HTTPConfig = {}) {}

  /**
   * Make an HTTP request using fetch
   * Returns a Signal that supports cancellation via switchMap
   */
  request<T = any>(
    method: HttpMethod,
    url: string,
    data?: any,
    config: RequestConfig = {}
  ): Signal<Result<T>> {
    const observable = new Observable<Result<T>>((subscriber) => {
      const controller = new AbortController();

      // Merge configurations
      const mergedConfig = { ...this.config, ...config };
      const fullUrl = this.buildURL(
        mergedConfig.baseURL ? `${mergedConfig.baseURL}${url}` : url,
        mergedConfig.params
      );

      // Build fetch options
      const fetchOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...mergedConfig.headers,
        },
        signal: controller.signal,
      };

      // Add body for POST, PUT, PATCH
      if (data && ["POST", "PUT", "PATCH"].includes(method)) {
        fetchOptions.body = JSON.stringify(data);
      }

      // Handle timeout if specified
      let timeoutId: NodeJS.Timeout | undefined;
      if (mergedConfig.timeout) {
        timeoutId = setTimeout(() => {
          controller.abort();
        }, mergedConfig.timeout);
      }

      fetch(fullUrl, fetchOptions)
        .then(async (response) => {
          // Clear timeout on success
          if (timeoutId) clearTimeout(timeoutId);

          // Parse response body - try json first, fallback to text
          let responseData: T;
          try {
            responseData = await response.json();
          } catch (error) {
            // If json parsing fails, try text if method exists
            if (typeof response.text === "function") {
              responseData = (await response.text()) as any;
            } else {
              // Fallback for mocked responses
              responseData = null as any;
            }
          }

          // Build normalized result
          const result: Result<T> = {
            data: responseData,
            status: response.status,
            statusText: response.statusText,
            headers: this.parseHeaders(response.headers),
          };

          // Check for HTTP errors
          if (!response.ok) {
            subscriber.error(result);
          } else {
            subscriber.next(result);
            subscriber.complete();
          }
        })
        .catch((err) => {
          // Clear timeout on error
          if (timeoutId) clearTimeout(timeoutId);

          // Ignore abort errors (from cancellation)
          if (err.name !== "AbortError") {
            subscriber.error({
              data: null,
              status: 0,
              statusText: err.message,
              headers: {},
            });
          }
        });

      // 🔥 Return cleanup function - this is what switchMap will call for cancellation
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        controller.abort();
      };
    });

    return new Signal(observable);
  }

  /**
   * Build URL with query parameters using URLSearchParams
   */
  private buildURL(url: string, params?: Record<string, any>): string {
    if (!params) return url;

    const searchParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  /**
   * Parse headers from Headers object to plain object
   */
  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
}
