import { JobRequisition, Candidate } from '../types';
import { apiClient, ApiResponse } from './apiClient';

export const recruitmentService = {
  async getJobs(tenantId: string): Promise<ApiResponse<JobRequisition[]>> {
    return apiClient.query<JobRequisition>('job_requisitions', tenantId, {
      order: { column: 'postedDate', ascending: false },
    });
  },

  async createJob(job: JobRequisition): Promise<ApiResponse<JobRequisition>> {
    return apiClient.insert<JobRequisition>('job_requisitions', job);
  },

  async updateJob(id: string, updates: Partial<JobRequisition>): Promise<ApiResponse<JobRequisition>> {
    return apiClient.update<JobRequisition>('job_requisitions', id, updates);
  },

  async getCandidates(tenantId: string, jobId?: string): Promise<ApiResponse<Candidate[]>> {
    const eq = jobId ? { jobRequisitionId: jobId } : undefined;
    return apiClient.query<Candidate>('candidates', tenantId, {
      eq,
      order: { column: 'appliedDate', ascending: false },
    });
  },

  async createCandidate(candidate: Candidate): Promise<ApiResponse<Candidate>> {
    return apiClient.insert<Candidate>('candidates', candidate);
  },

  async updateCandidateStage(id: string, stage: Candidate['stage']): Promise<ApiResponse<Candidate>> {
    return apiClient.update<Candidate>('candidates', id, { stage });
  },
};
