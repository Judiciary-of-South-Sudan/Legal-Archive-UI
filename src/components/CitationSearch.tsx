import { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/lib/apiClient';

interface Item { id: string; label: string; }

interface CitationSearchProps {
  type: 'law' | 'judgment';
  value: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

export const CitationSearch = ({ type, value, onChange, placeholder }: CitationSearchProps) => {
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // track IDs we set via onChange so we don't re-resolve them
  const lastEmittedKey = useRef('');

  // Resolve IDs to labels whenever value changes externally
  useEffect(() => {
    const valueKey = value.join(',');
    if (valueKey === lastEmittedKey.current) return;

    if (!value.length) { setSelectedItems([]); return; }

    const existingIds = selectedItems.map(i => i.id);
    const newIds = value.filter(id => !existingIds.includes(id));

    if (newIds.length === 0) {
      setSelectedItems(prev => prev.filter(i => value.includes(i.id)));
      return;
    }

    const endpoint = type === 'law'
      ? `/laws/batch?ids=${newIds.join(',')}`
      : `/judgments/batch?ids=${newIds.join(',')}`;

    apiClient.get(endpoint).then(res => {
      const docs: any[] = res.data?.data ?? [];
      const resolved: Item[] = newIds.map(id => {
        const found = docs.find((d: any) => d.id === id);
        return { id, label: found ? (type === 'law' ? found.title : found.caseName) : id };
      });
      setSelectedItems(prev => [
        ...prev.filter(i => value.includes(i.id)),
        ...resolved,
      ]);
    }).catch(() => {
      setSelectedItems(prev => [
        ...prev.filter(i => value.includes(i.id)),
        ...newIds.map(id => ({ id, label: id })),
      ]);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.join(','), type]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const endpoint = type === 'law' ? '/laws/search' : '/judgments/search';
        const res = await apiClient.get(endpoint, { params: { query: query.trim(), size: 8, page: 0 } });
        const docs: any[] = res.data?.data?.content ?? [];
        setResults(docs.map((d: any) => ({
          id: d.id,
          label: type === 'law' ? d.title : d.caseName,
        })));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, type]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const emit = (next: Item[]) => {
    const nextIds = next.map(i => i.id);
    lastEmittedKey.current = nextIds.join(',');
    onChange(nextIds);
  };

  const select = (item: Item) => {
    if (selectedItems.some(s => s.id === item.id)) return;
    const next = [...selectedItems, item];
    setSelectedItems(next);
    emit(next);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const remove = (id: string) => {
    const next = selectedItems.filter(i => i.id !== id);
    setSelectedItems(next);
    emit(next);
  };

  const visibleResults = results.filter(r => !selectedItems.some(s => s.id === r.id));

  return (
    <div ref={containerRef} className="relative">
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedItems.map(item => (
            <Badge key={item.id} variant="secondary" className="gap-1 max-w-[240px]">
              <span className="truncate text-xs">{item.label}</span>
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="ms-0.5 rounded-full hover:bg-muted shrink-0"
                aria-label={`Remove ${item.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { if (query.length >= 2) setOpen(true); }}
          placeholder={placeholder ?? (type === 'law' ? 'Search laws by title…' : 'Search cases by name…')}
          className="ps-9"
        />
        {searching && (
          <Loader2 className="absolute end-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
        )}
      </div>
      {open && visibleResults.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-48 overflow-y-auto">
          {visibleResults.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => select(r)}
              className="w-full text-start px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
