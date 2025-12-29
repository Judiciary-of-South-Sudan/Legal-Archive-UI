import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { judgmentService } from '@/services/judgmentService';
import { CreateJudgmentRequest, PaginationParams, SearchParams, DateRangeParams } from '@/types/api';
import { toast } from 'sonner';

export const judgmentKeys = {
  all: ['judgments'] as const,
  lists: () => [...judgmentKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...judgmentKeys.lists(), params] as const,
  details: () => [...judgmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...judgmentKeys.details(), id] as const,
  search: (params: SearchParams) => [...judgmentKeys.all, 'search', params] as const,
  byCourtLevel: (courtLevel: string, params?: PaginationParams) =>
    [...judgmentKeys.all, 'courtLevel', courtLevel, params] as const,
  byCaseType: (caseType: string, params?: PaginationParams) =>
    [...judgmentKeys.all, 'caseType', caseType, params] as const,
  byDateRange: (params: DateRangeParams) =>
    [...judgmentKeys.all, 'dateRange', params] as const,
  recent: (limit: number) => [...judgmentKeys.all, 'recent', limit] as const,
};

export const useGetJudgments = (params?: PaginationParams) => {
  return useQuery({
    queryKey: judgmentKeys.list(params),
    queryFn: () => judgmentService.getAllJudgments(params),
  });
};

export const useGetJudgmentById = (id: string) => {
  return useQuery({
    queryKey: judgmentKeys.detail(id),
    queryFn: () => judgmentService.getJudgmentById(id),
    enabled: !!id,
  });
};

export const useSearchJudgments = (params: SearchParams) => {
  return useQuery({
    queryKey: judgmentKeys.search(params),
    queryFn: () => judgmentService.searchJudgments(params),
    enabled: !!params.query,
  });
};

export const useGetJudgmentsByCourtLevel = (courtLevel: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: judgmentKeys.byCourtLevel(courtLevel, params),
    queryFn: () => judgmentService.getJudgmentsByCourtLevel(courtLevel, params),
    enabled: !!courtLevel,
  });
};

export const useGetJudgmentsByCaseType = (caseType: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: judgmentKeys.byCaseType(caseType, params),
    queryFn: () => judgmentService.getJudgmentsByCaseType(caseType, params),
    enabled: !!caseType,
  });
};

export const useGetJudgmentsByDateRange = (params: DateRangeParams) => {
  return useQuery({
    queryKey: judgmentKeys.byDateRange(params),
    queryFn: () => judgmentService.getJudgmentsByDateRange(params),
    enabled: !!params.startDate && !!params.endDate,
  });
};

export const useGetRecentJudgments = (limit: number = 10) => {
  return useQuery({
    queryKey: judgmentKeys.recent(limit),
    queryFn: () => judgmentService.getRecentJudgments(limit),
  });
};

export const useCreateJudgment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJudgmentRequest) => judgmentService.createJudgment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: judgmentKeys.lists() });
      toast.success('Judgment created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create judgment');
    },
  });
};

export const useUpdateJudgment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateJudgmentRequest }) =>
      judgmentService.updateJudgment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: judgmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: judgmentKeys.detail(variables.id) });
      toast.success('Judgment updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update judgment');
    },
  });
};

export const useDeleteJudgment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => judgmentService.deleteJudgment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: judgmentKeys.lists() });
      toast.success('Judgment deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete judgment');
    },
  });
};

export const useIncrementJudgmentView = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => judgmentService.incrementViewCount(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: judgmentKeys.detail(id) });
    },
  });
};

export const useIncrementJudgmentDownload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => judgmentService.incrementDownloadCount(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: judgmentKeys.detail(id) });
    },
  });
};

