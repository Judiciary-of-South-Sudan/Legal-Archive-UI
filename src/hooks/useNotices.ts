import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noticeService } from '@/services/noticeService';
import { CreateLegalNoticeRequest, PaginationParams, SearchParams } from '@/types/api';
import { toast } from 'sonner';

export const noticeKeys = {
  all: ['notices'] as const,
  lists: () => [...noticeKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...noticeKeys.lists(), params] as const,
  details: () => [...noticeKeys.all, 'detail'] as const,
  detail: (id: string) => [...noticeKeys.details(), id] as const,
  search: (params: SearchParams) => [...noticeKeys.all, 'search', params] as const,
};

export const useGetNotices = (params?: PaginationParams) => {
  return useQuery({
    queryKey: noticeKeys.list(params),
    queryFn: () => noticeService.getAllNotices(params),
  });
};

export const useGetNoticeById = (id?: string) => {
  return useQuery({
    queryKey: noticeKeys.detail(id || ''),
    queryFn: () => noticeService.getNoticeById(id || ''),
    enabled: !!id,
  });
};

export const useSearchNotices = (params: SearchParams) => {
  return useQuery({
    queryKey: noticeKeys.search(params),
    queryFn: () => noticeService.searchNotices(params),
    enabled: !!params.query,
  });
};

export const useCreateNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLegalNoticeRequest) => noticeService.createNotice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
      toast.success('Legal notice created successfully');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to create legal notice');
    },
  });
};

export const useUpdateNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateLegalNoticeRequest }) => noticeService.updateNotice(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: noticeKeys.detail(vars.id) });
      toast.success('Legal notice updated successfully');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to update legal notice');
    },
  });
};

export const useIncrementNoticeView = () => {
  return useMutation({
    mutationFn: (id: string) => noticeService.incrementNoticeView(id),
  });
};

export const useDeleteNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => noticeService.deleteNotice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
      toast.success('Legal notice deleted');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to delete legal notice');
    },
  });
};
