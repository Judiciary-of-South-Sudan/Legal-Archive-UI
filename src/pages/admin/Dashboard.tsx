import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import VerifyDocument from '@/components/admin/VerifyDocument';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText, Gavel, FileWarning, Users, BarChart3, TrendingUp,
  UserCog, Eye, Download, Search, ClipboardList, RefreshCw, CheckCircle2,
  Clock, AlertTriangle, Scale, BookOpen, Layers, ShieldCheck,
  XCircle, ChevronRight,
} from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalLaws: number; totalJudgments: number; totalLegalNotices: number; totalUsers: number;
  totalDocuments: number;
  lawsThisYear: number; judgmentsThisYear: number; noticesThisYear: number;
  publishedLaws: number; publishedJudgments: number; publishedNotices: number;
  underReviewLaws: number; underReviewJudgments: number; underReviewNotices: number;
  lawsWithoutPdf: number; judgmentsWithoutPdf: number; noticesWithoutPdf: number;
}

interface ActivitySummary {
  period: string; newLaws: number; newJudgments: number;
  newLegalNotices: number; totalNewDocuments: number;
}

interface DocTypeStats  { type: string; views: number; downloads: number; }
interface SearchTermStat { term: string; count: number; }
interface MonthlyDocStat { month: string; laws: number; judgments: number; notices: number; total: number; }

interface AnalyticsSummary {
  totalViews: number; totalDownloads: number; totalSearches: number;
  byType: DocTypeStats[]; topSearchTerms: SearchTermStat[]; monthlyDocuments: MonthlyDocStat[];
}

interface AuditEntry {
  id: string; action: string; entityType: string; entityId: string;
  entityTitle: string; performedBy: string; timestamp: string; details: string | null;
}

