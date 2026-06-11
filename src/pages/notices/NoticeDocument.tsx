import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetNoticeById } from '@/hooks/useNotices';
import { resolveFileUrl } from '@/lib/apiClient';
import PdfViewer from '@/components/PdfViewer';

const NoticeDocument: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: notice, isLoading, error } = useGetNoticeById(id || '');

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 text-muted-foreground">
        <AlertCircle className="h-8 w-8" />
        <p>Document not found.</p>
        <Link to="/notices"><Button variant="outline">Back to Notices</Button></Link>
      </div>
    );
  }

  if (!notice.pdfUrl) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 text-muted-foreground">
        <AlertCircle className="h-8 w-8" />
        <p>No document available for this notice.</p>
        <Link to={`/notices/${id}`}><Button variant="outline">Back</Button></Link>
      </div>
    );
  }

  const pdfUrl = resolveFileUrl(notice.pdfUrl)!;

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link to={`/notices/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
          <h1 className="text-sm font-semibold truncate text-foreground">{notice.title}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <PdfViewer url={pdfUrl} fullHeight />
      </div>
    </div>
  );
};

export default NoticeDocument;
