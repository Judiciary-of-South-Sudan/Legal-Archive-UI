import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSearchSuggestions, Suggestion } from '@/hooks/useSearchSuggestions';

const TYPE_PATH: Record<Suggestion['type'], string> = {
  law: 'laws',
  judgment: 'judgments',
  notice: 'notices',
  decree: 'decrees',
};

interface SearchSuggestFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputClassName?: string;
  iconClassName?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}

// Drop-in replacement for the `<div className="relative">...<Input/></div>` wrapper around
// a search box — adds a debounced suggestions dropdown. Submission (Enter / search button)
// is left to the parent's own <form>; this component only owns the input + dropdown.
export const SearchSuggestField = ({
  value,
  onChange,
  placeholder,
  inputClassName,
  iconClassName,
  inputRef,
}: SearchSuggestFieldProps) => {
  const [open, setOpen] = useState(false);
  const { suggestions, loading } = useSearchSuggestions(value);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectSuggestion = (s: Suggestion) => {
    setOpen(false);
    onChange('');
    navigate(`/${TYPE_PATH[s.type]}/${s.id}`);
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <Search className={iconClassName ?? 'absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground'} />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => { if (value.trim().length >= 2) setOpen(true); }}
        placeholder={placeholder}
        className={inputClassName}
        type="search"
        enterKeyHint="search"
        autoComplete="off"
      />
      {loading && (
        <Loader2 className="absolute end-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
      )}
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-64 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={`${s.type}-${s.id}`}
              type="button"
              onClick={() => selectSuggestion(s)}
              className="w-full text-start px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between gap-2"
            >
              <span className="truncate">{s.label}</span>
              <span className="text-xs text-muted-foreground shrink-0 capitalize">{s.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
