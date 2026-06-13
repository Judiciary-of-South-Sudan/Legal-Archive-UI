import { useState } from "react";
import { resolveFileUrl } from "@/lib/apiClient";
import { Download, Eye, FileText, Calendar, ChevronRight, Loader2, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SearchBar from "@/components/SearchBar";
import DocStatusDropdown from "@/components/DocStatusDropdown";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useGetLaws, useGetLawCategories, useGetLawTypes, useGetLawYears, useGetRecentLaws, useSearchLaws } from "@/hooks/useLaws";
import { Link } from 'react-router-dom';
import { LawFilterParams } from "@/types/api";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";

const STATUSES = ["Active", "Repealed", "Amended"];

const verificationBadge = (status?: string) => {
  if (!status || status === "PUBLISHED") return null;
  const map: Record<string, string> = { DRAFT: "bg-yellow-100 text-yellow-800", UNDER_REVIEW: "bg-blue-100 text-blue-800" };
  return <Badge className={`text-xs ${map[status] ?? ""}`}>{status.replace("_", " ")}</Badge>;
};

const Laws = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false;
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Omit<LawFilterParams, "page" | "size" | "sort">>({});
  const size = 10;

  const hasFilters = Object.values(filters).some(Boolean);

  const listParams: LawFilterParams = { page, size, sort: "year,desc", ...filters };
  const listQuery = useGetLaws(listParams);
  const searchQueryResult = useSearchLaws({ query: searchQuery, page, size, sort: "year,desc" });
  const activeQuery = searchQuery ? searchQueryResult : listQuery;

  const { data: categories } = useGetLawCategories();
  const { data: types } = useGetLawTypes();
  const { data: years } = useGetLawYears();
  const { data: recentLaws } = useGetRecentLaws(10);

  const laws = activeQuery.data?.content || [];
  const totalPages = activeQuery.data?.totalPages || 1;
  const totalElements = activeQuery.data?.totalElements || 0;

  const setFilter = (key: keyof typeof filters, value: string | number | undefined) => {
    setPage(0);
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  };

  const clearFilters = () => { setPage(0); setFilters({}); };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">{t("laws.page_title")}</h1>
          <p className="text-muted-foreground">{t("laws.page_subtitle")}</p>
        </div>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="browse">{t("laws.tab_browse")}</TabsTrigger>
            <TabsTrigger value="constitution">{t("laws.tab_constitution")}</TabsTrigger>
            <TabsTrigger value="categories">{t("laws.tab_categories")}</TabsTrigger>
            <TabsTrigger value="recent">{t("laws.tab_recent")}</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <SearchBar
                  placeholder={t("laws.search_placeholder")}
                  onSearch={(query) => { setPage(0); setSearchQuery(query || ""); }}
                />
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                className="mt-1 shrink-0"
                onClick={() => setShowFilters(v => !v)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                {t("laws.filters")} {hasFilters && !searchQuery ? `(${activeFilterCount})` : ""}
              </Button>
            </div>

            {showFilters && !searchQuery && (
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Select value={filters.type ?? ""} onValueChange={v => setFilter("type", v)}>
                      <SelectTrigger><SelectValue placeholder={t("laws.all_types")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t("laws.all_types")}</SelectItem>
                        {(types ?? ["Act", "Constitution", "Regulation", "Statutory Instrument"]).map(tp => (
                          <SelectItem key={tp} value={tp}>{tp}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filters.status ?? ""} onValueChange={v => setFilter("status", v)}>
                      <SelectTrigger><SelectValue placeholder={t("laws.all_statuses")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t("laws.all_statuses")}</SelectItem>
                        {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.year?.toString() ?? ""}
                      onValueChange={v => setFilter("year", v ? parseInt(v) : undefined)}
                    >
                      <SelectTrigger><SelectValue placeholder={t("laws.all_years")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t("laws.all_years")}</SelectItem>
                        {(years ?? []).map(y => (
                          <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filters.category ?? ""} onValueChange={v => setFilter("category", v)}>
                      <SelectTrigger><SelectValue placeholder={t("laws.all_categories")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t("laws.all_categories")}</SelectItem>
                        {(categories ?? []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {hasFilters && (
                    <Button variant="ghost" size="sm" className="mt-2 text-muted-foreground" onClick={clearFilters}>
                      <X className="h-3 w-3 mr-1" /> {t("laws.clear_filters")}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {activeQuery.error && (
              <Alert variant="destructive">
                <AlertDescription>{t("laws.error")}</AlertDescription>
              </Alert>
            )}

            {activeQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">{t("laws.loading")}</span>
              </div>
            ) : (
              <>
                {totalElements > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {totalElements} {totalElements !== 1 ? t("laws.found_plural") : t("laws.found_singular")}
                  </p>
                )}
                <div className="divide-y divide-border border border-border rounded-md bg-card">
                  {laws.map((law, idx) => (
                    <div key={law.id || law.title || idx} className="flex items-start gap-4 px-4 py-3 hover:bg-secondary/40 transition-colors">
                      <div className="flex-1 min-w-0">
                        <Link to={`/laws/${law.id}`} className="text-sm font-semibold text-foreground hover:text-primary leading-snug block">
                          {law.title}
                        </Link>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                          {law.type && <Badge variant="secondary" className="h-5 text-xs">{law.type}</Badge>}
                          {law.category && <Badge variant="outline" className="h-5 text-xs">{law.category}</Badge>}
                          {law.year && <span>{law.year}</span>}
                          {law.enactmentDate && !law.year && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />{new Date(law.enactmentDate).toLocaleDateString()}
                            </span>
                          )}
                          {law.status && (
                            <span className="font-medium text-green-700 dark:text-green-400">{law.status}</span>
                          )}
                          {isAdmin && law.id
                            ? <DocStatusDropdown id={law.id} collection="laws" current={law.verificationStatus || 'DRAFT'} onChanged={() => activeQuery.refetch()} />
                            : verificationBadge(law.verificationStatus)
                          }
                        </div>
                        {law.summary && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{law.summary}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        <Link to={`/laws/${law.id}`}>
                          <Button size="sm" variant="ghost" className="h-10 px-3 text-xs sm:h-7 sm:px-2">{t("laws.view")}</Button>
                        </Link>
                        {law.pdfUrl && (
                          <Button size="sm" variant="ghost" className="h-10 px-3 text-xs sm:h-7 sm:px-2" asChild>
                            <a href={resolveFileUrl(law.pdfUrl)} target="_blank" rel="noreferrer">
                              <Download className="h-3 w-3 me-1" /> PDF
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {!activeQuery.isLoading && laws.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">{t("laws.no_results")}</p>
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-muted-foreground">
                      {t("common.showing")} {page * size + 1}–{Math.min((page + 1) * size, totalElements)} {t("common.of")} {totalElements}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page <= 0}>{t("common.previous")}</Button>
                      <span className="text-sm">{t("common.page")} {page + 1} {t("common.of")} {totalPages}</span>
                      <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>{t("common.next")}</Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="constitution">
            <div className="space-y-4">
              <p className="text-muted-foreground mb-4">{t("laws.constitution_subtitle")}</p>
              {laws.filter(law => law.type === "Constitution").map((law) => (
                <Card key={law.id || law.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{law.title}</h3>
                    <p className="text-muted-foreground mb-4">{law.summary}</p>
                    <div className="flex gap-2">
                      <Link to={`/laws/${law.id}`}>
                        <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1" /> {t("laws.view")}</Button>
                      </Link>
                      {law.pdfUrl && (
                        <Button size="sm" variant="default" asChild>
                          <a href={resolveFileUrl(law.pdfUrl)} target="_blank" rel="noreferrer">
                            <Download className="h-4 w-4 mr-1" /> {t("laws.download_pdf")}
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories?.map((category) => (
                <Card key={category} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FileText className="h-8 w-8 text-primary" />
                      <Badge variant="secondary">{category}</Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{category}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t("laws.category_subtitle")}</p>
                    <Button variant="ghost" size="sm" className="text-primary" onClick={() => {
                      setFilter("category", category);
                      setShowFilters(true);
                    }}>
                      {t("laws.view_laws")} <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent">
            <div className="space-y-4">
              <p className="text-muted-foreground mb-4">{t("laws.recent_subtitle")}</p>
              {recentLaws?.map((law) => (
                <Card key={law.id || law.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{law.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="secondary">{law.type}</Badge>
                          {law.year && <Badge variant="outline">{law.year}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {law.lastAmended
                            ? `${t("laws.updated")}: ${new Date(law.lastAmended).toLocaleDateString()}`
                            : law.enactmentDate
                            ? `${t("laws.enacted")}: ${new Date(law.enactmentDate).toLocaleDateString()}`
                            : ""}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Link to={`/laws/${law.id}`}>
                          <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1" /> {t("laws.view")}</Button>
                        </Link>
                        {law.pdfUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={resolveFileUrl(law.pdfUrl)} target="_blank" rel="noreferrer">
                              <Download className="h-4 w-4 mr-1" /> {t("laws.pdf")}
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Laws;
