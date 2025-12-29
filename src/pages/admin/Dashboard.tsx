import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Gavel, FileWarning, Users, Upload, BarChart3, TrendingUp } from 'lucide-react';
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

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await apiClient.get('/admin/dashboard');
      setStats(response.data.data);
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

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
              <div className="text-2xl font-bold">{stats?.totalLaws || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.lawsThisYear || 0} this year
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Judgments</CardTitle>
              <Gavel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalJudgments || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.judgmentsThisYear || 0} this year
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Legal Notices</CardTitle>
              <FileWarning className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalLegalNotices || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.noticesThisYear || 0} this year
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Registered accounts</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Upload Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/admin/upload-law">
                <Button className="w-full" variant="outline">Upload Law</Button>
              </Link>
              <Link to="/admin/upload-judgment">
                <Button className="w-full" variant="outline">Upload Judgment</Button>
              </Link>
              <Link to="/admin/upload-notice">
                <Button className="w-full" variant="outline">Upload Legal Notice</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Manage Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/laws">
                <Button className="w-full" variant="outline">View All Laws</Button>
              </Link>
              <Link to="/judgments">
                <Button className="w-full" variant="outline">View All Judgments</Button>
              </Link>
              <Link to="/notices">
                <Button className="w-full" variant="outline">View Legal Notices</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                System Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Documents</span>
                  <span className="font-semibold">{stats?.totalDocuments || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Users</span>
                  <span className="font-semibold">{stats?.totalUsers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">This Year</span>
                  <span className="font-semibold">
                    {(stats?.lawsThisYear || 0) + (stats?.judgmentsThisYear || 0) + (stats?.noticesThisYear || 0)}
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
            <p className="text-muted-foreground">
              Dashboard statistics loaded successfully. Use the quick actions above to manage your legal archive.
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;

