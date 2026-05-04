import React from 'react';

type Props = {
  url: string;
  title?: string;
  height?: number | string;
  onClose?: () => void;
  allowDownload?: boolean;
};

const PdfViewer: React.FC<Props> = ({ url, title, height = 640, onClose, allowDownload = true }) => {
  // ...existing code...
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-5xl bg-white rounded shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium">{title || 'PDF Viewer'}</div>
            {allowDownload && url && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground underline"
                download
              >
                Download
              </a>
            )}
          </div>
          <div>
            <button
              aria-label="Close PDF viewer"
              onClick={() => onClose && onClose()}
              className="text-sm px-3 py-1 rounded hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>

        <div className="bg-gray-50" style={{ height }}>
          <iframe
            src={url}
            title={title || 'pdf-viewer'}
            width="100%"
            height="100%"
            className="block"
            style={{ border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;