interface ReviewItem {
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

// ─── Config ───────────────────────────────────────────────────────────────────

const ACTION_CFG: Record<string, { label: string; cls: string }> = {
  CREATED:        { label: 'Created',        cls: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  UPDATED:        { label: 'Edited',         cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  STATUS_CHANGED: { label: 'Status Changed', cls: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
  DELETED:        { label: 'Deleted',        cls: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  PDF_UPLOADED:   { label: 'PDF Uploaded',   cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
};

const TYPE_CLS: Record<string, string> = {
  Law:      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300',
  Judgment: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300',
  Notice:   'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300',
};

const fmtDate = (iso: string) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
};

const pct = (n: number, total: number) => total === 0 ? 0 : Math.round((n / total) * 100);

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon, label, total, published, underReview, thisYear, color,
}: {
  icon: React.ReactNode; label: string; total: number;
  published: number; underReview: number; thisYear: number; color: string;
}) {
  const draft = total - published - underReview;
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-3xl font-bold">{total.toLocaleString()}</div>
        <Progress value={pct(published, total)} className="h-1.5" />
        <div className="grid grid-cols-3 gap-1 text-xs">
          <div className="text-center">
            <div className="font-semibold text-green-600 dark:text-green-400">{published}</div>
            <div className="text-muted-foreground">Published</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600 dark:text-blue-400">{underReview}</div>
            <div className="text-muted-foreground">Review</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-muted-foreground">{draft}</div>
            <div className="text-muted-foreground">Draft</div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground border-t pt-2">+{thisYear} uploaded this year</p>
      </CardContent>
    </Card>
  );
}

function MetricCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminDashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [reviewLoading, setReviewLoading] = useState<Record<string, boolean>>({});
  const [verifyItem, setVerifyItem]   = useState<ReviewItem | null>(null);
  const [auditFilter, setAuditFilter] = useState<string>('ALL');
  const [auditLimit, setAuditLimit]   = useState(50);
  const [refreshing, setRefreshing]   = useState(false);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ['admin', 'stats'],
    queryFn: () => apiClient.get('/admin/dashboard').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: activity, refetch: refetchActivity } = useQuery<ActivitySummary>({
    queryKey: ['admin', 'activity'],
    queryFn: () => apiClient.get('/admin/activity').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: analytics, refetch: refetchAnalytics } = useQuery<AnalyticsSummary>({
    queryKey: ['admin', 'analytics'],
    queryFn: () => apiClient.get('/admin/analytics').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: auditLog = [], refetch: refetchAudit } = useQuery<AuditEntry[]>({
    queryKey: ['admin', 'audit', auditLimit],
    queryFn: () => apiClient.get(`/admin/audit?limit=${auditLimit}`).then(r => r.data.data ?? []),
    staleTime: 5 * 60 * 1000,
  });

  const { data: reviewQueue = [], isLoading: reviewQueueLoading, refetch: refetchReviewQueue } = useQuery<ReviewItem[]>({
    queryKey: ['admin', 'reviewQueue'],
    queryFn: () => apiClient.get('/admin/review-queue').then(r => r.data.data ?? []),
    staleTime: 5 * 60 * 1000,
  });

  const loading = statsLoading || reviewQueueLoading;

  const handleReviewAction = async (item: ReviewItem, action: 'PUBLISHED' | 'UNDER_REVIEW' | 'DRAFT', comment = '') => {
    setReviewLoading(prev => ({ ...prev, [item.id]: true }));
    try {
      await apiClient.put(`/admin/${item.collection}/${item.id}/status`, {
        verificationStatus: action,
        comment: comment || undefined,
      });
      if (action === 'UNDER_REVIEW') {
        queryClient.setQueryData<ReviewItem[]>(['admin', 'reviewQueue'], prev =>
          (prev ?? []).map(r => r.id === item.id ? { ...r, verificationStatus: 'UNDER_REVIEW' } : r)
        );
      } else {
        queryClient.setQueryData<ReviewItem[]>(['admin', 'reviewQueue'], prev =>
          (prev ?? []).filter(r => r.id !== item.id)
        );
        queryClient.setQueryData<DashboardStats>(['admin', 'stats'], prev => prev ? {
          ...prev,
          underReviewLaws:      item.documentType === 'Law'      ? prev.underReviewLaws - 1      : prev.underReviewLaws,
          underReviewJudgments: item.documentType === 'Judgment' ? prev.underReviewJudgments - 1 : prev.underReviewJudgments,
          underReviewNotices:   item.documentType === 'Notice'   ? prev.underReviewNotices - 1   : prev.underReviewNotices,
          publishedLaws:        action === 'PUBLISHED' && item.documentType === 'Law'      ? prev.publishedLaws + 1      : prev.publishedLaws,
          publishedJudgments:   action === 'PUBLISHED' && item.documentType === 'Judgment' ? prev.publishedJudgments + 1 : prev.publishedJudgments,
          publishedNotices:     action === 'PUBLISHED' && item.documentType === 'Notice'   ? prev.publishedNotices + 1   : prev.publishedNotices,
        } : prev);
      }
      const toastMsg = action === 'PUBLISHED' ? `"${item.title}" published`
        : action === 'UNDER_REVIEW' ? `"${item.title}" submitted for review`
        : `"${item.title}" returned to draft`;
      toast.success(toastMsg);
    } catch {
      toast.error('Action failed');
    } finally {
      setReviewLoading(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchActivity(), refetchAnalytics(), refetchAudit(), refetchReviewQueue()]);
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const loadMoreAudit = () => setAuditLimit(prev => prev + 50);

  const filteredAudit = auditFilter === 'ALL'
    ? auditLog
    : auditLog.filter(e => e.action === auditFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64 gap-3 text-muted-foreground">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading dashboard…
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalDocs = (stats?.totalLaws ?? 0) + (stats?.totalJudgments ?? 0) + (stats?.totalLegalNotices ?? 0);
  const totalPublished = (stats?.publishedLaws ?? 0) + (stats?.publishedJudgments ?? 0) + (stats?.publishedNotices ?? 0);
  const totalWithoutPdf = (stats?.lawsWithoutPdf ?? 0) + (stats?.judgmentsWithoutPdf ?? 0) + (stats?.noticesWithoutPdf ?? 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" /> {isAdmin() ? 'Admin Dashboard' : 'Dashboard'}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {isAdmin() ? 'South Sudan Legal Archive — content and system management' : 'Upload and manage your document submissions'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 me-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className={`grid min-w-max sm:w-full sm:max-w-xl ${isAdmin() ? 'grid-cols-4' : 'grid-cols-2'}`}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {isAdmin() && (
              <TabsTrigger value="review" className="relative">
                Unpublished
                {reviewQueue.length > 0 && (
                  <span className="ms-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                    {reviewQueue.length}
                  </span>
                )}
              </TabsTrigger>
            )}
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            {isAdmin() && <TabsTrigger value="audit">Audit Log</TabsTrigger>}
          </TabsList>

          {/* ──────────────── OVERVIEW TAB ──────────────── */}
          <TabsContent value="overview" className="space-y-6">

            {/* Stat cards */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${isAdmin() ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
              <StatCard
                icon={<FileText className="h-4 w-4 text-blue-600" />}
                label="Laws" total={stats?.totalLaws ?? 0}
                published={stats?.publishedLaws ?? 0} underReview={stats?.underReviewLaws ?? 0}
                thisYear={stats?.lawsThisYear ?? 0} color="bg-blue-50 dark:bg-blue-950"
              />
              <StatCard
                icon={<Gavel className="h-4 w-4 text-purple-600" />}
                label="Judgments" total={stats?.totalJudgments ?? 0}
                published={stats?.publishedJudgments ?? 0} underReview={stats?.underReviewJudgments ?? 0}
                thisYear={stats?.judgmentsThisYear ?? 0} color="bg-purple-50 dark:bg-purple-950"
              />
              <StatCard
                icon={<FileWarning className="h-4 w-4 text-amber-600" />}
                label="Notices" total={stats?.totalLegalNotices ?? 0}
                published={stats?.publishedNotices ?? 0} underReview={stats?.underReviewNotices ?? 0}
                thisYear={stats?.noticesThisYear ?? 0} color="bg-amber-50 dark:bg-amber-950"
              />
              {isAdmin() && (
                <Card className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Registered Users</CardTitle>
                    <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-3xl font-bold">{stats?.totalUsers ?? 0}</div>
                    <div className="text-sm text-muted-foreground">{totalDocs} documents total</div>
                    <div className="text-xs text-muted-foreground border-t pt-2">
                      <Link to="/admin/users" className="underline hover:text-foreground">Manage users →</Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Content Health + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Content Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> Content Health
                  </CardTitle>
                  <CardDescription>Publication and PDF coverage across all collections</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Published rate */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Published
                      </span>
                      <span className="font-semibold">{totalPublished} / {totalDocs} <span className="text-muted-foreground font-normal">({pct(totalPublished, totalDocs)}%)</span></span>
                    </div>
                    <Progress value={pct(totalPublished, totalDocs)} className="h-2" />
                  </div>
                  {/* PDF coverage */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <FileText className="h-3.5 w-3.5 text-blue-500" /> Have PDF
                      </span>
                      <span className="font-semibold">
                        {totalDocs - totalWithoutPdf} / {totalDocs} <span className="text-muted-foreground font-normal">({pct(totalDocs - totalWithoutPdf, totalDocs)}%)</span>
                      </span>
                    </div>
                    <Progress value={pct(totalDocs - totalWithoutPdf, totalDocs)} className="h-2" />
                  </div>
                  {/* Missing PDFs breakdown */}
                  {totalWithoutPdf > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-3 space-y-1">
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" /> {totalWithoutPdf} documents missing PDFs
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-xs text-amber-600 dark:text-amber-400">
                        <span>{stats?.lawsWithoutPdf ?? 0} Laws</span>
                        <span>{stats?.judgmentsWithoutPdf ?? 0} Judgments</span>
                        <span>{stats?.noticesWithoutPdf ?? 0} Notices</span>
                      </div>
                    </div>
                  )}
                  {/* Under review */}
                  {((stats?.underReviewLaws ?? 0) + (stats?.underReviewJudgments ?? 0) + (stats?.underReviewNotices ?? 0)) > 0 && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30 p-3">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {(stats?.underReviewLaws ?? 0) + (stats?.underReviewJudgments ?? 0) + (stats?.underReviewNotices ?? 0)} documents under review — see Unpublished tab
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" /> Recent Activity
                  </CardTitle>
                  <CardDescription>New documents added in the {activity?.period ?? 'last 7 days'}</CardDescription>
                </CardHeader>
                <CardContent>
                  {activity ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg bg-primary/5 border px-4 py-3">
                        <span className="text-sm font-medium">Total new documents</span>
                        <span className="text-2xl font-bold text-primary">{activity.totalNewDocuments}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Laws', count: activity.newLaws, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40' },
                          { label: 'Judgments', count: activity.newJudgments, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/40' },
                          { label: 'Notices', count: activity.newLegalNotices, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
                        ].map(({ label, count, color, bg }) => (
                          <div key={label} className={`rounded-lg ${bg} p-3 text-center`}>
                            <div className={`text-xl font-bold ${color}`}>{count}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No activity data available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
                <CardDescription>Upload new content or jump to any section</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {[
                  {
                    label: 'Upload',
                    items: [
                      { to: '/admin/upload-law',      icon: <FileText className="h-5 w-5" />,    label: 'Law',         color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60' },
                      { to: '/admin/upload-judgment',  icon: <Gavel className="h-5 w-5" />,       label: 'Judgment',    color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60' },
                      { to: '/admin/upload-notice',    icon: <FileWarning className="h-5 w-5" />, label: 'Notice',      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60' },
                      { to: '/admin/upload-decree',    icon: <Scale className="h-5 w-5" />,       label: 'Decree',      color: 'text-green-700 bg-green-50 dark:bg-green-950/60' },
                      ...(isAdmin() ? [{ to: '/admin/bulk-import', icon: <Layers className="h-5 w-5" />, label: 'Bulk Import', color: 'text-green-600 bg-green-50 dark:bg-green-950/60' }] : []),
                    ],
                  },
                  {
                    label: 'Browse',
                    items: [
                      { to: '/laws',      icon: <FileText className="h-5 w-5" />,    label: 'Laws',      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60' },
                      { to: '/judgments', icon: <Gavel className="h-5 w-5" />,       label: 'Judgments', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60' },
                      { to: '/notices',   icon: <FileWarning className="h-5 w-5" />, label: 'Notices',   color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60' },
                      { to: '/library',   icon: <BookOpen className="h-5 w-5" />,    label: 'Library',   color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/60' },
                    ],
                  },
                  {
                    label: 'Manage',
                    items: [
                      ...(isAdmin() ? [{ to: '/admin/users', icon: <Users className="h-5 w-5" />, label: 'Users', color: 'text-slate-600 bg-slate-100 dark:bg-slate-800/60' }] : []),
                      { to: '/profile', icon: <UserCog className="h-5 w-5" />, label: 'My Profile', color: 'text-slate-600 bg-slate-100 dark:bg-slate-800/60' },
                    ],
                  },
                ].map(group => (
                  <div key={group.label}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">{group.label}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {group.items.map(({ to, icon, label, color }) => (
                        <Link key={to} to={to}>
                          <div className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer text-center">
                            <div className={`p-2.5 rounded-lg ${color} group-hover:scale-110 transition-transform`}>
                              {icon}
                            </div>
                            <span className="text-xs font-medium leading-tight text-foreground">{label}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ──────────────── UNPUBLISHED TAB ──────────────── */}
          <TabsContent value="review" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-amber-500" /> Unpublished Documents
                    </CardTitle>
                    <CardDescription>
                      {reviewQueue.length === 0
                        ? 'All documents are published'
                        : `${reviewQueue.length} document${reviewQueue.length > 1 ? 's' : ''} not yet visible to the public`}
                    </CardDescription>
                  </div>
                  {reviewQueue.length > 0 && (
                    <span className="text-sm font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full">
                      {reviewQueue.length} unpublished
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {reviewQueue.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                    <div className="p-4 rounded-full bg-green-50 dark:bg-green-950/40">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                    <p className="text-sm font-medium">All clear — everything is published</p>
                    <p className="text-xs text-muted-foreground">
                      Draft and under-review documents appear here so you can publish or reject them.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviewQueue.map(item => {
                      const typeColor = {
                        Law:      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300',
                        Judgment: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300',
                        Notice:   'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
                        Decree:   'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300',
                      }[item.documentType];
                      const typeIcon = {
                        Law:      <FileText className="h-4 w-4" />,
                        Judgment: <Gavel className="h-4 w-4" />,
                        Notice:   <FileWarning className="h-4 w-4" />,
                        Decree:   <Scale className="h-4 w-4" />,
                      }[item.documentType];
                      const detailLink = {
                        Law:      `/laws/${item.id}`,
                        Judgment: `/judgments/${item.id}`,
                        Notice:   `/notices/${item.id}`,
                        Decree:   `/decrees/${item.id}`,
                      }[item.documentType];
                      const isLoading = reviewLoading[item.id];

                      return (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border p-4 hover:bg-muted/20 transition-colors">
                          {/* Type badge + icon */}
                          <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border self-start sm:self-center shrink-0 ${typeColor}`}>
                            {typeIcon} {item.documentType}
                          </div>

                          {/* Main info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2">
                              <p className="text-sm font-semibold leading-snug truncate" title={item.title}>
                                {item.title}
                              </p>
                              <Link to={detailLink} className="shrink-0 text-muted-foreground hover:text-foreground">
                                <ChevronRight className="h-4 w-4 mt-0.5" />
                              </Link>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                              {/* Verification status badge */}
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                item.verificationStatus === 'UNDER_REVIEW'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                              }`}>
                                {item.verificationStatus === 'UNDER_REVIEW' ? 'Under Review' : 'Draft'}
                              </span>
                              {item.subType && (
                                <span className="text-xs text-muted-foreground">{item.subType}</span>
                              )}
                              {item.year > 0 && (
                                <span className="text-xs text-muted-foreground">{item.year}</span>
                              )}
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Uploaded by {item.createdBy || 'unknown'}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              disabled={isLoading}
                              onClick={() => setVerifyItem(item)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <ShieldCheck className="h-3.5 w-3.5 me-1.5" />
                              {isLoading ? 'Saving…' : 'Review'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ──────────────── ANALYTICS TAB ──────────────── */}
          <TabsContent value="analytics" className="space-y-6">
            {analytics ? (
              <>
                {/* Top metric cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricCard
                    icon={<Eye className="h-4 w-4 text-muted-foreground" />}
                    label="Total Views" value={analytics.totalViews.toLocaleString()} sub="across all documents"
                  />
                  <MetricCard
                    icon={<Download className="h-4 w-4 text-muted-foreground" />}
                    label="Total Downloads" value={analytics.totalDownloads.toLocaleString()} sub="PDF downloads"
                  />
                  <MetricCard
                    icon={<Search className="h-4 w-4 text-muted-foreground" />}
                    label="Total Searches" value={analytics.totalSearches.toLocaleString()} sub="recorded search queries"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Views & Downloads by type */}
                  <Card>
                    <CardHeader><CardTitle className="text-base">Views & Downloads by Type</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={analytics.byType} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="views" name="Views" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                          <Bar dataKey="downloads" name="Downloads" fill="#10b981" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Monthly uploads — line chart */}
                  <Card>
                    <CardHeader><CardTitle className="text-base">Monthly Uploads (last 6 months)</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={analytics.monthlyDocuments} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="laws" name="Laws" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="judgments" name="Judgments" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="notices" name="Notices" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Top search terms */}
                {analytics.topSearchTerms.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Top Search Terms</CardTitle>
                      <CardDescription>Most frequently searched queries</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analytics.topSearchTerms.map((s, i) => (
                          <div key={s.term} className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground w-5 text-end font-mono">{i + 1}</span>
                            <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${Math.round((s.count / analytics.topSearchTerms[0].count) * 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium min-w-[120px] truncate">{s.term}</span>
                            <span className="text-xs text-muted-foreground w-8 text-end">{s.count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* By-type breakdown table */}
                <Card>
                  <CardHeader><CardTitle className="text-base">Engagement by Collection</CardTitle></CardHeader>
                  <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-start px-4 py-2.5 font-medium text-muted-foreground">Collection</th>
                            <th className="text-end px-4 py-2.5 font-medium text-muted-foreground">Views</th>
                            <th className="text-end px-4 py-2.5 font-medium text-muted-foreground">Downloads</th>
                            <th className="text-end px-4 py-2.5 font-medium text-muted-foreground">D/L Rate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {analytics.byType.map(r => (
                            <tr key={r.type} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-2.5 font-medium">{r.type}</td>
                              <td className="px-4 py-2.5 text-end">{r.views.toLocaleString()}</td>
                              <td className="px-4 py-2.5 text-end">{r.downloads.toLocaleString()}</td>
                              <td className="px-4 py-2.5 text-end text-muted-foreground">
                                {r.views > 0 ? `${Math.round((r.downloads / r.views) * 100)}%` : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-16">No analytics data available</div>
            )}
          </TabsContent>

          {/* ──────────────── AUDIT LOG TAB ──────────────── */}
          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ClipboardList className="h-4 w-4" /> Audit Log
                    </CardTitle>
                    <CardDescription>Every create, edit, status change, and delete action</CardDescription>
                  </div>
                  {/* Action filter */}
                  <div className="flex flex-wrap gap-1.5">
                    {['ALL', 'CREATED', 'UPDATED', 'STATUS_CHANGED', 'DELETED'].map(f => (
                      <button
                        key={f}
                        onClick={() => setAuditFilter(f)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium border transition-colors ${
                          auditFilter === f
                            ? 'bg-foreground text-background border-foreground'
                            : 'bg-transparent text-muted-foreground border-border hover:border-foreground'
                        }`}
                      >
                        {f === 'STATUS_CHANGED' ? 'Status' : f === 'ALL' ? 'All' : ACTION_CFG[f]?.label ?? f}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredAudit.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No audit entries found</p>
                ) : (
                  <>
                    <div className="space-y-0.5">
                      {filteredAudit.map((entry) => {
                        const cfg = ACTION_CFG[entry.action] ?? { label: entry.action, cls: 'bg-gray-100 text-gray-700' };
                        return (
                          <div key={entry.id} className="flex items-start gap-3 py-2.5 border-b last:border-0 hover:bg-muted/20 rounded px-2 -mx-2 transition-colors">
                            <span className={`shrink-0 mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${cfg.cls}`}>
                              {cfg.label}
                            </span>
                            <span className={`shrink-0 mt-0.5 text-xs font-medium px-2 py-0.5 rounded border ${TYPE_CLS[entry.entityType] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                              {entry.entityType}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium block truncate" title={entry.entityTitle}>
                                {entry.entityTitle}
                              </span>
                              {entry.details && (
                                <span className="text-xs text-muted-foreground font-mono">{entry.details}</span>
                              )}
                            </div>
                            <div className="shrink-0 text-right">
                              <div className="text-xs font-medium">{entry.performedBy}</div>
                              <div className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(entry.timestamp)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {auditLog.length >= auditLimit && (
                      <div className="text-center pt-4">
                        <Button variant="outline" size="sm" onClick={loadMoreAudit}>
                          Load more entries
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      Showing {filteredAudit.length} of {auditLog.length} loaded entries
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />

      <VerifyDocument
        item={verifyItem}
        onClose={() => setVerifyItem(null)}
        onAction={handleReviewAction}
      />
    </div>
  );
};

export default AdminDashboard;
