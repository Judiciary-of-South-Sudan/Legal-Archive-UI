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
import { Loader2, Upload, Gavel } from 'lucide-react';
import { useGetJudgmentById, useUpdateJudgment } from '@/hooks/useJudgments';
import apiClient from '@/lib/apiClient';
import { ApiResponse, CreateJudgmentRequest, Judgment } from '@/types/api';
import { CitationSearch } from '@/components/CitationSearch';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface EditJudgmentForm {
  caseName: string;
  caseNumber: string;
  courtName: string;
  courtLevel: string;
  judges: string;
  judgmentDate: string;
  parties: string;
  caseType: string;
  verdict: string;
  status: string;
  summary: string;
  tags: string;
  fullText: string;
  citedLaws: string[];
  citedCases: string[];
  jurisdiction: string;
  language: string;
  sourceUrl: string;
  sourceProvenance: string;
}

const EditJudgment: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: judgment, isLoading } = useGetJudgmentById(id || '');
  const updateMutation = useUpdateJudgment();

  const [formData, setFormData] = useState<EditJudgmentForm | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (judgment) {
      setFormData({
        caseName: judgment.caseName || '',
        caseNumber: judgment.caseNumber || '',
        courtName: judgment.courtName || '',
        courtLevel: judgment.courtLevel || 'High Court',
        judges: (judgment.judges || []).join(', '),
        judgmentDate: judgment.judgmentDate ? judgment.judgmentDate.split('T')[0] : '',
        parties: judgment.parties || '',
        caseType: judgment.caseType || '',
        verdict: judgment.verdict || '',
        status: judgment.status || 'Final',
        summary: judgment.summary || '',
        tags: (judgment.tags || []).join(', '),
        fullText: judgment.fullText || '',
        citedLaws: judgment.citedLaws || [],
        citedCases: judgment.citedCases || [],
        jurisdiction: judgment.jurisdiction || 'South Sudan',
        language: judgment.language || 'English',
        sourceUrl: judgment.sourceUrl || '',
        sourceProvenance: judgment.sourceProvenance || '',
      });
    }
  }, [judgment]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSelectChange = (name: string, value: string) =>
    setFormData(prev => (prev ? { ...prev, [name]: value } : prev));
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setPdfFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !formData) return;
    setIsSaving(true);

    try {
      const payload: CreateJudgmentRequest = {
        caseName: formData.caseName,
        caseNumber: formData.caseNumber || undefined,
        courtName: formData.courtName,
        courtLevel: formData.courtLevel,
        judges: formData.judges ? formData.judges.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        judgmentDate: formData.judgmentDate || undefined,
        parties: formData.parties || undefined,
        caseType: formData.caseType || undefined,
        verdict: formData.verdict || undefined,
        status: formData.status || undefined,
        summary: formData.summary || undefined,
        tags: formData.tags ? formData.tags.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        fullText: formData.fullText || undefined,
        citedLaws: formData.citedLaws.length ? formData.citedLaws : undefined,
        citedCases: formData.citedCases.length ? formData.citedCases : undefined,
        jurisdiction: formData.jurisdiction || undefined,
        language: formData.language || undefined,
        sourceUrl: formData.sourceUrl || undefined,
        sourceProvenance: formData.sourceProvenance || undefined,
      };

      await updateMutation.mutateAsync({ id, data: payload });

      if (pdfFile) {
        const fd = new FormData();
        fd.append('file', pdfFile);
        await apiClient.post<ApiResponse<Judgment>>(`/upload/judgment/${id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('PDF replaced');
      }

      navigate('/admin/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to update judgment');
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
          <span className="ml-2">{t('admin.form.loading')}</span>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t('admin.edit.judgment_title')}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('admin.edit.judgment_details')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="caseName">{t('admin.form.case_name_required')}</Label>
                  <Input id="caseName" name="caseName" value={formData.caseName} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="caseNumber">{t('admin.form.case_number')}</Label>
                  <Input id="caseNumber" name="caseNumber" value={formData.caseNumber} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="courtName">{t('admin.form.court_name_required')}</Label>
                  <Input id="courtName" name="courtName" value={formData.courtName} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="courtLevel">{t('admin.form.court_level')}</Label>
                  <Select value={formData.courtLevel} onValueChange={v => handleSelectChange('courtLevel', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Supreme Court">Supreme Court</SelectItem>
                      <SelectItem value="Court of Appeal">Court of Appeal</SelectItem>
                      <SelectItem value="High Court">High Court</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="judges">{t('admin.form.judges_hint')}</Label>
                  <Input id="judges" name="judges" value={formData.judges} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="judgmentDate">{t('admin.form.judgment_date')}</Label>
                  <Input id="judgmentDate" name="judgmentDate" type="date" value={formData.judgmentDate} onChange={handleInputChange} />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="parties">{t('admin.form.parties')}</Label>
                  <Input id="parties" name="parties" value={formData.parties} onChange={handleInputChange} placeholder="e.g., John Doe v. State" />
                </div>

                <div>
                  <Label htmlFor="caseType">{t('admin.form.case_type')}</Label>
                  <Select value={formData.caseType} onValueChange={v => handleSelectChange('caseType', v)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Civil">Civil</SelectItem>
                      <SelectItem value="Criminal">Criminal</SelectItem>
                      <SelectItem value="Constitutional">Constitutional</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Family">Family</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="verdict">{t('admin.form.verdict')}</Label>
                  <Select value={formData.verdict} onValueChange={v => handleSelectChange('verdict', v)}>
                    <SelectTrigger><SelectValue placeholder="Select verdict" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Allowed">Allowed</SelectItem>
                      <SelectItem value="Dismissed">Dismissed</SelectItem>
                      <SelectItem value="Guilty">Guilty</SelectItem>
                      <SelectItem value="Not Guilty">Not Guilty</SelectItem>
                      <SelectItem value="Settled">Settled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">{t('admin.form.status')}</Label>
                  <Select value={formData.status} onValueChange={v => handleSelectChange('status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Final">Final</SelectItem>
                      <SelectItem value="Under Appeal">Under Appeal</SelectItem>
                      <SelectItem value="Overturned">Overturned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">{t('admin.form.language')}</Label>
                  <Select value={formData.language} onValueChange={v => handleSelectChange('language', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Arabic">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="summary">{t('admin.form.summary')}</Label>
                  <Textarea id="summary" name="summary" value={formData.summary} onChange={handleInputChange} rows={4} />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="tags">{t('admin.form.tags_hint')}</Label>
                  <Input id="tags" name="tags" value={formData.tags} onChange={handleInputChange} />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="fullText">{t('admin.form.full_text')}</Label>
                  <Textarea id="fullText" name="fullText" value={formData.fullText} onChange={handleInputChange} rows={6} />
                </div>

                <div>
                  <Label>{t('admin.form.cited_laws')}</Label>
                  <CitationSearch
                    type="law"
                    value={formData.citedLaws}
                    onChange={ids => setFormData(prev => prev ? { ...prev, citedLaws: ids } : prev)}
                  />
                </div>

                <div>
                  <Label>{t('admin.form.cited_cases')}</Label>
                  <CitationSearch
                    type="judgment"
                    value={formData.citedCases}
                    onChange={ids => setFormData(prev => prev ? { ...prev, citedCases: ids } : prev)}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="sourceUrl">Source URL</Label>
                  <Input id="sourceUrl" name="sourceUrl" type="url" value={formData.sourceUrl} onChange={handleInputChange}
                    placeholder="https://judiciary.gov.ss/..." />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="sourceProvenance">Source Provenance</Label>
                  <Input id="sourceProvenance" name="sourceProvenance" value={formData.sourceProvenance} onChange={handleInputChange}
                    placeholder="e.g. Supreme Court Records, File No. HC/2021/04" />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="pdfFile">{t('admin.form.replace_pdf')}</Label>
                  <div className="mt-2">
                    <Input id="pdfFile" type="file" accept=".pdf" onChange={handleFileChange} className="cursor-pointer" />
                    {pdfFile && (
                      <div className="mt-2 flex items-center text-sm text-muted-foreground">
                        <Gavel className="h-4 w-4 mr-2" />
                        {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('admin.form.saving')}</>
                  ) : (
                    <><Upload className="mr-2 h-4 w-4" />{t('admin.form.save_changes')}</>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/admin/dashboard')}>
                  {t('admin.form.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default EditJudgment;
