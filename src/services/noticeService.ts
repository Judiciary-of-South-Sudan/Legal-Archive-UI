import apiClient from '@/lib/apiClient';
import { ApiResponse, LegalNotice, CreateLegalNoticeRequest, PaginatedResponse, PaginationParams, SearchParams } from '@/types/api';

export const noticeService = {
  async getAllNotices(params?: PaginationParams): Promise<PaginatedResponse<LegalNotice>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<LegalNotice>>>('/legal-notices', { params });
    return response.data.data!;
  },

  async createNotice(data: CreateLegalNoticeRequest): Promise<LegalNotice> {
    const response = await apiClient.post<ApiResponse<LegalNotice>>('/legal-notices', data);
    return response.data.data!;
  },

  async uploadNoticePdf(id: string, file: File): Promise<LegalNotice | undefined> {
    const form = new FormData();
    form.append('file', file);
    const response = await apiClient.post<ApiResponse<LegalNotice>>(`/upload/legal-notice/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async getNoticeById(id: string): Promise<LegalNotice> {
    const response = await apiClient.get<ApiResponse<LegalNotice>>(`/legal-notices/${id}`);
    return response.data.data!;
  },

  async updateNotice(id: string, data: CreateLegalNoticeRequest): Promise<LegalNotice> {
    const response = await apiClient.put<ApiResponse<LegalNotice>>(`/legal-notices/${id}`, data);
    return response.data.data!;
  },

  async deleteNotice(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<string>>(`/legal-notices/${id}`);
  },

  async searchNotices(params: SearchParams): Promise<PaginatedResponse<LegalNotice>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<LegalNotice>>>('/legal-notices/search', { params });
    return response.data.data!;
  },

  async incrementNoticeView(id: string): Promise<void> {
    await apiClient.post(`/legal-notices/${id}/view`);
  },

  async incrementNoticeDownload(id: string): Promise<void> {
    await apiClient.post(`/legal-notices/${id}/download`);
  },
};
