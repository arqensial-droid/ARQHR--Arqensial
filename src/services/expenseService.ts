import { ExpenseClaim } from '../types';
import { apiClient, ApiResponse } from './apiClient';

export const expenseService = {
  async getAll(tenantId: string, employeeId?: string): Promise<ApiResponse<ExpenseClaim[]>> {
    const eq = employeeId ? { employeeId } : undefined;
    return apiClient.query<ExpenseClaim>('expenses', tenantId, {
      eq,
      order: { column: 'date', ascending: false },
    });
  },

  async submit(claim: ExpenseClaim): Promise<ApiResponse<ExpenseClaim>> {
    return apiClient.insert<ExpenseClaim>('expenses', claim);
  },

  async review(id: string, status: 'Approved' | 'Rejected', reviewerName: string): Promise<ApiResponse<ExpenseClaim>> {
    return apiClient.update<ExpenseClaim>('expenses', id, {
      status,
      approvedBy: reviewerName,
    });
  },
};
