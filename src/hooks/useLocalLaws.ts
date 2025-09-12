import { useEffect, useMemo, useState } from "react";
import type { LawDoc } from "../types/law";

type Params = { q?: string; year?: string | number; category?: string; page?: number; size?: number };

export function useLocalLaws(params: Params = {}) {
  const [all, setAll] = useState<LawDoc[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/data/laws.json", { cache: "no-store" });
        const data = (await res.json()) as LawDoc[];
        if (mounted) setAll(data);
      } catch (e) {
        if (mounted) setError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    if (!all) return [];
    const q = (params.q ?? "").toLowerCase().trim();
    const yr = params.year ? Number(params.year) : undefined;
    const cat = (params.category ?? "").toLowerCase().trim();

    return all.filter(d => {
      const matchesQ = !q ||
        d.title.toLowerCase().includes(q) ||
        (d.summary ?? "").toLowerCase().includes(q) ||
        (d.category ?? "").toLowerCase().includes(q);
      const matchesYear = !yr || d.year === yr;
      const matchesCat = !cat || (d.category ?? "").toLowerCase() === cat;
      return matchesQ && matchesYear && matchesCat;
    });
  }, [all, params.q, params.year, params.category]);

  const page = params.page ?? 1;
  const size = params.size ?? 10;
  const start = (page - 1) * size;
  const items = filtered.slice(start, start + size);

  // simple category counts for your “By Category” tab
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    (all ?? []).forEach(d => {
      const c = d.category ?? "Uncategorized";
      map.set(c, (map.get(c) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ id: name.toLowerCase(), name, count }));
  }, [all]);

  return { items, total: filtered.length, page, size, loading, error, categories, all: all ?? [] };
}
