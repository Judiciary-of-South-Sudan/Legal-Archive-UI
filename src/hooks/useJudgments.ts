import { useQuery } from "@tanstack/react-query";
import { api, Paginated, Judgment } from "../lib/api";

export type JudgmentsParams = {
  q?: string;
  court?: string;
  year?: number | string;
  page?: number;
  size?: number;
};

export function useJudgments(params: JudgmentsParams) {
  const queryString = new URLSearchParams(
    Object.fromEntries(
      Object.entries({
        q: params.q ?? "",
        court: params.court ?? "",
        year: params.year ? String(params.year) : "",
        page: String(params.page ?? 1),
        size: String(params.size ?? 10),
      }).filter(([, v]) => v !== "" && v !== "undefined")
    )
  ).toString();

  return useQuery({
    queryKey: ["judgments", queryString],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Judgment>>(`/v1/judgments?${queryString}`);
      return data;
    },
    staleTime: 60_000,
  });
}
