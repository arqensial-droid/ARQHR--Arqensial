import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Local storage key for custom user-configured credentials
const LOCAL_STORAGE_URL_KEY = 'arqhr_supabase_url';
const LOCAL_STORAGE_KEY_KEY = 'arqhr_supabase_anon_key';

export function getStoredSupabaseConfig(): { url: string; key: string } {
  const customUrl = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_URL_KEY) : null;
  const customKey = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY_KEY) : null;

  return {
    url: customUrl || envUrl,
    key: customKey || envAnonKey,
  };
}

export function saveSupabaseConfig(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_URL_KEY, url.trim());
    localStorage.setItem(LOCAL_STORAGE_KEY_KEY, key.trim());
  }
}

export function clearSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_URL_KEY);
    localStorage.removeItem(LOCAL_STORAGE_KEY_KEY);
  }
}

// Check if credentials look like a real valid Supabase project
export function isConfiguredForLiveSupabase(url?: string, key?: string): boolean {
  const current = getStoredSupabaseConfig();
  const targetUrl = url !== undefined ? url : current.url;
  const targetKey = key !== undefined ? key : current.key;

  return Boolean(
    targetUrl &&
    targetUrl.startsWith('https://') &&
    targetKey &&
    targetKey.length > 20 &&
    !targetUrl.includes('your-project-id')
  );
}

// Create or retrieve active client
let activeSupabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  const config = getStoredSupabaseConfig();

  // If live credentials provided, create real Supabase client
  if (isConfiguredForLiveSupabase(config.url, config.key)) {
    if (!activeSupabaseClient) {
      activeSupabaseClient = createClient(config.url, config.key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    }
    return activeSupabaseClient;
  }

  // Fallback to local default client to avoid null pointers
  if (!activeSupabaseClient) {
    const dummyUrl = 'https://arqhr-tenant-engine.supabase.co';
    const dummyKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy-anon-key-placeholder-arqhr-2026';
    activeSupabaseClient = createClient(dummyUrl, dummyKey, {
      auth: {
        persistSession: true,
      },
    });
  }

  return activeSupabaseClient;
}

export const supabase = getSupabaseClient();
