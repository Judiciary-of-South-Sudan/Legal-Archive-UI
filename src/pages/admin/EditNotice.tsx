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
import { Loader2, Upload, FileWarning } from 'lucide-react';
import { useGetNoticeById, useUpdateNotice } from '@/hooks/useNotices';
import apiClient from '@/lib/apiClient';
import { ApiResponse, CreateLegalNoticeRequest, LegalNotice } from '@/types/api';
import { toast } from 'sonner';

interface EditNoticeForm {
  title: string;
  noticeNumber?: string;
  type?: string;
  publicationDate?: string;
  issuingAuthority?: string;
  ministry?: string;
  department?: string;
  gazetteIssue?: string;
  effectiveDate?: string;
  summary?: string;
  tags?: string;
  relatedLaws?: string;
  amendsLaws?: string;
  status?: string;
  jurisdiction?: string;
  language?: string;
}

const EditNotice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: notice, isLoading } = useGetNoticeById(id || '');
  const updateMutation = useUpdateNotice();

  const [formData, setFormData] = useState<EditNoticeForm | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (notice) {
      setFormData({
        title: notice.title || '',
        noticeNumber: notice.noticeNumber || '',
        type: notice.type || 'Legal Notice',
        publicationDate: notice.publicationDate ? notice.publicationDate.split('T')[0] : '',
        issuingAuthority: notice.issuingAuthority || '',
        ministry: notice.ministry || '',
        department: notice.department || '',
        gazetteIssue: notice.gazetteIssue || '',
        effectiveDate: notice.effectiveDate ? notice.effectiveDate.split('T')[0] : '',
        summary: notice.summary || '',
        tags: (notice.tags || []).join(', '),
        relatedLaws: (notice.relatedLaws || []).join(', '),
        amendsLaws: (notice.amendsLaws || []).join(', '),
        status: notice.status || 'Active',
        jurisdiction: notice.jurisdiction || 'South Sudan',
        language: notice.language || 'English',
      });
    }
  }, [notice]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target as HTMLInputElement;
    setFormData({ ...formData, [name]: value });
  };
  const handleSelectChange = (name: string, value: string) => setFormData(prev => (prev ? { ...prev, [name]: value } : prev));
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) setPdfFile(e.target.files[0]); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !formData) return;
    setIsSaving(true);

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
        tags: formData.tags ? formData.tags.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        relatedLaws: formData.relatedLaws ? formData.relatedLaws.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        amendsLaws: formData.amendsLaws ? formData.amendsLaws.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        status: formData.status || undefined,
        jurisdiction: formData.jurisdiction || undefined,
        language: formData.language || undefined,
      };

      await updateMutation.mutateAsync({ id, data: payload });

      if (pdfFile) {
        const fd = new FormData();
        fd.append('file', pdfFile);
        await apiClient.post<ApiResponse<LegalNotice>>(`/upload/legal-notice/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('PDF uploaded');
      }

      navigate('/admin/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error('Update failed', err);
      toast.error(error?.response?.data?.message || 'Failed to update notice');
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
          <span className="ml-2">Loading...</span>
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
          <h1 className="text-3xl font-bold">Edit Legal Notice</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="noticeNumber">Notice Number</Label>
                  <Input id="noticeNumber" name="noticeNumber" value={formData.noticeNumber} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
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

                <div className="md:col-span-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="publicationDate">Publication Date</Label>
                  <Input id="publicationDate" name="publicationDate" type="date" value={formData.publicationDate} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="effectiveDate">Effective Date</Label>
                  <Input id="effectiveDate" name="effectiveDate" type="date" value={formData.effectiveDate} onChange={handleInputChange} />
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
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Repealed">Repealed</SelectItem>
                      <SelectItem value="Superseded">Superseded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea id="summary" name="summary" value={formData.summary} onChange={handleInputChange} rows={4} />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input id="tags" name="tags" value={formData.tags} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="relatedLaws">Related Law IDs (comma-separated)</Label>
                  <Input id="relatedLaws" name="relatedLaws" value={formData.relatedLaws} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="amendsLaws">Amends Law IDs (comma-separated)</Label>
                  <Input id="amendsLaws" name="amendsLaws" value={formData.amendsLaws} onChange={handleInputChange} />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="pdfFile">Replace PDF</Label>
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
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Save Changes
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

export default EditNotice;
