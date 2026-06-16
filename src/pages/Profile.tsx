import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { User, Building2, Briefcase, Lock, Check, Loader2, Mail, CalendarDays, Shield } from 'lucide-react';
import type { User as UserType } from '@/types/api';
import { useTranslation } from 'react-i18next';

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  ROLE_ADMIN:  { label: 'Administrator', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' },
  ROLE_EDITOR: { label: 'Editor',        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
  ROLE_VIEWER: { label: 'Viewer',        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export default function Profile() {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [position, setPosition] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    authService.getProfile()
      .then(p => {
        setProfile(p);
        setFullName(p.fullName ?? '');
        setOrganization(p.organization ?? '');
        setPosition(p.position ?? '');
      })
      .catch(() => toast({ title: t('profile.loading_error'), variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await authService.updateProfile({ fullName, organization, position });
      setProfile(updated);
      toast({ title: t('profile.saved'), description: t('profile.saved_desc') });
    } catch {
      toast({ title: t('profile.save_failed'), variant: 'destructive' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: t('profile.pwd_mismatch'), variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: t('profile.pwd_too_short'), variant: 'destructive' });
      return;
    }
    setSavingPassword(true);
    try {
      await authService.changePassword({ oldPassword, newPassword });
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      toast({ title: t('profile.pwd_changed'), description: t('profile.pwd_changed_desc') });
    } catch {
      toast({ title: t('profile.pwd_failed'), description: t('profile.pwd_failed_desc'), variant: 'destructive' });
    } finally {
      setSavingPassword(false);
    }
  };

  const initials = (profile?.fullName || profile?.username || authUser?.username || '?')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-2xl font-bold">{profile?.fullName || profile?.username}</h1>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                      <span className="text-muted-foreground text-sm flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" /> {profile?.email}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                      {(profile?.roles ?? authUser?.roles ?? []).map(r => {
                        const meta = ROLE_LABELS[r] ?? { label: r.replace('ROLE_', ''), color: 'bg-gray-100 text-gray-800' };
                        return (
                          <span key={r} className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${meta.color}`}>
                            <Shield className="h-3 w-3" /> {meta.label}
                          </span>
                        );
                      })}
                      {profile?.organization && (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" /> {profile.organization}
                        </span>
                      )}
                      {profile?.position && (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" /> {profile.position}
                        </span>
                      )}
                    </div>
                    {profile?.createdAt && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center sm:justify-start gap-1">
                        <CalendarDays className="h-3.5 w-3.5" /> {t('profile.member_since')} {formatDate(profile.createdAt)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" /> {t('profile.section_info')}
                  </CardTitle>
                  <CardDescription>{t('profile.section_info_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="space-y-1">
                      <Label>{t('profile.username')}</Label>
                      <Input value={profile?.username ?? ''} disabled className="bg-muted/50" />
                    </div>
                    <div className="space-y-1">
                      <Label>{t('profile.email')}</Label>
                      <Input value={profile?.email ?? ''} disabled className="bg-muted/50" />
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <Label htmlFor="fullName">{t('profile.full_name')}</Label>
                      <Input
                        id="fullName"
                        placeholder="e.g. John Garang"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="organization">{t('profile.organization')}</Label>
                      <Input
                        id="organization"
                        placeholder="e.g. Ministry of Justice"
                        value={organization}
                        onChange={e => setOrganization(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="position">{t('profile.position')}</Label>
                      <Input
                        id="position"
                        placeholder="e.g. Legal Researcher"
                        value={position}
                        onChange={e => setPosition(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={savingProfile}>
                      {savingProfile ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Check className="h-4 w-4 me-2" />}
                      {t('profile.save_btn')}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lock className="h-4 w-4" /> {t('profile.section_security')}
                  </CardTitle>
                  <CardDescription>{t('profile.section_security_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="oldPassword">{t('profile.current_pwd')}</Label>
                      <Input
                        id="oldPassword"
                        type="password"
                        value={oldPassword}
                        onChange={e => setOldPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="newPassword">{t('profile.new_pwd')}</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="confirmPassword">{t('profile.confirm_pwd')}</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                      />
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-destructive mt-1">{t('profile.pwd_mismatch')}</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      variant="outline"
                      className="w-full"
                      disabled={savingPassword || !oldPassword || !newPassword || newPassword !== confirmPassword}
                    >
                      {savingPassword ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Lock className="h-4 w-4 me-2" />}
                      {t('profile.change_pwd_btn')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
