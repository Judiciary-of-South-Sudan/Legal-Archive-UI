import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Gavel, FileWarning, Users, Upload, BarChart3, TrendingUp, UserCog } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';

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

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivitySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get('/admin/dashboard'),
      apiClient.get('/admin/activity'),
    ])
      .then(([statsRes, activityRes]) => {
        setStats(statsRes.data.data);
        setActivity(activityRes.data.data);
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
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your legal archive system</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Upload className="mr-2 h-4 w-4" />
                Upload Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/admin/upload-law">
                <Button className="w-full" variant="outline" size="sm">Upload Law</Button>
              </Link>
              <Link to="/admin/upload-judgment">
                <Button className="w-full" variant="outline" size="sm">Upload Judgment</Button>
              </Link>
              <Link to="/admin/upload-notice">
                <Button className="w-full" variant="outline" size="sm">Upload Legal Notice</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <BarChart3 className="mr-2 h-4 w-4" />
                Browse Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/laws">
                <Button className="w-full" variant="outline" size="sm">All Laws</Button>
              </Link>
              <Link to="/judgments">
                <Button className="w-full" variant="outline" size="sm">All Judgments</Button>
              </Link>
              <Link to="/notices">
                <Button className="w-full" variant="outline" size="sm">All Notices</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <UserCog className="mr-2 h-4 w-4" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Manage roles and access for registered users.
              </p>
              <Link to="/admin/users">
                <Button className="w-full" size="sm">Manage Users</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <TrendingUp className="mr-2 h-4 w-4" />
                System Stats
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
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
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
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
