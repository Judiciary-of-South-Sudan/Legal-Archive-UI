import { Download } from 'lucide-react';
import apiClient from '@/lib/apiClient';

interface BulkDownloadLinkProps {
  type: 'laws' | 'judgments' | 'notices' | 'decrees';
  label: string;
}

// Plain <a> on purpose — this triggers a real ZIP file download (BulkDownloadController),
// not a client-side route, so it shouldn't go through React Router.
export const BulkDownloadLink = ({ type, label }: BulkDownloadLinkProps) => (
  <a
    href={`${apiClient.defaults.baseURL}/download/bulk?type=${type}`}
    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
  >
    <Download className="h-3.5 w-3.5" />
    {label}
  </a>
);
