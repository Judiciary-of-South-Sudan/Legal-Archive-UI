import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Calendar, BookOpen, Pencil, Loader2, Copy, Check, Bookmark, BookmarkCheck, ChevronRight, Printer } from 'lucide-react';
import { useGetLawById, useIncrementLawView, useIncrementLawDownload } from '@/hooks/useLaws';
import { resolveFileUrl } from '@/lib/apiClient';
import apiClient from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { useIsBookmarked, useToggleBookmark } from '@/hooks/useBookmarks';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const LawDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: law, isLoading, error } = useGetLawById(id || '');
  const { mutate: incrementView } = useIncrementLawView();
  const { isAdmin, isAuthenticated } = useAuth();
  const countedViewForId = useRef<string | null>(null);
  const [citationCopied, setCitationCopied] = useState(false);
  const { data: bookmarked } = useIsBookmarked(id || '');
  const { mutate: toggleBookmark, isPending: bookmarkPending } = useToggleBookmark();
  const { mutate: trackDownload } = useIncrementLawDownload();
  const [relatedLawTitles, setRelatedLawTitles] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    if (!id || !law?.relatedLaws?.length) return;
    apiClient.get(`/laws/${id}/related`).then(res => {
      const laws: any[] = res.data?.data ?? [];
      setRelatedLawTitles(laws.map(l => ({ id: l.id, title: l.title })));
    }).catch(() => {});
  }, [id, law?.relatedLaws?.length]);

  const copyCitation = () => {
    if (!law) return;
    const parts = [law.title];
    if (law.year) parts.push(String(law.year));
    if (law.publisher) parts.push(law.publisher);
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
          <span className="ml-2">{t('laws.loading_detail')}</span>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !law) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="archive-card rounded-md p-6">
            <h2 className="text-xl font-semibold">{t('laws.not_found')}</h2>
            <p className="text-muted-foreground mt-2">{t('laws.not_found_desc')}</p>
            <div className="mt-4">
              <Link to="/laws"><Button variant="outline">{t('laws.back')}</Button></Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const pdfUrl = resolveFileUrl(law.pdfUrl);
  const defaultTab = law.fullText ? 'text' : pdfUrl ? 'pdf' : 'metadata';

  const statusColor =
    law.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    : law.status === 'Repealed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-4 max-w-5xl">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">{t('common.home')}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/laws" className="hover:text-primary">{t('nav.laws')}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground truncate max-w-[40ch]">{law.title}</span>
        </nav>

        <div className="archive-card rounded-md p-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {law.type && <Badge variant="secondary">{law.type}</Badge>}
            {law.status && <Badge className={statusColor}>{law.status}</Badge>}
            {law.category && <Badge variant="outline">{law.category}</Badge>}
            {law.year && <Badge variant="outline">{law.year}</Badge>}
          </div>

          <h1 className="text-2xl font-bold text-foreground leading-snug">{law.title}</h1>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-muted-foreground">
            {law.enactmentDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                {t('laws.enacted')}: <span className="text-foreground">{new Date(law.enactmentDate).toLocaleDateString()}</span>
              </span>
            )}
            {law.jurisdiction && (
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                {t('laws.jurisdiction')}: <span className="text-foreground">{law.jurisdiction}</span>
              </span>
            )}
            {law.publisher && (
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 shrink-0" />
                {t('laws.publisher')}: <span className="text-foreground">{law.publisher}</span>
              </span>
            )}
          </div>

          {law.summary && (
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">{law.summary}</p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            {pdfUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={pdfUrl} target="_blank" rel="noreferrer" download onClick={() => trackDownload(id!)}>
                  <Download className="h-4 w-4 mr-1.5" /> {t('laws.download_pdf')}
                </a>
              </Button>
            )}
            {isAuthenticated && (
              <Button
                variant={bookmarked ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleBookmark({ documentId: id!, documentType: 'LAW', title: law.title })}
                disabled={bookmarkPending}
              >
                {bookmarked ? <BookmarkCheck className="h-4 w-4 mr-1.5" /> : <Bookmark className="h-4 w-4 mr-1.5" />}
                {bookmarked ? t('common.bookmarked') : t('common.bookmark')}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={copyCitation}>
              {citationCopied ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
              {citationCopied ? t('common.citation_copied') : t('common.copy_citation')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-1.5" /> {t('common.print')}
            </Button>
            {isAdmin() && (
              <Link to={`/admin/edit-law/${id}`}>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-1.5" /> {t('common.edit')}
                </Button>
              </Link>
            )}
            <Link to="/laws">
              <Button variant="ghost" size="sm">{t('laws.back')}</Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue={defaultTab}>
          <TabsList>
            <TabsTrigger value="text">{t('common.tab_text')}</TabsTrigger>
            <TabsTrigger value="pdf">{t('common.tab_pdf')}</TabsTrigger>
            <TabsTrigger value="metadata">{t('common.tab_metadata')}</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-4">
            {law.fullText ? (
              <div className="archive-card rounded-md p-8">
                <article className="document-text mx-auto max-w-[72ch] text-[15px] text-foreground whitespace-pre-wrap">
                  {law.fullText}
                </article>
              </div>
            ) : (
              <div className="archive-card rounded-md py-16 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">{t('laws.fulltext_unavailable')}</p>
                {pdfUrl && (
                  <p className="text-sm mt-1">
                    <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      {t('common.download_pdf_link')}
                    </a>{' '}
                    {t('common.fulltext_pdf_suffix')}
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pdf" className="mt-4">
            {pdfUrl ? (
              <div className="archive-card overflow-hidden rounded-md">
                <iframe
                  src={pdfUrl}
                  className="w-full h-[80vh]"
                  title={`${law.title} — PDF`}
                />
              </div>
            ) : (
              <div className="archive-card rounded-md py-16 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">{t('laws.no_pdf_detail')}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="metadata" className="mt-4">
            <div className="archive-card rounded-md p-6 space-y-6">
              <div>
                <h3 className="archive-section-label mb-4">{t('laws.doc_details')}</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  {[
                    { label: t('laws.enacted'), value: law.enactmentDate && new Date(law.enactmentDate).toLocaleDateString() },
                    { label: t('laws.commenced'), value: law.commencementDate && new Date(law.commencementDate).toLocaleDateString() },
                    { label: t('laws.last_amended'), value: law.lastAmended && new Date(law.lastAmended).toLocaleDateString() },
                    { label: t('laws.jurisdiction'), value: law.jurisdiction },
                    { label: t('laws.publisher'), value: law.publisher },
                    { label: t('laws.language'), value: law.language },
                    { label: t('common.category'), value: law.category },
                    { label: t('common.type'), value: law.type },
                  ].filter(r => r.value).map(({ label, value }) => (
                    <div key={label}>
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="font-medium text-foreground mt-0.5">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {law.tags && law.tags.length > 0 && (
                <div className="border-t border-border pt-5">
                  <h3 className="archive-section-label mb-3">{t('laws.tags')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {law.tags.map((tag, i) => (
                      <span key={i} className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {law.relatedLaws && law.relatedLaws.length > 0 && (
                <div className="border-t border-border pt-5">
                  <h3 className="archive-section-label mb-3">{t('laws.related_laws')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {(relatedLawTitles.length > 0 ? relatedLawTitles : law.relatedLaws.map(rid => ({ id: rid, title: rid }))).map(({ id: lawId, title }) => (
                      <Link key={lawId} to={`/laws/${lawId}`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-muted">{title}</Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {law.amendments && law.amendments.length > 0 && (
                <div className="border-t border-border pt-5">
                  <h3 className="archive-section-label mb-3">{t('laws.amendments_label')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {law.amendments.map((a, i) => (
                      <span key={i} className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">{a}</span>
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

export default LawDetail;
