import { BookOpen, Calendar, ChevronRight, FileText, Gavel, Loader2, ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useGetLaws, useGetRecentLaws } from "@/hooks/useLaws";
import { useGetJudgments, useGetRecentJudgments } from "@/hooks/useJudgments";
import { useGetNotices } from "@/hooks/useNotices";
import { useGetDecrees, useGetRecentDecrees } from "@/hooks/useDecrees";
import { useTranslation } from "react-i18next";

const StatBlock = ({
  label,
  value,
  href,
}: {
  label: string;
  value: number | undefined;
  href: string;
}) => (
  <Link to={href} className="archive-card block rounded-md p-5 transition-colors hover:border-primary">
    <span className="text-sm font-medium text-muted-foreground">{label}</span>
    <div className="mt-2 text-3xl font-bold text-foreground">
      {value === undefined ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : value.toLocaleString()}
    </div>
  </Link>
);

const EmptyState = ({ label }: { label: string }) => (
  <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{label}</p>
);

const FeaturedSections = () => {
  const { t } = useTranslation();
  const { data: recentJudgments, isLoading: judgementsLoading } = useGetRecentJudgments(5);
  const { data: recentLaws, isLoading: lawsLoading } = useGetRecentLaws(5);
  const { data: recentNotices, isLoading: noticesLoading } = useGetNotices({ page: 0, size: 5, sort: "createdAt,desc" });
  const { data: recentDecrees, isLoading: decreesLoading } = useGetRecentDecrees(5);
  const { data: lawStats } = useGetLaws({ page: 0, size: 1 });
  const { data: judgmentStats } = useGetJudgments({ page: 0, size: 1 });
  const { data: noticeStats } = useGetNotices({ page: 0, size: 1 });
  const { data: decreeStats } = useGetDecrees({ page: 0, size: 1 });

  return (
    <section className="bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <span className="archive-section-label">{t("featured.archive_overview")}</span>
            <h2 className="mt-2 text-2xl font-bold text-foreground md:text-3xl">{t("featured.latest_records")}</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {t("featured.latest_records_desc")}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/search">
              {t("featured.search_archive")} <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatBlock label={t("featured.laws_label")} value={lawStats?.totalElements} href="/laws" />
          <StatBlock label={t("featured.judgments_label")} value={judgmentStats?.totalElements} href="/judgments" />
          <StatBlock label={t("featured.notices_label")} value={noticeStats?.totalElements} href="/notices" />
          <StatBlock label={t("featured.decrees_label")} value={decreeStats?.totalElements} href="/decrees" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <div className="archive-card rounded-md">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="flex items-center gap-2 font-semibold">
                <BookOpen className="h-5 w-5 text-primary" />
                {t("featured.recent_laws")}
              </h3>
              <Link to="/laws" className="text-sm font-semibold text-primary hover:underline">
                {t("featured.view_all")}
              </Link>
            </div>
            <div className="p-4">
              {lawsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : recentLaws && recentLaws.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentLaws.map((law) => (
                    <Link key={law.id} to={`/laws/${law.id}`} className="block py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-sm font-semibold leading-6 text-foreground hover:text-primary">{law.title}</h4>
                        {law.type && <Badge variant="secondary" className="shrink-0">{law.type}</Badge>}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {law.year && <span>{law.year}</span>}
                        {law.status && <span className="font-medium text-green-700 dark:text-green-300">{law.status}</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState label={t("featured.no_laws")} />
              )}
            </div>
          </div>

          <div className="archive-card rounded-md">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="flex items-center gap-2 font-semibold">
                <Gavel className="h-5 w-5 text-primary" />
                {t("featured.recent_judgments")}
              </h3>
              <Link to="/judgments" className="text-sm font-semibold text-primary hover:underline">
                {t("featured.view_all")}
              </Link>
            </div>
            <div className="p-4">
              {judgementsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : recentJudgments && recentJudgments.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentJudgments.map((judgment) => (
                    <Link key={judgment.id} to={`/judgments/${judgment.id}`} className="block py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-sm font-semibold leading-6 text-foreground hover:text-primary">{judgment.caseName}</h4>
                        {judgment.courtLevel && <Badge variant="outline" className="shrink-0">{judgment.courtLevel}</Badge>}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {judgment.courtName && <span>{judgment.courtName}</span>}
                        {judgment.judgmentDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(judgment.judgmentDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState label={t("featured.no_judgments")} />
              )}
            </div>
          </div>

          <div className="archive-card rounded-md">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="flex items-center gap-2 font-semibold">
                <FileText className="h-5 w-5 text-primary" />
                {t("featured.recent_notices")}
              </h3>
              <Link to="/notices" className="text-sm font-semibold text-primary hover:underline">
                {t("featured.view_all")}
              </Link>
            </div>
            <div className="p-4">
              {noticesLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : recentNotices && recentNotices.content.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentNotices.content.map((notice) => (
                    <Link key={notice.id} to={`/notices/${notice.id}`} className="block py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-sm font-semibold leading-6 text-foreground hover:text-primary">{notice.title}</h4>
                        {notice.type && <Badge variant="outline" className="shrink-0">{notice.type}</Badge>}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {notice.publicationDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(notice.publicationDate).toLocaleDateString()}
                          </span>
                        )}
                        {notice.status && <span className="font-medium text-green-700 dark:text-green-300">{notice.status}</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState label={t("featured.no_notices")} />
              )}
            </div>
          </div>

          <div className="archive-card rounded-md">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="flex items-center gap-2 font-semibold">
                <ScrollText className="h-5 w-5 text-primary" />
                {t("featured.recent_decrees")}
              </h3>
              <Link to="/decrees" className="text-sm font-semibold text-primary hover:underline">
                {t("featured.view_all")}
              </Link>
            </div>
            <div className="p-4">
              {decreesLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : recentDecrees && recentDecrees.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentDecrees.map((decree) => (
                    <Link key={decree.id} to={`/decrees/${decree.id}`} className="block py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-sm font-semibold leading-6 text-foreground hover:text-primary">{decree.title}</h4>
                        {decree.decreeType && <Badge variant="outline" className="shrink-0 text-xs">{decree.decreeType}</Badge>}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {decree.decreeDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(decree.decreeDate).toLocaleDateString()}
                          </span>
                        )}
                        {decree.decreeNumber && <span>{decree.decreeNumber}</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState label={t("featured.no_decrees")} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSections;
