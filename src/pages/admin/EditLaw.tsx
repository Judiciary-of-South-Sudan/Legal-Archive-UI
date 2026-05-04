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

interface EditLawForm {
  title: string;
  type: string;
  year?: number | string;
  lawNumber?: string;
  enactmentDate?: string;
  category?: string;
  jurisdiction?: string;
  issuingAuthority?: string;
  ministry?: string;
  status?: string;
  summary?: string;
  keywords?: string; // comma-separated in form
  language?: string;
}

const EditLaw: React.FC = () => {
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
        lawNumber: law.lawNumber || '',
        enactmentDate: law.enactmentDate ? law.enactmentDate.split('T')[0] : '',
        category: law.category || '',
        jurisdiction: law.jurisdiction || 'South Sudan',
        issuingAuthority: law.issuingAuthority || '',
        ministry: law.ministry || '',
        status: law.status || 'Active',
        summary: law.summary || '',
        keywords: (law.keywords || []).join(', '),
        language: law.language || 'English',
      });
    }
  }, [law]);

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
      const payload: CreateLawRequest = {
        title: formData.title,
        type: formData.type,
        year: Number(formData.year),
        lawNumber: formData.lawNumber || undefined,
        enactmentDate: formData.enactmentDate || undefined,
        category: formData.category || undefined,
        jurisdiction: formData.jurisdiction || undefined,
        issuingAuthority: formData.issuingAuthority || undefined,
        ministry: formData.ministry || undefined,
        status: formData.status || undefined,
        summary: formData.summary || undefined,
        keywords: formData.keywords ? formData.keywords.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        language: formData.language || undefined,
      };

      await updateMutation.mutateAsync({ id, data: payload });

      if (pdfFile) {
        const fd = new FormData();
        fd.append('file', pdfFile);
        await apiClient.post<ApiResponse<Law>>(`/upload/law/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('PDF uploaded');
      }

      navigate('/admin/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error('Update failed', err);
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
          <h1 className="text-3xl font-bold">Edit Law</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Law Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* basic fields - similar to upload form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(v) => handleSelectChange('type', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Constitution">Constitution</SelectItem>
                      <SelectItem value="Act">Act</SelectItem>
                      <SelectItem value="Bill">Bill</SelectItem>
                      <SelectItem value="Regulation">Regulation</SelectItem>
                      <SelectItem value="Ordinance">Ordinance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input id="year" name="year" type="number" value={String(formData.year)} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="lawNumber">Law Number</Label>
                  <Input id="lawNumber" name="lawNumber" value={formData.lawNumber} onChange={handleInputChange} />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea id="summary" name="summary" value={formData.summary} onChange={handleInputChange} rows={4} />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                  <Input id="keywords" name="keywords" value={formData.keywords} onChange={handleInputChange} />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="pdfFile">Replace PDF</Label>
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

export default EditLaw;
