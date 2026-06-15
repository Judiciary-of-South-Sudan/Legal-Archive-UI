import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
const PdfViewer = React.lazy(() => import('@/components/PdfViewer'));
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Gavel, Download, Pencil, Users, FileText, Loader2, Copy, Check, Bookmark, BookmarkCheck, ChevronRight, Printer, Send } from 'lucide-react';
import { useGetJudgmentById, useIncrementJudgmentView, useIncrementJudgmentDownload, judgmentKeys } from '@/hooks/useJudgments';
import { resolveFileUrl } from '@/lib/apiClient';
import apiClient from '@/lib/apiClient';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useIsBookmarked, useToggleBookmark } from '@/hooks/useBookmarks';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useBandwidth } from '@/contexts/BandwidthContext';
import LowBandwidthBanner from '@/components/LowBandwidthBanner';

const JudgmentDetail: React.FC = () => {
  const { t } = useTranslation();
  const { lowBandwidth } = useBandwidth();
  const { id } = useParams<{ id: string }>();
  const { data: judgment, isLoading, error } = useGetJudgmentById(id || '');
  const { mutate: incrementView } = useIncrementJudgmentView();
  const { mutate: trackDownload } = useIncrementJudgmentDownload();
  const { isAdmin, isEditor, isAuthenticated } = useAuth();
  const countedViewForId = useRef<string | null>(null);
  const [citationCopied, setCitationCopied] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [submitPending, setSubmitPending] = useState(false);
  const queryClient = useQueryClient();
  const [citedLawTitles, setCitedLawTitles] = useState<Record<string, string>>({});
  const [citedCaseTitles, setCitedCaseTitles] = useState<Record<string, string>>({});
  const [casesCircitedBy, setCasesCircitedBy] = useState<any[]>([]);

  useEffect(() => {
    if (!judgment?.citedLaws?.length) return;
    Promise.allSettled(judgment.citedLaws.map((lawId: string) => apiClient.get(`/laws/${lawId}`))).then(results => {
      const map: Record<string, string> = {};
      results.forEach((r, i) => {
        map[judgment.citedLaws[i]] = r.status === 'fulfilled' ? (r.value.data?.data?.title ?? judgment.citedLaws[i]) : judgment.citedLaws[i];
      });
      setCitedLawTitles(map);
    });
  }, [judgment?.citedLaws?.join(',')]);

  useEffect(() => {
    if (!judgment?.citedCases?.length) return;
    Promise.allSettled(judgment.citedCases.map((caseId: string) => apiClient.get(`/judgments/${caseId}`))).then(results => {
      const map: Record<string, string> = {};
      results.forEach((r, i) => {
        map[judgment.citedCases[i]] = r.status === 'fulfilled' ? (r.value.data?.data?.caseName ?? judgment.citedCases[i]) : judgment.citedCases[i];
      });
      setCitedCaseTitles(map);
    });
  }, [judgment?.citedCases?.join(',')]);

  useEffect(() => {
    if (!id) return;
    apiClient.get(`/judgments/${id}/cited-by`).then(res => {
      setCasesCircitedBy(res.data?.data ?? []);
    }).catch(() => {});
  }, [id]);

  const { data: bookmarked } = useIsBookmarked(id || '');
  const { mutate: toggleBookmark, isPending: bookmarkPending } = useToggleBookmark();

  const handleSubmitForReview = async () => {
    if (!id) return;
    setSubmitPending(true);
    try {
      await apiClient.put(`/editor/judgments/${id}/submit`);
      toast.success('Submitted for review');
      queryClient.invalidateQueries({ queryKey: judgmentKeys.detail(id) });
    } catch {
      toast.error('Failed to submit for review');
    } finally {
      setSubmitPending(false);
    }
  };

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
          <span className="ms-2">{t('judgments.loading_detail')}</span>
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
          <div className="archive-card rounded-md p-6">
            <h2 className="text-xl font-semibold">{t('judgments.not_found')}</h2>
            <p className="text-muted-foreground mt-2">{t('judgments.not_found_desc')}</p>
            <div className="mt-4">
              <Link to="/judgments"><Button variant="outline">{t('judgments.back')}</Button></Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const pdfUrl = resolveFileUrl(judgment.pdfUrl);
  const defaultTab = pdfUrl && !lowBandwidth ? 'pdf' : judgment.fullText ? 'text' : 'metadata';

  const statusColor =
    judgment.status === 'Final' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    : judgment.status === 'Overturned' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-4 max-w-5xl">
        <LowBandwidthBanner />
        <nav className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">{t('common.home')}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/judgments" className="hover:text-primary">{t('nav.judgments')}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground truncate max-w-[16ch] sm:max-w-[40ch]">{judgment.caseName}</span>
        </nav>

        <div className="archive-card rounded-md p-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {judgment.courtLevel && <Badge variant="secondary">{judgment.courtLevel}</Badge>}
            {judgment.caseType && <Badge variant="outline">{judgment.caseType}</Badge>}
            {judgment.status && <Badge className={statusColor}>{judgment.status}</Badge>}
            {judgment.verdict && (
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">{judgment.verdict}</Badge>
            )}
          </div>

          <h1 className="text-2xl font-bold text-foreground leading-snug">{judgment.caseName}</h1>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-muted-foreground">
            {judgment.caseNumber && (
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 shrink-0" />
                {t('judgments.case_number')}: <span className="text-foreground font-medium">{judgment.caseNumber}</span>
              </span>
            )}
            {judgment.judgmentDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                {t('judgments.date')}: <span className="text-foreground">{new Date(judgment.judgmentDate).toLocaleDateString()}</span>
              </span>
            )}
            {judgment.courtName && (
              <span className="flex items-center gap-1.5">
                <Gavel className="h-3.5 w-3.5 shrink-0" />
                {t('judgments.court')}: <span className="text-foreground">{judgment.courtName}</span>
              </span>
            )}
            {judgment.parties && (
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 shrink-0" />
                {t('judgments.parties')}: <span className="text-foreground">{judgment.parties}</span>
              </span>
            )}
          </div>

          {judgment.summary && (
            <div className="mt-4 border-t border-border pt-4">
              <p className={`text-sm text-muted-foreground leading-relaxed ${!summaryExpanded ? 'line-clamp-3' : ''}`}>
                {judgment.summary}
              </p>
              {judgment.summary.length > 180 && (
                <button
                  type="button"
                  onClick={() => setSummaryExpanded(v => !v)}
                  className="mt-1 text-xs text-primary hover:underline"
                >
                  {summaryExpanded ? t('common.show_less', { defaultValue: 'Show less' }) : t('common.show_more', { defaultValue: 'Show more' })}
                </button>
              )}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            {pdfUrl && (
              <Button variant="outline" size="sm" className="h-11 sm:h-9" asChild>
                <a href={pdfUrl} target="_blank" rel="noreferrer" download onClick={() => trackDownload(id!)}>
                  <Download className="h-4 w-4 me-1.5" /> {t('laws.download_pdf')}
                </a>
              </Button>
            )}
            {isAuthenticated && (
              <Button
                variant={bookmarked ? 'default' : 'outline'}
                size="sm"
                className="h-11 sm:h-9"
                onClick={() => toggleBookmark({ documentId: id!, documentType: 'JUDGMENT', title: judgment.caseName })}
                disabled={bookmarkPending}
              >
                {bookmarked ? <BookmarkCheck className="h-4 w-4 me-1.5" /> : <Bookmark className="h-4 w-4 me-1.5" />}
                {bookmarked ? t('common.bookmarked') : t('common.bookmark')}
              </Button>
            )}
            <Button variant="outline" size="sm" className="h-11 sm:h-9" onClick={copyCitation}>
              {citationCopied ? <Check className="h-4 w-4 me-1.5" /> : <Copy className="h-4 w-4 me-1.5" />}
              {citationCopied ? t('common.citation_copied') : t('common.copy_citation')}
            </Button>
            <Button variant="outline" size="sm" className="h-11 sm:h-9" onClick={() => window.print()}>
              <Printer className="h-4 w-4 me-1.5" /> {t('common.print')}
            </Button>
            {(isAdmin() || isEditor()) && judgment.verificationStatus === 'DRAFT' && (
              <Button variant="outline" size="sm" className="h-11 sm:h-9" onClick={handleSubmitForReview} disabled={submitPending}>
                {submitPending ? <Loader2 className="h-4 w-4 me-1.5 animate-spin" /> : <Send className="h-4 w-4 me-1.5" />}
                {t('common.submit_for_review', { defaultValue: 'Submit for Review' })}
              </Button>
            )}
            {(isAdmin() || isEditor()) && (
              <Link to={`/admin/edit-judgment/${id}`}>
                <Button variant="outline" size="sm" className="h-11 sm:h-9">
                  <Pencil className="h-4 w-4 me-1.5" /> {t('common.edit')}
                </Button>
              </Link>
            )}
            <Link to="/judgments">
              <Button variant="ghost" size="sm" className="h-11 sm:h-9">{t('judgments.back')}</Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue={defaultTab}>
          <TabsList>
            <TabsTrigger value="pdf">{t('common.tab_pdf')}</TabsTrigger>
            {judgment.fullText && (
              <TabsTrigger value="text">{t('common.tab_text', { defaultValue: 'Text' })}</TabsTrigger>
            )}
            <TabsTrigger value="metadata">{t('common.tab_metadata')}</TabsTrigger>
          </TabsList>

          <TabsContent value="pdf" className="mt-4">
            {pdfUrl ? (
              <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                <PdfViewer url={pdfUrl} />
              </Suspense>
            ) : (
              <div className="archive-card rounded-md py-16 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">{t('judgments.no_pdf_detail')}</p>
              </div>
            )}
          </TabsContent>

          {judgment.fullText && (
            <TabsContent value="text" className="mt-4">
              <div className="archive-card rounded-md p-6">
                <div className="text-sm leading-8 text-foreground whitespace-pre-wrap">{judgment.fullText}</div>
              </div>
            </TabsContent>
          )}

          <TabsContent value="metadata" className="mt-4">
            <div className="archive-card rounded-md p-6 space-y-6">
              <div>
                <h3 className="archive-section-label mb-4">{t('judgments.case_details')}</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  {[
                    { label: t('judgments.case_number'), value: judgment.caseNumber },
                    { label: t('judgments.date'), value: judgment.judgmentDate && new Date(judgment.judgmentDate).toLocaleDateString() },
                    { label: t('judgments.court'), value: judgment.courtName },
                    { label: t('judgments.court_level'), value: judgment.courtLevel },
                    { label: t('judgments.jurisdiction'), value: judgment.jurisdiction },
                    { label: t('judgments.parties'), value: judgment.parties },
                    { label: t('judgments.verdict'), value: judgment.verdict },
                    { label: t('common.status'), value: judgment.status },
                  ].filter(r => r.value).map(({ label, value }) => (
                    <div key={label}>
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="font-medium text-foreground mt-0.5">{value}</dd>
                    </div>
                  ))}
                </dl>
                {judgment.judges && judgment.judges.length > 0 && (
                  <div className="mt-3">
                    <dt className="text-sm text-muted-foreground">{t('judgments.judges')}</dt>
                    <dd className="text-sm font-medium text-foreground mt-0.5">{judgment.judges.join(', ')}</dd>
                  </div>
                )}
                {judgment.frbrUri && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <dt className="text-sm text-muted-foreground">{t('judgments.frbr_uri')}</dt>
                    <dd className="mt-0.5 font-mono text-xs text-foreground break-all">{judgment.frbrUri}</dd>
                  </div>
                )}
                {(judgment.sourceProvenance || judgment.sourceUrl) && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <dt className="text-sm text-muted-foreground">Source</dt>
                    {judgment.sourceProvenance && <dd className="text-sm font-medium text-foreground mt-0.5">{judgment.sourceProvenance}</dd>}
                    {judgment.sourceUrl && (
                      <dd className="mt-1">
                        <a href={judgment.sourceUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline break-all">{judgment.sourceUrl}</a>
                      </dd>
                    )}
                  </div>
                )}
              </div>

              {judgment.tags && judgment.tags.length > 0 && (
                <div className="border-t border-border pt-5">
                  <h3 className="archive-section-label mb-3">{t('judgments.tags')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {judgment.tags.map((tag, i) => (
                      <span key={i} className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {judgment.citedLaws && judgment.citedLaws.length > 0 && (
                <div className="border-t border-border pt-5">
                  <h3 className="archive-section-label mb-3">{t('judgments.cited_laws')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {judgment.citedLaws.map((lawId: string) => (
                      <Link key={lawId} to={`/laws/${lawId}`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-muted">{citedLawTitles[lawId] ?? lawId}</Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {judgment.citedCases && judgment.citedCases.length > 0 && (
                <div className="border-t border-border pt-5">
                  <h3 className="archive-section-label mb-3">{t('judgments.cited_cases')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {judgment.citedCases.map((caseId: string) => (
                      <Link key={caseId} to={`/judgments/${caseId}`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-muted">{citedCaseTitles[caseId] ?? caseId}</Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {casesCircitedBy.length > 0 && (
                <div className="border-t border-border pt-5">
                  <h3 className="archive-section-label mb-3">{t('judgments.cited_by_cases')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {casesCircitedBy.map((j: any) => (
                      <Link key={j.id} to={`/judgments/${j.id}`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-muted">{j.caseName ?? j.id}</Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default JudgmentDetail;
