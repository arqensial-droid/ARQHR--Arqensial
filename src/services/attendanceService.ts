import { AttendanceRecord } from '../types';
import { apiClient, ApiResponse } from './apiClient';

export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export const attendanceService = {
  async getByDate(tenantId: string, date: string): Promise<ApiResponse<AttendanceRecord[]>> {
    return apiClient.query<AttendanceRecord>('attendance_records', tenantId, {
      eq: { date },
      order: { column: 'check_in_time', ascending: false },
    });
  },

  async getAll(tenantId: string): Promise<ApiResponse<AttendanceRecord[]>> {
    return apiClient.query<AttendanceRecord>('attendance_records', tenantId, {
      order: { column: 'date', ascending: false },
    });
  },

  async punchIn(record: AttendanceRecord): Promise<ApiResponse<AttendanceRecord>> {
    return apiClient.insert<AttendanceRecord>('attendance_records', record);
  },

  async punchOut(id: string, checkOutTime: string, durationHours: number): Promise<ApiResponse<AttendanceRecord>> {
    return apiClient.update<AttendanceRecord>('attendance_records', id, {
      checkOutTime,
      durationHours,
    });
  },

  async requestRegularization(id: string, reason: string): Promise<ApiResponse<AttendanceRecord>> {
    return apiClient.update<AttendanceRecord>('attendance_records', id, {
      regularizationRequested: true,
      regularizationReason: reason,
      regularizationStatus: 'Pending',
    });
  },

  async reviewRegularization(id: string, status: 'Approved' | 'Rejected'): Promise<ApiResponse<AttendanceRecord>> {
    return apiClient.update<AttendanceRecord>('attendance_records', id, {
      regularizationStatus: status,
    });
  },
};
