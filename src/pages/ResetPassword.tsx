import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Scale, Eye, EyeOff, CheckCircle } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError(t('reset_password.mismatch'));
      return;
    }
    if (password.length < 8) {
      setError(t('reset_password.too_short'));
      return;
    }
    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-password', { token, password });
      setDone(true);
      toast.success(t('reset_password.success_toast'));
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setError(err?.response?.data?.message || t('reset_password.error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive font-medium">{t('reset_password.invalid_link')}</p>
            <Link to="/forgot-password" className="mt-3 block text-sm text-primary hover:underline">
              {t('reset_password.request_new')}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Scale className="h-5 w-5" />
            </div>
            <span className="font-bold text-foreground">South Sudan Law Archive</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('reset_password.title')}</CardTitle>
            <CardDescription>{t('reset_password.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {done ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle className="h-10 w-10 text-green-500" />
                <p className="text-sm font-medium text-foreground">{t('reset_password.success_title')}</p>
                <p className="text-sm text-muted-foreground">{t('reset_password.success_desc')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="password">{t('reset_password.new_password')}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder={t('reset_password.password_placeholder')}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm">{t('reset_password.confirm_password')}</Label>
                  <Input
                    id="confirm"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder={t('reset_password.confirm_placeholder')}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('reset_password.saving')}</>
                  ) : t('reset_password.submit')}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
