import apiClient from '@/lib/apiClient';
import { ApiResponse, LegalNotice, CreateLegalNoticeRequest } from '@/types/api';

export const noticeService = {
  async createNotice(data: CreateLegalNoticeRequest): Promise<LegalNotice> {
    const response = await apiClient.post<ApiResponse<LegalNotice>>('/notices', data);
    return response.data.data!;
  },

  async uploadNoticePdf(id: string, file: File): Promise<void> {
    const form = new FormData();
    form.append('file', file);
    await apiClient.post(`/upload/notice/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async getNoticeById(id: string): Promise<LegalNotice> {
    const response = await apiClient.get<ApiResponse<LegalNotice>>(`/notices/${id}`);
    return response.data.data!;
  },

  async updateNotice(id: string, data: CreateLegalNoticeRequest): Promise<LegalNotice> {
    const response = await apiClient.put<ApiResponse<LegalNotice>>(`/notices/${id}`, data);
    return response.data.data!;
  },

  async deleteNotice(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<string>>(`/notices/${id}`);
  },
};
