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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, FileText } from 'lucide-react';
import { useCreateLaw } from '@/hooks/useLaws';
import { toast } from 'sonner';
import apiClient from '@/lib/apiClient';
import { ApiResponse, Law } from '@/types/api';

const AdminUploadLaw: React.FC = () => {
  const navigate = useNavigate();
  const createLawMutation = useCreateLaw();

  const [formData, setFormData] = useState({
    title: '',
    type: 'Act',
    year: new Date().getFullYear(),
    lawNumber: '',
    enactmentDate: '',
    commencementDate: '',
    category: '',
    jurisdiction: 'South Sudan',
    issuingAuthority: '',
    ministry: '',
    publisher: '',
    status: 'Active',
    summary: '',
    tags: '',
    language: 'English',
    // new fields
    fullText: '',
    relatedLaws: '',
    amendments: '',
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
      // Create the law first
      const lawData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        relatedLaws: formData.relatedLaws ? formData.relatedLaws.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        amendments: formData.amendments ? formData.amendments.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        year: Number(formData.year),
        fullText: formData.fullText || undefined,
        publisher: formData.publisher || undefined,
        commencementDate: formData.commencementDate || undefined,
      };

      const createdLaw = await createLawMutation.mutateAsync(lawData);

      // Upload PDF if provided
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
      console.error('Upload error:', error);
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
          <h1 className="text-3xl font-bold">Upload New Law</h1>
          <p className="text-muted-foreground">Add a new law document to the archive</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Law Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., The Constitution of South Sudan, 2011"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(val) => handleSelectChange('type', val)}>
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
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="lawNumber">Law Number</Label>
                  <Input
                    id="lawNumber"
                    name="lawNumber"
                    value={formData.lawNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., Act No. 12 of 2025"
                  />
                </div>

                <div>
                  <Label htmlFor="enactmentDate">Enactment Date</Label>
                  <Input
                    id="enactmentDate"
                    name="enactmentDate"
                    type="date"
                    value={formData.enactmentDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="commencementDate">Commencement Date</Label>
                  <Input
                    id="commencementDate"
                    name="commencementDate"
                    type="date"
                    value={formData.commencementDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g., Constitutional, Criminal"
                  />
                </div>

                <div>
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  <Input
                    id="jurisdiction"
                    name="jurisdiction"
                    value={formData.jurisdiction}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="issuingAuthority">Issuing Authority</Label>
                  <Input
                    id="issuingAuthority"
                    name="issuingAuthority"
                    value={formData.issuingAuthority}
                    onChange={handleInputChange}
                    placeholder="e.g., National Legislative Assembly"
                  />
                </div>

                <div>
                  <Label htmlFor="ministry">Ministry</Label>
                  <Input
                    id="ministry"
                    name="ministry"
                    value={formData.ministry}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="publisher">Publisher</Label>
                  <Input
                    id="publisher"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(val) => handleSelectChange('status', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Repealed">Repealed</SelectItem>
                      <SelectItem value="Amended">Amended</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={formData.language} onValueChange={(val) => handleSelectChange('language', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Arabic">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Brief description of the law..."
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="e.g., constitution, rights, governance"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="fullText">Full Text</Label>
                  <Textarea
                    id="fullText"
                    name="fullText"
                    value={formData.fullText}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Full text of the law (optional)"
                  />
                </div>

                <div>
                  <Label htmlFor="relatedLaws">Related Laws (comma-separated)</Label>
                  <Input
                    id="relatedLaws"
                    name="relatedLaws"
                    value={formData.relatedLaws}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="amendments">Amendments (comma-separated)</Label>
                  <Input
                    id="amendments"
                    name="amendments"
                    value={formData.amendments}
                    onChange={handleInputChange}
                    placeholder="e.g., Act No. 2 of 2015"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="pdfFile">PDF Document</Label>
                  <div className="mt-2">
                    <Input
                      id="pdfFile"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
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
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Law
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

export default AdminUploadLaw;
