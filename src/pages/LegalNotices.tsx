import { useEffect, useState } from "react";
import { resolveFileUrl } from "@/lib/apiClient";
import { Download, Calendar, FileText, Bell, Archive, Star, Loader2, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DocStatusDropdown from "@/components/DocStatusDropdown";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { useGetNotices, useSearchNotices } from "@/hooks/useNotices";
import { NoticeFilterParams } from "@/types/api";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";

const NOTICE_TYPES = [
  "Appointment", "Amendment", "Regulation", "Proclamation", "Gazette", "Court Order", "Public Notice"
];
const STATUSES = ["Active", "Expired", "Withdrawn"];

const verificationBadge = (status?: string) => {
  if (!status || status === "PUBLISHED") return null;
  const map: Record<string, string> = { DRAFT: "bg-yellow-100 text-yellow-800", UNDER_REVIEW: "bg-blue-100 text-blue-800" };
  return <Badge className={`text-xs ${map[status] ?? ""}`}>{status.replace("_", " ")}</Badge>;
};

const LegalNotices = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false;
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Omit<NoticeFilterParams, "page" | "size" | "sort">>({});
  const size = 10;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const hasFilters = Object.values(filters).some(v => v !== undefined && v !== "");

  const listParams: NoticeFilterParams = { page, size, sort: "publicationDate,desc", ...filters };
  const listQuery = useGetNotices(listParams);
  const searchQueryResult = useSearchNotices({ query: debouncedSearch, page, size, sort: "publicationDate,desc" });

  const activeQuery = debouncedSearch ? searchQueryResult : listQuery;
  const noticesData = activeQuery.data;
  const notices = noticesData?.content || [];
  const totalPages = noticesData?.totalPages || 1;
  const totalElements = noticesData?.totalElements || 0;

  const setFilter = (key: keyof typeof filters, value: string | undefined) => {
    setPage(0);
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  };

  const clearFilters = () => { setPage(0); setFilters({}); };

  const noticeTypeStats = [
    { id: "appointments", name: t("notices.type_appointments"), icon: Bell, typeFilter: "Appointment" },
    { id: "amendments", name: t("notices.type_amendments"), icon: FileText, typeFilter: "Amendment" },
    { id: "regulations", name: t("notices.type_regulations"), icon: Archive, typeFilter: "Regulation" },
    { id: "proclamations", name: t("notices.type_proclamations"), icon: Star, typeFilter: "Proclamation" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1 md:text-3xl md:mb-4">{t("notices.page_title")}</h1>
          <p className="text-muted-foreground text-sm md:text-base">{t("notices.page_subtitle")}</p>
        </div>

        <Tabs defaultValue="notices" className="w-full">
          <div className="overflow-x-auto pb-0.5">
          <TabsList className="grid min-w-max grid-cols-4 sm:w-full">
            <TabsTrigger value="notices">{t("notices.tab_all")}</TabsTrigger>
            <TabsTrigger value="types">{t("notices.tab_types")}</TabsTrigger>
            <TabsTrigger value="gazette">{t("notices.tab_gazette")}</TabsTrigger>
            <TabsTrigger value="recent">{t("notices.tab_recent")}</TabsTrigger>
          </TabsList>
          </div>

          <TabsContent value="notices" className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={e => { setPage(0); setSearchQuery(e.target.value); }}
                  placeholder={t("notices.search_placeholder")}
                  className="ps-9"
                  type="search"
                />
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                className="shrink-0"
                onClick={() => setShowFilters(v => !v)}
              >
                <SlidersHorizontal className="h-4 w-4 me-1.5" />
                {t("notices.filters")}{hasFilters && !searchQuery ? ` (${Object.values(filters).filter(Boolean).length})` : ""}
              </Button>
            </div>

            {showFilters && !searchQuery && (
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Select value={filters.type ?? "all"} onValueChange={v => setFilter("type", v === "all" ? undefined : v)}>
                      <SelectTrigger><SelectValue placeholder={t("notices.all_types")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("notices.all_types")}</SelectItem>
                        {NOTICE_TYPES.map(nt => <SelectItem key={nt} value={nt}>{nt}</SelectItem>)}
                      </SelectContent>
                    </Select>

                    <Select value={filters.status ?? "all"} onValueChange={v => setFilter("status", v === "all" ? undefined : v)}>
                      <SelectTrigger><SelectValue placeholder={t("notices.all_statuses")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("notices.all_statuses")}</SelectItem>
                        {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {hasFilters && (
                    <Button variant="ghost" size="sm" className="mt-2 text-muted-foreground" onClick={clearFilters}>
                      <X className="h-3 w-3 mr-1" /> {t("notices.clear_filters")}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {activeQuery.error && (
              <Alert variant="destructive">
                <AlertDescription>{t("notices.error")}</AlertDescription>
              </Alert>
            )}

            {activeQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">{t("notices.loading")}</span>
              </div>
            ) : (
              <>
                {totalElements > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {totalElements} {totalElements !== 1 ? t("notices.found_plural") : t("notices.found_singular")}
                  </p>
                )}
                <div className="divide-y divide-border border border-border rounded-md bg-card">
                  {notices.map((notice) => (
                    <div key={notice.id} className="flex items-start gap-4 px-4 py-3 hover:bg-secondary/40 transition-colors">
                      <div className="flex-1 min-w-0">
                        <Link to={`/notices/${notice.id}`} className="text-sm font-semibold text-foreground hover:text-primary leading-snug block">
                          {notice.title}
                        </Link>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                          {notice.type && <Badge variant="secondary" className="h-5 text-xs">{notice.type}</Badge>}
                          {notice.gazetteIssue && <Badge variant="outline" className="h-5 text-xs">{notice.gazetteIssue}</Badge>}
                          {notice.publicationDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />{new Date(notice.publicationDate).toLocaleDateString()}
                            </span>
                          )}
                          {notice.issuingAuthority && <span>{notice.issuingAuthority}</span>}
                          {notice.status && (
                            <span className="font-medium text-green-700 dark:text-green-400">{notice.status}</span>
                          )}
                          {isAdmin && notice.id
                            ? <DocStatusDropdown id={notice.id} collection="notices" current={notice.verificationStatus || 'DRAFT'} onChanged={() => activeQuery.refetch()} />
                            : verificationBadge(notice.verificationStatus)
                          }
                        </div>
                        {notice.summary && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{notice.summary}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        <Link to={`/notices/${notice.id}`}>
                          <Button size="sm" variant="ghost" className="h-10 px-3 text-xs sm:h-7 sm:px-2">{t("notices.view")}</Button>
                        </Link>
                        {notice.pdfUrl && (
                          <Button size="sm" variant="ghost" className="h-10 px-3 text-xs sm:h-7 sm:px-2" asChild>
                            <a href={resolveFileUrl(notice.pdfUrl)} target="_blank" rel="noreferrer">
                              <Download className="h-3 w-3 me-1" /> PDF
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {notices.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">{t("notices.no_results")}</p>
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

          <TabsContent value="types">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {noticeTypeStats.map((type) => {
                const IconComponent = type.icon;
                return (
                  <Card key={type.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <IconComponent className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold text-lg mb-4 group-hover:text-primary transition-colors">{type.name}</h3>
                      <Button variant="ghost" size="sm" className="text-primary" onClick={() => {
                        setFilter("type", type.typeFilter);
                        setShowFilters(true);
                      }}>
                        {t("notices.view_notices")} <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="gazette">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  {t("notices.gazette_title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t("notices.gazette_desc")}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  {t("notices.tab_recent")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notices.slice(0, 3).map((notice) => (
                    <div key={notice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{notice.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {notice.type}{notice.publicationDate ? ` - ${new Date(notice.publicationDate).toLocaleDateString()}` : ""}
                        </p>
                      </div>
                      <Link to={`/notices/${notice.id}`}>
                        <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />{t("notices.view")}</Button>
                      </Link>
                    </div>
                  ))}
                  {notices.length === 0 && <p className="text-sm text-muted-foreground">{t("notices.no_results")}</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default LegalNotices;
