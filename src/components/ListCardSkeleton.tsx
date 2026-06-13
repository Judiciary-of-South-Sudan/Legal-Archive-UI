import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  count?: number;
}

const ListCardSkeleton: React.FC<Props> = ({ count = 8 }) => (
  <div className="divide-y divide-border border border-border rounded-md bg-card">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-start gap-4 px-4 py-3">
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-10" />
          </div>
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="shrink-0 pt-0.5">
          <Skeleton className="h-7 w-12 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

export default ListCardSkeleton;
