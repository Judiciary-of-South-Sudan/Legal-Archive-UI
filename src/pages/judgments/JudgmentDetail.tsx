import React, { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Gavel, Download } from 'lucide-react';
import { useGetJudgmentById, useIncrementJudgmentView } from '@/hooks/useJudgments';
import { resolveFileUrl } from '@/lib/apiClient';
import { Loader2 } from 'lucide-react';

const JudgmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: judgment, isLoading, error } = useGetJudgmentById(id || '');
  const { mutate: incrementView } = useIncrementJudgmentView();
  const countedViewForId = useRef<string | null>(null);

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
          <span className="ml-2">Loading judgment...</span>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !judgment) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold">Judgment not found</h2>
              <p className="text-muted-foreground mt-2">Unable to find the requested judgment.</p>
              <div className="mt-4">
                <Link to="/judgments">
                  <Button variant="outline">Back to Judgments</Button>
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
        <h1 className="text-2xl font-bold mb-2">{judgment.caseName}</h1>
        <div className="text-sm text-muted-foreground mb-4">
          <span className="mr-4"><Calendar className="h-4 w-4 inline" /> {judgment.judgmentDate ? new Date(judgment.judgmentDate).toLocaleDateString() : '—'}</span>
          <span className="mr-4"><Gavel className="h-4 w-4 inline" /> {judgment.courtLevel}</span>
        </div>

        <Card>
          <CardContent>
            {judgment.summary && <p className="mb-4">{judgment.summary}</p>}
            {judgment.verdict && <p className="mb-4 font-semibold">Verdict: {judgment.verdict}</p>}

            <div className="flex gap-3">
              {judgment.pdfUrl ? (
                <Button asChild>
                  <a href={resolveFileUrl(judgment.pdfUrl)} target="_blank" rel="noreferrer">
                    <Download className="h-4 w-4 mr-1" /> Download PDF
                  </a>
                </Button>
              ) : (
                <Button variant="outline" disabled>No PDF available</Button>
              )}

              <Link to="/judgments">
                <Button variant="ghost">Back to Judgments</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default JudgmentDetail;
