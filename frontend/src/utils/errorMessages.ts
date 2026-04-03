import { ApiClientError } from "../types/api";

export function getFriendlyErrorMessage(error: unknown) {
  if (!(error instanceof ApiClientError)) {
    return "Something unexpected happened while searching. Please try again.";
  }

  switch (error.code) {
    case "INVALID_INPUT":
      return error.message;
    case "EXTERNAL_API_ERROR":
      return "Wikipedia data could not be reached right now. Please try again in a moment.";
    case "INTERNAL_SERVER_ERROR":
      return "The WikiPath API hit an unexpected server error. Please try again.";
    case "NETWORK_ERROR":
      return "Unable to connect to the WikiPath API. Make sure the backend is running and the base URL is correct.";
    default:
      return error.message || "Something unexpected happened while searching.";
  }
}

export function isConnectionError(error: unknown) {
  return error instanceof ApiClientError && error.isNetworkError;
}

