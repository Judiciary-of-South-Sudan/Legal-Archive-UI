import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Document, Page, Thumbnail, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// CDN worker — avoids the new URL() Vite trick that fails on mobile Safari
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Only render pages within ±WINDOW of the current page; rest are white placeholders
const WINDOW = 5;

type Props = {
  url: string;
  fullHeight?: boolean;
  showThumbnails?: boolean;
};

const PdfViewer: React.FC<Props> = ({ url, fullHeight = false, showThumbnails = true }) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const pagesAreaRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(() =>
    typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, 1200) : 300
  );
  const thumbnailRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Track the width of the pages area for responsive page sizing
  useEffect(() => {
    const el = pagesAreaRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // IntersectionObserver: update active page as user scrolls
  useEffect(() => {
    if (numPages === 0) return;
    const observers: IntersectionObserver[] = [];
    for (let n = 1; n <= numPages; n++) {
      const el = pageRefs.current[n];
      if (!el) continue;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setPageNumber(n); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    }
    return () => observers.forEach(obs => obs.disconnect());
  }, [numPages]);

  // Keep active thumbnail scrolled into view in the sidebar
  useEffect(() => {
    thumbnailRefs.current[pageNumber]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [pageNumber]);

  const goToPage = useCallback((n: number) => {
    const clamped = Math.max(1, Math.min(n, numPages));
    setPageNumber(clamped);
    pageRefs.current[clamped]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [numPages]);

  const floatingNav = numPages > 1 ? (
    <div className="fixed bottom-4 inset-x-0 z-20 flex justify-center pointer-events-none md:hidden">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-background/90 px-2 py-1.5 shadow-lg backdrop-blur-sm">
        <button
          onClick={() => goToPage(pageNumber - 1)}
          disabled={pageNumber <= 1}
          aria-label="Previous page"
          className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-40"
        >
          {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        <span className="min-w-[3.5rem] text-center text-xs font-medium tabular-nums">
          {pageNumber} / {numPages}
        </span>
        <button
          onClick={() => goToPage(pageNumber + 1)}
          disabled={pageNumber >= numPages}
          aria-label="Next page"
          className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-40"
        >
          {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  ) : null;

  // fullHeight mode: fixed container with its own scroll (used on the /document page)
  if (fullHeight) {
    return (
      <>
      <div className="flex h-full overflow-hidden">
        <Document
          file={url}
          onLoadSuccess={({ numPages: n }) => { setNumPages(n); setPageNumber(1); }}
          loading={<div className="flex items-center justify-center h-full w-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
          error={<div className="flex items-center justify-center h-full w-full text-destructive text-sm">Failed to load document.</div>}
          className="flex flex-1 overflow-hidden w-full"
        >
          {showThumbnails && numPages > 0 && (
            <div className="hidden md:flex w-36 shrink-0 overflow-y-auto bg-gray-100 border-r flex-col items-center py-3 gap-3">
              {Array.from({ length: numPages }, (_, i) => {
                const n = i + 1;
                return (
                  <button key={n} ref={el => { thumbnailRefs.current[n] = el; }} onClick={() => goToPage(n)}
                    className={`flex flex-col items-center gap-1 px-2 py-1 rounded w-full transition-colors ${pageNumber === n ? 'bg-blue-100 ring-1 ring-blue-400' : 'hover:bg-gray-200'}`}>
                    <Thumbnail pageNumber={n} width={108} />
                    <span className="text-xs tabular-nums text-gray-500">{n}</span>
                  </button>
                );
              })}
            </div>
          )}
          <div ref={pagesAreaRef} className="overflow-auto flex flex-col items-center py-8 gap-8 flex-1 bg-gray-200">
            {numPages > 0 && Array.from({ length: numPages }, (_, i) => {
              const n = i + 1;
              const pw = Math.floor(containerWidth * 0.92);
              const inWindow = Math.abs(n - pageNumber) <= WINDOW;
              return (
                <div key={n} ref={el => { pageRefs.current[n] = el; }} className="flex justify-center">
                  {inWindow
                    ? <Page pageNumber={n} width={pw} renderTextLayer renderAnnotationLayer className="shadow-md" />
                    : <div style={{ width: pw, height: Math.floor(pw * 1.414) }} className="bg-white shadow-md" />
                  }
                </div>
              );
            })}
          </div>
        </Document>
      </div>
      {floatingNav}
      </>
    );
  }

  // Default mode: pages flow naturally with the page, sticky thumbnail sidebar
  return (
    <>
    <Document
      file={url}
      onLoadSuccess={({ numPages: n }) => { setNumPages(n); setPageNumber(1); }}
      loading={<div className="flex items-center justify-center py-24 w-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
      error={<div className="flex items-center justify-center py-24 w-full text-destructive text-sm">Failed to load document.</div>}
      className="flex w-full items-start"
    >
      {/* Sticky sidebar */}
      {showThumbnails && numPages > 0 && (
        <div className="hidden md:flex sticky top-0 h-screen w-40 shrink-0 overflow-y-auto bg-gray-50 border-r border-gray-200 flex-col items-center pt-4 pb-4 gap-2">
          {Array.from({ length: numPages }, (_, i) => {
            const n = i + 1;
            return (
              <button key={n} ref={el => { thumbnailRefs.current[n] = el; }} onClick={() => goToPage(n)}
                className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-md w-full transition-all ${
                  pageNumber === n
                    ? 'bg-primary/10 ring-1 ring-primary/40'
                    : 'hover:bg-gray-100'
                }`}>
                <Thumbnail pageNumber={n} width={112} />
                <span className="text-[11px] tabular-nums text-gray-400">{n}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Pages — full width, no cap, natural document feel */}
      <div ref={pagesAreaRef} className="flex-1 flex flex-col items-center py-6 gap-5 bg-[#e8e8e8]">
        {numPages > 0 && Array.from({ length: numPages }, (_, i) => {
          const n = i + 1;
          const pw = Math.floor(containerWidth * 0.97);
          const inWindow = Math.abs(n - pageNumber) <= WINDOW;
          return (
            <div key={n} ref={el => { pageRefs.current[n] = el; }} className="w-full flex justify-center">
              {inWindow
                ? <Page pageNumber={n} width={pw} renderTextLayer renderAnnotationLayer className="shadow-[0_2px_8px_rgba(0,0,0,0.15)]" />
                : <div style={{ width: pw, height: Math.floor(pw * 1.414) }} className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]" />
              }
            </div>
          );
        })}
        <div className="h-8" />
      </div>
    </Document>
    {floatingNav}
    </>
  );
};

export default PdfViewer;
