import { supabase } from './supabase';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/** Get current Supabase JWT — returns empty string in dev mode */
async function getToken(): Promise<string> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || '';
  } catch {
    return '';
  }
}

/** POST with file upload (FormData) */
export async function apiPost(endpoint: string, body: FormData | object): Promise<Response> {
  const token = await getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  if (body instanceof FormData) {
    // Don't set Content-Type — browser sets it with boundary for FormData
    return fetch(`${BASE}${endpoint}`, { method: 'POST', headers, body });
  }

  headers['Content-Type'] = 'application/json';
  return fetch(`${BASE}${endpoint}`, { method: 'POST', headers, body: JSON.stringify(body) });
}

/** GET with auth */
export async function apiGet(endpoint: string): Promise<Response> {
  const token = await getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(`${BASE}${endpoint}`, { headers });
}
