import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, FileText } from 'lucide-react';
import { useCreateLaw } from '@/hooks/useLaws';
import { toast } from 'sonner';
import apiClient from '@/lib/apiClient';
import { ApiResponse, Law } from '@/types/api';
import { useTranslation } from 'react-i18next';

const AdminUploadLaw: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createLawMutation = useCreateLaw();

  const [formData, setFormData] = useState({
    title: '',
    type: 'Act',
    year: new Date().getFullYear(),
    enactmentDate: '',
    commencementDate: '',
    category: '',
    jurisdiction: 'South Sudan',
    publisher: '',
    gazetteVolume: '',
    gazetteIssue: '',
    gazetteDate: '',
    status: 'Active',
    summary: '',
    tags: '',
    language: 'English',
    fullText: '',
    relatedLaws: '',
    amendments: '',
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const submitActionRef = useRef<'DRAFT' | 'UNDER_REVIEW'>('DRAFT');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const lawData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        relatedLaws: formData.relatedLaws ? formData.relatedLaws.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        amendments: formData.amendments ? formData.amendments.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        year: Number(formData.year),
        fullText: formData.fullText || undefined,
        publisher: formData.publisher || undefined,
        enactmentDate: formData.enactmentDate || undefined,
        commencementDate: formData.commencementDate || undefined,
        verificationStatus: submitActionRef.current,
      };

      const createdLaw = await createLawMutation.mutateAsync(lawData);

      if (pdfFile && (createdLaw.id || createdLaw.frbrUri)) {
        const fd = new FormData();
        fd.append('file', pdfFile);
        const uploadKey = createdLaw.id ?? createdLaw.frbrUri;
        await apiClient.post<ApiResponse<Law>>(`/upload/law/${uploadKey}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Law and PDF uploaded successfully!');
      } else {
        toast.success('Law created successfully!');
      }

      navigate('/admin/dashboard');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to upload law');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t('admin.upload.law_title')}</h1>
          <p className="text-muted-foreground">{t('admin.upload.law_subtitle')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('admin.upload.law_details')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">{t('admin.form.title_required')}</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required
                    placeholder="e.g., The Constitution of South Sudan, 2011" />
                </div>

                <div>
                  <Label htmlFor="type">{t('admin.form.type_required')}</Label>
                  <Select value={formData.type} onValueChange={(val) => handleSelectChange('type', val)}>
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
                  <Input id="year" name="year" type="number" value={formData.year} onChange={handleInputChange} required />
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
                  <Input id="category" name="category" value={formData.category} onChange={handleInputChange}
                    placeholder="e.g., Constitutional, Criminal" />
                </div>

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
                  <Label htmlFor="status">{t('admin.form.status')}</Label>
                  <Select value={formData.status} onValueChange={(val) => handleSelectChange('status', val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Repealed">Repealed</SelectItem>
                      <SelectItem value="Amended">Amended</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">{t('admin.form.language')}</Label>
                  <Select value={formData.language} onValueChange={(val) => handleSelectChange('language', val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Arabic">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="summary">{t('admin.form.summary')}</Label>
                  <Textarea id="summary" name="summary" value={formData.summary} onChange={handleInputChange} rows={4}
                    placeholder="Brief description of the law..." />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="tags">{t('admin.form.tags_hint')}</Label>
                  <Input id="tags" name="tags" value={formData.tags} onChange={handleInputChange}
                    placeholder="e.g., constitution, rights, governance" />
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
                  <Input id="amendments" name="amendments" value={formData.amendments} onChange={handleInputChange}
                    placeholder="e.g., Act No. 2 of 2015" />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="pdfFile">{t('admin.form.pdf_document')}</Label>
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
                <Button type="submit" disabled={isUploading}
                  onClick={() => { submitActionRef.current = 'DRAFT'; }}>
                  {isUploading && submitActionRef.current === 'DRAFT' ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('admin.form.uploading')}</>
                  ) : (
                    <><Upload className="mr-2 h-4 w-4" />Save as Draft</>
                  )}
                </Button>
                <Button type="submit" variant="secondary" disabled={isUploading}
                  onClick={() => { submitActionRef.current = 'UNDER_REVIEW'; }}>
                  {isUploading && submitActionRef.current === 'UNDER_REVIEW' ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('admin.form.uploading')}</>
                  ) : (
                    <>Submit for Review</>
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

export default AdminUploadLaw;
