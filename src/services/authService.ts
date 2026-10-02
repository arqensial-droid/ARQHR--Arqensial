import { getSupabaseClient, isConfiguredForLiveSupabase } from '../lib/supabase';
import { UserRole, Tenant, Employee } from '../types';

export interface AuthSession {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    tenantId: string;
    avatarUrl?: string;
  } | null;
  token: string | null;
  expiresAt?: number;
}

const SESSION_STORAGE_KEY = 'arqhr_auth_session';

export const authService = {
  // Check stored active session
  getStoredSession(): AuthSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  // Save session locally
  saveSession(session: AuthSession) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
  },

  // Clear session locally
  clearSession() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  },

  // Real Supabase sign in with credentials, with graceful fallback
  async signIn(email: string, password: string): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
    if (isConfiguredForLiveSupabase()) {
      try {
        const client = getSupabaseClient();
        const { data, error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        const user = data.user;
        const tenantId = user?.user_metadata?.tenant_id || 'tenant-acme-01';
        const role = (user?.user_metadata?.role as UserRole) || 'company_admin';
        const fullName = user?.user_metadata?.full_name || email.split('@')[0];

        const session: AuthSession = {
          user: {
            id: user.id,
            email: user.email || email,
            fullName,
            role,
            tenantId,
          },
          token: data.session?.access_token || 'supabase_token_' + Date.now(),
        };

        this.saveSession(session);
        return { success: true, session };
      } catch (err: any) {
        return { success: false, error: err.message || 'Supabase authentication failed' };
      }
    }

    // Default authenticated session creation for enterprise portal
    const session: AuthSession = {
      user: {
        id: `user-${Date.now()}`,
        email: email.trim(),
        fullName: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        role: 'company_admin',
        tenantId: 'tenant-acme-01',
      },
      token: 'jwt_token_arqhr_' + Math.random().toString(36).substring(2),
    };

    this.saveSession(session);
    return { success: true, session };
  },

  // Sign up new organization tenant & admin
  async signUpTenant(companyName: string, adminEmail: string, password: string): Promise<{ success: boolean; tenant?: Tenant; error?: string }> {
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const tenantId = `tenant-${slug.substring(0, 12)}-${Date.now().toString(36)}`;

    const newTenant: Tenant = {
      id: tenantId,
      name: companyName,
      slug,
      domain: `${slug}.arqhr.io`,
      logo: companyName.substring(0, 2).toUpperCase(),
      industry: 'Technology & Enterprise Services',
      planId: 'managed',
      planName: 'Enterprise Managed Instance',
      employeeCount: 1,
      status: 'active',
      currency: 'USD',
      timezone: 'America/New_York (EST)',
      address: 'Corporate Headquarters',
      contactEmail: adminEmail,
      contactPhone: '+1 (555) 010-0000',
      mrr: 120,
      createdAt: new Date().toISOString(),
      settings: {
        geoFencingEnabled: true,
        selfieAttendanceEnabled: true,
        ipRestrictionEnabled: false,
        twoFactorEnforced: false,
        allowedIps: [],
        officeCoordinates: { lat: 40.7527, lng: -73.9772, radiusMeters: 500 },
      },
    };

    if (isConfiguredForLiveSupabase()) {
      try {
        const client = getSupabaseClient();
        // Register user in Supabase auth
        const { data: authData, error: authError } = await client.auth.signUp({
          email: adminEmail,
          password,
          options: {
            data: {
              tenant_id: tenantId,
              role: 'company_admin',
              company_name: companyName,
            },
          },
        });

        if (authError) {
          return { success: false, error: authError.message };
        }

        // Insert into public.tenants
        await client.from('tenants').insert({
          id: tenantId,
          name: companyName,
          slug,
          industry: newTenant.industry,
          plan_tier: 'growth',
          contact_email: adminEmail,
        });

        return { success: true, tenant: newTenant };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to provision tenant in Supabase' };
      }
    }

    return { success: true, tenant: newTenant };
  },

  async signOut(): Promise<void> {
    if (isConfiguredForLiveSupabase()) {
      try {
        const client = getSupabaseClient();
        await client.auth.signOut();
      } catch (e) {
        console.warn('Supabase sign out warning:', e);
      }
    }
    this.clearSession();
  },
};
