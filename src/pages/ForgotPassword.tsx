import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Scale, CheckCircle } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { useTranslation } from 'react-i18next';

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch {
      setError(t('forgot_password.error'));
    } finally {
      setIsLoading(false);
    }
  };

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
            <CardTitle>{t('forgot_password.title')}</CardTitle>
            <CardDescription>{t('forgot_password.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle className="h-10 w-10 text-green-500" />
                <p className="text-sm text-foreground font-medium">{t('forgot_password.sent_title')}</p>
                <p className="text-sm text-muted-foreground">{t('forgot_password.sent_desc')}</p>
                <Link to="/login" className="mt-2 text-sm text-primary hover:underline">
                  {t('forgot_password.back_login')}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email">{t('forgot_password.email_label')}</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder={t('forgot_password.email_placeholder')}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('forgot_password.sending')}</>
                  ) : t('forgot_password.submit')}
                </Button>
                <div className="text-center text-sm">
                  <Link to="/login" className="text-muted-foreground hover:text-primary hover:underline">
                    {t('forgot_password.back_login')}
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
