import apiClient from '@/lib/apiClient';
import { ApiResponse, PaginatedResponse, Law, CreateLawRequest, LawStats, LawFilterParams, SearchParams } from '@/types/api';

export const lawService = {
  async getAllLaws(params?: LawFilterParams): Promise<PaginatedResponse<Law>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Law>>>('/laws', { params });
    return response.data.data!;
  },
  async getLawById(id: string): Promise<Law> {
    const response = await apiClient.get<ApiResponse<Law>>(`/laws/${id}`);
    return response.data.data!;
  },
  async createLaw(data: CreateLawRequest): Promise<Law> {
    const response = await apiClient.post<ApiResponse<Law>>('/laws', data);
    return response.data.data!;
  },
  async updateLaw(id: string, data: CreateLawRequest): Promise<Law> {
    const response = await apiClient.put<ApiResponse<Law>>(`/laws/${id}`, data);
    return response.data.data!;
  },
  async deleteLaw(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<string>>(`/laws/${id}`);
  },
  async searchLaws(params: SearchParams): Promise<PaginatedResponse<Law>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Law>>>('/laws/search', { params });
    return response.data.data!;
  },
  async getLawsByType(type: string, params?: LawFilterParams): Promise<PaginatedResponse<Law>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Law>>>('/laws/filter', { params: { type, ...params } });
    return response.data.data!;
  },
  async getLawsByYear(year: number, params?: LawFilterParams): Promise<PaginatedResponse<Law>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Law>>>('/laws/filter', { params: { year, ...params } });
    return response.data.data!;
  },
  async getLawsByCategory(category: string, params?: LawFilterParams): Promise<PaginatedResponse<Law>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Law>>>('/laws/filter', { params: { category, ...params } });
    return response.data.data!;
  },
  async getLawsByStatus(status: string, params?: LawFilterParams): Promise<PaginatedResponse<Law>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Law>>>('/laws/filter', { params: { status, ...params } });
    return response.data.data!;
  },
  async getLawTypes(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>('/laws/types');
    return response.data.data!;
  },
  async getLawYears(): Promise<number[]> {
    const response = await apiClient.get<ApiResponse<number[]>>('/laws/years');
    return response.data.data!;
  },
  async getLawCategories(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>('/laws/categories');
    return response.data.data!;
  },
  async incrementViewCount(id: string): Promise<Law> {
    const response = await apiClient.post<ApiResponse<Law>>(`/laws/${id}/view`);
    return response.data.data!;
  },
  async incrementDownloadCount(id: string): Promise<Law> {
    const response = await apiClient.post<ApiResponse<Law>>(`/laws/${id}/download`);
    return response.data.data!;
  },
  async getStatistics(): Promise<LawStats> {
    const response = await apiClient.get<ApiResponse<LawStats>>('/statistics');
    return response.data.data!;
  },
  async getRecentLaws(limit: number = 10): Promise<Law[]> {
    const response = await apiClient.get<ApiResponse<Law[]>>('/laws/recent', { params: { limit } });
    return response.data.data!;
  },
};
