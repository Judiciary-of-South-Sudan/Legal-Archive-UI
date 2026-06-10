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
import { Search, BookOpen, Gavel, FileText, Calendar, Loader2, ChevronRight } from "lucide-react";
import { useSearchLaws } from "@/hooks/useLaws";
import { useSearchJudgments } from "@/hooks/useJudgments";
import { useSearchNotices } from "@/hooks/useNotices";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 20;

const Pagination = ({ page, totalPages, onPrev, onNext }: { page: number; totalPages: number; onPrev: () => void; onNext: () => void }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 pt-4">
      <Button variant="outline" size="sm" onClick={onPrev} disabled={page === 0}>Previous</Button>
      <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
      <Button variant="outline" size="sm" onClick={onNext} disabled={page >= totalPages - 1}>Next</Button>
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

  const query = searchParams.get("q") || "";
  const lastRecordedQuery = useRef("");

  useEffect(() => {
    setInputValue(query);
    setLawsPage(0);
    setJudgmentsPage(0);
    setNoticesPage(0);
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

  const lawsResult = useSearchLaws({ query, page: lawsPage, size: PAGE_SIZE });
  const judgmentsResult = useSearchJudgments({ query, page: judgmentsPage, size: PAGE_SIZE });
  const noticesResult = useSearchNotices({ query, page: noticesPage, size: PAGE_SIZE });

  const lawsCount = lawsResult.data?.totalElements ?? 0;
  const judgmentsCount = judgmentsResult.data?.totalElements ?? 0;
  const noticesCount = noticesResult.data?.totalElements ?? 0;
  const totalCount = lawsCount + judgmentsCount + noticesCount;

  const lawsTotalPages = lawsResult.data?.totalPages ?? 1;
  const judgmentsTotalPages = judgmentsResult.data?.totalPages ?? 1;
  const noticesTotalPages = noticesResult.data?.totalPages ?? 1;

  const isLoading = lawsResult.isLoading || judgmentsResult.isLoading || noticesResult.isLoading;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">

        <div className="max-w-2xl mb-8">
          <h1 className="text-2xl font-bold mb-4">{t("search.page_title")}</h1>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t("search.placeholder")}
                className="pl-10"
              />
            </div>
            <Button type="submit">{t("search.btn")}</Button>
          </form>
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
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
                <span className="text-muted-foreground">{t("search.loading")}</span>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-6">
                  {totalCount} {totalCount !== 1 ? t("search.results_plural") : t("search.results_singular")}{" "}
                  <span className="font-semibold text-foreground">"{query}"</span>
                </p>

                <Tabs defaultValue="all">
                  <TabsList className="mb-6">
                    <TabsTrigger value="all">
                      {t("search.tab_all")} <Badge variant="secondary" className="ml-2">{totalCount}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="laws">
                      {t("search.tab_laws")} <Badge variant="secondary" className="ml-2">{lawsCount}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="judgments">
                      {t("search.tab_judgments")} <Badge variant="secondary" className="ml-2">{judgmentsCount}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="notices">
                      {t("search.tab_notices")} <Badge variant="secondary" className="ml-2">{noticesCount}</Badge>
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

                    {(lawsCount > 5 || judgmentsCount > 5 || noticesCount > 5) && (
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
                        <Pagination page={lawsPage} totalPages={lawsTotalPages} onPrev={() => setLawsPage(p => p - 1)} onNext={() => setLawsPage(p => p + 1)} />
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
                        <Pagination page={judgmentsPage} totalPages={judgmentsTotalPages} onPrev={() => setJudgmentsPage(p => p - 1)} onNext={() => setJudgmentsPage(p => p + 1)} />
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
                        <Pagination page={noticesPage} totalPages={noticesTotalPages} onPrev={() => setNoticesPage(p => p - 1)} onNext={() => setNoticesPage(p => p + 1)} />
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
          <Button variant="ghost" size="icon" className="h-8 w-8">
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
