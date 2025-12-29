import { useMutation, useQueryClient } from '@tanstack/react-query';
import { noticeService } from '@/services/noticeService';
import { CreateLegalNoticeRequest } from '@/types/api';
import { toast } from 'sonner';

export const useCreateNotice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLegalNoticeRequest) => noticeService.createNotice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      toast.success('Legal notice created successfully');
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to create legal notice');
    },
  });
};
