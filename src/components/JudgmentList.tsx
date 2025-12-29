import { useState } from "react";
import { useGetJudgments, useGetJudgmentsByCourtLevel } from "@/hooks/useJudgments";

type Props = {
  fixedCourt?: string;   // e.g. "High Court" | "Court of Appeal" | "Supreme Court"
  title?: string;
};

export default function JudgmentList({ fixedCourt, title }: Props) {
  const [page, setPage] = useState(0);
  const size = 10;

  // Always call both hooks (React rules)
  const allJudgmentsQuery = useGetJudgments({ page, size, sort: 'judgmentDate,desc' });
  const courtJudgmentsQuery = useGetJudgmentsByCourtLevel(
    fixedCourt || 'Supreme Court',
    { page, size, sort: 'judgmentDate,desc' }
  );

  // Choose which result to use based on fixedCourt
  const { data: judgmentsData, isLoading, isError } = fixedCourt
    ? courtJudgmentsQuery
    : allJudgmentsQuery;

  const judgments = judgmentsData?.content || [];
  const totalPages = judgmentsData?.totalPages || 1;
  const totalElements = judgmentsData?.totalElements || 0;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {title || (fixedCourt ? `${fixedCourt} Judgments` : "Judgments")}
        </h1>
        <div className="text-sm text-slate-600">
          {isLoading ? "Loading…" : `Showing ${judgments.length} of ${totalElements}`}
        </div>
      </div>

      {isError && <div className="text-red-600">Failed to load judgments from API.</div>}

      <ul className="divide-y rounded border bg-white">
        {judgments.map((j) => (
          <li key={j.id} className="p-4 hover:bg-slate-50">
            <div className="font-medium">{j.caseName}</div>
            <div className="text-sm text-slate-600">
              {j.courtName || "Court N/A"} • {j.judgmentDate ? new Date(j.judgmentDate).getFullYear() : "Year N/A"}
            </div>
            {j.summary && <p className="mt-1 text-slate-700 line-clamp-2">{j.summary}</p>}
            {j.caseNumber && <div className="text-xs text-slate-500 mt-1">{j.caseNumber}</div>}
          </li>
        ))}
      </ul>

      {judgments.length === 0 && !isLoading && (
        <div className="text-center py-8 text-slate-500">No judgments found.</div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 pt-4">
          <button
            className="px-3 py-2 border rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page <= 0 || isLoading}
          >
            Prev
          </button>
          <span className="text-sm">Page {page + 1} / {totalPages}</span>
          <button
            className="px-3 py-2 border rounded disabled:opacity-50"
            onClick={() => setPage((p) => (p < totalPages - 1 ? p + 1 : p))}
            disabled={page >= totalPages - 1 || isLoading}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
