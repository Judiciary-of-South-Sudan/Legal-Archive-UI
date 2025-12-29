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
import { CreateJudgmentRequest } from '@/types/api';
import { toast } from 'sonner';

interface EditJudgmentForm {
  caseName: string;
  caseNumber?: string;
  courtName: string;
  courtLevel?: string;
  judges?: string; // comma separated
  judgmentDate?: string;
  caseType?: string;
  verdict?: string;
  summary?: string;
  keywords?: string;
  jurisdiction?: string;
  language?: string;
}

const EditJudgment: React.FC = () => {
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
        caseType: judgment.caseType || '',
        verdict: judgment.verdict || '',
        summary: judgment.summary || '',
        keywords: (judgment.keywords || []).join(', '),
        jurisdiction: judgment.jurisdiction || 'South Sudan',
        language: judgment.language || 'English',
      });
    }
  }, [judgment]);

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
      const payload: CreateJudgmentRequest = {
        caseName: formData.caseName,
        caseNumber: formData.caseNumber || undefined,
        courtName: formData.courtName,
        courtLevel: formData.courtLevel,
        judges: formData.judges ? formData.judges.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        judgmentDate: formData.judgmentDate || undefined,
        caseType: formData.caseType || undefined,
        verdict: formData.verdict || undefined,
        summary: formData.summary || undefined,
        keywords: formData.keywords ? formData.keywords.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        jurisdiction: formData.jurisdiction || undefined,
        language: formData.language || undefined,
      };

      await updateMutation.mutateAsync({ id, data: payload });

      if (pdfFile) {
        const fd = new FormData();
        fd.append('file', pdfFile);
        await apiClient.post(`/upload/judgment/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('PDF uploaded');
      }

      navigate('/admin/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error('Update failed', err);
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
          <h1 className="text-3xl font-bold">Edit Judgment</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Judgment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="caseName">Case Name *</Label>
                  <Input id="caseName" name="caseName" value={formData.caseName} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="caseNumber">Case Number</Label>
                  <Input id="caseNumber" name="caseNumber" value={formData.caseNumber} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="courtName">Court Name *</Label>
                  <Input id="courtName" name="courtName" value={formData.courtName} onChange={handleInputChange} required />
                </div>

                <div>
                  <Label htmlFor="courtLevel">Court Level</Label>
                  <Select value={formData.courtLevel} onValueChange={(v) => handleSelectChange('courtLevel', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Supreme Court">Supreme Court</SelectItem>
                      <SelectItem value="Court of Appeal">Court of Appeal</SelectItem>
                      <SelectItem value="High Court">High Court</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="judges">Judges (comma-separated)</Label>
                  <Input id="judges" name="judges" value={formData.judges} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="judgmentDate">Judgment Date</Label>
                  <Input id="judgmentDate" name="judgmentDate" type="date" value={formData.judgmentDate} onChange={handleInputChange} />
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

export default EditJudgment;

