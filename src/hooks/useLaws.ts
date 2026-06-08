import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lawService } from '@/services/lawService';
import { CreateLawRequest, LawFilterParams, SearchParams } from '@/types/api';
import { toast } from 'sonner';
export const lawKeys = {
  all: ['laws'] as const,
  lists: () => [...lawKeys.all, 'list'] as const,
  list: (params?: LawFilterParams) => [...lawKeys.lists(), params] as const,
  details: () => [...lawKeys.all, 'detail'] as const,
  detail: (id: string) => [...lawKeys.details(), id] as const,
  search: (params: SearchParams) => [...lawKeys.all, 'search', params] as const,
  types: () => [...lawKeys.all, 'types'] as const,
  years: () => [...lawKeys.all, 'years'] as const,
  categories: () => [...lawKeys.all, 'categories'] as const,
  stats: () => [...lawKeys.all, 'stats'] as const,
  recent: (limit: number) => [...lawKeys.all, 'recent', limit] as const,
};
export const useGetLaws = (params?: LawFilterParams) => {
  return useQuery({
    queryKey: lawKeys.list(params),
    queryFn: () => lawService.getAllLaws(params),
  });
};
export const useGetLawById = (id: string) => {
  return useQuery({
    queryKey: lawKeys.detail(id),
    queryFn: () => lawService.getLawById(id),
    enabled: !!id,
  });
};
export const useSearchLaws = (params: SearchParams) => {
  return useQuery({
    queryKey: lawKeys.search(params),
    queryFn: () => lawService.searchLaws(params),
    enabled: !!params.query,
  });
};
export const useGetLawTypes = () => {
  return useQuery({
    queryKey: lawKeys.types(),
    queryFn: () => lawService.getLawTypes(),
  });
};
export const useGetLawYears = () => {
  return useQuery({
    queryKey: lawKeys.years(),
    queryFn: () => lawService.getLawYears(),
  });
};
export const useGetLawCategories = () => {
  return useQuery({
    queryKey: lawKeys.categories(),
    queryFn: () => lawService.getLawCategories(),
  });
};
export const useGetLawStats = () => {
  return useQuery({
    queryKey: lawKeys.stats(),
    queryFn: () => lawService.getStatistics(),
  });
};
export const useGetRecentLaws = (limit: number = 10) => {
  return useQuery({
    queryKey: lawKeys.recent(limit),
    queryFn: () => lawService.getRecentLaws(limit),
  });
};
export const useCreateLaw = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLawRequest) => lawService.createLaw(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lawKeys.lists() });
      toast.success('Law created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create law');
    },
  });
};
export const useUpdateLaw = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateLawRequest }) => lawService.updateLaw(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: lawKeys.lists() });
      queryClient.invalidateQueries({ queryKey: lawKeys.detail(variables.id) });
      toast.success('Law updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update law');
    },
  });
};
export const useDeleteLaw = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lawService.deleteLaw(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lawKeys.lists() });
      toast.success('Law deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete law');
    },
  });
};
export const useIncrementLawView = () => {
  return useMutation({
    mutationFn: (id: string) => lawService.incrementViewCount(id),
  });
};
export const useIncrementLawDownload = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lawService.incrementDownloadCount(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: lawKeys.detail(id) });
    },
  });
};
