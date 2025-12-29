import { Signal } from "@mini/core";

/**
 * Normalized HTTP response result
 */
export interface Result<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

/**
 * HTTP request configuration
 */
export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  signal?: AbortSignal;
  [key: string]: any;
}

/**
 * HTTP method types
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * HTTP adapter interface
 */
export interface HttpAdapter {
  request<T = any>(
    method: HttpMethod,
    url: string,
    data?: any,
    config?: RequestConfig
  ): Signal<Result<T>>;
}

/**
 * HTTP service configuration
 */
export interface HTTPConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
  [key: string]: any;
}
