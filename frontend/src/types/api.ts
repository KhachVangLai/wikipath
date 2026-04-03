export type ApiErrorCode =
  | "INVALID_INPUT"
  | "EXTERNAL_API_ERROR"
  | "INTERNAL_SERVER_ERROR"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

export interface HealthResponse {
  status: string;
}

export interface SuggestResponse {
  items: string[];
}

export interface PathMetrics {
  expandedNodes: number;
  durationMs: number;
  cacheHits: number;
  cacheMisses: number;
}

export interface PathSearchResponse {
  from: string;
  to: string;
  found: boolean;
  depth: number;
  path: string[];
  metrics: PathMetrics;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  timestamp: string;
}

export interface SearchPathParams {
  from: string;
  to: string;
  maxDepth: number;
}

interface ApiClientErrorOptions {
  message: string;
  code: ApiErrorCode;
  status?: number;
  timestamp?: string;
  isNetworkError?: boolean;
}

export class ApiClientError extends Error {
  code: ApiErrorCode;
  status?: number;
  timestamp?: string;
  isNetworkError: boolean;

  constructor({
    message,
    code,
    status,
    timestamp,
    isNetworkError = false
  }: ApiClientErrorOptions) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
    this.timestamp = timestamp;
    this.isNetworkError = isNetworkError;
  }
}

