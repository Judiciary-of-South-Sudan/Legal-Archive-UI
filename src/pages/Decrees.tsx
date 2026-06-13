import { useState } from 'react';
import { Link } from 'react-router-dom';
import ListCardSkeleton from '@/components/ListCardSkeleton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, SlidersHorizontal, X, FileText, Calendar, Search, Users } from 'lucide-react';
import { useGetDecrees, useGetDecreeYears } from '@/hooks/useDecrees';
import { decreeService } from '@/services/decreeService';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

const DECREE_TYPES = ['APPOINTMENT', 'RELIEF', 'REDEPLOYMENT', 'ESTABLISHMENT', 'DISSOLUTION', 'RATIFICATION', 'OTHER'];

const typeColor: Record<string, string> = {
  APPOINTMENT: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  RELIEF: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  REDEPLOYMENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  ESTABLISHMENT: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  DISSOLUTION: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  RATIFICATION: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
};

const DecreeTypeBadge = ({ type }: { type?: string }) => {
  if (!type) return null;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${typeColor[type] ?? 'bg-secondary text-secondary-foreground'}`}>
      {type}
    </span>
  );
};

const Decrees = () => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const size = 20;

  const listQuery = useGetDecrees({
    page,
    size,
    sort: 'decreeDate,desc',
    decreeType: filterType || undefined,
    year: filterYear ? parseInt(filterYear) : undefined,
  });

  const searchResult = useQuery({
    queryKey: ['decrees', 'search', searchQuery, page],
    queryFn: () => decreeService.searchDecrees(searchQuery, page, size),
    enabled: searchQuery.length > 1,
  });

  const { data: years } = useGetDecreeYears();

  const activeQuery = searchQuery.length > 1 ? searchResult : listQuery;
  const decrees = activeQuery.data?.content ?? [];
  const totalElements = activeQuery.data?.totalElements ?? 0;
  const totalPages = activeQuery.data?.totalPages ?? 1;
  const hasFilters = !!(filterType || filterYear);

  const handleSearch = () => {
    setPage(0);
    setSearchQuery(searchInput);
  };

  const clearFilters = () => {
    setPage(0);
    setFilterType('');
    setFilterYear('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{t('decrees.page_title')}</h1>
          <p className="mt-1 text-muted-foreground">{t('decrees.page_subtitle')}</p>
        </div>

        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              enterKeyHint="search"
              className="ps-9"
              placeholder={t('decrees.search_placeholder')}
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button size="sm" onClick={handleSearch}>{t('header.search')}</Button>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            className="shrink-0"
            onClick={() => setShowFilters(v => !v)}
          >
            <SlidersHorizontal className="h-4 w-4 me-1" />
            {t('decrees.filters')} {hasFilters ? `(${[filterType, filterYear].filter(Boolean).length})` : ''}
          </Button>
        </div>

        {showFilters && (
          <Card className="mb-4">
            <CardContent className="pt-4 pb-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Select value={filterType || "all"} onValueChange={v => { setPage(0); setFilterType(v === "all" ? "" : v); }}>
                  <SelectTrigger><SelectValue placeholder={t('decrees.all_types')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('decrees.all_types')}</SelectItem>
                    {DECREE_TYPES.map(tp => <SelectItem key={tp} value={tp}>{tp}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterYear || "all"} onValueChange={v => { setPage(0); setFilterYear(v === "all" ? "" : v); }}>
                  <SelectTrigger><SelectValue placeholder={t('decrees.all_years')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('decrees.all_years')}</SelectItem>
                    {(years ?? []).map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {hasFilters && (
                <Button variant="ghost" size="sm" className="mt-2 text-muted-foreground" onClick={clearFilters}>
                  <X className="h-3 w-3 me-1" /> {t('decrees.clear_filters')}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {activeQuery.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{t('decrees.error')}</AlertDescription>
          </Alert>
        )}

        {activeQuery.isLoading ? (
          <ListCardSkeleton />
        ) : (
          <>
            {totalElements > 0 && (
              <p className="mb-3 text-sm text-muted-foreground">
                {totalElements} {totalElements !== 1 ? t('decrees.found_plural') : t('decrees.found_singular')}
              </p>
            )}

            <div className="divide-y divide-border border border-border rounded-md bg-card">
              {decrees.length === 0 ? (
                <div className="py-16 text-center">
                  <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{t('decrees.no_results')}</p>
                </div>
              ) : decrees.map((decree, idx) => (
                <div key={decree.id || idx} className="flex items-start gap-4 px-4 py-3 hover:bg-secondary/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <Link to={`/decrees/${decree.id}`} className="text-sm font-semibold text-foreground hover:text-primary leading-snug block">
                      {decree.title}
                    </Link>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {decree.decreeNumber && (
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {t('decrees.decree_number')} {decree.decreeNumber}
                        </span>
                      )}
                      {decree.decreeDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(decree.decreeDate).toLocaleDateString()}
                        </span>
                      )}
                      {decree.decreeType && <DecreeTypeBadge type={decree.decreeType} />}
                      {decree.personnel && decree.personnel.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {decree.personnel.length} {decree.personnel.length === 1 ? 'person' : 'persons'}
                        </span>
                      )}
                    </div>
                    {decree.subject && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{decree.subject}</p>
                    )}
                  </div>
                  <Link to={`/decrees/${decree.id}`} className="shrink-0 text-xs text-primary hover:underline mt-0.5">
                    {t('decrees.view_details')}
                  </Link>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
                  {t('common.previous')}
                </Button>
                <span className="text-sm text-muted-foreground">{t('common.page')} {page + 1} {t('common.of')} {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
                  {t('common.next')}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Decrees;
