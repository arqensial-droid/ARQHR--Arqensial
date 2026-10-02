import { HelpdeskTicket } from '../types';
import { apiClient, ApiResponse } from './apiClient';

export const helpdeskService = {
  async getAll(tenantId: string, employeeId?: string): Promise<ApiResponse<HelpdeskTicket[]>> {
    const eq = employeeId ? { employeeId } : undefined;
    return apiClient.query<HelpdeskTicket>('helpdesk_tickets', tenantId, {
      eq,
      order: { column: 'createdAt', ascending: false },
    });
  },

  async create(ticket: HelpdeskTicket): Promise<ApiResponse<HelpdeskTicket>> {
    return apiClient.insert<HelpdeskTicket>('helpdesk_tickets', ticket);
  },

  async addReply(ticketId: string, currentThread: HelpdeskTicket['thread'], sender: string, message: string, isStaff = true): Promise<ApiResponse<HelpdeskTicket>> {
    const newEntry = {
      author: sender,
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStaff,
    };
    const updatedThread = [...currentThread, newEntry];
    return apiClient.update<HelpdeskTicket>('helpdesk_tickets', ticketId, {
      thread: updatedThread,
      status: 'In Progress',
    });
  },

  async updateStatus(ticketId: string, status: HelpdeskTicket['status']): Promise<ApiResponse<HelpdeskTicket>> {
    return apiClient.update<HelpdeskTicket>('helpdesk_tickets', ticketId, { status });
  },
};
