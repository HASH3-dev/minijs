import type { Signal } from "@mini/core";
import { FetchHttpAdapter } from "./adapters";
import type { HttpAdapter, RequestConfig, Result } from "./types";

/**
 * HTTPService class that provides HTTP methods (GET, POST, PUT, PATCH, DELETE)
 * Uses an adapter pattern to support different HTTP clients (fetch, axios, etc.)
 * All methods return Signal<Result<T>> for reactive programming and cancellation support
 */
export class HTTPService {
  constructor(private adapter: HttpAdapter = new FetchHttpAdapter()) {}

  /**
   * Perform a GET request
   * @param url The URL to request
   * @param config Optional request configuration
   * @returns Signal<Result<T>> with the response
   */
  get<T = any>(url: string, config?: RequestConfig): Signal<Result<T>> {
    return this.adapter.request<T>("GET", url, undefined, config);
  }

  /**
   * Perform a POST request
   * @param url The URL to request
   * @param data The data to send in the request body
   * @param config Optional request configuration
   * @returns Signal<Result<T>> with the response
   */
  post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Signal<Result<T>> {
    return this.adapter.request<T>("POST", url, data, config);
  }

  /**
   * Perform a PUT request
   * @param url The URL to request
   * @param data The data to send in the request body
   * @param config Optional request configuration
   * @returns Signal<Result<T>> with the response
   */
  put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Signal<Result<T>> {
    return this.adapter.request<T>("PUT", url, data, config);
  }

  /**
   * Perform a PATCH request
   * @param url The URL to request
   * @param data The data to send in the request body
   * @param config Optional request configuration
   * @returns Signal<Result<T>> with the response
   */
  patch<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Signal<Result<T>> {
    return this.adapter.request<T>("PATCH", url, data, config);
  }

  /**
   * Perform a DELETE request
   * @param url The URL to request
   * @param config Optional request configuration
   * @returns Signal<Result<T>> with the response
   */
  delete<T = any>(url: string, config?: RequestConfig): Signal<Result<T>> {
    return this.adapter.request<T>("DELETE", url, undefined, config);
  }
}
