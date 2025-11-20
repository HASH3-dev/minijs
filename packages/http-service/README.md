# @mini/http-service

HTTP Service for Mini Framework with Signal support and automatic request cancellation.

## Features

- ✅ **Returns Signals** - All requests return a `Signal` from `@mini/core`
- ✅ **Adapter Pattern** - Use fetch, axios, or any custom HTTP client
- ✅ **Automatic Cancellation** - Automatically cancels previous requests to the same endpoint using `switchMap` internally
- ✅ **TypeScript First** - Full type safety
- ✅ **Zero Configuration** - No need to worry about cancellation, it's handled automatically

## Installation

```bash
npm install @mini/http-service @mini/core rxjs
```

## Basic Usage

### Simple GET Request

```typescript
import { HttpService } from '@mini/http-service';

const httpService = new HttpService();

// Returns a Signal
const usersSignal = httpService.get<User[]>('/api/users');

// Access the value
usersSignal.subscribe(users => {
  console.log(users);
});

// Or get current value
const currentUsers = usersSignal.value;
```

### Automatic Cancellation

The service automatically cancels previous requests when a new one is made to the same endpoint. This prevents race conditions and ensures only the latest response is processed. You don't need to worry about cancellation - it's handled internally using `switchMap`.

```typescript
import { Component, signal, Watch } from '@mini/core';
import { HttpService } from '@mini/http-service';

export class SearchComponent extends Component {
  searchTerm = signal('');
  results = signal<any[]>([]);
  httpService = new HttpService();

  @Watch('searchTerm')
  onSearchTermChange(term: string) {
    // When searchTerm changes, automatically cancel previous request
    // and start a new one - no need for switchMap manually!
    const resultsSignal = this.httpService.get('/api/search', { 
      params: { q: term } 
    });
    
    resultsSignal.subscribe(results => {
      this.results.next(results);
    });
  }

  render() {
    return (
      <div>
        <input 
          onInput={(e) => this.searchTerm.next(e.target.value)} 
          placeholder="Search..."
        />
        <ul>
          {this.results.value?.map(item => (
            <li>{item.name}</li>
          ))}
        </ul>
      </div>
    );
  }
}
```

**Note**: If you call `httpService.get()` multiple times with the same URL, the previous request is automatically cancelled.

### Using with @LoadData Decorator

```typescript
import { Component, LoadData } from '@mini/core';
import { HttpService } from '@mini/http-service';
import { firstValueFrom } from 'rxjs';

export class UserListComponent extends Component {
  httpService = new HttpService();

  @LoadData({ autoLoad: true })
  loadUsers() {
    // @LoadData accepts Promise or Observable
    // Signal extends Observable (ReplaySubject), so we can convert it to Promise
    const usersSignal = this.httpService.get('/api/users');
    return firstValueFrom(usersSignal);
  }

  render() {
    // Component automatically handles loading/error/success states
    return <div>Users loaded!</div>;
  }
}
```

## API Methods

All methods return a `Signal` and automatically cancel previous requests to the same endpoint:

```typescript
// GET - automatically cancels previous GET requests to the same URL
const data = httpService.get<T>(url, config?);

// POST - automatically cancels previous POST requests to the same URL
const data = httpService.post<T>(url, body?, config?);

// PUT - automatically cancels previous PUT requests to the same URL
const data = httpService.put<T>(url, body?, config?);

// PATCH - automatically cancels previous PATCH requests to the same URL
const data = httpService.patch<T>(url, body?, config?);

// DELETE - automatically cancels previous DELETE requests to the same URL
const data = httpService.delete<T>(url, config?);
```

## Request Configuration

```typescript
interface HttpRequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
  signal?: AbortSignal; // Automatically handled internally
  timeout?: number;
}
```

### Example with Full Configuration

```typescript
const result = httpService.post('/api/users', 
  { name: 'John', email: 'john@example.com' },
  {
    headers: {
      'Authorization': 'Bearer token123',
      'X-Custom-Header': 'value'
    },
    timeout: 5000, // 5 seconds
    params: {
      include: 'profile',
      format: 'json'
    }
  }
);
```

