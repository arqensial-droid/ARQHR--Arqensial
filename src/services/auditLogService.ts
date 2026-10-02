import { AuditLog, UserRole } from '../types';
import { apiClient } from './apiClient';

export const auditLogService = {
  async log(
    tenantId: string,
    action: string,
    performedBy: string,
    role: UserRole,
    resourceType: string,
    details: string,
    ipAddress?: string
  ): Promise<AuditLog> {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tenantId,
      action,
      performedBy,
      role,
      resourceType,
      details,
      ipAddress: ipAddress || '198.51.100.14',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
    };

    try {
      await apiClient.insert<AuditLog>('audit_logs', newLog);
    } catch (e) {
      console.warn('[auditLogService] Error persisting audit record:', e);
    }

    return newLog;
  },

  async getLogs(tenantId: string, limit = 50): Promise<AuditLog[]> {
    const res = await apiClient.query<AuditLog>('audit_logs', tenantId, {
      order: { column: 'timestamp', ascending: false },
      limit,
    });
    return res.data || [];
  },
};
