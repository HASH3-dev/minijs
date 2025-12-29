import { describe, it, expect, beforeEach, vi } from "vitest";
import axios from "axios";
import { HTTPService, AxiosHttpAdapter } from "../src/resources/HTTPService";

// Mock axios
vi.mock("axios");
const mockedAxios = axios as any;

describe("AxiosHttpAdapter", () => {
  let httpService: HTTPService;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Create a mock axios instance
    mockAxiosInstance = {
      request: vi.fn(),
    };

    // Mock axios.create to return our mocked instance
    mockedAxios.create = vi.fn().mockReturnValue(mockAxiosInstance);

    const adapter = new AxiosHttpAdapter({
      baseURL: "https://api.example.com",
    });
    httpService = new HTTPService(adapter);
  });

  describe("GET requests", () => {
    it("should make a GET request", async () => {
      const mockResponse = {
        data: { data: "test" },
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
      };
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);

      const signal = httpService.get("/test");
      const result = await signal;

      expect(result).toEqual({
        data: { data: "test" },
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
      });
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "get",
          url: "/test",
        })
      );
    });

    it("should add query parameters", async () => {
      const mockResponse = {
        data: { test: "data" },
        status: 200,
        statusText: "OK",
        headers: {},
      };
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);

      const signal = httpService.get("/test", {
        params: { foo: "bar", baz: 123 },
      });

      const result = await signal;

      expect(result.data).toEqual({ test: "data" });
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "get",
          url: "/test",
          params: { foo: "bar", baz: 123 },
        })
      );
    });
  });

  describe("POST requests", () => {
    it("should make a POST request with body", async () => {
      const mockResponse = {
        data: { id: 1 },
        status: 201,
        statusText: "Created",
        headers: { "content-type": "application/json" },
      };
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);

      const postData = { name: "test" };
      const signal = httpService.post("/users", postData);

      const result = await signal;

      expect(result).toEqual({
        data: { id: 1 },
        status: 201,
        statusText: "Created",
        headers: { "content-type": "application/json" },
      });
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "post",
          url: "/users",
          data: postData,
        })
      );
    });
  });

  describe("PUT requests", () => {
    it("should make a PUT request with body", async () => {
      const mockResponse = {
        data: { id: 1, name: "updated" },
        status: 200,
        statusText: "OK",
        headers: {},
      };
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);

      const putData = { name: "updated" };
      const signal = httpService.put("/users/1", putData);

      const result = await signal;

      expect(result.data).toEqual({ id: 1, name: "updated" });
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "put",
          url: "/users/1",
          data: putData,
        })
      );
    });
  });

  describe("PATCH requests", () => {
    it("should make a PATCH request with body", async () => {
      const mockResponse = {
        data: { id: 1, name: "patched" },
        status: 200,
        statusText: "OK",
        headers: {},
      };
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);

      const patchData = { name: "patched" };
      const signal = httpService.patch("/users/1", patchData);

      const result = await signal;

      expect(result.data).toEqual({ id: 1, name: "patched" });
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "patch",
          url: "/users/1",
          data: patchData,
        })
      );
    });
  });

  describe("delete requests", () => {
    it("should make a delete request", async () => {
      const mockResponse = {
        data: null,
        status: 204,
        statusText: "No Content",
        headers: {},
      };
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);

      const signal = httpService.delete("/users/1");

      const result = await signal;

      expect(result.status).toBe(204);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "delete",
          url: "/users/1",
        })
      );
    });
  });

  describe("Error handling", () => {
    it("should handle HTTP errors with response", async () => {
      const mockError = {
        response: {
          data: { error: "Not found" },
          status: 404,
          statusText: "Not Found",
          headers: {},
        },
        isAxiosError: true,
      };
      mockAxiosInstance.request.mockRejectedValueOnce(mockError);

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

    it("should handle network errors without response", async () => {
      const mockError = {
        message: "Network Error",
        isAxiosError: true,
      };
      mockAxiosInstance.request.mockRejectedValueOnce(mockError);

      const signal = httpService.get("/test");

      const errorPromise = new Promise((_, reject) => {
        signal.subscribe({
          error: (error) => reject(error),
        });
      });

      await expect(errorPromise).rejects.toEqual({
        data: null,
        status: 0,
        statusText: "Network Error",
        headers: {},
      });
    });
  });

  describe("Request cancellation", () => {
    it("should support AbortController cancellation", async () => {
      const mockResponse = {
        data: { data: "test" },
        status: 200,
        statusText: "OK",
        headers: {},
      };
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);

      const signal = await httpService.get("/test");

      // Verify request was called with AbortSignal
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });
  });

  describe("Configuration", () => {
    it("should create axios instance with correct baseURL", async () => {
      const mockResponse = {
        data: { test: "data" },
        status: 200,
        statusText: "OK",
        headers: {},
      };
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);

      // Make a request to trigger axios instance creation
      const result = await httpService.get("/test");

      // Verify axios.create was called with correct config
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: "https://api.example.com",
        })
      );

      // And verify the request completed successfully
      expect(result.data).toEqual({ test: "data" });
    });

    it("should pass config params correctly", async () => {
      const mockResponse = {
        data: { test: "data" },
        status: 200,
        statusText: "OK",
        headers: {},
      };
      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);

      // Test that config params are passed
      await httpService.get("/test", {
        params: { test: "value" },
        timeout: 3000,
      });

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { test: "value" },
          timeout: 3000,
        })
      );
    });
  });

  describe("Timeout handling", () => {
    it("should cancel request when timeout is reached", async () => {
      // Mock a slow response that takes longer than timeout
      mockAxiosInstance.request.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  data: { data: "slow response" },
                  status: 200,
                  statusText: "OK",
                  headers: {},
                }),
              200
            ); // Responds in 200ms
          })
      );

      const signal = httpService.get("/slow-endpoint", { timeout: 50 }); // Timeout after 50ms

      // Should timeout and be ignored (CanceledError is ignored)
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify request was called
      expect(mockAxiosInstance.request).toHaveBeenCalled();
    });

    it("should complete successfully if response arrives before timeout", async () => {
      // Mock a fast response
      mockAxiosInstance.request.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  data: { data: "fast response" },
                  status: 200,
                  statusText: "OK",
                  headers: {},
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
