import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetJudgmentById } from '@/hooks/useJudgments';
import { resolveFileUrl } from '@/lib/apiClient';
import PdfViewer from '@/components/PdfViewer';

const JudgmentDocument: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: judgment, isLoading, error } = useGetJudgmentById(id || '');

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !judgment) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 text-muted-foreground">
        <AlertCircle className="h-8 w-8" />
        <p>Document not found.</p>
        <Link to="/judgments"><Button variant="outline">Back to Judgments</Button></Link>
      </div>
    );
  }

  if (!judgment.pdfUrl) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 text-muted-foreground">
        <AlertCircle className="h-8 w-8" />
        <p>No document available for this judgment.</p>
        <Link to={`/judgments/${id}`}><Button variant="outline">Back</Button></Link>
      </div>
    );
  }

  const pdfUrl = resolveFileUrl(judgment.pdfUrl)!;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link to={`/judgments/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
          <h1 className="text-sm font-semibold truncate text-foreground">{judgment.caseName}</h1>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={pdfUrl} target="_blank" rel="noreferrer" download>
            <Download className="h-4 w-4 mr-1" /> Download
          </a>
        </Button>
      </div>

      {/* PDF viewer fills remaining height */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <PdfViewer url={pdfUrl} fullHeight />
      </div>
    </div>
  );
};

export default JudgmentDocument;
