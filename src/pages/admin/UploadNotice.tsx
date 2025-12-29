import React, { useState } from 'react';
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

const AdminUploadNotice: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateNotice();

  const [formData, setFormData] = useState({
    noticeNumber: '',
    title: '',
    type: 'Notice',
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
    status: '',
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
      console.error('Upload error:', err);
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
          <h1 className="text-3xl font-bold">Upload Legal Notice</h1>
          <p className="text-muted-foreground">Add a new legal notice or gazette entry</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="noticeNumber">Notice Number</Label>
                  <Input id="noticeNumber" name="noticeNumber" value={formData.noticeNumber} onChange={handleInputChange} />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(v) => handleSelectChange('type', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Notice">Notice</SelectItem>
                      <SelectItem value="Gazette">Gazette</SelectItem>
                      <SelectItem value="Circular">Circular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="publicationDate">Publication Date</Label>
                  <Input id="publicationDate" name="publicationDate" type="date" value={formData.publicationDate} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="issuingAuthority">Issuing Authority *</Label>
                  <Input id="issuingAuthority" name="issuingAuthority" value={formData.issuingAuthority} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="ministry">Ministry</Label>
                  <Input id="ministry" name="ministry" value={formData.ministry} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" name="department" value={formData.department} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="gazetteIssue">Gazette Issue</Label>
                  <Input id="gazetteIssue" name="gazetteIssue" value={formData.gazetteIssue} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="effectiveDate">Effective Date</Label>
                  <Input id="effectiveDate" name="effectiveDate" type="date" value={formData.effectiveDate} onChange={handleInputChange} />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea id="summary" name="summary" value={formData.summary} onChange={handleInputChange} rows={4} />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="fullText">Full Text</Label>
                  <Textarea id="fullText" name="fullText" value={formData.fullText} onChange={handleInputChange} rows={6} />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input id="tags" name="tags" value={formData.tags} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="relatedLaws">Related Laws (comma-separated)</Label>
                  <Input id="relatedLaws" name="relatedLaws" value={formData.relatedLaws} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="amendsLaws">Amends Laws (comma-separated)</Label>
                  <Input id="amendsLaws" name="amendsLaws" value={formData.amendsLaws} onChange={handleInputChange} />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="pdfFile">PDF Document</Label>
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
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Notice
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/admin/dashboard')}>
                  Cancel
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

