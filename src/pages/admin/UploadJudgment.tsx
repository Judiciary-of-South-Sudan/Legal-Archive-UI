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
import { Loader2, Upload, Gavel } from 'lucide-react';
import { useCreateJudgment } from '@/hooks/useJudgments';
import { toast } from 'sonner';
import apiClient from '@/lib/apiClient';
import { ApiResponse, CreateJudgmentRequest, Judgment } from '@/types/api';

const AdminUploadJudgment: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateJudgment();

  const [formData, setFormData] = useState({
    caseName: '',
    caseNumber: '',
    courtName: '',
    courtLevel: 'High Court',
    judges: '',
    judgmentDate: '',
    caseType: '',
    verdict: '',
    summary: '',
    // renamed keywords -> tags (comma-separated in UI)
    tags: '',
    // new fields to match backend DTO
    parties: '',
    fullText: '',
    citedLaws: '',
    citedCases: '',
    jurisdiction: 'South Sudan',
    language: 'English',
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
        // send tags (was keywords)
        tags: formData.tags ? formData.tags.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        parties: formData.parties || undefined,
        fullText: formData.fullText || undefined,
        citedLaws: formData.citedLaws ? formData.citedLaws.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        citedCases: formData.citedCases ? formData.citedCases.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        jurisdiction: formData.jurisdiction,
        language: formData.language,
      };

      const created = await createMutation.mutateAsync(payload) as Judgment;

      if (pdfFile && (created?.id || created?.frbrUri)) {
        const fd = new FormData();
        fd.append('file', pdfFile);
        // use id or frbrUri as fallback for upload route
        const uploadKey = created.id ?? created.frbrUri;
        await apiClient.post<ApiResponse<Judgment>>(`/upload/judgment/${uploadKey}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Judgment and PDF uploaded successfully');
      } else {
        toast.success('Judgment created successfully');
      }

      navigate('/admin/dashboard');
    } catch (err: unknown) {
      // narrow unknown to extract possible message safely
      const error = err as { response?: { data?: { message?: string } } };
      console.error('Upload error:', err);
      toast.error(error?.response?.data?.message || 'Failed to upload judgment');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Upload New Judgment</h1>
          <p className="text-muted-foreground">Add a new court judgment to the archive</p>
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
                  <Label htmlFor="parties">Parties</Label>
                  <Input id="parties" name="parties" value={formData.parties} onChange={handleInputChange} />
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
                  <Label htmlFor="citedLaws">Cited Laws (comma-separated)</Label>
                  <Input id="citedLaws" name="citedLaws" value={formData.citedLaws} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="citedCases">Cited Cases (comma-separated)</Label>
                  <Input id="citedCases" name="citedCases" value={formData.citedCases} onChange={handleInputChange} />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="pdfFile">PDF Document</Label>
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
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Judgment
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

export default AdminUploadJudgment;
