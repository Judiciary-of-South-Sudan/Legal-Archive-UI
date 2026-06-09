import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookmarkService } from '@/services/bookmarkService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const bookmarkKeys = {
  all: ['bookmarks'] as const,
  list: () => [...bookmarkKeys.all, 'list'] as const,
  check: (documentId: string) => [...bookmarkKeys.all, 'check', documentId] as const,
};

export const useGetBookmarks = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: bookmarkKeys.list(),
    queryFn: bookmarkService.getBookmarks,
    enabled: isAuthenticated,
  });
};

export const useIsBookmarked = (documentId: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: bookmarkKeys.check(documentId),
    queryFn: () => bookmarkService.isBookmarked(documentId),
    enabled: isAuthenticated && !!documentId,
  });
};

export const useToggleBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, documentType, title }: { documentId: string; documentType: string; title: string }) =>
      bookmarkService.toggle(documentId, documentType, title),
    onSuccess: (nowBookmarked, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.list() });
      queryClient.setQueryData(bookmarkKeys.check(documentId), nowBookmarked);
      toast.success(nowBookmarked ? 'Bookmarked' : 'Bookmark removed');
    },
    onError: () => toast.error('Failed to update bookmark'),
  });
};
