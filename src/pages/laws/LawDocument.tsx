import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetLawById } from '@/hooks/useLaws';
import { resolveFileUrl } from '@/lib/apiClient';
import PdfViewer from '@/components/PdfViewer';

const LawDocument: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: law, isLoading, error } = useGetLawById(id || '');

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !law) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 text-muted-foreground">
        <AlertCircle className="h-8 w-8" />
        <p>Document not found.</p>
        <Link to="/laws"><Button variant="outline">Back to Laws</Button></Link>
      </div>
    );
  }

  if (!law.pdfUrl) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 text-muted-foreground">
        <AlertCircle className="h-8 w-8" />
        <p>No document available for this law.</p>
        <Link to={`/laws/${id}`}><Button variant="outline">Back</Button></Link>
      </div>
    );
  }

  const pdfUrl = resolveFileUrl(law.pdfUrl)!;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link to={`/laws/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
          <h1 className="text-sm font-semibold truncate text-foreground">{law.title}</h1>
        </div>
      </div>

      {/* PDF viewer fills remaining height */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <PdfViewer url={pdfUrl} fullHeight />
      </div>
    </div>
  );
};

export default LawDocument;
