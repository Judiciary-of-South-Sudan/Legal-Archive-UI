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
};

