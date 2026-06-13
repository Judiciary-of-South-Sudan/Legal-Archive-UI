import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2, XCircle, RotateCcw, Clock, User, FileText,
} from 'lucide-react';
import apiClient from '@/lib/apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReviewItem {
  id: string;
  documentType: 'Law' | 'Judgment' | 'Notice' | 'Decree';
  collection: 'laws' | 'judgments' | 'notices' | 'decrees';
  title: string;
  subType: string;
  year: number;
  verificationStatus: 'DRAFT' | 'UNDER_REVIEW' | 'PUBLISHED';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  entityTitle: string;
  performedBy: string;
  timestamp: string;
  details: string | null;
}

interface Props {
  item: ReviewItem | null;
  onClose: () => void;
  onAction: (item: ReviewItem, newStatus: 'PUBLISHED' | 'UNDER_REVIEW' | 'DRAFT', comment: string) => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACTION_CFG: Record<string, { label: string; cls: string }> = {
  CREATED:        { label: 'Created',        cls: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  UPDATED:        { label: 'Edited',         cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  STATUS_CHANGED: { label: 'Status Changed', cls: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
  DELETED:        { label: 'Deleted',        cls: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  PDF_UPLOADED:   { label: 'PDF Uploaded',   cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
};

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  DRAFT:        { label: 'Draft',        cls: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  UNDER_REVIEW: { label: 'Under Review', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' },
  PUBLISHED:    { label: 'Published',    cls: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300' },
};

const fmtDate = (iso: string) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
};

// ─── Component ────────────────────────────────────────────────────────────────

const VerifyDocument: React.FC<Props> = ({ item, onClose, onAction }) => {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: history = [], isLoading: historyLoading } = useQuery<AuditEntry[]>({
    queryKey: ['audit', item?.id],
    queryFn: () =>
      apiClient.get(`/admin/audit/${item!.id}`).then(r => r.data.data ?? []),
    enabled: !!item,
  });

  if (!item) return null;

  const statusCfg = STATUS_CFG[item.verificationStatus] ?? STATUS_CFG.DRAFT;

  const handleAction = async (newStatus: 'PUBLISHED' | 'UNDER_REVIEW' | 'DRAFT') => {
    setSubmitting(true);
    try {
      await onAction(item, newStatus, comment);
      setComment('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  // Available transitions based on current status
  const isDraft      = item.verificationStatus === 'DRAFT';
  const isUnderReview = item.verificationStatus === 'UNDER_REVIEW';
  const isPublished  = item.verificationStatus === 'PUBLISHED';

  return (
    <Dialog open={!!item} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col gap-0 p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-semibold leading-snug line-clamp-2">
                {item.title}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs font-medium text-muted-foreground">{item.documentType}</span>
                {item.subType && (
                  <span className="text-xs text-muted-foreground">· {item.subType}</span>
                )}
                {item.year > 0 && (
                  <span className="text-xs text-muted-foreground">· {item.year}</span>
                )}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusCfg.cls}`}>
                  {statusCfg.label}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><User className="h-3 w-3" /> {item.createdBy}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Uploaded {fmtDate(item.createdAt)}</span>
          </div>
        </DialogHeader>

        {/* Audit History */}
        <div className="flex-1 overflow-hidden px-6 py-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Audit Trail
          </p>
          <ScrollArea className="h-48 pe-2">
            {historyLoading ? (
              <p className="text-sm text-muted-foreground">Loading history…</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No audit entries yet.</p>
            ) : (
              <ol className="relative border-s border-border ms-2 space-y-4">
                {history.map(entry => {
                  const cfg = ACTION_CFG[entry.action] ?? { label: entry.action, cls: 'bg-gray-100 text-gray-700' };
                  // Parse comment out of details like "DRAFT → PUBLISHED | Great content"
                  const parts = entry.details ? entry.details.split(' | ') : [];
                  const transition = parts[0] ?? null;
                  const entryComment = parts.slice(1).join(' | ') || null;

                  return (
                    <li key={entry.id} className="ms-4">
                      <span className="absolute -start-1.5 mt-1 h-3 w-3 rounded-full border bg-background border-border" />
                      <div className="flex items-start gap-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{fmtDate(entry.timestamp)}</span>
                        <span className="text-xs text-muted-foreground">by {entry.performedBy}</span>
                      </div>
                      {transition && (
                        <p className="text-xs font-mono text-muted-foreground mt-1">{transition}</p>
                      )}
                      {entryComment && (
                        <p className="text-xs text-foreground mt-1 italic">"{entryComment}"</p>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </ScrollArea>
        </div>

        <Separator />

        {/* Decision area */}
        <div className="px-6 py-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Decision Comment
          </p>
          <Textarea
            placeholder="Add a comment explaining your decision (optional)"
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            className="resize-none text-sm"
          />
        </div>

        <DialogFooter className="px-6 pb-6 flex-row justify-between gap-2">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {/* DRAFT → submit for review or publish directly */}
            {isDraft && (
              <Button
                variant="outline"
                disabled={submitting}
                onClick={() => handleAction('UNDER_REVIEW')}
                className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/40"
              >
                <Clock className="h-3.5 w-3.5 me-1.5" />
                {submitting ? 'Submitting…' : 'Submit for Review'}
              </Button>
            )}
            {isDraft && (
              <Button
                disabled={submitting}
                onClick={() => handleAction('PUBLISHED')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle2 className="h-3.5 w-3.5 me-1.5" />
                {submitting ? 'Publishing…' : 'Publish Directly'}
              </Button>
            )}

            {/* UNDER_REVIEW → return to draft or approve */}
            {isUnderReview && (
              <Button
                variant="outline"
                disabled={submitting}
                onClick={() => handleAction('DRAFT')}
                className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <RotateCcw className="h-3.5 w-3.5 me-1.5" />
                {submitting ? 'Saving…' : 'Return to Draft'}
              </Button>
            )}
            {isUnderReview && (
              <Button
                disabled={submitting}
                onClick={() => handleAction('PUBLISHED')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle2 className="h-3.5 w-3.5 me-1.5" />
                {submitting ? 'Publishing…' : 'Approve & Publish'}
              </Button>
            )}

            {/* PUBLISHED → unpublish */}
            {isPublished && (
              <Button
                variant="outline"
                disabled={submitting}
                onClick={() => handleAction('DRAFT')}
                className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <XCircle className="h-3.5 w-3.5 me-1.5" /> Unpublish
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VerifyDocument;
