import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Download, Pencil, FileText, Loader2, Copy, Check, Bookmark, BookmarkCheck, ChevronRight, Printer, Users, ScrollText } from 'lucide-react';
import { useGetDecreeById, useIncrementDecreeView, useIncrementDecreeDownload } from '@/hooks/useDecrees';
import { resolveFileUrl } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { useIsBookmarked, useToggleBookmark } from '@/hooks/useBookmarks';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const typeColor: Record<string, string> = {
  APPOINTMENT: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  RELIEF: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  REDEPLOYMENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  ESTABLISHMENT: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  DISSOLUTION: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  RATIFICATION: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
};

const DecreeDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: decree, isLoading, error } = useGetDecreeById(id || '');
  const { mutate: incrementView } = useIncrementDecreeView();
  const { mutate: trackDownload } = useIncrementDecreeDownload();
  const { isAdmin, isAuthenticated } = useAuth();
  const countedViewForId = useRef<string | null>(null);
  const [citationCopied, setCitationCopied] = useState(false);

  const { data: bookmarked } = useIsBookmarked(id || '');
  const { mutate: toggleBookmark, isPending: bookmarkPending } = useToggleBookmark();

  useEffect(() => {
    if (id && countedViewForId.current !== id) {
      countedViewForId.current = id;
      incrementView(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const copyCitation = () => {
    if (!decree) return;
    const parts = [decree.title];
    if (decree.decreeNumber) parts.push(`Decree No. ${decree.decreeNumber}`);
    if (decree.decreeDate) parts.push(String(new Date(decree.decreeDate).getFullYear()));
    if (decree.issuedBy) parts.push(decree.issuedBy);
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
          <span className="ml-2">{t('decrees.loading_detail')}</span>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !decree) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="archive-card rounded-md p-6">
            <h2 className="text-xl font-semibold">{t('decrees.not_found')}</h2>
            <p className="text-muted-foreground mt-2">{t('decrees.not_found_desc')}</p>
            <div className="mt-4">
              <Link to="/decrees"><Button variant="outline">{t('decrees.back')}</Button></Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const pdfUrl = resolveFileUrl(decree.pdfUrl);
  const defaultTab = decree.fullText ? 'text' : pdfUrl ? 'pdf' : 'metadata';
  const typeClass = decree.decreeType ? (typeColor[decree.decreeType] ?? 'bg-secondary text-secondary-foreground') : '';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-4 max-w-5xl">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">{t('common.home')}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/decrees" className="hover:text-primary">{t('nav.decrees')}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground truncate max-w-[40ch]">{decree.title}</span>
        </nav>

        <div className="archive-card rounded-md p-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {decree.decreeType && (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeClass}`}>
                {decree.decreeType}
              </span>
            )}
            {decree.verificationStatus && (
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                {decree.verificationStatus}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-foreground leading-snug">{decree.title}</h1>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-muted-foreground">
            {decree.decreeNumber && (
              <span className="flex items-center gap-1.5">
                <ScrollText className="h-3.5 w-3.5 shrink-0" />
                {t('decrees.decree_number')} <span className="text-foreground font-medium">{decree.decreeNumber}</span>
              </span>
            )}
            {decree.decreeDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                {t('decrees.date')}: <span className="text-foreground">{new Date(decree.decreeDate).toLocaleDateString()}</span>
              </span>
            )}
            {decree.issuedBy && (
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span>{decree.issuedBy}</span>
              </span>
            )}
          </div>

          {decree.subject && (
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">{decree.subject}</p>
          )}

          {decree.summary && (
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{decree.summary}</p>
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
                onClick={() => toggleBookmark({ documentId: id!, documentType: 'DECREE', title: decree.title })}
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
              <Link to={`/admin/edit-decree/${id}`}>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-1.5" /> {t('common.edit')}
                </Button>
              </Link>
            )}
            <Link to="/decrees">
              <Button variant="ghost" size="sm">{t('decrees.back')}</Button>
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
            {decree.fullText ? (
              <div className="archive-card rounded-md p-8">
                <article className="document-text mx-auto max-w-[72ch] text-[15px] text-foreground whitespace-pre-wrap">
                  {decree.fullText}
                </article>
              </div>
            ) : (
              <div className="archive-card rounded-md py-16 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">{t('decrees.fulltext_unavailable')}</p>
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
                  title={`${decree.title} — PDF`}
                />
              </div>
            ) : (
              <div className="archive-card rounded-md py-16 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">{t('decrees.no_pdf_detail')}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="metadata" className="mt-4">
            <div className="archive-card rounded-md p-6 space-y-6">
              <div>
                <h3 className="archive-section-label mb-4">{t('decrees.decree_details')}</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  {[
                    { label: t('decrees.decree_number'), value: decree.decreeNumber },
                    { label: t('decrees.date'), value: decree.decreeDate && new Date(decree.decreeDate).toLocaleDateString() },
                    { label: t('decrees.type'), value: decree.decreeType },
                    { label: t('decrees.issued_by'), value: decree.issuedBy },
                    { label: t('decrees.subject'), value: decree.subject },
                    { label: t('decrees.year'), value: decree.year },
                    { label: t('decrees.language'), value: decree.language },
                    { label: t('common.status'), value: decree.verificationStatus },
                  ].filter(r => r.value).map(({ label, value }) => (
                    <div key={label}>
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="font-medium text-foreground mt-0.5">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
                {decree.frbrUri && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <dt className="text-sm text-muted-foreground">{t('decrees.frbr_uri')}</dt>
                    <dd className="mt-0.5 font-mono text-xs text-foreground break-all">{decree.frbrUri}</dd>
                  </div>
                )}
              </div>

              {decree.personnel && decree.personnel.length > 0 && (
                <div className="border-t border-border pt-5">
                  <h3 className="archive-section-label mb-3">{t('decrees.personnel')}</h3>
                  <ul className="divide-y divide-border border border-border rounded-md bg-background">
                    {decree.personnel.map((entry, i) => (
                      <li key={i} className="px-4 py-2.5 text-sm text-foreground">{entry}</li>
                    ))}
                  </ul>
                </div>
              )}

              {decree.tags && decree.tags.length > 0 && (
                <div className="border-t border-border pt-5">
                  <h3 className="archive-section-label mb-3">{t('decrees.tags')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {decree.tags.map((tag, i) => (
                      <span key={i} className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-5">
                <h3 className="archive-section-label mb-3">{t('decrees.statistics')}</h3>
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">{t('common.views')}</dt>
                    <dd className="font-semibold text-foreground mt-0.5">{decree.viewCount ?? 0}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t('common.downloads')}</dt>
                    <dd className="font-semibold text-foreground mt-0.5">{decree.downloadCount ?? 0}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default DecreeDetail;
