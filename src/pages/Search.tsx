import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import apiClient from "@/lib/apiClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, Gavel, FileText, Calendar, Loader2, ChevronRight, ScrollText, SlidersHorizontal, X } from "lucide-react";
import { useSearchLaws } from "@/hooks/useLaws";
import { useSearchJudgments } from "@/hooks/useJudgments";
import { useSearchNotices } from "@/hooks/useNotices";
import { useSearchDecrees } from "@/hooks/useDecrees";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 20;

// Maps the Hero search-scope `type` param to a Search.tsx tab. "agreements" has no
// dedicated tab — peace agreements are modeled as Law records (type: Agreement/Treaty) —
// so it opens the "laws" tab, which is where they'll actually appear.
const TYPE_TO_TAB: Record<string, string> = {
  laws: "laws",
  judgments: "judgments",
  notices: "notices",
  decrees: "decrees",
  agreements: "laws",
};

const Pagination = ({ page, totalPages, onPrev, onNext, prevLabel, nextLabel, pageLabel, ofLabel }: {
  page: number; totalPages: number; onPrev: () => void; onNext: () => void;
  prevLabel: string; nextLabel: string; pageLabel: string; ofLabel: string;
}) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 pt-4">
      <Button variant="outline" size="sm" onClick={onPrev} disabled={page === 0}>{prevLabel}</Button>
      <span className="text-sm text-muted-foreground">{pageLabel} {page + 1} {ofLabel} {totalPages}</span>
      <Button variant="outline" size="sm" onClick={onNext} disabled={page >= totalPages - 1}>{nextLabel}</Button>
    </div>
  );
};

const SearchPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get("q") || "");
  const [lawsPage, setLawsPage] = useState(0);
  const [judgmentsPage, setJudgmentsPage] = useState(0);
  const [noticesPage, setNoticesPage] = useState(0);
  const [decreesPage, setDecreesPage] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [syntaxHelpOpen, setSyntaxHelpOpen] = useState(false);
  const [fromYear, setFromYear] = useState<number | undefined>();
  const [toYear, setToYear] = useState<number | undefined>();
  const [sort, setSort] = useState("relevance");
  const [activeTab, setActiveTab] = useState(TYPE_TO_TAB[searchParams.get("type") ?? ""] ?? "all");

  const query = searchParams.get("q") || "";
  const lastRecordedQuery = useRef("");

  const resetPages = () => {
    setLawsPage(0);
    setJudgmentsPage(0);
    setNoticesPage(0);
    setDecreesPage(0);
  };

  const clearFilters = () => {
    setFromYear(undefined);
    setToYear(undefined);
    setSort("relevance");
    resetPages();
  };

  useEffect(() => {
    setInputValue(query);
    resetPages();
    setActiveTab(TYPE_TO_TAB[searchParams.get("type") ?? ""] ?? "all");
  }, [query]);

  useEffect(() => {
    if (query && query !== lastRecordedQuery.current) {
      lastRecordedQuery.current = query;
      apiClient.post("/analytics/search", { query }).catch(() => {});
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    }
  };

  const lawsResult = useSearchLaws({ query, page: lawsPage, size: PAGE_SIZE, fromYear, toYear, sort });
  const judgmentsResult = useSearchJudgments({ query, page: judgmentsPage, size: PAGE_SIZE, fromYear, toYear, sort });
  const noticesResult = useSearchNotices({ query, page: noticesPage, size: PAGE_SIZE, fromYear, toYear, sort });
  const decreesResult = useSearchDecrees({ query, page: decreesPage, size: PAGE_SIZE, fromYear, toYear, sort });

  const activeFilterCount = [fromYear, toYear].filter(Boolean).length + (sort !== "relevance" ? 1 : 0);

  const lawsCount = lawsResult.data?.totalElements ?? 0;
  const judgmentsCount = judgmentsResult.data?.totalElements ?? 0;
  const noticesCount = noticesResult.data?.totalElements ?? 0;
  const decreesCount = decreesResult.data?.totalElements ?? 0;
  const totalCount = lawsCount + judgmentsCount + noticesCount + decreesCount;

  const lawsTotalPages = lawsResult.data?.totalPages ?? 1;
  const judgmentsTotalPages = judgmentsResult.data?.totalPages ?? 1;
  const noticesTotalPages = noticesResult.data?.totalPages ?? 1;
  const decreesTotalPages = decreesResult.data?.totalPages ?? 1;

  const isLoading = lawsResult.isLoading || judgmentsResult.isLoading || noticesResult.isLoading || decreesResult.isLoading;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">

        <div className="max-w-2xl mb-8">
          <h1 className="text-2xl font-bold mb-4">{t("search.page_title")}</h1>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t("search.placeholder")}
                className="ps-10"
                type="search"
                enterKeyHint="search"
                autoComplete="off"
              />
            </div>
            <Button type="submit">{t("search.btn")}</Button>
            <Button
              type="button"
              variant={filtersOpen || activeFilterCount > 0 ? "secondary" : "outline"}
              size="icon"
              onClick={() => setFiltersOpen((o) => !o)}
              aria-label={t("searchbar.filters")}
              className="relative shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -end-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </form>

          {filtersOpen && (
            <div className="mt-3 flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">{t("search.from_year")}</label>
                <Input
                  type="number"
                  min={1900}
                  max={2099}
                  value={fromYear ?? ""}
                  onChange={(e) => {
                    setFromYear(e.target.value ? Number(e.target.value) : undefined);
                    resetPages();
                  }}
                  className="w-24 h-8 text-sm"
                  placeholder="1900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">{t("search.to_year")}</label>
                <Input
                  type="number"
                  min={1900}
                  max={2099}
                  value={toYear ?? ""}
                  onChange={(e) => {
                    setToYear(e.target.value ? Number(e.target.value) : undefined);
                    resetPages();
                  }}
                  className="w-24 h-8 text-sm"
                  placeholder="2099"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">{t("search.sort")}</label>
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); resetPages(); }}
                  className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="relevance">{t("search.sort_relevance")}</option>
                  <option value="newest">{t("search.sort_newest")}</option>
                  <option value="oldest">{t("search.sort_oldest")}</option>
                </select>
              </div>
              {activeFilterCount > 0 && (
                <Button type="button" variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1">
                  <X className="h-3 w-3" />
                  {t("searchbar.clear_all")}
                </Button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setSyntaxHelpOpen((o) => !o)}
            className="mt-2 text-xs text-muted-foreground hover:text-primary underline-offset-2 hover:underline"
          >
            Advanced search syntax
          </button>
          {syntaxHelpOpen && (
            <div className="mt-1.5 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
              <p><code className="font-mono text-foreground">"exact phrase"</code> — match an exact phrase</p>
              <p><code className="font-mono text-foreground">land OR water</code> — match either term</p>
              <p><code className="font-mono text-foreground">-customary</code> or <code className="font-mono text-foreground">NOT customary</code> — exclude a term</p>
              <p><code className="font-mono text-foreground">title:constitution</code> — restrict a term to one field</p>
              <p>Combine freely, e.g. <code className="font-mono text-foreground">title:"land act" -repealed</code></p>
            </div>
          )}
        </div>

        {!query ? (
          <div className="text-center py-16">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">{t("search.empty_prompt")}</p>
          </div>
        ) : (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary me-3" />
                <span className="text-muted-foreground">{t("search.loading")}</span>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-6">
                  {totalCount} {totalCount !== 1 ? t("search.results_plural") : t("search.results_singular")}{" "}
                  <span className="font-semibold text-foreground">"{query}"</span>
                </p>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-6 flex w-full overflow-x-auto no-scrollbar gap-0">
                    <TabsTrigger value="all" className="flex-none sm:flex-1 whitespace-nowrap gap-1.5">
                      {t("search.tab_all")} <Badge variant="secondary" className="ms-1.5">{totalCount}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="laws" className="flex-none sm:flex-1 whitespace-nowrap gap-1.5">
                      {t("search.tab_laws")} <Badge variant="secondary" className="ms-1.5">{lawsCount}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="judgments" className="flex-none sm:flex-1 whitespace-nowrap gap-1.5">
                      {t("search.tab_judgments")} <Badge variant="secondary" className="ms-1.5">{judgmentsCount}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="notices" className="flex-none sm:flex-1 whitespace-nowrap gap-1.5">
                      {t("search.tab_notices")} <Badge variant="secondary" className="ms-1.5">{noticesCount}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="decrees" className="flex-none sm:flex-1 whitespace-nowrap gap-1.5">
                      {t("search.tab_decrees")} <Badge variant="secondary" className="ms-1.5">{decreesCount}</Badge>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-3">
                    {totalCount === 0 && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">{t("search.no_results", { query })}</p>
                        <p className="text-sm text-muted-foreground mt-2">{t("search.no_results_hint")}</p>
                      </div>
                    )}

                    {lawsResult.data?.content.slice(0, 5).map((law) => (
                      <ResultCard
                        key={law.id}
                        href={`/laws/${law.id}`}
                        icon={<BookOpen className="h-4 w-4" />}
                        type={t("search.type_law")}
                        typeColor="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                        title={law.title}
                        meta={[law.type, law.year?.toString(), law.status].filter(Boolean) as string[]}
                        summary={law.summary}
                        date={law.enactmentDate}
                      />
                    ))}

                    {judgmentsResult.data?.content.slice(0, 5).map((j) => (
                      <ResultCard
                        key={j.id}
                        href={`/judgments/${j.id}`}
                        icon={<Gavel className="h-4 w-4" />}
                        type={t("search.type_judgment")}
                        typeColor="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
                        title={j.caseName}
                        meta={[j.courtLevel, j.caseType, j.status].filter(Boolean) as string[]}
                        summary={j.summary}
                        date={j.judgmentDate}
                      />
                    ))}

                    {noticesResult.data?.content.slice(0, 5).map((n) => (
                      <ResultCard
                        key={n.id}
                        href={`/notices/${n.id}`}
                        icon={<FileText className="h-4 w-4" />}
                        type={t("search.type_notice")}
                        typeColor="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
                        title={n.title}
                        meta={[n.type, n.status].filter(Boolean) as string[]}
                        summary={n.summary}
                        date={n.publicationDate}
                      />
                    ))}

                    {decreesResult.data?.content.slice(0, 5).map((d) => (
                      <ResultCard
                        key={d.id}
                        href={`/decrees/${d.id}`}
                        icon={<ScrollText className="h-4 w-4" />}
                        type={t("search.type_decree")}
                        typeColor="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100"
                        title={d.title}
                        meta={[d.decreeType, d.year?.toString()].filter(Boolean) as string[]}
                        summary={d.subject}
                        date={d.decreeDate}
                        subTitle={d.decreeNumber}
                      />
                    ))}

                    {(lawsCount > 5 || judgmentsCount > 5 || noticesCount > 5 || decreesCount > 5) && (
                      <p className="text-sm text-muted-foreground text-center pt-2">
                        {t("search.top_5_hint")}
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent value="laws" className="space-y-3">
                    {lawsResult.isLoading ? (
                      <Loading />
                    ) : lawsResult.data?.content.length === 0 ? (
                      <Empty message={t("search.no_laws", { query })} />
                    ) : (
                      <>
                        {lawsResult.data?.content.map((law) => (
                          <ResultCard
                            key={law.id}
                            href={`/laws/${law.id}`}
                            icon={<BookOpen className="h-4 w-4" />}
                            type={t("search.type_law")}
                            typeColor="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                            title={law.title}
                            meta={[law.type, law.year?.toString(), law.category, law.status].filter(Boolean) as string[]}
                            summary={law.summary}
                            date={law.enactmentDate}
                          />
                        ))}
                        <Pagination page={lawsPage} totalPages={lawsTotalPages} onPrev={() => setLawsPage(p => p - 1)} onNext={() => setLawsPage(p => p + 1)} prevLabel={t('common.previous')} nextLabel={t('common.next')} pageLabel={t('common.page')} ofLabel={t('common.of')} />
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="judgments" className="space-y-3">
                    {judgmentsResult.isLoading ? (
                      <Loading />
                    ) : judgmentsResult.data?.content.length === 0 ? (
                      <Empty message={t("search.no_judgments", { query })} />
                    ) : (
                      <>
                        {judgmentsResult.data?.content.map((j) => (
                          <ResultCard
                            key={j.id}
                            href={`/judgments/${j.id}`}
                            icon={<Gavel className="h-4 w-4" />}
                            type={t("search.type_judgment")}
                            typeColor="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
                            title={j.caseName}
                            meta={[j.courtLevel, j.courtName, j.caseType, j.verdict].filter(Boolean) as string[]}
                            summary={j.summary}
                            date={j.judgmentDate}
                            subTitle={j.caseNumber}
                          />
                        ))}
                        <Pagination page={judgmentsPage} totalPages={judgmentsTotalPages} onPrev={() => setJudgmentsPage(p => p - 1)} onNext={() => setJudgmentsPage(p => p + 1)} prevLabel={t('common.previous')} nextLabel={t('common.next')} pageLabel={t('common.page')} ofLabel={t('common.of')} />
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="notices" className="space-y-3">
                    {noticesResult.isLoading ? (
                      <Loading />
                    ) : noticesResult.data?.content.length === 0 ? (
                      <Empty message={t("search.no_notices", { query })} />
                    ) : (
                      <>
                        {noticesResult.data?.content.map((n) => (
                          <ResultCard
                            key={n.id}
                            href={`/notices/${n.id}`}
                            icon={<FileText className="h-4 w-4" />}
                            type={t("search.type_notice")}
                            typeColor="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
                            title={n.title}
                            meta={[n.type, n.issuingAuthority, n.status].filter(Boolean) as string[]}
                            summary={n.summary}
                            date={n.publicationDate}
                            subTitle={n.noticeNumber}
                          />
                        ))}
                        <Pagination page={noticesPage} totalPages={noticesTotalPages} onPrev={() => setNoticesPage(p => p - 1)} onNext={() => setNoticesPage(p => p + 1)} prevLabel={t('common.previous')} nextLabel={t('common.next')} pageLabel={t('common.page')} ofLabel={t('common.of')} />
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="decrees" className="space-y-3">
                    {decreesResult.isLoading ? (
                      <Loading />
                    ) : decreesResult.data?.content.length === 0 ? (
                      <Empty message={t("search.no_decrees", { query })} />
                    ) : (
                      <>
                        {decreesResult.data?.content.map((d) => (
                          <ResultCard
                            key={d.id}
                            href={`/decrees/${d.id}`}
                            icon={<ScrollText className="h-4 w-4" />}
                            type={t("search.type_decree")}
                            typeColor="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100"
                            title={d.title}
                            meta={[d.decreeType, d.year?.toString(), d.issuedBy].filter(Boolean) as string[]}
                            summary={d.subject}
                            date={d.decreeDate}
                            subTitle={d.decreeNumber}
                          />
                        ))}
                        <Pagination page={decreesPage} totalPages={decreesTotalPages} onPrev={() => setDecreesPage(p => p - 1)} onNext={() => setDecreesPage(p => p + 1)} prevLabel={t('common.previous')} nextLabel={t('common.next')} pageLabel={t('common.page')} ofLabel={t('common.of')} />
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

interface ResultCardProps {
  href: string;
  icon: React.ReactNode;
  type: string;
  typeColor: string;
  title: string;
  meta: string[];
  summary?: string;
  date?: string;
  subTitle?: string;
}

const ResultCard = ({ href, icon, type, typeColor, title, meta, summary, date, subTitle }: ResultCardProps) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${typeColor}`}>
              {icon}{type}
            </span>
            {meta.slice(0, 3).map((m, i) => (
              <Badge key={i} variant="outline" className="text-xs">{m}</Badge>
            ))}
          </div>
          <Link to={href} className="block hover:text-primary transition-colors">
            <h3 className="font-semibold text-foreground leading-snug">{title}</h3>
            {subTitle && <p className="text-xs text-muted-foreground mt-0.5">{subTitle}</p>}
          </Link>
          {summary && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{summary}</p>}
          {date && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(date).toLocaleDateString()}
            </p>
          )}
        </div>
        <Link to={href} className="shrink-0 mt-1">
          <Button variant="ghost" size="icon" className="h-11 w-11">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </CardContent>
  </Card>
);

const Loading = () => (
  <div className="flex justify-center py-10">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

const Empty = ({ message }: { message: string }) => (
  <div className="text-center py-10">
    <p className="text-muted-foreground">{message}</p>
  </div>
);

export default SearchPage;
