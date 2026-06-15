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
import { Loader2, Upload, FileText } from 'lucide-react';
import { useGetLawById, useUpdateLaw } from '@/hooks/useLaws';
import apiClient from '@/lib/apiClient';
import { ApiResponse, CreateLawRequest, Law } from '@/types/api';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface EditLawForm {
  title: string;
  type: string;
  year: number | string;
  enactmentDate: string;
  commencementDate: string;
  category: string;
  jurisdiction: string;
  publisher: string;
  gazetteVolume: string;
  gazetteIssue: string;
  gazetteDate: string;
  status: string;
  summary: string;
  tags: string;
  language: string;
  fullText: string;
  relatedLaws: string;
  amendments: string;
  repealedBy: string;
  repealDate: string;
}

const EditLaw: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: law, isLoading } = useGetLawById(id || '');
  const updateMutation = useUpdateLaw();

  const [formData, setFormData] = useState<EditLawForm | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (law) {
      setFormData({
        title: law.title || '',
        type: law.type || 'Act',
        year: law.year || new Date().getFullYear(),
        enactmentDate: law.enactmentDate ? law.enactmentDate.split('T')[0] : '',
        commencementDate: law.commencementDate ? law.commencementDate.split('T')[0] : '',
        category: law.category || '',
        jurisdiction: law.jurisdiction || 'South Sudan',
        publisher: law.publisher || '',
        gazetteVolume: law.gazetteVolume || '',
        gazetteIssue: law.gazetteIssue || '',
        gazetteDate: law.gazetteDate || '',
        status: law.status || 'Active',
        summary: law.summary || '',
        tags: (law.tags || []).join(', '),
        language: law.language || 'English',
        fullText: law.fullText || '',
        relatedLaws: (law.relatedLaws || []).join(', '),
        amendments: (law.amendments || []).join(', '),
        repealedBy: law.repealedBy || '',
        repealDate: law.repealDate ? law.repealDate.split('T')[0] : '',
      });
    }
  }, [law]);

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
      const payload: CreateLawRequest = {
        title: formData.title,
        type: formData.type,
        year: Number(formData.year),
        enactmentDate: formData.enactmentDate || undefined,
        commencementDate: formData.commencementDate || undefined,
        category: formData.category || undefined,
        jurisdiction: formData.jurisdiction || undefined,
        publisher: formData.publisher || undefined,
        gazetteVolume: formData.gazetteVolume || undefined,
        gazetteIssue: formData.gazetteIssue || undefined,
        gazetteDate: formData.gazetteDate || undefined,
        status: formData.status || undefined,
        summary: formData.summary || undefined,
        tags: formData.tags ? formData.tags.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        language: formData.language || undefined,
        fullText: formData.fullText || undefined,
        relatedLaws: formData.relatedLaws ? formData.relatedLaws.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        amendments: formData.amendments ? formData.amendments.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        repealedBy: formData.repealedBy || undefined,
        repealDate: formData.repealDate || undefined,
      };

      await updateMutation.mutateAsync({ id, data: payload });

      if (pdfFile) {
        const fd = new FormData();
        fd.append('file', pdfFile);
        await apiClient.post<ApiResponse<Law>>(`/upload/law/${id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('PDF replaced');
      }

      navigate('/admin/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to update law');
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
          <h1 className="text-3xl font-bold">{t('admin.edit.law_title')}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('admin.edit.law_details')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">{t('admin.form.title_required')}</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="type">{t('admin.form.type_required')}</Label>
                  <Select value={formData.type} onValueChange={v => handleSelectChange('type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Constitution">Constitution</SelectItem>
                      <SelectItem value="Act">Act</SelectItem>
                      <SelectItem value="Agreement">Agreement</SelectItem>
                      <SelectItem value="Treaty">Treaty</SelectItem>
                      <SelectItem value="Bill">Bill</SelectItem>
                      <SelectItem value="Decree">Decree</SelectItem>
                      <SelectItem value="Regulation">Regulation</SelectItem>
                      <SelectItem value="Ordinance">Ordinance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="year">{t('admin.form.year_required')}</Label>
                  <Input id="year" name="year" type="number" value={String(formData.year)} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="enactmentDate">{t('admin.form.enactment_date')}</Label>
                  <Input id="enactmentDate" name="enactmentDate" type="date" value={formData.enactmentDate} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="commencementDate">{t('admin.form.commencement_date')}</Label>
                  <Input id="commencementDate" name="commencementDate" type="date" value={formData.commencementDate} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="category">{t('admin.form.category')}</Label>
                  <Input id="category" name="category" value={formData.category} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="status">{t('admin.form.status')}</Label>
                  <Select value={formData.status} onValueChange={v => handleSelectChange('status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Repealed">Repealed</SelectItem>
                      <SelectItem value="Amended">Amended</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.status === 'Repealed' && (
                  <>
                    <div>
                      <Label htmlFor="repealDate">Repeal Date</Label>
                      <Input id="repealDate" name="repealDate" type="date" value={formData.repealDate} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label htmlFor="repealedBy">Repealed By (Law ID)</Label>
                      <Input id="repealedBy" name="repealedBy" value={formData.repealedBy} onChange={handleInputChange}
                        placeholder="MongoDB ID of the repealing law" />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="jurisdiction">{t('admin.form.jurisdiction')}</Label>
                  <Input id="jurisdiction" name="jurisdiction" value={formData.jurisdiction} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="publisher">{t('admin.form.publisher')}</Label>
                  <Input id="publisher" name="publisher" value={formData.publisher} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="gazetteVolume">{t('laws.gazette_volume')}</Label>
                  <Input id="gazetteVolume" name="gazetteVolume" value={formData.gazetteVolume} onChange={handleInputChange}
                    placeholder="e.g., Vol. XV" />
                </div>

                <div>
                  <Label htmlFor="gazetteIssue">{t('laws.gazette_issue')}</Label>
                  <Input id="gazetteIssue" name="gazetteIssue" value={formData.gazetteIssue} onChange={handleInputChange}
                    placeholder="e.g., No. 23" />
                </div>

                <div>
                  <Label htmlFor="gazetteDate">{t('laws.gazette_date')}</Label>
                  <Input id="gazetteDate" name="gazetteDate" type="date" value={formData.gazetteDate} onChange={handleInputChange} />
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
                  <Label htmlFor="relatedLaws">{t('admin.form.related_laws')}</Label>
                  <Input id="relatedLaws" name="relatedLaws" value={formData.relatedLaws} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="amendments">{t('admin.form.amendments')}</Label>
                  <Input id="amendments" name="amendments" value={formData.amendments} onChange={handleInputChange} />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="pdfFile">{t('admin.form.replace_pdf')}</Label>
                  <div className="mt-2">
                    <Input id="pdfFile" type="file" accept=".pdf" onChange={handleFileChange} className="cursor-pointer" />
                    {pdfFile && (
                      <div className="mt-2 flex items-center text-sm text-muted-foreground">
                        <FileText className="h-4 w-4 mr-2" />
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

export default EditLaw;
