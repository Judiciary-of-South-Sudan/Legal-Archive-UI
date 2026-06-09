import { Calendar, FileText, BookOpen, Gavel, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useGetRecentJudgments } from "@/hooks/useJudgments";
import { useGetRecentLaws } from "@/hooks/useLaws";
import { useGetNotices } from "@/hooks/useNotices";
import { useGetLaws } from "@/hooks/useLaws";
import { useGetJudgments } from "@/hooks/useJudgments";
import { useTranslation } from "react-i18next";

const StatCard = ({ label, value, icon, href }: { label: string; value: number | undefined; icon: React.ReactNode; href: string }) => (
  <Link to={href} className="block group">
    <Card className="hover:shadow-md transition-shadow text-center">
      <CardContent className="p-6">
        <div className="flex justify-center mb-3 text-primary">{icon}</div>
        <div className="text-3xl font-bold text-foreground mb-1">
          {value === undefined ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : value.toLocaleString()}
        </div>
        <div className="text-sm text-muted-foreground group-hover:text-primary transition-colors">{label}</div>
      </CardContent>
    </Card>
  </Link>
);

const FeaturedSections = () => {
  const { t } = useTranslation();
  const { data: recentJudgments, isLoading: judgementsLoading } = useGetRecentJudgments(4);
  const { data: recentLaws, isLoading: lawsLoading } = useGetRecentLaws(4);
  const { data: recentNotices, isLoading: noticesLoading } = useGetNotices({ page: 0, size: 4, sort: "createdAt,desc" });

  const { data: lawStats } = useGetLaws({ page: 0, size: 1 });
  const { data: judgmentStats } = useGetJudgments({ page: 0, size: 1 });
  const { data: noticeStats } = useGetNotices({ page: 0, size: 1 });

  return (
    <section className="py-12 bg-secondary/30">
      <div className="container mx-auto px-4">

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <StatCard label={t("featured.laws_label")} value={lawStats?.totalElements} icon={<BookOpen className="h-8 w-8" />} href="/laws" />
          <StatCard label={t("featured.judgments_label")} value={judgmentStats?.totalElements} icon={<Gavel className="h-8 w-8" />} href="/judgments" />
          <StatCard label={t("featured.notices_label")} value={noticeStats?.totalElements} icon={<FileText className="h-8 w-8" />} href="/notices" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Recent Judgments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Gavel className="h-5 w-5 text-primary" />
                {t("featured.recent_judgments")}
              </CardTitle>
              <Link to="/judgments">
                <Button variant="ghost" size="sm" className="text-primary text-xs">
                  {t("featured.view_all")} <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {judgementsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : recentJudgments && recentJudgments.length > 0 ? (
                <div className="space-y-4">
                  {recentJudgments.map((j) => (
                    <div key={j.id} className="border-b border-border pb-3 last:border-b-0">
                      <Link to={`/judgments/${j.id}`} className="block hover:text-primary transition-colors">
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <h4 className="font-medium text-sm leading-tight flex-1">{j.caseName}</h4>
                          {j.courtLevel && <Badge variant="outline" className="text-xs shrink-0">{j.courtLevel}</Badge>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {j.courtName && <span>{j.courtName}</span>}
                          {j.judgmentDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(j.judgmentDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">{t("featured.no_judgments")}</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Laws */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-5 w-5 text-primary" />
                {t("featured.recent_laws")}
              </CardTitle>
              <Link to="/laws">
                <Button variant="ghost" size="sm" className="text-primary text-xs">
                  {t("featured.view_all")} <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {lawsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : recentLaws && recentLaws.length > 0 ? (
                <div className="space-y-4">
                  {recentLaws.map((law) => (
                    <div key={law.id} className="border-b border-border pb-3 last:border-b-0">
                      <Link to={`/laws/${law.id}`} className="block hover:text-primary transition-colors">
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <h4 className="font-medium text-sm leading-tight flex-1">{law.title}</h4>
                          {law.type && <Badge variant="secondary" className="text-xs shrink-0">{law.type}</Badge>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {law.year && <span>{law.year}</span>}
                          {law.status && <span className="text-green-700">{law.status}</span>}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">{t("featured.no_laws")}</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Legal Notices */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-primary" />
                {t("featured.recent_notices")}
              </CardTitle>
              <Link to="/notices">
                <Button variant="ghost" size="sm" className="text-primary text-xs">
                  {t("featured.view_all")} <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {noticesLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : recentNotices && recentNotices.content.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recentNotices.content.map((n) => (
                    <div key={n.id} className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                      <Link to={`/notices/${n.id}`} className="block">
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <h4 className="font-medium text-sm leading-tight flex-1">{n.title}</h4>
                          {n.type && <Badge variant="outline" className="text-xs shrink-0">{n.type}</Badge>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          {n.publicationDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(n.publicationDate).toLocaleDateString()}
                            </span>
                          )}
                          {n.status && (
                            <span className={n.status === 'Active' ? 'text-green-700' : 'text-muted-foreground'}>
                              {n.status}
                            </span>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">{t("featured.no_notices")}</p>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </section>
  );
};

export default FeaturedSections;
