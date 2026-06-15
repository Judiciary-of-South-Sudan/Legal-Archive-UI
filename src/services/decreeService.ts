import apiClient from '@/lib/apiClient';
import { ApiResponse, PaginatedResponse, RepublicanDecree, CreateDecreeRequest, SearchParams } from '@/types/api';

export interface DecreeFilterParams {
  page?: number;
  size?: number;
  sort?: string;
  decreeType?: string;
  year?: number;
}

export const decreeService = {
  async getAllDecrees(params?: DecreeFilterParams): Promise<PaginatedResponse<RepublicanDecree>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<RepublicanDecree>>>('/decrees', { params });
    return response.data.data!;
  },
  async getDecreeById(id: string): Promise<RepublicanDecree> {
    const response = await apiClient.get<ApiResponse<RepublicanDecree>>(`/decrees/${id}`);
    return response.data.data!;
  },
  async getRecentDecrees(limit: number = 10): Promise<RepublicanDecree[]> {
    const response = await apiClient.get<ApiResponse<RepublicanDecree[]>>('/decrees/recent', { params: { limit } });
    return response.data.data!;
  },
  async searchDecrees(params: SearchParams): Promise<PaginatedResponse<RepublicanDecree>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<RepublicanDecree>>>('/decrees/search', { params });
    return response.data.data!;
  },
  async getAllYears(): Promise<number[]> {
    const response = await apiClient.get<ApiResponse<number[]>>('/decrees/years');
    return response.data.data!;
  },
  async createDecree(data: CreateDecreeRequest): Promise<RepublicanDecree> {
    const response = await apiClient.post<ApiResponse<RepublicanDecree>>('/decrees', data);
    return response.data.data!;
  },
  async updateDecree(id: string, data: CreateDecreeRequest): Promise<RepublicanDecree> {
    const response = await apiClient.put<ApiResponse<RepublicanDecree>>(`/decrees/${id}`, data);
    return response.data.data!;
  },
  async deleteDecree(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<string>>(`/decrees/${id}`);
  },
  async incrementViewCount(id: string): Promise<void> {
    await apiClient.post(`/decrees/${id}/view`);
  },
  async incrementDownloadCount(id: string): Promise<void> {
    await apiClient.post(`/decrees/${id}/download`);
  },
};
