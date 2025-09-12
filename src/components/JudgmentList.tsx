import { useState } from "react";
import { useJudgments } from "../hooks/useJudgments";

type Props = {
  fixedCourt?: string;   // e.g. "High Court" | "Court of Appeal" | "Supreme Court"
  title?: string;
};

export default function JudgmentList({ fixedCourt, title }: Props) {
  const [q, setQ] = useState("");
  const [year, setYear] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useJudgments({
    q,
    court: fixedCourt,
    year,
    page,
    size: 10,
  });

  const total = data?.total ?? 0;
  const size = data?.size ?? 10;
  const maxPage = Math.max(1, Math.ceil(total / size));

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {title || (fixedCourt ? `${fixedCourt} Judgments` : "Judgments")}
        </h1>
        <div className="text-sm text-slate-600">
          {isLoading ? "Loading…" : `Showing ${(data?.items ?? []).length} of ${total}`}
        </div>
      </div>

      {/* Filters (search + year). Court is fixed through props */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={q}
          onChange={(e) => { setPage(1); setQ(e.target.value); }}
          placeholder="Search title, parties, judges…"
          className="border rounded px-3 py-2"
        />
        <input
          value={year}
          onChange={(e) => { setPage(1); setYear(e.target.value); }}
          placeholder="Year (e.g. 2024)"
          className="border rounded px-3 py-2"
        />
        {fixedCourt && (
          <input value={fixedCourt} readOnly className="border rounded px-3 py-2 bg-slate-50" />
        )}
      </div>

      {isError && <div className="text-red-600">Failed to load judgments.</div>}

      <ul className="divide-y rounded border bg-white">
        {(data?.items ?? []).map((j, i) => (
          <li key={`${j._id ?? j.title}-${i}`} className="p-4 hover:bg-slate-50">
            <div className="font-medium">{j.title}</div>
            <div className="text-sm text-slate-600">
              {(j.court ?? "Court N/A")} • {(j.year ?? "Year N/A")}
            </div>
            {j.summary && <p className="mt-1 text-slate-700">{j.summary}</p>}
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div className="flex items-center gap-2 pt-4">
        <button
          className="px-3 py-2 border rounded disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || isLoading}
        >
          Prev
        </button>
        <span className="text-sm">Page {data?.page ?? page} / {maxPage}</span>
        <button
          className="px-3 py-2 border rounded disabled:opacity-50"
          onClick={() => setPage((p) => (p < maxPage ? p + 1 : p))}
          disabled={page >= maxPage || isLoading || total === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
}
