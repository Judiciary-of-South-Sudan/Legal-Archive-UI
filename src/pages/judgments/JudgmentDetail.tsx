import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Gavel, Download, ExternalLink, Pencil, Users, FileText, Loader2, Copy, Check, Bookmark, BookmarkCheck } from 'lucide-react';
import { useGetJudgmentById, useIncrementJudgmentView } from '@/hooks/useJudgments';
import { resolveFileUrl } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { useIsBookmarked, useToggleBookmark } from '@/hooks/useBookmarks';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const JudgmentDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: judgment, isLoading, error } = useGetJudgmentById(id || '');
  const { mutate: incrementView } = useIncrementJudgmentView();
  const { isAdmin, isAuthenticated } = useAuth();
  const countedViewForId = useRef<string | null>(null);
  const [citationCopied, setCitationCopied] = useState(false);
  const { data: bookmarked } = useIsBookmarked(id || '');
  const { mutate: toggleBookmark, isPending: bookmarkPending } = useToggleBookmark();

  const copyCitation = () => {
    if (!judgment) return;
    const parts = [judgment.caseName];
    if (judgment.caseNumber) parts.push(`(${judgment.caseNumber})`);
    if (judgment.judgmentDate) parts.push(String(new Date(judgment.judgmentDate).getFullYear()));
    if (judgment.courtName) parts.push(judgment.courtName);
    parts.push(window.location.href);
    navigator.clipboard.writeText(parts.join(', '));
    setCitationCopied(true);
    toast.success(t('common.citation_copied'));
    setTimeout(() => setCitationCopied(false), 2000);
  };

  useEffect(() => {
    if (id && countedViewForId.current !== id) {
      countedViewForId.current = id;
      incrementView(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">{t('judgments.loading_detail')}</span>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !judgment) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold">{t('judgments.not_found')}</h2>
              <p className="text-muted-foreground mt-2">{t('judgments.not_found_desc')}</p>
              <div className="mt-4">
                <Link to="/judgments">
                  <Button variant="outline">{t('judgments.back')}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const pdfUrl = resolveFileUrl(judgment.pdfUrl);

  const statusColor =
    judgment.status === 'Final'
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      : judgment.status === 'Overturned'
      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {judgment.courtLevel && <Badge variant="secondary">{judgment.courtLevel}</Badge>}
              {judgment.caseType && <Badge variant="outline">{judgment.caseType}</Badge>}
              {judgment.status && <Badge className={statusColor}>{judgment.status}</Badge>}
              {judgment.verdict && (
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                  {judgment.verdict}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-4">{judgment.caseName}</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-muted-foreground mb-5">
              {judgment.caseNumber && (
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0" />
                  {t('judgments.case_number')}: <span className="text-foreground font-medium">{judgment.caseNumber}</span>
                </span>
              )}
              {judgment.judgmentDate && (
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0" />
                  {t('judgments.date')}: <span className="text-foreground">{new Date(judgment.judgmentDate).toLocaleDateString()}</span>
                </span>
              )}
              {judgment.courtName && (
                <span className="flex items-center gap-2">
                  <Gavel className="h-4 w-4 shrink-0" />
                  {t('judgments.court')}: <span className="text-foreground">{judgment.courtName}</span>
                </span>
              )}
              {judgment.parties && (
                <span className="flex items-center gap-2 sm:col-span-2">
                  <Users className="h-4 w-4 shrink-0" />
                  {t('judgments.parties')}: <span className="text-foreground">{judgment.parties}</span>
                </span>
              )}
              {judgment.judges && judgment.judges.length > 0 && (
                <span className="flex items-center gap-2 sm:col-span-2">
                  <Users className="h-4 w-4 shrink-0" />
                  {t('judgments.judges')}: <span className="text-foreground">{judgment.judges.join(', ')}</span>
                </span>
              )}
              {judgment.jurisdiction && (
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0" />
                  {t('judgments.jurisdiction')}: <span className="text-foreground">{judgment.jurisdiction}</span>
                </span>
              )}
            </div>

            {judgment.summary && (
              <p className="text-foreground mb-5 leading-relaxed">{judgment.summary}</p>
            )}

            {judgment.tags && judgment.tags.length > 0 && (
              <div className="mb-5">
                <h4 className="text-sm font-semibold mb-2">{t('judgments.tags')}</h4>
                <div className="flex flex-wrap gap-2">
                  {judgment.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-muted px-2 py-1 rounded">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {judgment.citedLaws && judgment.citedLaws.length > 0 && (
              <div className="mb-5">
                <h4 className="text-sm font-semibold mb-2">{t('judgments.cited_laws')}</h4>
                <div className="flex flex-wrap gap-2">
                  {judgment.citedLaws.map((lawId) => (
                    <Link key={lawId} to={`/laws/${lawId}`}>
                      <Badge variant="outline" className="cursor-pointer hover:bg-muted">{lawId}</Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {judgment.citedCases && judgment.citedCases.length > 0 && (
              <div className="mb-5">
                <h4 className="text-sm font-semibold mb-2">{t('judgments.cited_cases')}</h4>
                <div className="flex flex-wrap gap-2">
                  {judgment.citedCases.map((caseId) => (
                    <Link key={caseId} to={`/judgments/${caseId}`}>
                      <Badge variant="outline" className="cursor-pointer hover:bg-muted">{caseId}</Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {pdfUrl ? (
                <>
                  <Button asChild>
                    <Link to={`/judgments/${id}/document`}>
                      <ExternalLink className="h-4 w-4 mr-1" /> {t('judgments.view_document')}
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={pdfUrl} target="_blank" rel="noreferrer" download>
                      <Download className="h-4 w-4 mr-1" /> {t('laws.download_pdf')}
                    </a>
                  </Button>
                </>
              ) : (
                <Button variant="outline" disabled>{t('judgments.no_pdf')}</Button>
              )}
              {isAuthenticated && (
                <Button
                  variant={bookmarked ? 'default' : 'outline'}
                  onClick={() => toggleBookmark({ documentId: id!, documentType: 'JUDGMENT', title: judgment.caseName })}
                  disabled={bookmarkPending}
                >
                  {bookmarked ? <BookmarkCheck className="h-4 w-4 mr-1" /> : <Bookmark className="h-4 w-4 mr-1" />}
                  {bookmarked ? t('common.bookmarked') : t('common.bookmark')}
                </Button>
              )}
              <Button variant="outline" onClick={copyCitation}>
                {citationCopied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {citationCopied ? t('common.citation_copied') : t('common.copy_citation')}
              </Button>
              {isAdmin() && (
                <Link to={`/admin/edit-judgment/${id}`}>
                  <Button variant="outline">
                    <Pencil className="h-4 w-4 mr-1" /> {t('common.edit')}
                  </Button>
                </Link>
              )}
              <Link to="/judgments">
                <Button variant="ghost">{t('judgments.back')}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default JudgmentDetail;
