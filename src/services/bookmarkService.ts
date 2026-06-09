import apiClient from '@/lib/apiClient';
import { ApiResponse, Bookmark } from '@/types/api';

export const bookmarkService = {
  getBookmarks: async (): Promise<Bookmark[]> => {
    const res = await apiClient.get<ApiResponse<Bookmark[]>>('/bookmarks');
    return res.data.data ?? [];
  },

  isBookmarked: async (documentId: string): Promise<boolean> => {
    const res = await apiClient.get<ApiResponse<{ bookmarked: boolean }>>(`/bookmarks/${documentId}`);
    return res.data.data?.bookmarked ?? false;
  },

  toggle: async (documentId: string, documentType: string, title: string): Promise<boolean> => {
    const res = await apiClient.post<ApiResponse<{ bookmarked: boolean }>>('/bookmarks/toggle', {
      documentId, documentType, title,
    });
    return res.data.data?.bookmarked ?? false;
  },

  remove: async (documentId: string): Promise<void> => {
    await apiClient.delete(`/bookmarks/${documentId}`);
  },
};
