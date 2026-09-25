import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface ZelvoroMessageRecord {
  id?: string;
  request_id?: string;
  user_message: string;
  assistant_response: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed' | string;
  created_at?: string;
}

export const DEFAULT_SUPABASE_URL = 'https://xoivytxnvcluokqmgewt.supabase.co';
export const CHAT_ENDPOINT = '/api/chat';

/**
 * Generates an RFC4122 UUID for tracking messages
 */
export function generateMessageId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getSupabaseUrl(): string {
  return import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
}

export function getSupabaseAnonKey(): string {
  return (
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    localStorage.getItem('zelvoro_supabase_anon_key') ||
    ''
  );
}

export function setSupabaseAnonKey(key: string): void {
  if (key) {
    localStorage.setItem('zelvoro_supabase_anon_key', key.trim());
  } else {
    localStorage.removeItem('zelvoro_supabase_anon_key');
  }
  cachedClient = null;
}

let cachedClient: SupabaseClient | null = null;
let lastUsedKey: string | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (!key) {
    return null;
  }

  if (cachedClient && lastUsedKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key);
    lastUsedKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * 1. Saves user's message directly to Supabase table (zelvoro_messages)
 */
export async function saveUserMessageToSupabase(message: string): Promise<string> {
  const id = generateMessageId();
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('zelvoro_messages').insert({
        id,
        user_message: message,
        status: 'pending',
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Could not persist user message to Supabase:', err);
    }
  }
  return id;
}

/**
 * 2 & 3. Calls the server-side Zapier Agent via POST /api/chat and waits for response.
 */
export async function sendChatMessageToZapierAgent(
  message: string,
  abortSignal?: AbortSignal
): Promise<string> {
  let response: Response;
  try {
    response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
      signal: abortSignal,
    });
  } catch (err: unknown) {
    if (abortSignal?.aborted) {
      throw new Error('Agent execution was stopped by user.');
    }
    const messageStr = err instanceof Error ? err.message : 'Network error';
    throw new Error(`Failed to reach Zelvoro server: ${messageStr}`);
  }

  if (!response.ok) {
    let errorDetail = `Server returned HTTP ${response.status} (${response.statusText})`;
    try {
      const errorJson = await response.json();
      if (errorJson.error) {
        errorDetail = errorJson.error;
      }
    } catch {
      // Non-json response
    }
    throw new Error(errorDetail);
  }

  let data: { reply?: string; response?: string };
  try {
    data = await response.json();
  } catch {
    throw new Error('Received invalid JSON response from server.');
  }

  const replyText = data.reply || data.response;
  if (!replyText || typeof replyText !== 'string' || replyText.trim().length === 0) {
    throw new Error('Zapier Agent returned an empty or invalid response.');
  }

  return replyText;
}

/**
 * 6. Saves the completed assistant response to Supabase
 */
export async function saveAssistantMessageToSupabase(
  recordId: string,
  userMessage: string,
  assistantResponse: string
): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('zelvoro_messages').upsert({
        id: recordId,
        user_message: userMessage,
        assistant_response: assistantResponse,
        status: 'completed',
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Could not persist assistant response to Supabase:', err);
    }
  }
}

/**
 * Fetches conversation history directly from Supabase zelvoro_messages
 */
export async function fetchZelvoroHistory(): Promise<ZelvoroMessageRecord[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('zelvoro_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.warn('Error fetching message history from zelvoro_messages:', error.message);
      return [];
    }

    return (data || []) as ZelvoroMessageRecord[];
  } catch (err) {
    console.warn('Failed to load history from Supabase:', err);
    return [];
  }
}
