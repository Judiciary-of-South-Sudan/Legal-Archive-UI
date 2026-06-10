import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { decreeService, DecreeFilterParams } from '@/services/decreeService';
import { CreateDecreeRequest } from '@/types/api';
import { toast } from 'sonner';

export const decreeKeys = {
  all: ['decrees'] as const,
  lists: () => [...decreeKeys.all, 'list'] as const,
  list: (params?: DecreeFilterParams) => [...decreeKeys.lists(), params] as const,
  details: () => [...decreeKeys.all, 'detail'] as const,
  detail: (id: string) => [...decreeKeys.details(), id] as const,
  years: () => [...decreeKeys.all, 'years'] as const,
  recent: (limit: number) => [...decreeKeys.all, 'recent', limit] as const,
};

export const useGetDecrees = (params?: DecreeFilterParams) =>
  useQuery({ queryKey: decreeKeys.list(params), queryFn: () => decreeService.getAllDecrees(params) });

export const useGetDecreeById = (id: string) =>
  useQuery({ queryKey: decreeKeys.detail(id), queryFn: () => decreeService.getDecreeById(id), enabled: !!id });

export const useGetRecentDecrees = (limit = 10) =>
  useQuery({ queryKey: decreeKeys.recent(limit), queryFn: () => decreeService.getRecentDecrees(limit) });

export const useGetDecreeYears = () =>
  useQuery({ queryKey: decreeKeys.years(), queryFn: () => decreeService.getAllYears() });

export const useCreateDecree = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDecreeRequest) => decreeService.createDecree(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: decreeKeys.lists() }); toast.success('Decree created'); },
    onError: (error: any) => { toast.error(error?.response?.data?.message || 'Failed to create decree'); },
  });
};

export const useUpdateDecree = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateDecreeRequest }) => decreeService.updateDecree(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: decreeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: decreeKeys.detail(variables.id) });
      toast.success('Decree updated');
    },
    onError: (error: any) => { toast.error(error?.response?.data?.message || 'Failed to update decree'); },
  });
};

export const useDeleteDecree = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => decreeService.deleteDecree(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: decreeKeys.lists() }); toast.success('Decree deleted'); },
    onError: (error: any) => { toast.error(error?.response?.data?.message || 'Failed to delete decree'); },
  });
};

export const useIncrementDecreeView = () =>
  useMutation({ mutationFn: (id: string) => decreeService.incrementViewCount(id) });

export const useIncrementDecreeDownload = () =>
  useMutation({ mutationFn: (id: string) => decreeService.incrementDownloadCount(id) });
