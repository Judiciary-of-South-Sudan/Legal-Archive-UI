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
import apiClient from '@/lib/apiClient';

const LawDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: law, isLoading, error } = useGetLawById(id || '');
  const incrementView = useIncrementLawView();
  const [showPdf, setShowPdf] = useState(false);

  // new state: resolved PDF URL (either backend-provided or discovered)
  const [pdfUrlResolved, setPdfUrlResolved] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      // best-effort increment; don't await
      incrementView.mutate(id);
    }
  }, [id, incrementView]);

  // Debug: log law object when loaded to verify presence of pdfUrl
  useEffect(() => {
    if (law) {
      console.debug('[LawDetail] loaded law object:', law);
    }
  }, [law]);

  // Try to resolve a PDF when backend didn't include law.pdfUrl
  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    async function tryResolvePdf() {
      if (!law) return;
      console.debug('[LawDetail] starting PDF resolution for law id:', law.id, 'frbrUri:', law.frbrUri);
      // if the backend already provides a pdfUrl, keep it
      if (law.pdfUrl) {
        setPdfUrlResolved(null);
        setPdfLoading(false);
        console.debug('[LawDetail] law.pdfUrl present, using backend URL:', law.pdfUrl);
        return;
      }

      setPdfLoading(true);
      setPdfError(null);

      // candidate endpoints to try (these map to API routes or file endpoints)
      const candidates = [
        `/api/laws/${law.id}/pdf`,
        `/api/laws/${law.frbrUri}/pdf`,
        `/upload/law/${law.id}`,
        `/upload/law/${law.frbrUri}`,
        `/files/laws/${law.frbrUri}`,
        `/files/laws/${law.id}`,
      ];

      // apiClient base (e.g. https://example.com/api)
      const apiBase = apiClient.defaults.baseURL || '';
      const nonApiBase = apiBase.replace(/\/api\/?$/, '');

      for (const path of candidates) {
        if (cancelled) break;

        console.debug('[LawDetail] probing candidate path:', path);
        try {
          // Prefer apiClient for /api/* routes so auth is applied and responseType blob is supported
          if (path.startsWith('/api/')) {
            // strip leading /api because apiClient already uses baseURL that ends with /api
            const rel = path.replace(/^\/api\//, '/');
            try {
              const resp = await apiClient.get(rel, { responseType: 'blob' as const });
              console.debug('[LawDetail] apiClient GET', rel, 'status', resp.status, 'headers', resp.headers);
              if (resp.status >= 200 && resp.status < 300) {
                const blob = resp.data as Blob;
                const ct = (resp.headers && (resp.headers['content-type'] || resp.headers['Content-Type'])) || '';
                console.debug('[LawDetail] candidate response content-type:', ct, 'blob type:', blob?.type);
                if (blob && blob.type && blob.type.includes('pdf')) {
                  objectUrl = URL.createObjectURL(blob);
                  if (!cancelled) {
                    setPdfUrlResolved(objectUrl);
                    setPdfLoading(false);
                    setPdfError(null);
                    console.debug('[LawDetail] created object URL from blob for', rel);
                  }
                  break;
                } else if (ct && String(ct).includes('application/json')) {
                  // try parse JSON to extract URL
                  try {
                    // can't easily re-read blob as JSON from axios; instead perform a json GET
                    const jsonResp = await apiClient.get(rel, { responseType: 'json' });
                    console.debug('[LawDetail] apiClient JSON GET', rel, 'status', jsonResp.status, 'data', jsonResp.data);
                    const maybeUrl = jsonResp.data?.url || jsonResp.data?.pdfUrl || jsonResp.data?.data?.pdfUrl;
                    if (maybeUrl) {
                      if (!cancelled) {
                        setPdfUrlResolved(maybeUrl);
                        setPdfLoading(false);
                        setPdfError(null);
                        console.debug('[LawDetail] found pdf URL in JSON response for', rel, maybeUrl);
                      }
                      break;
                    }
                  } catch (e) {
                    // continue to next candidate
                  }
                }
              }
            } catch (e) {
              console.debug('[LawDetail] apiClient GET failed for', rel, e?.message || e);
              // continue to next candidate
              continue;
            }
          } else {
            // Non-API endpoints: build absolute URL against nonApiBase and use fetch with auth header
            const url = `${nonApiBase}${path.startsWith('/') ? '' : '/'}${path}`;
            console.debug('[LawDetail] fetching non-API url:', url);
            const headers: Record<string, string> = {};
            const token = localStorage.getItem('auth_token');
            if (token) headers['Authorization'] = `Bearer ${token}`;

            try {
              const resp = await fetch(url, { method: 'GET', headers, credentials: 'include' });
              console.debug('[LawDetail] fetch', url, 'status', resp.status, 'content-type', resp.headers.get('content-type'));
              if (!resp.ok) continue;

              const ct = resp.headers.get('content-type') || '';
              if (ct.includes('application/json')) {
                try {
                  const j = await resp.json();
                  console.debug('[LawDetail] fetch JSON result for', url, j);
                  const maybeUrl = j?.url || j?.pdfUrl || j?.data?.pdfUrl;
                  if (maybeUrl) {
                    if (!cancelled) {
                      setPdfUrlResolved(maybeUrl);
                      setPdfLoading(false);
                      setPdfError(null);
                      console.debug('[LawDetail] found pdf URL in JSON via fetch for', url, maybeUrl);
                    }
                    break;
                  }
                } catch (e) {
                  continue;
                }
              }

              const blob = await resp.blob();
              console.debug('[LawDetail] fetched blob size/type for', url, blob?.size, blob?.type);
              if (blob && blob.type && blob.type.includes('pdf')) {
                objectUrl = URL.createObjectURL(blob);
                if (!cancelled) {
                  setPdfUrlResolved(objectUrl);
                  setPdfLoading(false);
                  setPdfError(null);
                  console.debug('[LawDetail] created object URL from fetch for', url);
                }
                break;
              }
            } catch (e) {
              console.debug('[LawDetail] fetch failed for', url, e?.message || e);
              continue;
            }
          }
        } catch (err) {
          // ignore individual candidate errors and continue
          continue;
        }
      }

      if (!objectUrl && !cancelled) {
        setPdfLoading(false);
        setPdfError('No PDF found on expected endpoints.');
        console.debug('[LawDetail] PDF probe finished; no PDF found for law id', law.id);
      }
    }

    tryResolvePdf();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [law]);

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

  // prefer resolved fallback url over backend value if present
  const pdfUrlToUse = pdfUrlResolved ?? law.pdfUrl ?? null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">{law.title}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {law.enactmentDate ? new Date(law.enactmentDate).toLocaleDateString() : '—'}</span>
            <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> {law.jurisdiction || '—'}</span>
            <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> {law.issuingAuthority || '—'}</span>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            {law.summary && <p className="mb-4 text-foreground">{law.summary}</p>}

            {law.tags && law.tags.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-1">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {law.tags.map((k, i) => (
                    <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{k}</span>
                  ))}
                </div>
              </div>
            )}

            {law.lastAmended && (
              <div className="mb-4 text-sm text-muted-foreground">Last amended: {new Date(law.lastAmended).toLocaleDateString()}</div>
            )}

            <div className="flex items-center gap-3 mt-4">
              {pdfUrlToUse ? (
                <>
                  <Button asChild>
                    <a href={pdfUrlToUse} target="_blank" rel="noreferrer">
                      <Download className="h-4 w-4 mr-1" /> Download PDF
                    </a>
                  </Button>

                  {/* View button opens PdfViewer overlay */}
                  <Button variant="outline" onClick={() => setShowPdf(true)}>
                    View PDF
                  </Button>
                </>
              ) : pdfLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Searching for PDF...
                </div>
              ) : (
                <Button variant="outline" disabled>
                  No PDF available
                </Button>
              )}

              <Link to="/laws">
                <Button variant="ghost">Back to Laws</Button>
              </Link>
            </div>

            {/* Render PdfViewer as overlay when requested */}
            {showPdf && pdfUrlToUse && (
              <PdfViewer
                url={pdfUrlToUse}
                title={law.title}
                height="80vh"
                onClose={() => setShowPdf(false)}
              />
            )}

            {/* optional debug message when probe fails */}
            {pdfError && <div className="mt-3 text-sm text-red-500">{pdfError}</div>}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default LawDetail;

