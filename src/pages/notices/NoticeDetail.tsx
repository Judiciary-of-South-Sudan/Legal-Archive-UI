import React, { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, FileText, Download, Building2, ExternalLink, Loader2 } from 'lucide-react';
import { useGetNoticeById, useIncrementNoticeView } from '@/hooks/useNotices';
import { resolveFileUrl } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { Pencil } from 'lucide-react';

const NoticeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: notice, isLoading, error } = useGetNoticeById(id || '');
  const { mutate: incrementView } = useIncrementNoticeView();
  const { isAdmin } = useAuth();
  const countedViewForId = useRef<string | null>(null);

  useEffect(() => {
    if (id && countedViewForId.current !== id) {
      countedViewForId.current = id;
      incrementView(id);
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading notice...</span>
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
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold">Notice not found</h2>
              <p className="text-muted-foreground mt-2">Unable to find the requested notice.</p>
              <div className="mt-4">
                <Link to="/notices">
                  <Button variant="outline">Back to Notices</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const pdfUrl = resolveFileUrl(notice.pdfUrl);

  const statusColor =
    notice.status === 'Active'
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      : notice.status === 'Repealed'
      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-4">
        <Card>
          <CardContent className="p-6">
            {/* Title and badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {notice.type && <Badge variant="secondary">{notice.type}</Badge>}
              {notice.status && <Badge className={statusColor}>{notice.status}</Badge>}
              {notice.gazetteIssue && <Badge variant="outline">{notice.gazetteIssue}</Badge>}
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-4">{notice.title}</h1>

            {/* Metadata grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-muted-foreground mb-5">
              {notice.noticeNumber && (
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0" />
                  Notice No: <span className="text-foreground font-medium">{notice.noticeNumber}</span>
                </span>
              )}
              {notice.publicationDate && (
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0" />
                  Published: <span className="text-foreground">{new Date(notice.publicationDate).toLocaleDateString()}</span>
                </span>
              )}
              {notice.effectiveDate && (
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0" />
                  Effective: <span className="text-foreground">{new Date(notice.effectiveDate).toLocaleDateString()}</span>
                </span>
              )}
              {notice.issuingAuthority && (
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 shrink-0" />
                  Authority: <span className="text-foreground">{notice.issuingAuthority}</span>
                </span>
              )}
              {notice.ministry && (
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 shrink-0" />
                  Ministry: <span className="text-foreground">{notice.ministry}</span>
                </span>
              )}
              {notice.department && (
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0" />
                  Department: <span className="text-foreground">{notice.department}</span>
                </span>
              )}
              {notice.jurisdiction && (
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0" />
                  Jurisdiction: <span className="text-foreground">{notice.jurisdiction}</span>
                </span>
              )}
            </div>

            {/* Summary */}
            {notice.summary && (
              <p className="text-foreground mb-5 leading-relaxed">{notice.summary}</p>
            )}

            {/* Tags */}
            {notice.tags && notice.tags.length > 0 && (
              <div className="mb-5">
                <h4 className="text-sm font-semibold mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {notice.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-muted px-2 py-1 rounded">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Related laws */}
            {notice.relatedLaws && notice.relatedLaws.length > 0 && (
              <div className="mb-5">
                <h4 className="text-sm font-semibold mb-1">Related Laws</h4>
                <div className="flex flex-wrap gap-2">
                  {notice.relatedLaws.map((lawId) => (
                    <Link key={lawId} to={`/laws/${lawId}`}>
                      <Badge variant="outline" className="cursor-pointer hover:bg-muted">{lawId}</Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Amends laws */}
            {notice.amendsLaws && notice.amendsLaws.length > 0 && (
              <div className="mb-5">
                <h4 className="text-sm font-semibold mb-1">Amends</h4>
                <div className="flex flex-wrap gap-2">
                  {notice.amendsLaws.map((lawId) => (
                    <Link key={lawId} to={`/laws/${lawId}`}>
                      <Badge variant="outline" className="cursor-pointer hover:bg-muted">{lawId}</Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {pdfUrl ? (
                <>
                  <Button asChild>
                    <Link to={`/notices/${id}/document`}>
                      <ExternalLink className="h-4 w-4 mr-1" /> View Document
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={pdfUrl} target="_blank" rel="noreferrer" download>
                      <Download className="h-4 w-4 mr-1" /> Download PDF
                    </a>
                  </Button>
                </>
              ) : (
                <Button variant="outline" disabled>No PDF available</Button>
              )}
              {isAdmin() && (
                <Link to={`/admin/edit-notice/${id}`}>
                  <Button variant="outline">
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                </Link>
              )}
              <Link to="/notices">
                <Button variant="ghost">Back to Notices</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default NoticeDetail;
