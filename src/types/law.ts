export type LawDoc = {
  id: string;
  title: string;
  type: "Act" | "Constitution" | "Regulation" | "Rule" | string;
  year?: number;
  category?: string;
  status?: string;
  sections?: number;
  lastAmended?: string;
  summary?: string;
  pdfUrl?: string;
  htmlUrl?: string;
  frbrUri?: string;
};
