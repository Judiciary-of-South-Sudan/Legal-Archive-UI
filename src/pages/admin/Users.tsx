import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, ShieldCheck, ShieldOff, Trash2, RefreshCw } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface UserRecord {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  organization?: string;
  roles: string[];
  enabled: boolean;
  createdAt?: string;
  lastLogin?: string;
}

const ROLE_OPTIONS = [
  { value: 'ROLE_VIEWER', label: 'Viewer' },
  { value: 'ROLE_EDITOR', label: 'Editor' },
  { value: 'ROLE_ADMIN', label: 'Admin' },
];

const roleBadgeVariant = (role: string): 'default' | 'secondary' | 'destructive' => {
  if (role === 'ROLE_ADMIN') return 'destructive';
  if (role === 'ROLE_EDITOR') return 'default';
  return 'secondary';
};

const roleLabel = (role: string) => role.replace('ROLE_', '');

const AdminUsers: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingRoleChange, setPendingRoleChange] = useState<Record<string, string>>({});

  const fetchUsers = () => {
    setLoading(true);
    apiClient
      .get('/admin/users')
      .then((res) => setUsers(res.data.data ?? []))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = (userId: string, newRole: string) => {
    setPendingRoleChange((prev) => ({ ...prev, [userId]: newRole }));
    apiClient
      .put(`/admin/users/${userId}/role`, { role: newRole })
      .then((res) => {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, roles: res.data.data.roles } : u))
        );
        toast.success(t('admin.users.role_updated'));
      })
      .catch(() => {
        toast.error('Failed to update role');
        setPendingRoleChange((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      })
      .finally(() =>
        setPendingRoleChange((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        })
      );
  };

  const handleToggleEnabled = (user: UserRecord) => {
    apiClient
      .put(`/admin/users/${user.id}/enabled`, { enabled: !user.enabled })
      .then((res) => {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, enabled: res.data.data.enabled } : u))
        );
        toast.success(user.enabled ? t('admin.users.user_disabled') : t('admin.users.user_enabled'));
      })
      .catch(() => toast.error('Failed to update user status'));
  };

  const handleDelete = (userId: string) => {
    apiClient
      .delete(`/admin/users/${userId}`)
      .then(() => {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        toast.success(t('admin.users.user_deleted'));
      })
      .catch(() => toast.error('Failed to delete user'));
  };

  const primaryRole = (roles: string[]) =>
    roles.includes('ROLE_ADMIN')
      ? 'ROLE_ADMIN'
      : roles.includes('ROLE_EDITOR')
      ? 'ROLE_EDITOR'
      : 'ROLE_VIEWER';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              to="/admin/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="h-3 w-3" />
              {t('admin.users.back')}
            </Link>
            <h1 className="text-3xl font-bold">{t('admin.users.title')}</h1>
            <p className="text-muted-foreground">
              {users.length !== 1
                ? t('admin.users.registered_plural', { count: users.length })
                : t('admin.users.registered_singular', { count: users.length })}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 me-2 ${loading ? 'animate-spin' : ''}`} />
            {t('admin.users.refresh')}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('admin.users.registered_users')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">{t('admin.users.loading')}</p>
            ) : users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">{t('admin.users.no_users')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-start py-3 pe-4 font-medium text-muted-foreground">{t('admin.users.col_user')}</th>
                      <th className="text-start py-3 pe-4 font-medium text-muted-foreground">{t('admin.users.col_role')}</th>
                      <th className="text-start py-3 pe-4 font-medium text-muted-foreground">{t('admin.users.col_status')}</th>
                      <th className="text-start py-3 pe-4 font-medium text-muted-foreground">{t('admin.users.col_joined')}</th>
                      <th className="text-end py-3 font-medium text-muted-foreground">{t('admin.users.col_actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const role = primaryRole(user.roles);
                      const isPending = pendingRoleChange[user.id] !== undefined;
                      return (
                        <tr key={user.id} className="border-b last:border-0 hover:bg-muted/40">
                          <td className="py-3 pe-4">
                            <div className="font-medium">{user.fullName || user.username}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                            {user.organization && (
                              <div className="text-xs text-muted-foreground">{user.organization}</div>
                            )}
                          </td>
                          <td className="py-3 pe-4">
                            <Select
                              value={pendingRoleChange[user.id] ?? role}
                              onValueChange={(val) => handleRoleChange(user.id, val)}
                              disabled={isPending}
                            >
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLE_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-3 pe-4">
                            <Badge variant={user.enabled ? 'default' : 'secondary'}>
                              {user.enabled ? t('admin.users.status_active') : t('admin.users.status_disabled')}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            {user.createdAt
                              ? format(new Date(user.createdAt), 'dd MMM yyyy')
                              : '—'}
                          </td>
                          <td className="py-3 text-end">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleEnabled(user)}
                                title={user.enabled ? t('admin.users.disable_user') : t('admin.users.enable_user')}
                              >
                                {user.enabled ? (
                                  <ShieldOff className="h-4 w-4 text-amber-500" />
                                ) : (
                                  <ShieldCheck className="h-4 w-4 text-green-600" />
                                )}
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" title={t('admin.users.delete_title')}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t('admin.users.delete_title')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t('admin.users.delete_confirm', {
                                        name: user.fullName || user.username,
                                        email: user.email,
                                      })}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(user.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {t('admin.users.delete_btn')}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminUsers;
