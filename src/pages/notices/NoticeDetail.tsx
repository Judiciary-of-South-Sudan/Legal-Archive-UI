import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
const PdfViewer = React.lazy(() => import('@/components/PdfViewer'));
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, FileText, Download, Building2, Loader2, Pencil, Bookmark, BookmarkCheck, ChevronRight, Copy, Check, Printer, Send } from 'lucide-react';
import { useGetNoticeById, useIncrementNoticeView, useIncrementNoticeDownload, noticeKeys } from '@/hooks/useNotices';
import { resolveFileUrl } from '@/lib/apiClient';
import apiClient from '@/lib/apiClient';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useIsBookmarked, useToggleBookmark } from '@/hooks/useBookmarks';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useBandwidth } from '@/contexts/BandwidthContext';
import LowBandwidthBanner from '@/components/LowBandwidthBanner';

const NoticeDetail: React.FC = () => {
  const { t } = useTranslation();
  const { lowBandwidth } = useBandwidth();
  const { id } = useParams<{ id: string }>();
  const { data: notice, isLoading, error } = useGetNoticeById(id || '');
  const { mutate: incrementView } = useIncrementNoticeView();
  const { mutate: trackDownload } = useIncrementNoticeDownload();
  const { isAdmin, isEditor, isAuthenticated } = useAuth();
  const countedViewForId = useRef<string | null>(null);
  const [citationCopied, setCitationCopied] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [submitPending, setSubmitPending] = useState(false);
  const queryClient = useQueryClient();
  const { data: bookmarked } = useIsBookmarked(id || '');
  const { mutate: toggleBookmark, isPending: bookmarkPending } = useToggleBookmark();
  const [lawTitles, setLawTitles] = useState<Record<string, string>>({});

  useEffect(() => {
    const allIds = [...(notice?.relatedLaws ?? []), ...(notice?.amendsLaws ?? [])];
    if (!allIds.length) return;
    Promise.allSettled(allIds.map((lawId: string) => apiClient.get(`/laws/${lawId}`))).then(results => {
      const map: Record<string, string> = {};
      results.forEach((r, i) => {
        map[allIds[i]] = r.status === 'fulfilled' ? (r.value.data?.data?.title ?? allIds[i]) : allIds[i];
      });
      setLawTitles(map);
    });
  }, [notice?.relatedLaws?.join(','), notice?.amendsLaws?.join(',')]);

  useEffect(() => {
    if (id && countedViewForId.current !== id) {
      countedViewForId.current = id;
      incrementView(id);
    }
  }, [id]);

  const handleSubmitForReview = async () => {
    if (!id) return;
    setSubmitPending(true);
    try {
      await apiClient.put(`/editor/notices/${id}/submit`);
      toast.success('Submitted for review');
      queryClient.invalidateQueries({ queryKey: noticeKeys.detail(id) });
    } catch {
      toast.error('Failed to submit for review');
    } finally {
      setSubmitPending(false);
    }
  };

  const copyCitation = () => {
    if (!notice) return;
    const parts = [notice.title];
    if (notice.noticeNumber) parts.push(`(${notice.noticeNumber})`);
    if (notice.publicationDate) parts.push(String(new Date(notice.publicationDate).getFullYear()));
    if (notice.issuingAuthority) parts.push(notice.issuingAuthority);
    parts.push(window.location.href);
    navigator.clipboard.writeText(parts.join(', '));
    setCitationCopied(true);
    toast.success(t('common.citation_copied'));
    setTimeout(() => setCitationCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ms-2">{t('notices.loading_detail')}</span>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="archive-card rounded-md p-6">
            <h2 className="text-xl font-semibold">{t('notices.not_found')}</h2>
            <p className="text-muted-foreground mt-2">{t('notices.not_found_desc')}</p>
            <div className="mt-4">
              <Link to="/notices"><Button variant="outline">{t('notices.back')}</Button></Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const pdfUrl = resolveFileUrl(notice.pdfUrl);
  const defaultTab = pdfUrl && !lowBandwidth ? 'pdf' : notice.fullText ? 'text' : 'metadata';

  const statusColor =
    notice.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    : notice.status === 'Repealed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-4 max-w-5xl">
        <LowBandwidthBanner />
        <nav className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">{t('common.home')}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/notices" className="hover:text-primary">{t('nav.notices')}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground truncate max-w-[16ch] sm:max-w-[40ch]">{notice.title}</span>
        </nav>

        <div className="archive-card rounded-md p-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {notice.type && <Badge variant="secondary">{notice.type}</Badge>}
            {notice.status && <Badge className={statusColor}>{notice.status}</Badge>}
            {notice.gazetteIssue && <Badge variant="outline">{notice.gazetteIssue}</Badge>}
          </div>

          <h1 className="text-2xl font-bold text-foreground leading-snug">{notice.title}</h1>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-muted-foreground">
            {notice.noticeNumber && (
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 shrink-0" />
                {t('notices.notice_number')}: <span className="text-foreground font-medium">{notice.noticeNumber}</span>
              </span>
            )}
            {notice.publicationDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                {t('notices.published')}: <span className="text-foreground">{new Date(notice.publicationDate).toLocaleDateString()}</span>
              </span>
            )}
            {notice.issuingAuthority && (
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                {t('notices.authority')}: <span className="text-foreground">{notice.issuingAuthority}</span>
              </span>
            )}
          </div>

          {notice.summary && (
            <div className="mt-4 border-t border-border pt-4">
              <p className={`text-sm text-muted-foreground leading-relaxed ${!summaryExpanded ? 'line-clamp-3' : ''}`}>
                {notice.summary}
              </p>
              {notice.summary.length > 180 && (
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
                onClick={() => toggleBookmark({ documentId: id!, documentType: 'NOTICE', title: notice!.title })}
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
            {(isAdmin() || isEditor()) && notice.verificationStatus === 'DRAFT' && (
              <Button variant="outline" size="sm" className="h-11 sm:h-9" onClick={handleSubmitForReview} disabled={submitPending}>
                {submitPending ? <Loader2 className="h-4 w-4 me-1.5 animate-spin" /> : <Send className="h-4 w-4 me-1.5" />}
                {t('common.submit_for_review', { defaultValue: 'Submit for Review' })}
              </Button>
            )}
            {(isAdmin() || isEditor()) && (
              <Link to={`/admin/edit-notice/${id}`}>
                <Button variant="outline" size="sm" className="h-11 sm:h-9">
                  <Pencil className="h-4 w-4 me-1.5" /> {t('common.edit')}
                </Button>
              </Link>
            )}
            <Link to="/notices">
              <Button variant="ghost" size="sm" className="h-11 sm:h-9">{t('notices.back')}</Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue={defaultTab}>
          <TabsList>
            <TabsTrigger value="pdf">{t('common.tab_pdf')}</TabsTrigger>
            {notice.fullText && (
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
                <p className="text-muted-foreground text-sm">{t('notices.no_pdf_detail')}</p>
              </div>
            )}
          </TabsContent>

          {notice.fullText && (
            <TabsContent value="text" className="mt-4">
              <div className="archive-card rounded-md p-6">
                <div className="text-sm leading-8 text-foreground whitespace-pre-wrap">{notice.fullText}</div>
              </div>
            </TabsContent>
          )}

          <TabsContent value="metadata" className="mt-4">
            <div className="archive-card rounded-md p-6 space-y-6">
              <div>
                <h3 className="archive-section-label mb-4">{t('notices.notice_details')}</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  {[
                    { label: t('notices.notice_number'), value: notice.noticeNumber },
                    { label: t('notices.published'), value: notice.publicationDate && new Date(notice.publicationDate).toLocaleDateString() },
                    { label: t('notices.effective'), value: notice.effectiveDate && new Date(notice.effectiveDate).toLocaleDateString() },
                    { label: t('notices.authority'), value: notice.issuingAuthority },
                    { label: t('notices.ministry'), value: notice.ministry },
                    { label: t('notices.department'), value: notice.department },
                    { label: t('judgments.jurisdiction'), value: notice.jurisdiction },
                    { label: t('notices.gazette_issue'), value: notice.gazetteIssue },
                  ].filter(r => r.value).map(({ label, value }) => (
                    <div key={label}>
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="font-medium text-foreground mt-0.5">{value}</dd>
                    </div>
                  ))}
                </dl>
                {notice.frbrUri && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <dt className="text-sm text-muted-foreground">{t('notices.frbr_uri')}</dt>
                    <dd className="mt-0.5 font-mono text-xs text-foreground break-all">{notice.frbrUri}</dd>
                  </div>
                )}
                {(notice.sourceProvenance || notice.sourceUrl) && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <dt className="text-sm text-muted-foreground">Source</dt>
                    {notice.sourceProvenance && <dd className="text-sm font-medium text-foreground mt-0.5">{notice.sourceProvenance}</dd>}
                    {notice.sourceUrl && (
                      <dd className="mt-1">
                        <a href={notice.sourceUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline break-all">{notice.sourceUrl}</a>
                      </dd>
                    )}
                  </div>
                )}
              </div>

              {notice.tags && notice.tags.length > 0 && (
                <div className="border-t border-border pt-5">
                  <h3 className="archive-section-label mb-3">{t('notices.tags')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {notice.tags.map((tag, i) => (
                      <span key={i} className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {notice.relatedLaws && notice.relatedLaws.length > 0 && (
                <div className="border-t border-border pt-5">
                  <h3 className="archive-section-label mb-3">{t('notices.related_laws')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {notice.relatedLaws.map((lawId: string) => (
                      <Link key={lawId} to={`/laws/${lawId}`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-muted">{lawTitles[lawId] ?? lawId}</Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {notice.amendsLaws && notice.amendsLaws.length > 0 && (
                <div className="border-t border-border pt-5">
                  <h3 className="archive-section-label mb-3">{t('notices.amends')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {notice.amendsLaws.map((lawId: string) => (
                      <Link key={lawId} to={`/laws/${lawId}`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-muted">{lawTitles[lawId] ?? lawId}</Badge>
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

export default NoticeDetail;
