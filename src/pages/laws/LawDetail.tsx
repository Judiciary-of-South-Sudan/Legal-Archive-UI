import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Download, Calendar, BookOpen, ExternalLink, Pencil, Loader2, Copy, Check, Bookmark, BookmarkCheck } from 'lucide-react';
import { useGetLawById, useIncrementLawView } from '@/hooks/useLaws';
import { resolveFileUrl } from '@/lib/apiClient';
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
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold">{t('laws.not_found')}</h2>
              <p className="text-muted-foreground mt-2">{t('laws.not_found_desc')}</p>
              <div className="mt-4">
                <Link to="/laws">
                  <Button variant="outline">{t('laws.back')}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const pdfUrl = resolveFileUrl(law.pdfUrl);

  const statusColor =
    law.status === 'Active'
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      : law.status === 'Repealed'
      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {law.type && <Badge variant="secondary">{law.type}</Badge>}
              {law.status && <Badge className={statusColor}>{law.status}</Badge>}
              {law.category && <Badge variant="outline">{law.category}</Badge>}
              {law.year && <Badge variant="outline">{law.year}</Badge>}
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-4">{law.title}</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-muted-foreground mb-5">
              {law.enactmentDate && (
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0" />
                  {t('laws.enacted')}: <span className="text-foreground">{new Date(law.enactmentDate).toLocaleDateString()}</span>
                </span>
              )}
              {law.commencementDate && (
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0" />
                  {t('laws.commenced')}: <span className="text-foreground">{new Date(law.commencementDate).toLocaleDateString()}</span>
                </span>
              )}
              {law.lastAmended && (
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0" />
                  {t('laws.last_amended')}: <span className="text-foreground">{new Date(law.lastAmended).toLocaleDateString()}</span>
                </span>
              )}
              {law.jurisdiction && (
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 shrink-0" />
                  {t('laws.jurisdiction')}: <span className="text-foreground">{law.jurisdiction}</span>
                </span>
              )}
              {law.publisher && (
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0" />
                  {t('laws.publisher')}: <span className="text-foreground">{law.publisher}</span>
                </span>
              )}
              {law.language && (
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0" />
                  {t('laws.language')}: <span className="text-foreground">{law.language}</span>
                </span>
              )}
            </div>

            {law.summary && (
              <p className="text-foreground mb-5 leading-relaxed">{law.summary}</p>
            )}

            {law.tags && law.tags.length > 0 && (
              <div className="mb-5">
                <h4 className="text-sm font-semibold mb-2">{t('laws.tags')}</h4>
                <div className="flex flex-wrap gap-2">
                  {law.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-muted px-2 py-1 rounded">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {law.relatedLaws && law.relatedLaws.length > 0 && (
              <div className="mb-5">
                <h4 className="text-sm font-semibold mb-2">{t('laws.related_laws')}</h4>
                <div className="flex flex-wrap gap-2">
                  {law.relatedLaws.map((lawId) => (
                    <Link key={lawId} to={`/laws/${lawId}`}>
                      <Badge variant="outline" className="cursor-pointer hover:bg-muted">{lawId}</Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {law.amendments && law.amendments.length > 0 && (
              <div className="mb-5">
                <h4 className="text-sm font-semibold mb-2">{t('laws.amendments_label')}</h4>
                <div className="flex flex-wrap gap-2">
                  {law.amendments.map((a, i) => (
                    <span key={i} className="text-xs bg-muted px-2 py-1 rounded">{a}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {pdfUrl ? (
                <>
                  <Button asChild>
                    <Link to={`/laws/${id}/document`}>
                      <ExternalLink className="h-4 w-4 mr-1" /> {t('laws.view_document')}
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={pdfUrl} target="_blank" rel="noreferrer" download>
                      <Download className="h-4 w-4 mr-1" /> {t('laws.download_pdf')}
                    </a>
                  </Button>
                </>
              ) : (
                <Button variant="outline" disabled>{t('laws.no_pdf')}</Button>
              )}
              {isAuthenticated && (
                <Button
                  variant={bookmarked ? 'default' : 'outline'}
                  onClick={() => toggleBookmark({ documentId: id!, documentType: 'LAW', title: law.title })}
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
                <Link to={`/admin/edit-law/${id}`}>
                  <Button variant="outline">
                    <Pencil className="h-4 w-4 mr-1" /> {t('common.edit')}
                  </Button>
                </Link>
              )}
              <Link to="/laws">
                <Button variant="ghost">{t('laws.back')}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default LawDetail;
