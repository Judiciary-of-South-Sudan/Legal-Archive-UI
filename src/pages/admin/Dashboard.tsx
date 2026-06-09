import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Gavel, FileWarning, Users, Upload, BarChart3, TrendingUp, UserCog, Eye, Download, Search } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';
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

interface AnalyticsSummary {
  totalViews: number;
  totalDownloads: number;
  totalSearches: number;
  byType: DocTypeStats[];
  topSearchTerms: SearchTermStat[];
  monthlyDocuments: MonthlyDocStat[];
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivitySummary | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get('/admin/dashboard'),
      apiClient.get('/admin/activity'),
      apiClient.get('/admin/analytics'),
    ])
      .then(([statsRes, activityRes, analyticsRes]) => {
        setStats(statsRes.data.data);
        setActivity(activityRes.data.data);
        setAnalytics(analyticsRes.data.data);
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
          <div className="text-center">Loading dashboard...</div>
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
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your legal archive system</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Laws</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalLaws ?? 0}</div>
              <p className="text-xs text-muted-foreground">+{stats?.lawsThisYear ?? 0} this year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Judgments</CardTitle>
              <Gavel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalJudgments ?? 0}</div>
              <p className="text-xs text-muted-foreground">+{stats?.judgmentsThisYear ?? 0} this year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Legal Notices</CardTitle>
              <FileWarning className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalLegalNotices ?? 0}</div>
              <p className="text-xs text-muted-foreground">+{stats?.noticesThisYear ?? 0} this year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                <Link to="/admin/users" className="underline hover:text-foreground">Manage users</Link>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Upload className="mr-2 h-4 w-4" /> Upload Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/admin/upload-law"><Button className="w-full" variant="outline" size="sm">Upload Law</Button></Link>
              <Link to="/admin/upload-judgment"><Button className="w-full" variant="outline" size="sm">Upload Judgment</Button></Link>
              <Link to="/admin/upload-notice"><Button className="w-full" variant="outline" size="sm">Upload Legal Notice</Button></Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <BarChart3 className="mr-2 h-4 w-4" /> Browse Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/laws"><Button className="w-full" variant="outline" size="sm">All Laws</Button></Link>
              <Link to="/judgments"><Button className="w-full" variant="outline" size="sm">All Judgments</Button></Link>
              <Link to="/notices"><Button className="w-full" variant="outline" size="sm">All Notices</Button></Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <UserCog className="mr-2 h-4 w-4" /> User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">Manage roles and access for registered users.</p>
              <Link to="/admin/users"><Button className="w-full" size="sm">Manage Users</Button></Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <TrendingUp className="mr-2 h-4 w-4" /> System Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Documents</span>
                  <span className="font-semibold">{stats?.totalDocuments ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registered Users</span>
                  <span className="font-semibold">{stats?.totalUsers ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Added This Year</span>
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
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            {activity ? (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  New documents added in the <span className="font-medium text-foreground">{activity.period}</span>
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{activity.totalNewDocuments}</div>
                    <div className="text-xs text-muted-foreground mt-1">Total New</div>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-2xl font-bold">{activity.newLaws}</div>
                    <div className="text-xs text-muted-foreground mt-1">Laws</div>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-2xl font-bold">{activity.newJudgments}</div>
                    <div className="text-xs text-muted-foreground mt-1">Judgments</div>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-2xl font-bold">{activity.newLegalNotices}</div>
                    <div className="text-xs text-muted-foreground mt-1">Notices</div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No activity data available.</p>
            )}
          </CardContent>
        </Card>

        {/* ── Analytics Section ── */}
        {analytics && (
          <>
            {/* Totals row */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Across all documents</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalDownloads.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">PDF downloads</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalSearches.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Recorded search queries</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Views & Downloads by type */}
              <Card>
                <CardHeader><CardTitle className="text-base">Views & Downloads by Type</CardTitle></CardHeader>
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

              {/* Monthly document uploads */}
              <Card>
                <CardHeader><CardTitle className="text-base">Documents Added (Last 6 Months)</CardTitle></CardHeader>
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

            {/* Top search terms */}
            {analytics.topSearchTerms.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Top Search Terms</CardTitle></CardHeader>
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
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
