import axios from "axios";

interface ImportMetaEnv {
  VITE_API_URL?: string;
}

// Vite already provides the ImportMeta interface with env, so no need to redeclare it.

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  withCredentials: false,
});

export type Judgment = {
  _id?: string;
  type: "judgment" | "law" | "notice" | "opinion";
  title: string;
  summary?: string;
  court?: string;
  year?: number;
  judges?: string[];
  parties?: string[];
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
  facets?: Record<string, { value: string | number; count: number }[]>;
};
