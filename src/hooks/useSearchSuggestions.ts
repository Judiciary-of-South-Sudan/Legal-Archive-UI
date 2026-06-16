import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';

export interface Suggestion {
  id: string;
  label: string;
  type: 'law' | 'judgment' | 'notice' | 'decree';
}

export const useSearchSuggestions = (query: string) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/search/suggest', { params: { q: trimmed } });
        setSuggestions(res.data?.data ?? []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  return { suggestions, loading };
};
