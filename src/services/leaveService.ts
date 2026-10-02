import { LeaveRequest, LeaveBalance } from '../types';
import { apiClient, ApiResponse } from './apiClient';

export const leaveService = {
  async getAll(tenantId: string): Promise<ApiResponse<LeaveRequest[]>> {
    return apiClient.query<LeaveRequest>('leave_requests', tenantId, {
      order: { column: 'applied_on', ascending: false },
    });
  },

  async apply(leave: LeaveRequest): Promise<ApiResponse<LeaveRequest>> {
    return apiClient.insert<LeaveRequest>('leave_requests', leave);
  },

  async review(
    id: string,
    status: 'Approved' | 'Rejected',
    approvedBy: string,
    comment?: string
  ): Promise<ApiResponse<LeaveRequest>> {
    return apiClient.update<LeaveRequest>('leave_requests', id, {
      status,
      approvedBy,
      managerComment: comment,
    });
  },
};
