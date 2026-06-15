// API Response Types based on backend documentation

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  username: string;
  email: string;
  roles: string[];
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  organization?: string;
  position?: string;
  roles?: string[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  organization?: string;
  position?: string;
  roles: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CurrentUser {
  username: string;
  authorities: string[];
  authenticated: boolean;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// Law Types
export interface Law {
  id: string;
  frbrUri?: string;
  title: string;
  type: string;
  year: number;
  lawNumber?: string;
  enactmentDate?: string;
  commencementDate?: string;
  publicationDate?: string;
  effectiveDate?: string;
  lastAmended?: string;
  category?: string;
  jurisdiction?: string;
  issuingAuthority?: string;
  ministry?: string;
  publisher?: string;
  gazetteVolume?: string;
  gazetteIssue?: string;
  gazetteDate?: string;
  status?: string;
  summary?: string;
  fullText?: string;
  keywords?: string[];
  tags?: string[];
  pdfUrl?: string;
  sourceUrl?: string;
  sourceProvenance?: string;
  relatedLaws?: string[];
  amendments?: string[];
  repealedBy?: string;
  repealDate?: string;
  language?: string;
  verificationStatus?: string;
  createdBy?: string;
  updatedBy?: string;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLawRequest {
  title: string;
  type: string;
  year: number;
  lawNumber?: string;
  enactmentDate?: string;
  commencementDate?: string;
  publicationDate?: string;
  effectiveDate?: string;
  lastAmended?: string;
  category?: string;
  jurisdiction?: string;
  issuingAuthority?: string;
  ministry?: string;
  publisher?: string;
  gazetteVolume?: string;
  gazetteIssue?: string;
  gazetteDate?: string;
  status?: string;
  summary?: string;
  fullText?: string;
  keywords?: string[];
  tags?: string[];
  pdfUrl?: string;
  sourceUrl?: string;
  sourceProvenance?: string;
  relatedLaws?: string[];
  amendments?: string[];
  repealedBy?: string;
  repealDate?: string;
  language?: string;
  verificationStatus?: string;
}

// Republican Decree Types
export interface RepublicanDecree {
  id: string;
  decreeNumber?: string;
  title: string;
  decreeDate?: string;
  year?: number;
  decreeType?: string;
  issuedBy?: string;
  subject?: string;
  personnel?: string[];
  summary?: string;
  fullText?: string;
  pdfUrl?: string;
  htmlUrl?: string;
  frbrUri?: string;
  tags?: string[];
  language?: string;
  gazetteVolume?: string;
  gazetteIssue?: string;
  gazetteDate?: string;
  sourceUrl?: string;
  sourceProvenance?: string;
  verificationStatus?: string;
  createdBy?: string;
  updatedBy?: string;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDecreeRequest {
  decreeNumber?: string;
  title: string;
  decreeDate?: string;
  year?: number;
  decreeType?: string;
  issuedBy?: string;
  subject?: string;
  personnel?: string[];
  summary?: string;
  fullText?: string;
  pdfUrl?: string;
  htmlUrl?: string;
  frbrUri?: string;
  tags?: string[];
  language?: string;
  gazetteVolume?: string;
  gazetteIssue?: string;
  gazetteDate?: string;
  sourceUrl?: string;
  sourceProvenance?: string;
  verificationStatus?: string;
}

export interface LawStats {
  totalLaws: number;
  activeCount: number;
  repealedCount: number;
  byYear: Record<string, number>;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
}

// Judgment Types
export interface Judgment {
  id: string;
  frbrUri?: string;
  caseNumber?: string;
  caseName: string;
  courtName: string;
  courtLevel: string;
  judges?: string[];
  judgmentDate?: string;
  parties?: string;
  caseType?: string;
  verdict?: string;
  summary?: string;
  fullText?: string;
  legalPrinciples?: string[];
  citedCases?: string[];
  citedLaws?: string[];
  keywords?: string[];
  tags?: string[];
  jurisdiction?: string;
  language?: string;
  pdfUrl?: string;
  sourceUrl?: string;
  sourceProvenance?: string;
  status?: string;
  verificationStatus?: string;
  createdBy?: string;
  updatedBy?: string;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJudgmentRequest {
  caseNumber?: string;
  caseName: string;
  courtName: string;
  courtLevel: string;
  judges?: string[];
  judgmentDate?: string;
  parties?: string;
  caseType?: string;
  verdict?: string;
  summary?: string;
  fullText?: string;
  legalPrinciples?: string[];
  citedCases?: string[];
  citedLaws?: string[];
  keywords?: string[];
  tags?: string[];
  jurisdiction?: string;
  language?: string;
  pdfUrl?: string;
  sourceUrl?: string;
  sourceProvenance?: string;
  status?: string;
  verificationStatus?: string;
}

// Legal Notice Types
export interface LegalNotice {
  id: string;
  frbrUri?: string;
  noticeNumber?: string;
  title: string;
  type: string;
  publicationDate?: string;
  issuingAuthority: string;
  ministry?: string;
  department?: string;
  gazetteVolume?: string;
  gazetteIssue?: string;
  gazetteDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  summary?: string;
  fullText?: string;
  applicableLaws?: string[];
  relatedLaws?: string[];
  amendsLaws?: string[];
  keywords?: string[];
  tags?: string[];
  jurisdiction?: string;
  language?: string;
  pdfUrl?: string;
  sourceUrl?: string;
  sourceProvenance?: string;
  status?: string;
  verificationStatus?: string;
  createdBy?: string;
  updatedBy?: string;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLegalNoticeRequest {
  noticeNumber?: string;
  title: string;
  type: string;
  publicationDate?: string;
  issuingAuthority: string;
  ministry?: string;
  department?: string;
  gazetteVolume?: string;
  gazetteIssue?: string;
  gazetteDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  summary?: string;
  fullText?: string;
  applicableLaws?: string[];
  relatedLaws?: string[];
  amendsLaws?: string[];
  keywords?: string[];
  tags?: string[];
  jurisdiction?: string;
  language?: string;
  pdfUrl?: string;
  sourceUrl?: string;
  sourceProvenance?: string;
  status?: string;
  verificationStatus?: string;
}

// Judicial Opinion Types
export interface JudicialOpinion {
  id: string;
  title: string;
  authorJudge: string;
  court?: string;
  publicationDate?: string;
  topic?: string;
  summary?: string;
  keywords?: string[];
  tags?: string[];
  pdfUrl?: string;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

// Query Parameters
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface LawFilterParams extends PaginationParams {
  type?: string;
  year?: number;
  status?: string;
  category?: string;
}

export interface JudgmentFilterParams extends PaginationParams {
  courtLevel?: string;
  caseType?: string;
  status?: string;
  yearFrom?: number;
  yearTo?: number;
}

export interface NoticeFilterParams extends PaginationParams {
  type?: string;
  status?: string;
  yearFrom?: number;
  yearTo?: number;
}

export interface SearchParams extends PaginationParams {
  query: string;
}

export interface DateRangeParams extends PaginationParams {
  startDate: string;
  endDate: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  documentId: string;
  documentType: 'LAW' | 'JUDGMENT' | 'NOTICE' | 'DECREE';
  title: string;
  createdAt: string;
}
