import { getSupabaseClient, isConfiguredForLiveSupabase } from '../lib/supabase';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Global persistent local database storage keys
const DB_PREFIX = 'arqensial_db_';

export function getLocalTableData<T>(table: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${DB_PREFIX}${table}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(`Error reading local table ${table}:`, e);
    return [];
  }
}

export function setLocalTableData<T>(table: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${DB_PREFIX}${table}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing local table ${table}:`, e);
  }
}

export function clearLocalDatabase(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('arqhr_db_') || key.startsWith('arqensial_db_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {
    console.error('Error clearing local database:', e);
  }
}

export const apiClient = {
  isLiveSupabase: () => isConfiguredForLiveSupabase(),

  // Generic query with tenant isolation
  async query<T>(
    table: string,
    tenantId: string,
    options?: {
      eq?: Record<string, any>;
      order?: { column: string; ascending?: boolean };
      limit?: number;
    }
  ): Promise<ApiResponse<T[]>> {
    try {
      const isLive = isConfiguredForLiveSupabase();
      if (isLive) {
        const client = getSupabaseClient();
        let query = client.from(table).select('*');
        if (tenantId && tenantId !== 'ALL_SUPER_ADMIN') {
          query = query.eq('tenant_id', tenantId);
        }
        if (options?.eq) {
          Object.entries(options.eq).forEach(([k, v]) => {
            query = query.eq(k, v);
          });
        }
        if (options?.order) {
          query = query.order(options.order.column, { ascending: options.order.ascending ?? true });
        }
        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data, error } = await query;
        if (error) throw error;
        return { data: (data as T[]) || [], error: null };
      }

      // Local persistent database layer with strict tenant isolation
      let records = getLocalTableData<any>(table);
      if (tenantId && tenantId !== 'ALL_SUPER_ADMIN') {
        records = records.filter(r => r.tenantId === tenantId || r.tenant_id === tenantId);
      }
      if (options?.eq) {
        records = records.filter(r => {
          return Object.entries(options.eq!).every(([k, v]) => r[k] === v);
        });
      }
      return { data: records as T[], error: null };
    } catch (err: any) {
      console.warn(`[apiClient.query] Falling back for table ${table}:`, err?.message || err);
      // Fallback to local table data seamlessly
      let records = getLocalTableData<any>(table);
      if (tenantId && tenantId !== 'ALL_SUPER_ADMIN') {
        records = records.filter(r => r.tenantId === tenantId || r.tenant_id === tenantId);
      }
      return { data: records as T[], error: null };
    }
  },

  // Insert record
  async insert<T extends Record<string, any>>(table: string, record: T): Promise<ApiResponse<T>> {
    try {
      const isLive = isConfiguredForLiveSupabase();
      if (isLive) {
        const client = getSupabaseClient();
        const { data, error } = await client.from(table).insert(record).select().single();
        if (error) throw error;
        return { data: data as T, error: null };
      }

      const existing = getLocalTableData<T>(table);
      const updated = [record, ...existing];
      setLocalTableData(table, updated);
      return { data: record, error: null };
    } catch (err: any) {
      console.warn(`[apiClient.insert] Fallback for ${table}:`, err?.message || err);
      const existing = getLocalTableData<T>(table);
      const updated = [record, ...existing];
      setLocalTableData(table, updated);
      return { data: record, error: null };
    }
  },

  // Upsert record
  async upsert<T extends Record<string, any>>(table: string, record: T): Promise<ApiResponse<T>> {
    try {
      const isLive = isConfiguredForLiveSupabase();
      if (isLive) {
        const client = getSupabaseClient();
        const { data, error } = await client.from(table).upsert(record).select().single();
        if (error) throw error;
        return { data: data as T, error: null };
      }

      const existing = getLocalTableData<any>(table);
      const index = existing.findIndex(r => r.id === record.id);
      let updated: any[];
      if (index >= 0) {
        updated = [...existing];
        updated[index] = { ...updated[index], ...record };
      } else {
        updated = [record, ...existing];
      }
      setLocalTableData(table, updated);
      return { data: record, error: null };
    } catch (err: any) {
      console.warn(`[apiClient.upsert] Fallback for ${table}:`, err?.message || err);
      const existing = getLocalTableData<any>(table);
      const index = existing.findIndex(r => r.id === record.id);
      let updated: any[];
      if (index >= 0) {
        updated = [...existing];
        updated[index] = { ...updated[index], ...record };
      } else {
        updated = [record, ...existing];
      }
      setLocalTableData(table, updated);
      return { data: record, error: null };
    }
  },

  // Update record
  async update<T extends Record<string, any>>(
    table: string,
    id: string,
    updates: Partial<T>
  ): Promise<ApiResponse<T>> {
    try {
      const isLive = isConfiguredForLiveSupabase();
      if (isLive) {
        const client = getSupabaseClient();
        const { data, error } = await client.from(table).update(updates as any).eq('id', id).select().single();
        if (error) throw error;
        return { data: data as T, error: null };
      }

      const existing = getLocalTableData<any>(table);
      let updatedRecord: any = null;
      const updated = existing.map(item => {
        if (item.id === id) {
          updatedRecord = { ...item, ...updates };
          return updatedRecord;
        }
        return item;
      });
      setLocalTableData(table, updated);
      return { data: updatedRecord, error: null };
    } catch (err: any) {
      console.warn(`[apiClient.update] Fallback for ${table}:`, err?.message || err);
      const existing = getLocalTableData<any>(table);
      let updatedRecord: any = null;
      const updated = existing.map(item => {
        if (item.id === id) {
          updatedRecord = { ...item, ...updates };
          return updatedRecord;
        }
        return item;
      });
      setLocalTableData(table, updated);
      return { data: updatedRecord, error: null };
    }
  },

  // Delete record
  async delete(table: string, id: string): Promise<ApiResponse<boolean>> {
    try {
      const isLive = isConfiguredForLiveSupabase();
      if (isLive) {
        const client = getSupabaseClient();
        const { error } = await client.from(table).delete().eq('id', id);
        if (error) throw error;
        return { data: true, error: null };
      }

      const existing = getLocalTableData<any>(table);
      const filtered = existing.filter(item => item.id !== id);
      setLocalTableData(table, filtered);
      return { data: true, error: null };
    } catch (err: any) {
      const existing = getLocalTableData<any>(table);
      const filtered = existing.filter(item => item.id !== id);
      setLocalTableData(table, filtered);
      return { data: true, error: null };
    }
  },
};
