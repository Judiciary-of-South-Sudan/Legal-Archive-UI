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
import { Loader2, Upload, FileWarning } from 'lucide-react';
import { useCreateNotice } from '@/hooks/useNotices';
import { toast } from 'sonner';
import { noticeService } from '@/services/noticeService';
import { CreateLegalNoticeRequest, LegalNotice } from '@/types/api';
import { useTranslation } from 'react-i18next';

const AdminUploadNotice: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createMutation = useCreateNotice();

  const [formData, setFormData] = useState({
    noticeNumber: '',
    title: '',
    type: 'Legal Notice',
    publicationDate: '',
    issuingAuthority: '',
    ministry: '',
    department: '',
    gazetteIssue: '',
    effectiveDate: '',
    summary: '',
    tags: '',
    fullText: '',
    relatedLaws: '',
    amendsLaws: '',
    jurisdiction: 'South Sudan',
    language: 'English',
    status: 'Active',
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
    if (e.target.files && e.target.files[0]) setPdfFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const payload: CreateLegalNoticeRequest = {
        noticeNumber: formData.noticeNumber || undefined,
        title: formData.title,
        type: formData.type,
        publicationDate: formData.publicationDate || undefined,
        issuingAuthority: formData.issuingAuthority,
        ministry: formData.ministry || undefined,
        department: formData.department || undefined,
        gazetteIssue: formData.gazetteIssue || undefined,
        effectiveDate: formData.effectiveDate || undefined,
        summary: formData.summary || undefined,
        fullText: formData.fullText || undefined,
        tags: formData.tags ? formData.tags.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        relatedLaws: formData.relatedLaws ? formData.relatedLaws.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        amendsLaws: formData.amendsLaws ? formData.amendsLaws.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        jurisdiction: formData.jurisdiction,
        language: formData.language,
        status: formData.status || undefined,
        verificationStatus: submitActionRef.current,
      };

      const created = await createMutation.mutateAsync(payload) as LegalNotice;

      if (pdfFile && (created?.id || created?.frbrUri)) {
        const uploadKey = created.id ?? created.frbrUri;
        await noticeService.uploadNoticePdf(uploadKey, pdfFile);
        toast.success('Legal notice and PDF uploaded successfully');
      } else {
        toast.success('Legal notice created successfully');
      }

      navigate('/admin/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to upload legal notice');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t('admin.upload.notice_title')}</h1>
          <p className="text-muted-foreground">{t('admin.upload.notice_subtitle')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('admin.upload.notice_details')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="noticeNumber">{t('admin.form.notice_number')}</Label>
                  <Input id="noticeNumber" name="noticeNumber" value={formData.noticeNumber} onChange={handleInputChange} />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="title">{t('admin.form.title_required')}</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="type">{t('admin.form.type_required')}</Label>
                  <Select value={formData.type} onValueChange={(v) => handleSelectChange('type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Legal Notice">Legal Notice</SelectItem>
                      <SelectItem value="Gazette Notice">Gazette Notice</SelectItem>
                      <SelectItem value="Statutory Instrument">Statutory Instrument</SelectItem>
                      <SelectItem value="Regulation">Regulation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="publicationDate">{t('admin.form.publication_date')}</Label>
                  <Input id="publicationDate" name="publicationDate" type="date" value={formData.publicationDate} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="issuingAuthority">{t('admin.form.issuing_authority_required')}</Label>
                  <Input id="issuingAuthority" name="issuingAuthority" value={formData.issuingAuthority} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="ministry">{t('admin.form.ministry')}</Label>
                  <Input id="ministry" name="ministry" value={formData.ministry} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="department">{t('admin.form.department')}</Label>
                  <Input id="department" name="department" value={formData.department} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="gazetteIssue">{t('admin.form.gazette_issue')}</Label>
                  <Input id="gazetteIssue" name="gazetteIssue" value={formData.gazetteIssue} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="effectiveDate">{t('admin.form.effective_date')}</Label>
                  <Input id="effectiveDate" name="effectiveDate" type="date" value={formData.effectiveDate} onChange={handleInputChange} />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="summary">{t('admin.form.summary')}</Label>
                  <Textarea id="summary" name="summary" value={formData.summary} onChange={handleInputChange} rows={4} />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="fullText">{t('admin.form.full_text')}</Label>
                  <Textarea id="fullText" name="fullText" value={formData.fullText} onChange={handleInputChange} rows={6} />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="tags">{t('admin.form.tags_hint')}</Label>
                  <Input id="tags" name="tags" value={formData.tags} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="relatedLaws">{t('admin.form.related_laws')}</Label>
                  <Input id="relatedLaws" name="relatedLaws" value={formData.relatedLaws} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="amendsLaws">{t('admin.form.amends_laws')}</Label>
                  <Input id="amendsLaws" name="amendsLaws" value={formData.amendsLaws} onChange={handleInputChange} />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="pdfFile">{t('admin.form.pdf_document')}</Label>
                  <div className="mt-2">
                    <Input id="pdfFile" type="file" accept=".pdf" onChange={handleFileChange} className="cursor-pointer" />
                    {pdfFile && (
                      <div className="mt-2 flex items-center text-sm text-muted-foreground">
                        <FileWarning className="h-4 w-4 mr-2" />
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

export default AdminUploadNotice;
