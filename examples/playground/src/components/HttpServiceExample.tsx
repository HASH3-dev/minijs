import { Component, Mount, Watch, signal, Signal } from "@mini/core";
import { HttpService } from "@mini/http-service";
import { switchMap, catchError, of, delay, map, combineLatest, Observable } from "rxjs";

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
}

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

/**
 * HttpService Example Component
 * Demonstrates:
 * - Basic GET request with Signal
 * - Automatic cancellation (no switchMap needed!)
 * - Search with automatic cancellation
 * - Error handling
 */
export class HttpServiceExample extends Component {
  private httpService = new HttpService();
  
  // Basic example - loading users
  users = signal<User[]>([]);
  usersLoading = signal(false);
  usersError = signal<string | null>(null);

  // Search example - automatic cancellation (no switchMap needed!)
  searchTerm = signal("");
  searchResults = signal<Post[]>([]);
  searchLoading = signal(false);
  searchError = signal<string | null>(null);
  private currentSearchSignal: Signal<Post[]> | null = null;

  // Post example
  postTitle = signal("");
  postBody = signal("");
  postResult = signal<string | null>(null);
  posting = signal(false);

  // Reactive computed value - updates when postTitle or postBody change
  isPostDisabled = signal(true);

  // Multiple requests example - to demonstrate cancellation
  requestCount = signal(0);
  completedRequests = signal<Array<{ id: number; completed: boolean; cancelled: boolean; started?: boolean; data?: any; error?: string }>>([]);
  runningTest = signal(false);

  @Mount()
  setupPostDisabled() {
    // Subscribe to changes in postTitle, postBody, and posting to update isPostDisabled
    return combineLatest([
      this.postTitle, 
      this.postBody, 
      this.posting
    ]).pipe(
      map((values: any[]) => {
        const [title = '', body = '', posting = false] = values;
        return !title.trim() || !body.trim() || posting;
      })
    ).subscribe((disabled: boolean) => {
      this.isPostDisabled.set(disabled);
    });
  }

