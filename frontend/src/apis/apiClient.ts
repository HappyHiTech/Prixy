const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_BASE_URL is missing from frontend/.env");
}
async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }

  const text = await response.text();
  return (text.length > 0 ? JSON.parse(text) : undefined) as T;
}

// TODO: when auth lands, read the token from the auth store here and set an
// Authorization header — plus a 401 refresh retry, as in Waypoint's apiClient.
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, init);
  return parseResponse<T>(response);
}

export default apiFetch;
