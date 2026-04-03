const DEFAULT_API_BASE_URL = "http://localhost:8080";

export function getConfiguredApiBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(
    /\/$/,
    ""
  );
}

export function getApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (import.meta.env.DEV) {
    return normalizedPath;
  }

  return `${getConfiguredApiBaseUrl()}${normalizedPath}`;
}

