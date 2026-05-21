const DEFAULT_API_BASE_URL = "http://localhost:8000";

export function getBackendApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

export function createBackendApiUrl(path: string) {
  const baseUrl = getBackendApiBaseUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}
