export type DocCategory = 'SRS' | 'Data Dictionary' | 'CRF' | 'Integration' | 'Technical' | 'General';

export interface DocumentMeta {
  id: string;
  title: string;
  category: DocCategory;
  department: string;
  author: string;
  version: string;
  uploadDate: string;
  tags: string[];
  summary?: string;
}

export interface DocumentData extends DocumentMeta {
  contentHtml?: string; // Fallback for legacy/mock data
  fileData?: string;    // Base64 encoded DOCX file
  rawText: string;     // The raw text for AI search/indexing
}

export interface KPI {
  totalDocs: number;
  byCategory: { name: string; value: number }[];
  byDepartment: { name: string; value: number }[];
  recentUploads: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'viewer';
}

export interface SearchResult {
  docId: string;
  title: string;
  score: number;
  snippet: string;
  aiReasoning?: string;
}