import type { HttpAdapter, HttpRequestConfig, HttpResponse, HttpError } from '../types';

/**
 * Default HTTP adapter using native fetch API
 */
export class FetchAdapter implements HttpAdapter {
  async request<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    const {
      url,
      method = 'GET',
      headers = {},
      body,
      params,
      signal,
      timeout,
    } = config;

    // Build URL with query params
    let finalUrl = url;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      const queryString = searchParams.toString();
      if (queryString) {
        finalUrl += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal,
    };

    // Add body for methods that support it
    if (body !== undefined && method !== 'GET' && method !== 'HEAD') {
      if (typeof body === 'string') {
        requestOptions.body = body;
      } else if (body instanceof FormData || body instanceof URLSearchParams) {
        requestOptions.body = body;
        // Remove Content-Type header to let browser set it with boundary
        delete (requestOptions.headers as Record<string, string>)['Content-Type'];
      } else {
        requestOptions.body = JSON.stringify(body);
      }
    }

    // Handle timeout
    let abortController: AbortController | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    if (timeout && timeout > 0) {
      abortController = new AbortController();
      const timeoutSignal = abortController.signal;

      // Combine signals if both timeout and request signal exist
      if (signal) {
        const combinedController = new AbortController();
        signal.addEventListener('abort', () => {
          combinedController.abort();
        });
        timeoutSignal.addEventListener('abort', () => {
          combinedController.abort();
        });
        requestOptions.signal = combinedController.signal;
      } else {
        requestOptions.signal = timeoutSignal;
      }

      timeoutId = setTimeout(() => {
        abortController?.abort();
      }, timeout);
    }

    try {
      const response = await fetch(finalUrl, requestOptions);

      // Clear timeout if request completed
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Parse response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Parse response body
      let data: T;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else if (contentType?.includes('text/')) {
        data = (await response.text()) as T;
      } else {
        data = (await response.blob()) as T;
      }

      const httpResponse: HttpResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        config,
      };

      // Throw error for non-2xx status codes
      if (!response.ok) {
        const error: HttpError = new Error(
          `Request failed with status ${response.status}: ${response.statusText}`
        ) as HttpError;
        error.response = httpResponse;
        error.config = config;
        error.code = 'HTTP_ERROR';
        throw error;
      }

      return httpResponse;
    } catch (error: any) {
      // Clear timeout on error
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Handle abort errors
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        const abortError: HttpError = new Error(
          timeout ? 'Request timeout' : 'Request aborted'
        ) as HttpError;
        abortError.config = config;
        abortError.code = error.name === 'TimeoutError' ? 'TIMEOUT' : 'ABORTED';
        throw abortError;
      }

      // Re-throw if already an HttpError
      if (error.code) {
        throw error;
      }

      // Wrap other errors
      const httpError: HttpError = error as HttpError;
      httpError.config = config;
      httpError.code = 'NETWORK_ERROR';
      throw httpError;
    }
  }
}

