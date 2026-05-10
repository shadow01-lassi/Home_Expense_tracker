const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const API_URL = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
type FetchOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  devUserId?: string | null;
};

export async function api(endpoint: string, options: FetchOptions = {}) {
  const { method = 'GET', body, token, devUserId } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Check passed token or local storage token
  let authToken = token;
  if (!authToken && typeof window !== 'undefined') {
    authToken = localStorage.getItem('app_token');
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (devUserId) {
    headers['x-dev-user-id'] = devUserId;
  }

  const config: RequestInit = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  };

  const res = await fetch(`${API_URL}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

export default api;
