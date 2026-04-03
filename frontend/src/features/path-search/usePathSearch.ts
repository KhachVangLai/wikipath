import { useCallback, useRef, useState } from "react";
import { isAbortError, searchPath } from "../../api/client";
import {
  ApiClientError,
  type PathSearchResponse,
  type SearchPathParams
} from "../../types/api";
import { isConnectionError } from "../../utils/errorMessages";

interface UsePathSearchOptions {
  onConnectionError?: () => void;
}

export function usePathSearch({ onConnectionError }: UsePathSearchOptions = {}) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const [result, setResult] = useState<PathSearchResponse | null>(null);
  const [lastSuccessfulResult, setLastSuccessfulResult] =
    useState<PathSearchResponse | null>(null);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const runSearch = useCallback(
    async (params: SearchPathParams) => {
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setHasSearched(true);
      setIsLoading(true);
      setError(null);

      try {
        const response = await searchPath(params, controller.signal);

        if (controller.signal.aborted) {
          return null;
        }

        setResult(response);

        if (response.found) {
          setLastSuccessfulResult(response);
        }

        return response;
      } catch (error) {
        if (isAbortError(error)) {
          return null;
        }

        if (isConnectionError(error)) {
          onConnectionError?.();
        }

        setResult(null);
        setError(
          error instanceof ApiClientError
            ? error
            : new ApiClientError({
                message: "Something unexpected happened while searching.",
                code: "UNKNOWN_ERROR"
              })
        );
        return null;
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }

        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [onConnectionError]
  );

  const backdropResult = isLoading
    ? result?.found
      ? result
      : lastSuccessfulResult
    : null;

  return {
    result,
    error,
    hasSearched,
    isLoading,
    backdropResult,
    runSearch
  };
}
