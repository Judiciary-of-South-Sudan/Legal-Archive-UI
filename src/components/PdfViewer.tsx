import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, Thumbnail, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

type Props = {
  url: string;
  downloadUrl?: string;
  fullHeight?: boolean;
  showThumbnails?: boolean;
};

const PdfViewer: React.FC<Props> = ({ url, downloadUrl, fullHeight = false, showThumbnails = true }) => {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const thumbnailRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    thumbnailRefs.current[pageNumber]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [pageNumber]);

  return (
    <div className={`border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 flex flex-col${fullHeight ? ' h-full' : ''}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-white dark:bg-gray-800 border-b shrink-0">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setPageNumber(p => Math.max(p - 1, 1))} disabled={pageNumber <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm tabular-nums px-1">{pageNumber} / {numPages || '—'}</span>
          <Button variant="ghost" size="sm" onClick={() => setPageNumber(p => Math.min(p + 1, numPages))} disabled={pageNumber >= numPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.max(+(z - 0.25).toFixed(2), 0.5))} disabled={zoom <= 0.5}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm tabular-nums w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.min(+(z + 0.25).toFixed(2), 3.0))} disabled={zoom >= 3.0}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {downloadUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={downloadUrl} target="_blank" rel="noreferrer" download>
              <Download className="h-4 w-4 mr-1" /> Download
            </a>
          </Button>
        )}
      </div>

      {/* Body: thumbnail strip + main page */}
      <div className="flex flex-1 overflow-hidden">
        <Document
          file={url}
          onLoadSuccess={({ numPages: n }) => { setNumPages(n); setPageNumber(1); }}
          loading={
            <div className="flex items-center justify-center h-64 w-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
          error={
            <div className="flex items-center justify-center h-64 w-full text-destructive text-sm">
              Failed to load document.
            </div>
          }
          className="flex flex-1 overflow-hidden w-full"
        >
          {showThumbnails && numPages > 0 && (
            <div className="w-20 shrink-0 overflow-y-auto bg-gray-200 dark:bg-gray-800 border-r flex flex-col items-center py-2 gap-2">
              {Array.from({ length: numPages }, (_, i) => {
                const n = i + 1;
                return (
                  <button
                    key={n}
                    ref={el => { thumbnailRefs.current[n] = el; }}
                    onClick={() => setPageNumber(n)}
                    className={`flex flex-col items-center gap-1 p-1 rounded w-full transition-colors ${
                      pageNumber === n
                        ? 'bg-primary/20 ring-1 ring-primary'
                        : 'hover:bg-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Thumbnail pageNumber={n} width={64} />
                    <span className="text-xs tabular-nums text-muted-foreground">{n}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div
            ref={containerRef}
            className="overflow-auto flex justify-center py-6 flex-1"
            style={fullHeight ? {} : { maxHeight: '82vh' }}
          >
            <Page
              pageNumber={pageNumber}
              width={Math.floor(containerWidth * zoom)}
              renderTextLayer
              renderAnnotationLayer
              className="shadow-lg"
            />
          </div>
        </Document>
      </div>
    </div>
  );
};

export default PdfViewer;
