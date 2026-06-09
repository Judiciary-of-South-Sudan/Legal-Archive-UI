import { useState } from "react";
import { resolveFileUrl } from "@/lib/apiClient";
import { Download, Eye, Calendar, FileText, Bell, Archive, Star, Loader2, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SearchBar from "@/components/SearchBar";
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
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Omit<NoticeFilterParams, "page" | "size" | "sort">>({});
  const size = 10;

  const hasFilters = Object.values(filters).some(v => v !== undefined && v !== "");

  const listParams: NoticeFilterParams = { page, size, sort: "publicationDate,desc", ...filters };
  const listQuery = useGetNotices(listParams);
  const searchQueryResult = useSearchNotices({ query: searchQuery, page, size, sort: "publicationDate,desc" });

  const activeQuery = searchQuery ? searchQueryResult : listQuery;
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">{t("notices.page_title")}</h1>
          <p className="text-muted-foreground">{t("notices.page_subtitle")}</p>
        </div>

        <Tabs defaultValue="notices" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notices">{t("notices.tab_all")}</TabsTrigger>
            <TabsTrigger value="types">{t("notices.tab_types")}</TabsTrigger>
            <TabsTrigger value="gazette">{t("notices.tab_gazette")}</TabsTrigger>
            <TabsTrigger value="recent">{t("notices.tab_recent")}</TabsTrigger>
          </TabsList>

          <TabsContent value="notices" className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <SearchBar
                  placeholder={t("notices.search_placeholder")}
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
                {t("notices.filters")} {hasFilters && !searchQuery ? `(${Object.values(filters).filter(Boolean).length})` : ""}
              </Button>
            </div>

            {showFilters && !searchQuery && (
              <Card>
                <CardContent className="pt-4 pb-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Select value={filters.type ?? ""} onValueChange={v => setFilter("type", v)}>
                      <SelectTrigger><SelectValue placeholder={t("notices.all_types")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t("notices.all_types")}</SelectItem>
                        {NOTICE_TYPES.map(nt => <SelectItem key={nt} value={nt}>{nt}</SelectItem>)}
                      </SelectContent>
                    </Select>

                    <Select value={filters.status ?? ""} onValueChange={v => setFilter("status", v)}>
                      <SelectTrigger><SelectValue placeholder={t("notices.all_statuses")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t("notices.all_statuses")}</SelectItem>
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
                <div className="space-y-4">
                  {notices.map((notice) => (
                    <Card key={notice.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-foreground mb-2">{notice.title}</h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="secondary">{notice.type}</Badge>
                              {notice.gazetteIssue && <Badge variant="outline">{notice.gazetteIssue}</Badge>}
                              {notice.issuingAuthority && <Badge variant="outline">{notice.issuingAuthority}</Badge>}
                              {notice.status && (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                  {notice.status}
                                </Badge>
                              )}
                              {verificationBadge(notice.verificationStatus)}
                            </div>

                            {notice.tags && notice.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {notice.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Link to={`/notices/${notice.id}`}>
                              <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1" />{t("notices.view")}</Button>
                            </Link>
                            {notice.pdfUrl && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={resolveFileUrl(notice.pdfUrl)} target="_blank" rel="noreferrer">
                                  <Download className="h-4 w-4 mr-1" />{t("notices.pdf")}
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-muted-foreground">
                          {notice.publicationDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{t("notices.published")}: {new Date(notice.publicationDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{t("notices.authority")}: {notice.issuingAuthority}</span>
                          </div>
                        </div>

                        {notice.summary && <p className="text-foreground mb-4 line-clamp-3">{notice.summary}</p>}

                        <div className="flex justify-end">
                          <Link to={`/notices/${notice.id}`}>
                            <Button variant="ghost" size="sm" className="text-primary">
                              {t("notices.view_details")} <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {notices.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">{t("notices.no_results")}</p>
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
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
