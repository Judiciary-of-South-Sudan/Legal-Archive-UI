import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Gavel, FileWarning, Users, Upload, BarChart3, TrendingUp, UserCog, Eye, Download, Search, ClipboardList } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface DashboardStats {
  totalLaws: number;
  totalJudgments: number;
  totalLegalNotices: number;
  totalUsers: number;
  totalDocuments: number;
  lawsThisYear: number;
  judgmentsThisYear: number;
  noticesThisYear: number;
}

interface ActivitySummary {
  period: string;
  newLaws: number;
  newJudgments: number;
  newLegalNotices: number;
  totalNewDocuments: number;
}

interface DocTypeStats { type: string; views: number; downloads: number; }
interface SearchTermStat { term: string; count: number; }
interface MonthlyDocStat { month: string; laws: number; judgments: number; notices: number; total: number; }

interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  entityTitle: string;
  performedBy: string;
  timestamp: string;
  details: string | null;
}

interface AnalyticsSummary {
  totalViews: number;
  totalDownloads: number;
  totalSearches: number;
  byType: DocTypeStats[];
  topSearchTerms: SearchTermStat[];
  monthlyDocuments: MonthlyDocStat[];
}

const fmtDate = (iso: string) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
};

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivitySummary | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get('/admin/dashboard'),
      apiClient.get('/admin/activity'),
      apiClient.get('/admin/analytics'),
      apiClient.get('/admin/audit'),
    ])
      .then(([statsRes, activityRes, analyticsRes, auditRes]) => {
        setStats(statsRes.data.data);
        setActivity(activityRes.data.data);
        setAnalytics(analyticsRes.data.data);
        setAuditLog(auditRes.data.data ?? []);
      })
      .catch((error) => {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">{t('admin.dashboard.loading')}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('admin.dashboard.subtitle')}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.dashboard.total_laws')}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalLaws ?? 0}</div>
              <p className="text-xs text-muted-foreground">{t('admin.dashboard.this_year', { count: stats?.lawsThisYear ?? 0 })}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.dashboard.total_judgments')}</CardTitle>
              <Gavel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalJudgments ?? 0}</div>
              <p className="text-xs text-muted-foreground">{t('admin.dashboard.this_year', { count: stats?.judgmentsThisYear ?? 0 })}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.dashboard.legal_notices')}</CardTitle>
              <FileWarning className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalLegalNotices ?? 0}</div>
              <p className="text-xs text-muted-foreground">{t('admin.dashboard.this_year', { count: stats?.noticesThisYear ?? 0 })}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.dashboard.total_users')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                <Link to="/admin/users" className="underline hover:text-foreground">{t('admin.dashboard.manage_users')}</Link>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Upload className="mr-2 h-4 w-4" /> {t('admin.dashboard.upload_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/admin/upload-law"><Button className="w-full" variant="outline" size="sm">{t('admin.dashboard.upload_law')}</Button></Link>
              <Link to="/admin/upload-judgment"><Button className="w-full" variant="outline" size="sm">{t('admin.dashboard.upload_judgment')}</Button></Link>
              <Link to="/admin/upload-notice"><Button className="w-full" variant="outline" size="sm">{t('admin.dashboard.upload_notice')}</Button></Link>
              <Link to="/admin/bulk-import"><Button className="w-full" size="sm">{t('admin.dashboard.bulk_import')}</Button></Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <BarChart3 className="mr-2 h-4 w-4" /> {t('admin.dashboard.browse_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/laws"><Button className="w-full" variant="outline" size="sm">{t('admin.dashboard.all_laws')}</Button></Link>
              <Link to="/judgments"><Button className="w-full" variant="outline" size="sm">{t('admin.dashboard.all_judgments')}</Button></Link>
              <Link to="/notices"><Button className="w-full" variant="outline" size="sm">{t('admin.dashboard.all_notices')}</Button></Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <UserCog className="mr-2 h-4 w-4" /> {t('admin.dashboard.user_mgmt_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{t('admin.dashboard.user_mgmt_desc')}</p>
              <Link to="/admin/users"><Button className="w-full" size="sm">{t('admin.dashboard.manage_users_btn')}</Button></Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <TrendingUp className="mr-2 h-4 w-4" /> {t('admin.dashboard.system_stats')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('admin.dashboard.total_documents')}</span>
                  <span className="font-semibold">{stats?.totalDocuments ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('admin.dashboard.registered_users')}</span>
                  <span className="font-semibold">{stats?.totalUsers ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('admin.dashboard.added_this_year')}</span>
                  <span className="font-semibold">
                    {(stats?.lawsThisYear ?? 0) + (stats?.judgmentsThisYear ?? 0) + (stats?.noticesThisYear ?? 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader><CardTitle>{t('admin.dashboard.recent_activity')}</CardTitle></CardHeader>
          <CardContent>
            {activity ? (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('admin.dashboard.recent_activity_desc')} <span className="font-medium text-foreground">{activity.period}</span>
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{activity.totalNewDocuments}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t('admin.dashboard.total_new')}</div>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-2xl font-bold">{activity.newLaws}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t('nav.laws')}</div>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-2xl font-bold">{activity.newJudgments}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t('nav.judgments')}</div>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-2xl font-bold">{activity.newLegalNotices}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t('nav.notices')}</div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">{t('admin.dashboard.no_activity')}</p>
            )}
          </CardContent>
        </Card>

        {/* Analytics Section */}
        {analytics && (
          <>
            <div>
              <h2 className="text-xl font-semibold mb-4">{t('admin.dashboard.analytics')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('admin.dashboard.total_views')}</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{t('admin.dashboard.across_all_docs')}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('admin.dashboard.total_downloads')}</CardTitle>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalDownloads.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{t('admin.dashboard.pdf_downloads')}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('admin.dashboard.total_searches')}</CardTitle>
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalSearches.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{t('admin.dashboard.recorded_queries')}</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">{t('admin.dashboard.views_downloads_by_type')}</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
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

              <Card>
                <CardHeader><CardTitle className="text-base">{t('admin.dashboard.docs_added_6months')}</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={analytics.monthlyDocuments} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="laws" name="Laws" stackId="a" fill="#3b82f6" />
                      <Bar dataKey="judgments" name="Judgments" stackId="a" fill="#8b5cf6" />
                      <Bar dataKey="notices" name="Notices" stackId="a" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {analytics.topSearchTerms.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">{t('admin.dashboard.top_search_terms')}</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.topSearchTerms.map((s, i) => (
                      <div key={s.term} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}</span>
                        <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${Math.round((s.count / analytics.topSearchTerms[0].count) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium min-w-[120px]">{s.term}</span>
                        <span className="text-xs text-muted-foreground w-8 text-right">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
        {/* Audit Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4" />
              {t('admin.dashboard.audit_log')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{t('admin.dashboard.audit_log_desc')}</p>
          </CardHeader>
          <CardContent>
            {auditLog.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('admin.dashboard.audit_empty')}</p>
            ) : (
              <div className="space-y-1">
                {auditLog.map((entry) => {
                  const actionCfg: Record<string, { label: string; cls: string }> = {
                    CREATED:        { label: 'Created',        cls: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
                    UPDATED:        { label: 'Edited',         cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
                    STATUS_CHANGED: { label: 'Status Changed', cls: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
                    DELETED:        { label: 'Deleted',        cls: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
                    PDF_UPLOADED:   { label: 'PDF Uploaded',   cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
                  };
                  const typeCls: Record<string, string> = {
                    Law:      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300',
                    Judgment: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300',
                    Notice:   'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300',
                  };
                  const cfg = actionCfg[entry.action] ?? { label: entry.action, cls: 'bg-gray-100 text-gray-700' };
                  return (
                    <div key={entry.id} className="flex items-start gap-3 py-2.5 border-b last:border-0">
                      {/* Action badge */}
                      <span className={`shrink-0 mt-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                      {/* Type badge */}
                      <span className={`shrink-0 mt-0.5 text-xs font-medium px-2 py-0.5 rounded border ${typeCls[entry.entityType] ?? ''}`}>
                        {entry.entityType}
                      </span>
                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate block" title={entry.entityTitle}>
                          {entry.entityTitle}
                        </span>
                        {entry.details && (
                          <span className="text-xs text-muted-foreground font-mono">{entry.details}</span>
                        )}
                      </div>
                      {/* Who + when */}
                      <div className="shrink-0 text-right">
                        <div className="text-xs font-medium text-foreground">{entry.performedBy}</div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(entry.timestamp)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
