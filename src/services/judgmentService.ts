import apiClient from '@/lib/apiClient';
import {
  ApiResponse,
  PaginatedResponse,
  Judgment,
  CreateJudgmentRequest,
  JudgmentFilterParams,
  SearchParams,
  DateRangeParams
} from '@/types/api';

export const judgmentService = {
  async getAllJudgments(params?: JudgmentFilterParams): Promise<PaginatedResponse<Judgment>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Judgment>>>('/judgments', { params });
    return response.data.data!;
  },

  async getJudgmentById(id: string): Promise<Judgment> {
    const response = await apiClient.get<ApiResponse<Judgment>>(`/judgments/${id}`);
    return response.data.data!;
  },

  async createJudgment(data: CreateJudgmentRequest): Promise<Judgment> {
    const response = await apiClient.post<ApiResponse<Judgment>>('/judgments', data);
    return response.data.data!;
  },

  async updateJudgment(id: string, data: CreateJudgmentRequest): Promise<Judgment> {
    const response = await apiClient.put<ApiResponse<Judgment>>(`/judgments/${id}`, data);
    return response.data.data!;
  },

  async deleteJudgment(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<string>>(`/judgments/${id}`);
  },

  async searchJudgments(params: SearchParams): Promise<PaginatedResponse<Judgment>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Judgment>>>('/judgments/search', { params });
    return response.data.data!;
  },

  async getJudgmentsByCourtLevel(courtLevel: string, params?: PaginationParams): Promise<PaginatedResponse<Judgment>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Judgment>>>(`/judgments/court-level/${courtLevel}`, { params });
    return response.data.data!;
  },

  async getJudgmentsByCaseType(caseType: string, params?: PaginationParams): Promise<PaginatedResponse<Judgment>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Judgment>>>(`/judgments/case-type/${caseType}`, { params });
    return response.data.data!;
  },

  async getJudgmentsByDateRange(params: DateRangeParams): Promise<PaginatedResponse<Judgment>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Judgment>>>('/judgments/date-range', { params });
    return response.data.data!;
  },

  async incrementViewCount(id: string): Promise<Judgment> {
    const response = await apiClient.post<ApiResponse<Judgment>>(`/judgments/${id}/view`);
    return response.data.data!;
  },

  async incrementDownloadCount(id: string): Promise<Judgment> {
    const response = await apiClient.post<ApiResponse<Judgment>>(`/judgments/${id}/download`);
    return response.data.data!;
  },

  async getRecentJudgments(limit: number = 10): Promise<Judgment[]> {
    const response = await apiClient.get<ApiResponse<Judgment[]>>('/judgments/recent', { params: { limit } });
    return response.data.data!;
  },
};

