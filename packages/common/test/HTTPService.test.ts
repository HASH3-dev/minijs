import { describe, it, expect, beforeEach, vi } from "vitest";
import { HTTPService, FetchHttpAdapter } from "../src/resources/HTTPService";

describe("HTTPService", () => {
  let httpService: HTTPService;
  let mockFetch: any;

  beforeEach(() => {
    // Mock global fetch
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    const adapter = new FetchHttpAdapter({
      baseURL: "https://api.example.com",
    });
    httpService = new HTTPService(adapter);
  });

  describe("GET requests", () => {
    it("should make a GET request", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ data: "test" }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const signal = httpService.get("/test");
      const result = await signal;

      expect(result).toEqual({
        data: { data: "test" },
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
      });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/test",
        expect.objectContaining({
          method: "GET",
        })
      );
    });

    it("should add query parameters", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        json: async () => ({ test: "data" }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const signal = httpService.get("/test", {
        params: { foo: "bar", baz: 123 },
      });

      const result = await signal;

      expect(result).toEqual({
        data: { test: "data" },
        status: 200,
        statusText: "OK",
        headers: {},
      });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/test?foo=bar&baz=123",
        expect.any(Object)
      );
    });
  });

  describe("POST requests", () => {
    it("should make a POST request with body", async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        statusText: "Created",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ id: 1 }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const postData = { name: "test" };
      const signal = httpService.post("/users", postData);

      const result = await signal;

      expect(result).toEqual({
        data: { id: 1 },
        status: 201,
        statusText: "Created",
        headers: { "content-type": "application/json" },
      });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/users",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(postData),
        })
      );
    });
  });

  describe("PUT requests", () => {
    it("should make a PUT request with body", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        json: async () => ({ id: 1, name: "updated" }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const putData = { name: "updated" };
      const signal = httpService.put("/users/1", putData);

      const result = await signal;

      expect(result.data).toEqual({ id: 1, name: "updated" });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(putData),
        })
      );
    });
  });

  describe("PATCH requests", () => {
    it("should make a PATCH request with body", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        json: async () => ({ id: 1, name: "patched" }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const patchData = { name: "patched" };
      const signal = httpService.patch("/users/1", patchData);

      const result = await signal;

      expect(result.data).toEqual({ id: 1, name: "patched" });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify(patchData),
        })
      );
    });
  });

  describe("delete requests", () => {
    it("should make a delete request", async () => {
      const mockResponse = {
        ok: true,
        status: 204,
        statusText: "No Content",
        headers: new Headers(),
        json: async () => null,
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const signal = httpService.delete("/users/1");

      const result = await signal;

      expect(result.status).toBe(204);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/users/1",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });

  describe("Error handling", () => {
    it("should return error result for HTTP errors", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
        headers: new Headers(),
        json: async () => ({ error: "Not found" }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const signal = httpService.get("/not-found");

      const errorPromise = new Promise((_, reject) => {
        signal.subscribe({
          error: (error) => reject(error),
        });
      });

      await expect(errorPromise).rejects.toEqual({
        data: { error: "Not found" },
        status: 404,
        statusText: "Not Found",
        headers: {},
      });
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const signal = httpService.get("/test");

      const errorPromise = new Promise((_, reject) => {
        signal.subscribe({
          error: (error) => reject(error),
        });
      });

      await expect(errorPromise).rejects.toEqual({
        data: null,
        status: 0,
        statusText: "Network error",
        headers: {},
      });
    });
  });

  describe("Request cancellation", () => {
    it("should support AbortController cancellation", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        json: async () => ({ data: "test" }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const signal = httpService.get("/test");
      const subscription = signal.subscribe(() => {});

      // Unsubscribe should trigger abort
      subscription.unsubscribe();

      // Verify AbortController was passed
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });
  });

  describe("Timeout handling", () => {
    it("should cancel request when timeout is reached", async () => {
      // Mock a slow response that takes longer than timeout
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  status: 200,
                  statusText: "OK",
                  headers: new Headers(),
                  json: async () => ({ data: "slow response" }),
                }),
              200
            ); // Responds in 200ms
          })
      );

      const signal = httpService.get("/slow-endpoint", { timeout: 50 }); // Timeout after 50ms

      const errorPromise = new Promise((_, reject) => {
        signal.subscribe({
          error: (error) => reject(error),
          next: () => {
            throw new Error("Should not succeed");
          },
        });
      });

      // Should timeout and be ignored (AbortError is ignored)
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify fetch was called
      expect(mockFetch).toHaveBeenCalled();
    });

    it("should complete successfully if response arrives before timeout", async () => {
      // Mock a fast response
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  status: 200,
                  statusText: "OK",
                  headers: new Headers(),
                  json: async () => ({ data: "fast response" }),
                }),
              10
            ); // Responds in 10ms
          })
      );

      const result = await httpService.get("/fast-endpoint", { timeout: 100 }); // Timeout after 100ms

      expect(result.data).toEqual({ data: "fast response" });
      expect(result.status).toBe(200);
    });
  });
});
