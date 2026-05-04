import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
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
};

const PdfViewer: React.FC<Props> = ({ url, downloadUrl, fullHeight = false }) => {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`border rounded-lg overflow-hidden bg-gray-100 flex flex-col${fullHeight ? ' h-full' : ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-white border-b">
        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost" size="sm"
            onClick={() => setPageNumber(p => Math.max(p - 1, 1))}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm tabular-nums px-1">
            {pageNumber} / {numPages || '—'}
          </span>
          <Button
            variant="ghost" size="sm"
            onClick={() => setPageNumber(p => Math.min(p + 1, numPages))}
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost" size="sm"
            onClick={() => setZoom(z => Math.max(+(z - 0.25).toFixed(2), 0.5))}
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm tabular-nums w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button
            variant="ghost" size="sm"
            onClick={() => setZoom(z => Math.min(+(z + 0.25).toFixed(2), 3.0))}
            disabled={zoom >= 3.0}
          >
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

      <div
        ref={containerRef}
        className="overflow-auto flex justify-center py-6 flex-1"
        style={fullHeight ? {} : { maxHeight: '82vh' }}
      >
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => {
            setNumPages(numPages);
            setPageNumber(1);
          }}
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
        >
          <Page
            pageNumber={pageNumber}
            width={Math.floor(containerWidth * zoom)}
            renderTextLayer
            renderAnnotationLayer
            className="shadow-lg"
          />
        </Document>
      </div>
    </div>
  );
};

export default PdfViewer;
