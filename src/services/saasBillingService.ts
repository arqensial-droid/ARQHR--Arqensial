import { EnterpriseUsageStats } from '../types';

/**
 * Managed SaaS Service for ARQHR
 * This HRMS is manually managed by ARQHR administrators for small businesses,
 * retail stores, clothing stores, and agencies with zero seat limits or plan restrictions.
 */
export const saasBillingService = {
  // Get Usage and Status for Managed Tenant
  async getTenantUsage(tenantId: string, currentEmployeeCount: number): Promise<EnterpriseUsageStats> {
    const defaultStats: EnterpriseUsageStats = {
      tenantId,
      activeLicenses: currentEmployeeCount,
      allocatedLicenses: 999999, // Zero seat limits - manually managed by ARQHR admins
      storageUsedBytes: 12450000000,
      storageQuotaBytes: 107374182400,
      apiRequestsThisMonth: 14250,
      apiMonthlyLimit: 1000000,
      customDomainConfigured: true,
      whiteLabelTheme: {
        primaryColor: '#0F766E',
        brandName: 'ARQENSIAL Managed HRMS',
      },
    };

    return defaultStats;
  },

  // Validate Seat License Availability (Unrestricted for Managed Tenants)
  canAddEmployee(_activeLicenses: number, _allocatedLicenses: number): {
    allowed: boolean;
    availableSeats: number;
    upgradeMessage?: string;
  } {
    return {
      allowed: true,
      availableSeats: 999999,
    };
  },

  // Feature Access Check - Fully enabled across all client instances
  hasFeatureAccess(_planId: string, _feature: string): boolean {
    return true; // All features unlocked for managed client workspaces
  },
};
