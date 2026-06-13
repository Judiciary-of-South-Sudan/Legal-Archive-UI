import { useState } from "react";
import { resolveFileUrl } from "@/lib/apiClient";
import { Download, Calendar, Gavel, Loader2, SlidersHorizontal, X } from "lucide-react";
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
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1 md:text-3xl md:mb-4">{t("judgments.page_title")}</h1>
          <p className="text-muted-foreground text-sm md:text-base">{t("judgments.page_subtitle")}</p>
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
                type="search"
                enterKeyHint="search"
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
            <div className="divide-y divide-border border border-border rounded-md bg-card">
              {judgments.map((judgment, idx) => (
                <div key={judgment.id || idx} className="flex items-start gap-4 px-4 py-3 hover:bg-secondary/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <Link to={`/judgments/${judgment.id}`} className="text-sm font-semibold text-foreground hover:text-primary leading-snug block">
                      {judgment.caseName}
                    </Link>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      {judgment.courtLevel && <Badge variant="secondary" className="h-5 text-xs">{judgment.courtLevel}</Badge>}
                      {judgment.caseType && <Badge variant="outline" className="h-5 text-xs">{judgment.caseType}</Badge>}
                      {judgment.caseNumber && <span className="font-mono">{judgment.caseNumber}</span>}
                      {judgment.judgmentDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />{new Date(judgment.judgmentDate).toLocaleDateString()}
                        </span>
                      )}
                      {judgment.courtName && <span>{judgment.courtName}</span>}
                      {judgment.status && (
                        <span className="font-medium text-green-700 dark:text-green-400">{judgment.status}</span>
                      )}
                      {isAdmin && judgment.id
                        ? <DocStatusDropdown id={judgment.id} collection="judgments" current={judgment.verificationStatus || 'DRAFT'} onChanged={() => activeQuery.refetch()} />
                        : verificationBadge(judgment.verificationStatus)
                      }
                    </div>
                    {judgment.parties && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{judgment.parties}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <Link to={`/judgments/${judgment.id}`}>
                      <Button size="sm" variant="ghost" className="h-10 px-3 text-xs sm:h-7 sm:px-2">{t("judgments.view")}</Button>
                    </Link>
                    {judgment.pdfUrl && (
                      <Button size="sm" variant="ghost" className="h-10 px-3 text-xs sm:h-7 sm:px-2" asChild>
                        <a href={resolveFileUrl(judgment.pdfUrl)} target="_blank" rel="noreferrer">
                          <Download className="h-3 w-3 me-1" /> PDF
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {judgments.length === 0 && (
                <div className="text-center py-12">
                  <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t("judgments.no_results")}</p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col gap-2 mt-8 sm:flex-row sm:items-center sm:justify-between">
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
      </main>
      <Footer />
    </div>
  );
};

export default Judgments;
