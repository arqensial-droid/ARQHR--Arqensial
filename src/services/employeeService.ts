import { Employee } from '../types';
import { apiClient, ApiResponse } from './apiClient';

export interface EmployeeValidationError {
  field: string;
  message: string;
}

export const employeeService = {
  validateEmployee(emp: Partial<Employee>): EmployeeValidationError[] {
    const errors: EmployeeValidationError[] = [];
    if (!emp.firstName?.trim()) errors.push({ field: 'firstName', message: 'First name is required.' });
    if (!emp.lastName?.trim()) errors.push({ field: 'lastName', message: 'Last name is required.' });
    if (!emp.email?.trim() || !/^\S+@\S+\.\S+$/.test(emp.email)) {
      errors.push({ field: 'email', message: 'Valid corporate email address is required.' });
    }
    if (!emp.designation?.trim()) errors.push({ field: 'designation', message: 'Designation is required.' });
    if (emp.salaryStructure && emp.salaryStructure.annualCTC <= 0) {
      errors.push({ field: 'annualCTC', message: 'Annual CTC must be greater than zero.' });
    }
    return errors;
  },

  async getAll(tenantId: string): Promise<ApiResponse<Employee[]>> {
    return apiClient.query<Employee>('employees', tenantId, {
      order: { column: 'created_at', ascending: false },
    });
  },

  async getById(tenantId: string, id: string): Promise<ApiResponse<Employee | null>> {
    const res = await apiClient.query<Employee>('employees', tenantId, {
      eq: { id },
      limit: 1,
    });
    return { data: res.data?.[0] || null, error: res.error };
  },

  async create(employee: Employee): Promise<ApiResponse<Employee>> {
    return apiClient.insert<Employee>('employees', employee);
  },

  async update(id: string, updates: Partial<Employee>): Promise<ApiResponse<Employee>> {
    return apiClient.update<Employee>('employees', id, updates);
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete('employees', id);
  },
};
