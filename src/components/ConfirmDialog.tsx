import React from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = 'Delete this document?',
  description = 'This action cannot be undone. The document and any associated PDF will be permanently removed from the archive.',
  confirmLabel = 'Delete',
  isLoading = false,
  onConfirm,
  onCancel,
}) => (
  <AlertDialog open={open} onOpenChange={open => { if (!open) onCancel(); }}>
    <AlertDialogContent className="max-w-sm">
      <AlertDialogHeader>
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 mx-auto mb-2">
          <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <AlertDialogTitle className="text-center">{title}</AlertDialogTitle>
        <AlertDialogDescription className="text-center">
          {description}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
        {/* Confirm first (destructive) so it's visually prominent */}
        <Button
          variant="destructive"
          className="w-full"
          disabled={isLoading}
          onClick={onConfirm}
        >
          {isLoading ? (
            <><Loader2 className="h-4 w-4 me-2 animate-spin" /> Deleting…</>
          ) : (
            <><Trash2 className="h-4 w-4 me-2" /> {confirmLabel}</>
          )}
        </Button>
        {/* AlertDialogCancel auto-fires onOpenChange(false) → calls onCancel */}
        <AlertDialogCancel className="w-full mt-0" disabled={isLoading}>
          Cancel
        </AlertDialogCancel>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default ConfirmDialog;
