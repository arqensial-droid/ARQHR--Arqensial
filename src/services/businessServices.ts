import { ResignationRequest, GoalOKR, Asset, CompanyDocument, FeedPost } from '../types';
import { apiClient, ApiResponse } from './apiClient';

export const exitService = {
  async getAll(tenantId: string): Promise<ApiResponse<ResignationRequest[]>> {
    return apiClient.query<ResignationRequest>('resignation_requests', tenantId, {
      order: { column: 'submissionDate', ascending: false },
    });
  },

  async submit(req: ResignationRequest): Promise<ApiResponse<ResignationRequest>> {
    return apiClient.insert<ResignationRequest>('resignation_requests', req);
  },

  async updateClearance(
    id: string,
    currentReq: ResignationRequest,
    dept: 'it' | 'hr' | 'finance' | 'admin',
    cleared: boolean
  ): Promise<ApiResponse<ResignationRequest>> {
    const updatedClearance = {
      ...currentReq.clearances,
      [dept]: cleared,
    };
    return apiClient.update<ResignationRequest>('resignation_requests', id, {
      clearances: updatedClearance,
    });
  },
};

export const performanceService = {
  async getGoals(tenantId: string, employeeId?: string): Promise<ApiResponse<GoalOKR[]>> {
    const eq = employeeId ? { employeeId } : undefined;
    return apiClient.query<GoalOKR>('goals', tenantId, {
      eq,
      order: { column: 'dueDate', ascending: true },
    });
  },

  async addGoal(goal: GoalOKR): Promise<ApiResponse<GoalOKR>> {
    return apiClient.insert<GoalOKR>('goals', goal);
  },

  async updateProgress(goalId: string, progress: number): Promise<ApiResponse<GoalOKR>> {
    return apiClient.update<GoalOKR>('goals', goalId, {
      progress,
      status: progress >= 100 ? 'Completed' : progress >= 70 ? 'On Track' : progress >= 40 ? 'At Risk' : 'Behind',
    });
  },
};

export const assetService = {
  async getAll(tenantId: string): Promise<ApiResponse<Asset[]>> {
    return apiClient.query<Asset>('assets', tenantId, {
      order: { column: 'allocatedDate', ascending: false },
    });
  },

  async addAsset(asset: Asset): Promise<ApiResponse<Asset>> {
    return apiClient.insert<Asset>('assets', asset);
  },

  async updateAsset(id: string, updates: Partial<Asset>): Promise<ApiResponse<Asset>> {
    return apiClient.update<Asset>('assets', id, updates);
  },
};

export const documentService = {
  async getAll(tenantId: string): Promise<ApiResponse<CompanyDocument[]>> {
    return apiClient.query<CompanyDocument>('company_documents', tenantId, {
      order: { column: 'uploadedDate', ascending: false },
    });
  },

  async upload(doc: CompanyDocument): Promise<ApiResponse<CompanyDocument>> {
    return apiClient.insert<CompanyDocument>('company_documents', doc);
  },
};

export const engagementService = {
  async getPosts(tenantId: string): Promise<ApiResponse<FeedPost[]>> {
    return apiClient.query<FeedPost>('feed_posts', tenantId);
  },

  async createPost(post: FeedPost): Promise<ApiResponse<FeedPost>> {
    return apiClient.insert<FeedPost>('feed_posts', post);
  },

  async toggleLike(postId: string, currentLiked: boolean, currentCount: number): Promise<ApiResponse<FeedPost>> {
    return apiClient.update<FeedPost>('feed_posts', postId, {
      userLiked: !currentLiked,
      likes: currentLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
    });
  },
};
