import {
  ApiClientError,
  type ApiErrorResponse,
  type HealthResponse,
  type PathSearchResponse,
  type SearchPathParams,
  type SuggestResponse
} from "../types/api";
import { getApiUrl } from "../utils/environment";

const JSON_HEADERS = {
  Accept: "application/json"
};

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Record<string, unknown>;
  return (
    typeof response.code === "string" &&
    typeof response.message === "string" &&
    typeof response.timestamp === "string"
  );
}

function toKnownErrorCode(code: string) {
  switch (code) {
    case "INVALID_INPUT":
    case "EXTERNAL_API_ERROR":
    case "INTERNAL_SERVER_ERROR":
      return code;
    default:
      return "UNKNOWN_ERROR" as const;
  }
}

async function requestJson<T>(path: string, init?: RequestInit) {
  try {
    const response = await fetch(getApiUrl(path), {
      ...init,
      headers: {
        ...JSON_HEADERS,
        ...init?.headers
      }
    });

    if (!response.ok) {
      let errorBody: unknown = null;

      try {
        errorBody = await response.json();
      } catch {
        errorBody = null;
      }

      if (isApiErrorResponse(errorBody)) {
        throw new ApiClientError({
          message: errorBody.message,
          code: toKnownErrorCode(errorBody.code),
          status: response.status,
          timestamp: errorBody.timestamp
        });
      }

      throw new ApiClientError({
        message: "Unexpected server response.",
        code:
          response.status >= 500
            ? "INTERNAL_SERVER_ERROR"
            : "UNKNOWN_ERROR",
        status: response.status
      });
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiClientError || isAbortError(error)) {
      throw error;
    }

    throw new ApiClientError({
      message: "The WikiPath API is unreachable.",
      code: "NETWORK_ERROR",
      isNetworkError: true
    });
  }
}

export function health(signal?: AbortSignal) {
  return requestJson<HealthResponse>("/api/v1/health", { signal });
}

export function suggestTitles(query: string, signal?: AbortSignal) {
  const params = new URLSearchParams({ q: query });
  return requestJson<SuggestResponse>(`/api/v1/pages/suggest?${params}`, {
    signal
  });
}

export function searchPath(
  { from, to, maxDepth }: SearchPathParams,
  signal?: AbortSignal
) {
  const params = new URLSearchParams({
    from,
    to,
    maxDepth: String(maxDepth)
  });

  return requestJson<PathSearchResponse>(`/api/v1/path?${params}`, {
    signal
  });
}

export { isAbortError };

