import { useState } from "react";
import { resolveFileUrl } from "@/lib/apiClient";
import { Download, Eye, Calendar, Gavel, Loader2, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DocStatusDropdown from "@/components/DocStatusDropdown";
import { useGetJudgments, useSearchJudgments } from "@/hooks/useJudgments";
import { Link } from 'react-router-dom';
import { JudgmentFilterParams } from "@/types/api";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";

const COURT_LEVELS = ["Supreme Court", "Court of Appeal", "High Court", "Magistrate Court"];
const CASE_TYPES = ["Civil", "Criminal", "Constitutional", "Commercial", "Family", "Administrative"];
const STATUSES = ["Final", "Under Appeal", "Overturned"];

const verificationBadge = (status?: string) => {
  if (!status || status === "PUBLISHED") return null;
  const map: Record<string, string> = { DRAFT: "bg-yellow-100 text-yellow-800", UNDER_REVIEW: "bg-blue-100 text-blue-800" };
  return <Badge className={`text-xs ${map[status] ?? ""}`}>{status.replace("_", " ")}</Badge>;
};

const Judgments = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false;
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Omit<JudgmentFilterParams, "page" | "size" | "sort">>({});
  const [page, setPage] = useState(0);
  const size = 10;

  const hasFilters = Object.values(filters).some(v => v !== undefined && v !== "");

  const listParams: JudgmentFilterParams = { page, size, sort: "judgmentDate,desc", ...filters };
  const allQuery = useGetJudgments(listParams);
  const searchQuery = useSearchJudgments({ query: submittedSearch, page, size, sort: "judgmentDate,desc" });

  const activeQuery = submittedSearch ? searchQuery : allQuery;
  const judgments = activeQuery.data?.content || [];
  const totalPages = activeQuery.data?.totalPages || 1;
  const totalElements = activeQuery.data?.totalElements || 0;

  const setFilter = (key: keyof typeof filters, value: string | undefined) => {
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
          <h1 className="text-3xl font-bold text-foreground mb-4">{t("judgments.page_title")}</h1>
          <p className="text-muted-foreground">{t("judgments.page_subtitle")}</p>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2"><Gavel className="h-4 w-4" /> {t("judgments.search_title")}</span>
              <Button variant={showFilters ? "default" : "outline"} size="sm" onClick={() => setShowFilters(v => !v)}>
                <SlidersHorizontal className="h-4 w-4 mr-1" />
                {t("judgments.filters")} {hasFilters && !submittedSearch ? `(${activeFilterCount})` : ""}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder={t("judgments.search_placeholder")}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (setPage(0), setSubmittedSearch(searchTerm.trim()))}
                className="flex-1"
              />
              <Button onClick={() => { setPage(0); setSubmittedSearch(searchTerm.trim()); }}>{t("header.search")}</Button>
              {submittedSearch && (
                <Button variant="outline" onClick={() => { setSearchTerm(""); setSubmittedSearch(""); }}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {showFilters && !submittedSearch && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                <Select value={filters.courtLevel ?? ""} onValueChange={v => setFilter("courtLevel", v)}>
                  <SelectTrigger><SelectValue placeholder={t("judgments.all_courts")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t("judgments.all_courts")}</SelectItem>
                    {COURT_LEVELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={filters.caseType ?? ""} onValueChange={v => setFilter("caseType", v)}>
                  <SelectTrigger><SelectValue placeholder={t("judgments.all_case_types")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t("judgments.all_case_types")}</SelectItem>
                    {CASE_TYPES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={filters.status ?? ""} onValueChange={v => setFilter("status", v)}>
                  <SelectTrigger><SelectValue placeholder={t("judgments.all_statuses")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t("judgments.all_statuses")}</SelectItem>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>

                {hasFilters && (
                  <Button variant="ghost" size="sm" className="text-muted-foreground col-span-full w-fit" onClick={clearFilters}>
                    <X className="h-3 w-3 mr-1" /> {t("judgments.clear_filters")}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {activeQuery.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{t("judgments.error")}</AlertDescription>
          </Alert>
        )}

        {activeQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">{t("judgments.loading")}</span>
          </div>
        ) : (
          <>
            {totalElements > 0 && (
              <p className="text-sm text-muted-foreground mb-4">
                {totalElements} {totalElements !== 1 ? t("judgments.found_plural") : t("judgments.found_singular")}
              </p>
            )}
            <div className="space-y-6">
              {judgments.map((judgment, idx) => (
                <Card key={judgment.id || idx} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-2">{judgment.caseName}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="secondary">{judgment.courtLevel}</Badge>
                          {judgment.caseType && <Badge variant="outline">{judgment.caseType}</Badge>}
                          {judgment.caseNumber && <Badge variant="outline">{judgment.caseNumber}</Badge>}
                          {judgment.status && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                              {judgment.status}
                            </Badge>
                          )}
                          {verificationBadge(judgment.verificationStatus)}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Link to={`/judgments/${judgment.id}`}>
                          <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1" />{t("judgments.view")}</Button>
                        </Link>
                        {judgment.pdfUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={resolveFileUrl(judgment.pdfUrl)} target="_blank" rel="noreferrer">
                              <Download className="h-4 w-4 mr-1" />{t("judgments.pdf")}
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-muted-foreground">
                      {judgment.judgmentDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{t("judgments.date")}: {new Date(judgment.judgmentDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {judgment.judges && judgment.judges.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Gavel className="h-4 w-4" />
                          <span>{t("judgments.judges")}: {judgment.judges.join(", ")}</span>
                        </div>
                      )}
                      {judgment.courtName && <div>{t("judgments.court")}: {judgment.courtName}</div>}
                    </div>

                    {judgment.parties && <p className="text-sm font-medium mb-2">{t("judgments.parties")}: {judgment.parties}</p>}
                    {judgment.summary && <p className="text-foreground mb-3 line-clamp-3">{judgment.summary}</p>}
                    {judgment.verdict && <p className="text-sm font-medium text-primary mb-2">{t("judgments.verdict")}: {judgment.verdict}</p>}

                    {judgment.tags && judgment.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {judgment.tags.map((tag, i) => <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>)}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-xs text-muted-foreground">
                        {judgment.jurisdiction ? `${t("judgments.jurisdiction")}: ${judgment.jurisdiction}` : ""}
                      </div>
                      <Link to={`/judgments/${judgment.id}`}>
                        <Button variant="ghost" size="sm" className="text-primary">
                          {t("judgments.view_details")} <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {judgments.length === 0 && (
                <div className="text-center py-12">
                  <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t("judgments.no_results")}</p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-muted-foreground">
                  {t("common.showing")} {page * size + 1}–{Math.min((page + 1) * size, totalElements)} {t("common.of")} {totalElements}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page <= 0}>{t("common.previous")}</Button>
                  <span className="flex items-center px-4">{t("common.page")} {page + 1} {t("common.of")} {totalPages}</span>
                  <Button variant="outline" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>{t("common.next")}</Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Judgments;
