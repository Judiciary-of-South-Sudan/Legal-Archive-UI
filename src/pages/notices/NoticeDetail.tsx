import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, FileText, Download } from 'lucide-react';
import { useGetNoticeById } from '@/hooks/useNotices';
import { resolveFileUrl } from '@/lib/apiClient';
import { Loader2 } from 'lucide-react';

const NoticeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: notice, isLoading, error } = useGetNoticeById(id || '');

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
            <CardContent>
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">{notice.title}</h1>
        <div className="text-sm text-muted-foreground mb-4">
          <span className="mr-4"><Calendar className="h-4 w-4 inline" /> {notice.publicationDate || '—'}</span>
          <span className="mr-4"><FileText className="h-4 w-4 inline" /> {notice.issuingAuthority}</span>
        </div>

        <Card>
          <CardContent>
            {notice.summary && <p className="mb-4">{notice.summary}</p>}

            <div className="flex gap-3">
              {notice.pdfUrl ? (
                <Button asChild>
                  <a href={resolveFileUrl(notice.pdfUrl)} target="_blank" rel="noreferrer">
                    <Download className="h-4 w-4 mr-1" /> Download PDF
                  </a>
                </Button>
              ) : (
                <Button variant="outline" disabled>No PDF available</Button>
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