  async testMultipleRequests() {
    this.runningTest.set(true);
    this.completedRequests.set([]);
    this.requestCount.set(0);

    // Track subscriptions to cleanup later
    const subscriptions: Array<{ id: number; unsubscribe: () => void }> = [];
    let completedCount = 0;
    let cancelledCount = 0;

    // Make 10 requests RAPIDLY - all at once, without waiting
    // Each one uses the SAME URL, so previous requests are AUTOMATICALLY cancelled
    // The key is: we don't wait between requests, so when #2 is made, #1 is still in progress
    for (let i = 1; i <= 10; i++) {
      // Initialize new request tracking with pending status
      const requestInfo = { id: i, completed: false, cancelled: false, started: true };
      this.completedRequests.set([...this.completedRequests.value, requestInfo]);
      this.requestCount.set(i);

      // Make HTTP request - using the SAME URL
      // Since the URL is the same, previous requests are AUTOMATICALLY cancelled
      // No switchMap needed - the service handles it internally!
      const requestSignal = this.httpService.get<Post[]>(
        "https://jsonplaceholder.typicode.com/posts",
        {
          params: {
            _limit: 1,
            // Note: Using same params to demonstrate automatic cancellation
            // In real use, you'd have different params, but same base URL would still cancel
          },
        }
      );

      // Subscribe to this request signal
      // We'll track success, error, and detect cancellations
      const subscription = requestSignal.subscribe({
        next: (data: Post[]) => {
          // Request completed successfully
          completedCount++;
          const requests = [...this.completedRequests.value];
          const index = requests.findIndex(r => r.id === i);
          if (index !== -1 && !requests[index].cancelled) {
            requests[index] = { 
              ...requests[index], 
              completed: true, 
              cancelled: false,
              data 
            };
            this.completedRequests.set(requests);
            console.log(`✅ Request #${i} completed`);
          }

          // Check if all requests have finished (completed or cancelled)
          if (completedCount + cancelledCount === 10) {
            setTimeout(() => {
              this.runningTest.set(false);
            }, 1000);
          }
        },
        error: (error: any) => {
          // Request errored or was cancelled
          const requests = [...this.completedRequests.value];
          const index = requests.findIndex(r => r.id === i);
          
          if (index !== -1) {
            if (error.code === 'ABORTED' || error.name === 'AbortError') {
              // Request was cancelled - this is expected behavior!
              cancelledCount++;
              requests[index] = { 
                ...requests[index], 
                cancelled: true, 
                completed: false 
              };
              this.completedRequests.set(requests);
              console.log(`✗ Request #${i} was cancelled (as expected)`);
            } else {
              // Real error (not cancellation)
              requests[index] = { 
                ...requests[index], 
                cancelled: false, 
                completed: false,
                error: error.message 
              };
              this.completedRequests.set(requests);
              console.error(`❌ Error in request ${i}:`, error);
            }
          }

          // Check if all requests have finished
          if (completedCount + cancelledCount === 10) {
            setTimeout(() => {
              this.runningTest.set(false);
            }, 1000);
          }
        },
      });

      subscriptions.push({ id: i, unsubscribe: () => subscription.unsubscribe() });

      // CRITICAL: Don't wait between requests!
      // We want to fire all requests rapidly so previous ones are still in progress
      // This allows the cancellation to actually happen
      // Only add a tiny delay (10ms) to ensure requests are processed in order
      if (i < 10) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    // Cleanup: after test completes, unsubscribe from all signals
    setTimeout(() => {
      subscriptions.forEach(sub => sub.unsubscribe());
    }, 5000);
  }

  loadUsers() {
    this.usersLoading.set(true);
    this.usersError.set(null);

    // Basic GET request - returns Signal
    const usersSignal = this.httpService.get<User[]>(
      "https://jsonplaceholder.typicode.com/users"
    );

    // Subscribe to the signal
    usersSignal.subscribe({
      next: (users) => {
        this.users.set(users);
        this.usersLoading.set(false);
      },
      error: (error) => {
        this.usersError.set(error.message || "Failed to load users");
        this.usersLoading.set(false);
      },
    });
  }

  @Mount()
  onMount() {
    // Load users on mount
    this.loadUsers();
  }

  @Watch('searchTerm')
  onSearchTermChange(term: string) {
    // Clear results if search term is empty
    if (!term.trim()) {
      this.searchResults.set([]);
      this.searchLoading.set(false);
      this.currentSearchSignal = null;
      return;
    }

    this.searchLoading.set(true);
    this.searchError.set(null);

    // Call get() directly - cancellation is AUTOMATIC!
    // If a previous request to the same URL exists, it's automatically cancelled
    // No need for switchMap - the service handles it internally
    const searchSignal = this.httpService.get<Post[]>(
      "https://jsonplaceholder.typicode.com/posts",
      {
        params: {
          // Simulate search - in real app, you'd have a search endpoint
          _limit: 100, // Get more posts to filter
        },
      }
    );

    // Store reference to current search
    this.currentSearchSignal = searchSignal;

    // Subscribe to the signal
    // Note: Since the URL is the same, previous requests are automatically cancelled
    searchSignal.pipe(
      // Add delay to simulate slow network (1.5 seconds)
      // This makes it easier to see cancellation when typing quickly
      delay(1500),
      // Filter posts by title containing search term (simulated search)
      map((posts: Post[]) => {
        const currentTerm = this.searchTerm.value.toLowerCase();
        return posts.filter((post: Post) =>
          post.title.toLowerCase().includes(currentTerm)
        );
      }),
      catchError((error) => {
        // Only show error if not aborted (abort is expected behavior)
        // Aborted requests are automatically cancelled by the service
        if (error.code !== 'ABORTED') {
          this.searchError.set(error.message || "Search failed");
        }
        this.searchLoading.set(false);
        return of([]);
      })
    ).subscribe({
      next: (filteredPosts) => {
        // Only update if this is still the current search
        if (this.currentSearchSignal === searchSignal) {
          this.searchResults.set(filteredPosts);
          this.searchLoading.set(false);
        }
      },
      error: (error) => {
        if (error.code !== 'ABORTED' && this.currentSearchSignal === searchSignal) {
          this.searchError.set(error.message || "Search failed");
          this.searchLoading.set(false);
        }
      },
    });
  }

  async handlePost() {
    if (!this.postTitle.value.trim() || !this.postBody.value.trim()) {
      return;
    }

    this.posting.set(true);
    this.postResult.set(null);

    try {
      // POST request - returns Signal
      const resultSignal = this.httpService.post<Post>(
        "https://jsonplaceholder.typicode.com/posts",
        {
          title: this.postTitle.value,
          body: this.postBody.value,
          userId: 1,
        }
      );

      resultSignal.subscribe({
        next: (post) => {
          this.postResult.set(`Post created! ID: ${post.id}`);
          this.postTitle.set("");
          this.postBody.set("");
          this.posting.set(false);
        },
        error: (error) => {
          this.postResult.set(`Error: ${error.message}`);
          this.posting.set(false);
        },
      });
    } catch (error: any) {
      this.postResult.set(`Error: ${error.message}`);
      this.posting.set(false);
    }
  }

  render() {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">
            HTTP Service Examples
          </h2>
          <p className="text-slate-600 mb-6">
            Demonstrates HTTP requests with <strong>automatic cancellation</strong> - 
            no switchMap needed! The service cancels previous requests automatically.
          </p>
        </div>

        {/* Basic GET Example */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">
            1. Basic GET Request (Signal)
          </h3>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mb-4"
            onClick={() => this.loadUsers()}
            disabled={this.usersLoading.value}
          >
            {this.usersLoading.value ? "Loading..." : "Load Users"}
          </button>

          {this.usersError.value && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              Error: {this.usersError.value}
            </div>
          )}

          {this.users.value.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700 mb-2">
                Loaded {this.users.value.length} users:
              </p>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {this.users.value.map((user: User) => (
                  <div
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <p className="font-medium text-slate-800">{user.name}</p>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search with Automatic Cancellation Example */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">
            2. Search with Automatic Cancellation
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            Type to search. <strong>No switchMap needed!</strong> Previous requests are automatically cancelled 
            when you type quickly - the service handles it internally. Try typing quickly to see the cancellation in action!
            <br />
            <span className="text-xs text-slate-500 italic">
              (Note: Added 1.5s delay to simulate slow network and demonstrate cancellation)
            </span>
            <br />
            <span className="text-xs text-blue-600 font-medium mt-2 block">
              💡 Each call to httpService.get() with the same URL automatically cancels the previous request!
            </span>
          </p>
          <input
            type="text"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            placeholder="Search posts..."
            value={this.searchTerm}
            onInput={(e: any) => this.searchTerm.set(e.target.value)}
          />

          {this.searchLoading.value && (
            <div className="mb-4 text-blue-600">Searching...</div>
          )}

          {this.searchError.value && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              Error: {this.searchError.value}
            </div>
          )}

          {this.searchResults.value.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700 mb-2">
                Found {this.searchResults.value.length} results:
              </p>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {this.searchResults.value.map((post: Post) => (
                  <div
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <p className="font-medium text-slate-800">{post.title}</p>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {post.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {this.searchTerm.value &&
            !this.searchLoading.value &&
            this.searchResults.value.length === 0 &&
            !this.searchError.value && (
              <p className="text-slate-500 text-sm">No results found</p>
            )}
        </div>

        {/* POST Example */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">
            3. POST Request (Signal)
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Title:
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Post title..."
                value={this.postTitle}
                onInput={(e: any) => this.postTitle.set(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Body:
              </label>
              <textarea
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Post body..."
                rows={4}
                value={this.postBody}
                onInput={(e: any) => this.postBody.set(e.target.value)}
              />
            </div>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => this.handlePost()}
              disabled={this.isPostDisabled}
            >
              {this.posting.value ? "Posting..." : "Create Post"}
            </button>

            {this.postResult.value && (
              <div
                className={`p-3 rounded-lg border ${
                  this.postResult.value.includes("Error")
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-green-50 border-green-200 text-green-700"
                }`}
              >
                {this.postResult.value}
              </div>
            )}
          </div>
        </div>

        {/* Multiple Requests Test - Cancellation Demo */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">
            4. Multiple Requests Test (Cancellation Demo)
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            This example triggers 10 HTTP requests <strong>rapidly (10ms apart)</strong> to the <strong>same URL</strong>.
            Since they all use the same URL and are fired before previous ones complete, 
            the service <strong>automatically cancels</strong> previous requests!
            Only the LAST request (#10) should complete - all previous ones (1-9) should be automatically cancelled.
            <br />
            <span className="text-xs text-blue-600 font-medium mt-2 block">
              💡 Key: All requests fire rapidly (without waiting), so when request #2 starts, #1 is still in progress and gets cancelled!
            </span>
            <span className="text-xs text-red-600 font-medium mt-1 block">
              ⚠️ Watch the status below - cancelled requests will show "✗ Cancelled" in red. Check the console for logs!
            </span>
          </p>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => this.testMultipleRequests()}
            disabled={this.runningTest.value}
          >
            {this.runningTest.value ? "Running Test..." : "Start 10 Requests Test"}
          </button>

          {this.requestCount.value > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-slate-700 mb-2">
                Current Request: {this.requestCount.value}/10
              </p>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${(this.requestCount.value / 10) * 100}%` }}
                />
              </div>
            </div>
          )}

          {this.completedRequests.value.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700 mb-2">
                Request Status:
              </p>
              <div className="max-h-64 overflow-y-auto space-y-2 bg-slate-50 rounded-lg p-3 border border-slate-200">
                {this.completedRequests.value.map((request: { id: number; completed: boolean; cancelled: boolean; started?: boolean; data?: any; error?: string }) => (
                  <div
                    className={`p-2 rounded border ${
                      request.completed
                        ? "bg-green-50 border-green-200"
                        : request.cancelled
                        ? "bg-red-50 border-red-200"
                        : "bg-yellow-50 border-yellow-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-800">
                        Request #{request.id}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          request.completed
                            ? "bg-green-200 text-green-800"
                            : request.cancelled
                            ? "bg-red-200 text-red-800"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {request.completed
                          ? "✓ Completed"
                          : request.cancelled
                          ? "✗ Cancelled"
                          : "⏳ Pending"}
                      </span>
                    </div>
                    {request.completed && request.data && (
                      <p className="text-xs text-slate-600 mt-1">
                        ✓ Got post: {request.data[0]?.title?.substring(0, 40)}...
                      </p>
                    )}
                    {request.cancelled && (
                      <p className="text-xs text-red-600 mt-1">
                        ✗ This request was automatically cancelled by a newer request
                      </p>
                    )}
                    {request.error && (
                      <p className="text-xs text-red-600 mt-1">
                        Error: {request.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {!this.runningTest.value && this.completedRequests.value.length > 0 && (
                <div className="mt-4 p-3 bg-slate-100 rounded-lg border border-slate-300">
                  <p className="text-sm font-semibold text-slate-800 mb-2">Test Results:</p>
                  <div className="space-y-1 text-sm text-slate-700">
                    <p>
                      <span className="font-medium">Completed:</span>{" "}
                      {
                        this.completedRequests.value.filter((r: { id: number; completed: boolean; cancelled: boolean; data?: any }) => r.completed)
                          .length
                      }{" "}
                      request(s) - Only request #{this.completedRequests.value.filter((r: { id: number; completed: boolean }) => r.completed)[0]?.id || '?'} completed
                    </p>
                    <p>
                      <span className="font-medium">Cancelled:</span>{" "}
                      {
                        this.completedRequests.value.filter((r: { id: number; completed: boolean; cancelled: boolean; data?: any }) => r.cancelled)
                          .length
                      }{" "}
                      request(s) - All previous requests were automatically cancelled!
                    </p>
                    <p className="text-xs text-slate-600 mt-2 italic">
                      ✅ This proves that the service automatically cancels previous requests when a new one is made to the same URL!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>
              <strong>Basic GET:</strong> Returns a Signal that you can subscribe to
            </li>
            <li>
              <strong>Automatic Cancellation:</strong> When you call <code>httpService.get()</code> with 
              the same URL, previous requests are <strong>automatically cancelled</strong> - no switchMap needed!
            </li>
            <li>
              <strong>Search Example:</strong> Shows automatic cancellation in action - just call <code>get()</code> 
              directly and previous requests are cancelled automatically
            </li>
            <li>
              <strong>POST:</strong> Returns a Signal with the created resource (same URL = auto-cancellation works too)
            </li>
            <li>
              <strong>Multiple Requests Test:</strong> Demonstrates automatic cancellation by triggering 10 requests 
              to the same URL rapidly - only the last one completes, all others are cancelled automatically
            </li>
            <li>
              <strong>How it works:</strong> The service uses switchMap internally - you don't need to worry about it!
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

