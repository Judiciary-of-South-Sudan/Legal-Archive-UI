import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Download, Calendar, BookOpen } from 'lucide-react';
import { useGetLawById, useIncrementLawView } from '@/hooks/useLaws';
import { Loader2 } from 'lucide-react';
import PdfViewer from '@/components/PdfViewer';

const LawDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: law, isLoading, error } = useGetLawById(id || '');
  const incrementView = useIncrementLawView();
  const [showPdf, setShowPdf] = useState(false);

  useEffect(() => {
    if (id) {
      incrementView.mutate(id);
    }
  }, [id, incrementView]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading law...</span>
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
              <h2 className="text-xl font-semibold">Law not found</h2>
              <p className="text-muted-foreground mt-2">Unable to find the requested law.</p>
              <div className="mt-4">
                <Link to="/laws">
                  <Button variant="outline">Back to Laws</Button>
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">{law.title}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> {law.enactmentDate ? new Date(law.enactmentDate).toLocaleDateString() : '-'}
            </span>
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> {law.jurisdiction || '-'}
            </span>
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> {law.issuingAuthority || '-'}
            </span>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            {law.summary && <p className="mb-4 text-foreground">{law.summary}</p>}

            {law.tags && law.tags.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-1">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {law.tags.map((tag, index) => (
                    <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {law.lastAmended && (
              <div className="mb-4 text-sm text-muted-foreground">
                Last amended: {new Date(law.lastAmended).toLocaleDateString()}
              </div>
            )}

            <div className="flex items-center gap-3 mt-4">
              {law.pdfUrl ? (
                <>
                  <Button asChild>
                    <a href={law.pdfUrl} target="_blank" rel="noreferrer">
                      <Download className="h-4 w-4 mr-1" /> Download PDF
                    </a>
                  </Button>
                  <Button variant="outline" onClick={() => setShowPdf(true)}>
                    View PDF
                  </Button>
                </>
              ) : (
                <Button variant="outline" disabled>
                  No PDF available
                </Button>
              )}

              <Link to="/laws">
                <Button variant="ghost">Back to Laws</Button>
              </Link>
            </div>

            {showPdf && law.pdfUrl && (
              <PdfViewer
                url={law.pdfUrl}
                title={law.title}
                height="80vh"
                onClose={() => setShowPdf(false)}
              />
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default LawDetail;
