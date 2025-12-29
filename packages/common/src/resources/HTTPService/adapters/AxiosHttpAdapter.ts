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
 * Axios-based HTTP adapter (optional)
 * Requires axios to be installed as a peer dependency
 * Uses dynamic import to avoid bundling axios if not used (lazy-loaded on first request)
 */
export class AxiosHttpAdapter implements HttpAdapter {
  private axiosInstancePromise: Promise<any> | null = null;

  constructor(private config: HTTPConfig = {}) {}

  /**
   * Lazy load axios instance only when needed
   */
  private getAxiosInstance(): Promise<any> {
    if (!this.axiosInstancePromise) {
      this.axiosInstancePromise = import("axios")
        .then((module) => {
          const axios = module.default || module;
          // Create axios instance with base configuration
          return axios.create({
            baseURL: this.config.baseURL,
            headers: this.config.headers,
            timeout: this.config.timeout,
          });
        })
        .catch(() => {
          throw new Error(
            "Axios is not installed. Please install it with: npm install axios"
          );
        });
    }
    return this.axiosInstancePromise;
  }

  /**
   * Make an HTTP request using axios
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

      this.getAxiosInstance()
        .then((axiosInstance) => {
          // Build axios request config
          const axiosConfig: any = {
            method: method.toLowerCase(),
            url,
            headers: config.headers,
            params: config.params,
            timeout: config.timeout,
            signal: controller.signal,
          };

          // Add data for POST, PUT, PATCH
          if (data && ["POST", "PUT", "PATCH"].includes(method)) {
            axiosConfig.data = data;
          }

          return axiosInstance.request(axiosConfig);
        })
        .then((response: any) => {
          // Build normalized result
          const result: Result<T> = {
            data: response.data,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          };

          subscriber.next(result);
          subscriber.complete();
        })
        .catch((err: any) => {
          // Ignore abort errors (from cancellation)
          if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
            const result: Result<any> = {
              data: err.response?.data || null,
              status: err.response?.status || 0,
              statusText: err.response?.statusText || err.message,
              headers: err.response?.headers || {},
            };
            subscriber.error(result);
          }
        });

      // 🔥 Return cleanup function - this is what switchMap will call for cancellation
      return () => {
        controller.abort();
      };
    });

    return new Signal(observable);
  }
}
