import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, FileText, Plus, X } from 'lucide-react';
import { useGetDecreeById, useUpdateDecree } from '@/hooks/useDecrees';
import apiClient from '@/lib/apiClient';
import { ApiResponse, CreateDecreeRequest } from '@/types/api';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const DECREE_TYPES = ['APPOINTMENT', 'RELIEF', 'REDEPLOYMENT', 'ESTABLISHMENT', 'DISSOLUTION', 'RATIFICATION', 'OTHER'];
const VERIFICATION_STATUSES = ['DRAFT', 'UNDER_REVIEW', 'PUBLISHED', 'REJECTED'];

interface EditDecreeForm {
  decreeNumber: string;
  title: string;
  decreeType: string;
  decreeDate: string;
  year: number | string;
  issuedBy: string;
  subject: string;
  summary: string;
  tags: string;
  language: string;
  fullText: string;
  verificationStatus: string;
  sourceUrl: string;
  sourceProvenance: string;
  gazetteVolume: string;
  gazetteIssue: string;
  gazetteDate: string;
}

const EditDecree: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: decree, isLoading } = useGetDecreeById(id || '');
  const updateMutation = useUpdateDecree();

  const [formData, setFormData] = useState<EditDecreeForm | null>(null);
  const [personnel, setPersonnel] = useState<string[]>(['']);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (decree) {
      setFormData({
        decreeNumber: decree.decreeNumber || '',
        title: decree.title || '',
        decreeType: decree.decreeType || 'APPOINTMENT',
        decreeDate: decree.decreeDate ? decree.decreeDate.split('T')[0] : '',
        year: decree.year || new Date().getFullYear(),
        issuedBy: decree.issuedBy || '',
        subject: decree.subject || '',
        summary: decree.summary || '',
        tags: (decree.tags ?? []).join(', '),
        language: decree.language || 'English',
        fullText: decree.fullText || '',
        verificationStatus: decree.verificationStatus || 'DRAFT',
        sourceUrl: decree.sourceUrl || '',
        sourceProvenance: decree.sourceProvenance || '',
        gazetteVolume: decree.gazetteVolume || '',
        gazetteIssue: decree.gazetteIssue || '',
        gazetteDate: decree.gazetteDate || '',
      });
      setPersonnel(decree.personnel?.length ? decree.personnel : ['']);
    }
  }, [decree]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (!formData) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setPdfFile(e.target.files[0]);
  };

  const addPersonnelEntry = () => setPersonnel(prev => [...prev, '']);
  const removePersonnelEntry = (idx: number) => setPersonnel(prev => prev.filter((_, i) => i !== idx));
  const updatePersonnelEntry = (idx: number, value: string) =>
    setPersonnel(prev => prev.map((v, i) => (i === idx ? value : v)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !id) return;
    setIsSaving(true);
    try {
      let pdfUrl = decree?.pdfUrl;
      if (pdfFile) {
        const fd = new FormData();
        fd.append('file', pdfFile);
        const uploadRes = await apiClient.post<ApiResponse<string>>('/files/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        pdfUrl = uploadRes.data.data || '';
      }

      const payload: CreateDecreeRequest = {
        decreeNumber: formData.decreeNumber || undefined,
        title: formData.title,
        decreeType: formData.decreeType,
        decreeDate: formData.decreeDate || undefined,
        year: Number(formData.year) || undefined,
        issuedBy: formData.issuedBy || undefined,
        subject: formData.subject || undefined,
        personnel: personnel.filter(p => p.trim()),
        summary: formData.summary || undefined,
        tags: formData.tags ? formData.tags.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        language: formData.language,
        fullText: formData.fullText || undefined,
        pdfUrl: pdfUrl || undefined,
        verificationStatus: formData.verificationStatus,
        sourceUrl: formData.sourceUrl || undefined,
        sourceProvenance: formData.sourceProvenance || undefined,
        gazetteVolume: formData.gazetteVolume || undefined,
        gazetteIssue: formData.gazetteIssue || undefined,
        gazetteDate: formData.gazetteDate || undefined,
      };

      await updateMutation.mutateAsync({ id, data: payload });
      navigate(`/decrees/${id}`);
    } catch {
      toast.error(t('decrees.save_error'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !formData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> {t('decrees.edit_title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="decreeNumber">{t('decrees.decree_number')}</Label>
                  <Input id="decreeNumber" name="decreeNumber" value={formData.decreeNumber} onChange={handleInputChange} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="decreeType">{t('decrees.type')} *</Label>
                  <Select value={formData.decreeType} onValueChange={v => handleSelectChange('decreeType', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DECREE_TYPES.map(tp => <SelectItem key={tp} value={tp}>{tp}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title">{t('decrees.form_title')} *</Label>
                <Input id="title" name="title" required value={formData.title} onChange={handleInputChange} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="decreeDate">{t('decrees.date')}</Label>
                  <Input id="decreeDate" name="decreeDate" type="date" value={formData.decreeDate} onChange={handleInputChange} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="year">{t('decrees.year')}</Label>
                  <Input id="year" name="year" type="number" value={formData.year} onChange={handleInputChange} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="issuedBy">{t('decrees.issued_by')}</Label>
                <Input id="issuedBy" name="issuedBy" value={formData.issuedBy} onChange={handleInputChange} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subject">{t('decrees.subject')}</Label>
                <Input id="subject" name="subject" value={formData.subject} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t('decrees.personnel')}</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addPersonnelEntry}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> {t('decrees.add_person')}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{t('decrees.personnel_hint')}</p>
                {personnel.map((entry, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      value={entry}
                      onChange={e => updatePersonnelEntry(idx, e.target.value)}
                      placeholder={t('decrees.personnel_placeholder')}
                    />
                    {personnel.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removePersonnelEntry(idx)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="summary">{t('decrees.summary')}</Label>
                <Textarea id="summary" name="summary" rows={3} value={formData.summary} onChange={handleInputChange} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fullText">{t('decrees.full_text')}</Label>
                <Textarea id="fullText" name="fullText" rows={8} value={formData.fullText} onChange={handleInputChange} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="language">{t('decrees.language')}</Label>
                  <Select value={formData.language} onValueChange={v => handleSelectChange('language', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Arabic">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="verificationStatus">{t('common.status')}</Label>
                  <Select value={formData.verificationStatus} onValueChange={v => handleSelectChange('verificationStatus', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {VERIFICATION_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tags">{t('decrees.tags_label')}</Label>
                  <Input id="tags" name="tags" value={formData.tags} onChange={handleInputChange} placeholder={t('decrees.tags_hint')} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="gazetteVolume">{t('laws.gazette_volume')}</Label>
                  <Input id="gazetteVolume" name="gazetteVolume" value={formData.gazetteVolume} onChange={handleInputChange} placeholder="e.g. Vol. XV" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gazetteIssue">{t('laws.gazette_issue')}</Label>
                  <Input id="gazetteIssue" name="gazetteIssue" value={formData.gazetteIssue} onChange={handleInputChange} placeholder="e.g. No. 23" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gazetteDate">{t('laws.gazette_date')}</Label>
                  <Input id="gazetteDate" name="gazetteDate" type="date" value={formData.gazetteDate} onChange={handleInputChange} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sourceUrl">Source URL</Label>
                <Input id="sourceUrl" name="sourceUrl" type="url" value={formData.sourceUrl} onChange={handleInputChange}
                  placeholder="https://presidency.gov.ss/..." />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sourceProvenance">Source Provenance</Label>
                <Input id="sourceProvenance" name="sourceProvenance" value={formData.sourceProvenance} onChange={handleInputChange}
                  placeholder="e.g. Office of the President, Official Gazette No. 12, 2023" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pdfFile">{t('laws.pdf_file')}</Label>
                <Input id="pdfFile" type="file" accept=".pdf" onChange={handleFileChange} />
                {decree?.pdfUrl && !pdfFile && (
                  <p className="text-xs text-muted-foreground">{t('laws.current_pdf')}: {decree.pdfUrl}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isSaving || updateMutation.isPending}>
                  {(isSaving || updateMutation.isPending) ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('common.saving')}</>
                  ) : (
                    <><Upload className="h-4 w-4 mr-2" /> {t('common.save_changes')}</>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(`/decrees/${id}`)}>{t('common.cancel')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default EditDecree;