## Custom Adapters

You can create custom adapters for different HTTP clients (axios, node-fetch, etc).

### Creating an Adapter

```typescript
import { HttpAdapter, HttpRequestConfig, HttpResponse } from '@mini/http-service';

export class AxiosAdapter implements HttpAdapter {
  async request<T>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    // Implement your HTTP client logic here
    const response = await axios({
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.body,
      params: config.params,
      signal: config.signal, // Important: support AbortSignal
    });

    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config,
    };
  }
}

// Use the custom adapter
const httpService = new HttpService(new AxiosAdapter());
```

### Using Axios Adapter (Example)

```typescript
import axios from 'axios';
import { HttpService } from '@mini/http-service';
import type { HttpAdapter, HttpRequestConfig, HttpResponse } from '@mini/http-service';

class AxiosAdapter implements HttpAdapter {
  async request<T>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    try {
      const response = await axios({
        url: config.url,
        method: config.method || 'GET',
        headers: config.headers,
        data: config.body,
        params: config.params,
        signal: config.signal,
        timeout: config.timeout,
      });

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
        config,
      };
    } catch (error: any) {
      if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
        const abortError: HttpError = new Error('Request aborted') as HttpError;
        abortError.config = config;
        abortError.code = 'ABORTED';
        throw abortError;
      }

      const httpError: HttpError = error.response 
        ? {
            ...error,
            response: {
              data: error.response.data,
              status: error.response.status,
              statusText: error.response.statusText,
              headers: error.response.headers,
              config,
            },
            config,
            code: 'HTTP_ERROR',
          }
        : {
            ...error,
            config,
            code: 'NETWORK_ERROR',
          };

      throw httpError;
    }
  }
}

const httpService = new HttpService(new AxiosAdapter());
```

## How Automatic Cancellation Works

The service uses `switchMap` internally to automatically cancel previous requests when a new one is made to the same endpoint:

1. **Request Key Generated**: Each request is identified by a unique key (method + URL)
2. **Subject Created**: A Subject is created for each unique request key
3. **switchMap Setup**: The Subject uses `switchMap` to process requests, automatically canceling previous ones
4. **New Request Triggered**: When you call a method (e.g., `get()`), the request config is emitted to the Subject
5. **Previous Request Cancelled**: `switchMap` automatically unsubscribes from the previous Observable and aborts it
6. **Abort Signal Sent**: The AbortController's signal is sent to the HTTP adapter
7. **Request Aborted**: The HTTP adapter cancels the in-flight request
8. **Only Latest Response**: Only the latest response is processed, preventing race conditions

This is especially useful for:
- Search inputs (user types quickly)
- Form submissions (user clicks submit multiple times)
- Filter changes (user changes filters rapidly)
- Any scenario where multiple requests might be triggered in quick succession

**You don't need to do anything** - just call the methods normally and cancellation is handled automatically!

## Error Handling

```typescript
const usersSignal = httpService.get<User[]>('/api/users');

usersSignal.subscribe({
  next: (users) => {
    console.log('Success:', users);
  },
  error: (error: HttpError) => {
    if (error.code === 'ABORTED') {
      // Request was cancelled (expected behavior with automatic cancellation)
      console.log('Request cancelled');
    } else if (error.code === 'TIMEOUT') {
      console.error('Request timeout');
    } else if (error.response) {
      console.error('HTTP Error:', error.response.status, error.response.data);
    } else {
      console.error('Network Error:', error.message);
    }
  }
});
```

## Dependency Injection

The `HttpService` is marked as `@Injectable`, so you can use it with the DI system:

```typescript
import { Injectable, Inject } from '@mini/core';
import { HttpService } from '@mini/http-service';

@Injectable()
export class UserService {
  constructor(@Inject(HttpService) private http: HttpService) {}

  getUsers() {
    return this.http.get<User[]>('/api/users');
  }
}
```

## License

MIT
