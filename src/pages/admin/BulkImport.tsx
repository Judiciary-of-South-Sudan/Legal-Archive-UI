import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FileText, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface PendingImport {
  id: string;
  filename: string;
  pdfUrl: string;
  extractedTitle: string;
  extractedText: string;
  documentType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  uploadedAt: string;
  uploadedBy: string;
  reviewNote?: string;
}

const emptyForm = {
  documentType: 'LAW' as 'LAW' | 'JUDGMENT' | 'NOTICE' | 'DECREE',
  title: '',
  summary: '',
  status: 'DRAFT',
  tags: '',
  jurisdiction: 'South Sudan',
  language: 'English',
  useExtractedText: true,
  lawType: '',
  year: new Date().getFullYear(),
  category: '',
  enactmentDate: '',
  commencementDate: '',
  publisher: 'Government of South Sudan',
  caseNumber: '',
  caseName: '',
  courtName: '',
  courtLevel: '',
  judges: '',
  judgmentDate: '',
  parties: '',
  caseType: '',
  verdict: '',
  noticeNumber: '',
  noticeType: '',
  publicationDate: '',
  effectiveDate: '',
  issuingAuthority: '',
  ministry: '',
  gazetteIssue: '',
  decreeNumber: '',
  decreeDate: '',
  decreeType: '',
  issuedBy: '',
  subject: '',
  personnel: '',
};

const BulkImport: React.FC = () => {
  const { t } = useTranslation();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [allImports, setAllImports] = useState<PendingImport[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewItem, setReviewItem] = useState<PendingImport | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [rejectTarget, setRejectTarget] = useState<PendingImport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusBadge = (status: string) => {
    if (status === 'PENDING') return (
      <Badge variant="outline" className="text-amber-600 border-amber-400">
        <Clock className="h-3 w-3 mr-1" />{t('admin.bulk.status_pending')}
      </Badge>
    );
    if (status === 'APPROVED') return (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />{t('admin.bulk.status_approved')}
      </Badge>
    );
    return (
      <Badge className="bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />{t('admin.bulk.status_rejected')}
      </Badge>
    );
  };

  const fetchImports = async () => {
    try {
      const res = await apiClient.get('/admin/bulk-import');
      setAllImports(res.data.data || []);
    } catch {
      toast.error('Failed to load imports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchImports(); }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    setSelectedFiles(prev => [...prev, ...files]);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (idx: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach(f => formData.append('files', f));
      const res = await apiClient.post('/admin/bulk-import/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const queued: PendingImport[] = res.data.data || [];
      toast.success(`${queued.length} file(s) queued for review`);
      setSelectedFiles([]);
      fetchImports();
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const openReview = (item: PendingImport) => {
    setForm({
      ...emptyForm,
      title: item.extractedTitle || '',
      useExtractedText: !!item.extractedText,
    });
    setReviewItem(item);
  };

  const handleApprove = async () => {
    if (!reviewItem) return;
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        documentType: form.documentType,
        title: form.title,
        summary: form.summary,
        status: form.status,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        jurisdiction: form.jurisdiction,
        language: form.language,
        useExtractedText: form.useExtractedText,
      };

      if (form.documentType === 'LAW') {
        Object.assign(payload, {
          lawType: form.lawType,
          year: form.year,
          category: form.category,
          enactmentDate: form.enactmentDate || null,
          commencementDate: form.commencementDate || null,
          publisher: form.publisher,
        });
      } else if (form.documentType === 'JUDGMENT') {
        Object.assign(payload, {
          caseNumber: form.caseNumber,
          caseName: form.caseName,
          courtName: form.courtName,
          courtLevel: form.courtLevel,
          judges: form.judges ? form.judges.split(',').map(j => j.trim()).filter(Boolean) : [],
          judgmentDate: form.judgmentDate || null,
          parties: form.parties,
          caseType: form.caseType,
          verdict: form.verdict,
        });
      } else if (form.documentType === 'DECREE') {
        Object.assign(payload, {
          decreeNumber: form.decreeNumber,
          decreeDate: form.decreeDate || null,
          year: form.year,
          decreeType: form.decreeType,
          issuedBy: form.issuedBy,
          subject: form.subject,
          personnel: form.personnel ? form.personnel.split(',').map(p => p.trim()).filter(Boolean) : [],
        });
      } else {
        Object.assign(payload, {
          noticeNumber: form.noticeNumber,
          noticeType: form.noticeType,
          publicationDate: form.publicationDate || null,
          effectiveDate: form.effectiveDate || null,
          issuingAuthority: form.issuingAuthority,
          ministry: form.ministry,
          gazetteIssue: form.gazetteIssue,
        });
      }

      await apiClient.post(`/admin/bulk-import/${reviewItem.id}/approve`, payload);
      toast.success('Document published successfully');
      setReviewItem(null);
      fetchImports();
    } catch {
      toast.error('Approval failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    try {
      await apiClient.post(`/admin/bulk-import/${rejectTarget.id}/reject`, { note: rejectNote });
      toast.success('Import rejected');
      setRejectTarget(null);
      setRejectNote('');
      fetchImports();
    } catch {
      toast.error('Reject failed');
    }
  };

  const pending = allImports.filter(i => i.status === 'PENDING');
  const processed = allImports.filter(i => i.status !== 'PENDING');

  const field = (key: keyof typeof form, value: string | number | boolean) =>
    setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/dashboard"><ArrowLeft className="h-4 w-4 mr-1" />{t('admin.bulk.dashboard')}</Link>
          </Button>
          <h1 className="text-2xl font-bold">{t('admin.bulk.title')}</h1>
          {pending.length > 0 && (
            <Badge variant="destructive">{t('admin.bulk.pending_badge', { count: pending.length })}</Badge>
          )}
        </div>

        {/* Upload Zone */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">{t('admin.bulk.upload_pdfs')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">{t('admin.bulk.drag_drop')}</p>
              <p className="text-xs text-muted-foreground">{t('admin.bulk.pdf_only')}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                multiple
                className="hidden"
                onChange={handleFileInput}
              />
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {selectedFiles.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-secondary/30 rounded px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{f.name}</span>
                      <span className="text-muted-foreground">({(f.size / 1024).toFixed(0)} KB)</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-destructive" onClick={() => removeFile(idx)}>×</Button>
                  </div>
                ))}
                <Button onClick={handleUpload} disabled={uploading} className="mt-2 w-full">
                  {uploading ? t('admin.bulk.uploading') : t('admin.bulk.upload_btn', { count: selectedFiles.length })}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Queue */}
        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">{t('admin.bulk.pending_tab', { count: pending.length })}</TabsTrigger>
            <TabsTrigger value="processed">{t('admin.bulk.processed_tab', { count: processed.length })}</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {loading ? (
              <p className="text-muted-foreground text-sm">{t('admin.bulk.loading')}</p>
            ) : pending.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-10 w-10 mx-auto mb-3 text-green-400" />
                <p>{t('admin.bulk.no_pending')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map(item => (
                  <Card key={item.id}>
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.extractedTitle || item.filename}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.filename} · uploaded {new Date(item.uploadedAt).toLocaleDateString()}
                        </p>
                        {item.extractedText && (
                          <p className="text-xs text-green-600 mt-0.5">
                            {t('admin.bulk.text_extracted', { count: item.extractedText.length.toLocaleString() })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button size="sm" onClick={() => openReview(item)}>{t('admin.bulk.review_publish')}</Button>
                        <Button size="sm" variant="outline" className="text-destructive border-destructive/40" onClick={() => setRejectTarget(item)}>
                          {t('admin.bulk.reject')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="processed">
            {processed.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">{t('admin.bulk.no_processed')}</p>
            ) : (
              <div className="space-y-3">
                {processed.map(item => (
                  <Card key={item.id}>
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.extractedTitle || item.filename}</p>
                        <p className="text-xs text-muted-foreground">{item.documentType} · {item.filename}</p>
                        {item.reviewNote && <p className="text-xs text-muted-foreground mt-0.5">Note: {item.reviewNote}</p>}
                      </div>
                      {statusBadge(item.status)}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />

      {/* Review Modal */}
      <Dialog open={!!reviewItem} onOpenChange={open => !open && setReviewItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('admin.bulk.review_modal_title')} — {reviewItem?.filename}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('admin.bulk.doc_type_required')}</Label>
                <Select value={form.documentType} onValueChange={v => field('documentType', v as 'LAW' | 'JUDGMENT' | 'NOTICE' | 'DECREE')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LAW">Law</SelectItem>
                    <SelectItem value="JUDGMENT">Judgment</SelectItem>
                    <SelectItem value="NOTICE">Legal Notice</SelectItem>
                    <SelectItem value="DECREE">{t('admin.bulk.type_decree')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('admin.bulk.status_field')}</Label>
                <Select value={form.status} onValueChange={v => field('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>{t('admin.bulk.title_field')}</Label>
              <Input value={form.title} onChange={e => field('title', e.target.value)} />
            </div>

            <div>
              <Label>{t('admin.bulk.summary_field')}</Label>
              <Textarea value={form.summary} onChange={e => field('summary', e.target.value)} rows={3} />
            </div>

            {reviewItem?.extractedText && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                <Checkbox
                  id="useExtracted"
                  checked={form.useExtractedText}
                  onCheckedChange={v => field('useExtractedText', !!v)}
                />
                <Label htmlFor="useExtracted" className="cursor-pointer text-green-800 dark:text-green-200">
                  {t('admin.bulk.use_extracted', { count: reviewItem.extractedText.length.toLocaleString() })}
                </Label>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('admin.bulk.jurisdiction_field')}</Label>
                <Input value={form.jurisdiction} onChange={e => field('jurisdiction', e.target.value)} />
              </div>
              <div>
                <Label>{t('admin.bulk.language_field')}</Label>
                <Select value={form.language} onValueChange={v => field('language', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Arabic">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>{t('admin.bulk.tags_field')}</Label>
              <Input value={form.tags} onChange={e => field('tags', e.target.value)} placeholder="constitutional, human rights, land" />
            </div>

            <hr className="border-border" />

            {/* Law-specific fields */}
            {form.documentType === 'LAW' && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('admin.bulk.law_details')}</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>{t('admin.bulk.law_type')}</Label>
                    <Select value={form.lawType} onValueChange={v => field('lawType', v)}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Constitution">Constitution</SelectItem>
                        <SelectItem value="Act">Act</SelectItem>
                        <SelectItem value="Agreement">Agreement</SelectItem>
                        <SelectItem value="Treaty">Treaty</SelectItem>
                        <SelectItem value="Decree">Decree</SelectItem>
                        <SelectItem value="Regulation">Regulation</SelectItem>
                        <SelectItem value="Order">Order</SelectItem>
                        <SelectItem value="Ordinance">Ordinance</SelectItem>
                        <SelectItem value="Bill">Bill</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('admin.bulk.year')}</Label>
                    <Input type="number" value={form.year} onChange={e => field('year', parseInt(e.target.value))} />
                  </div>
                  <div>
                    <Label>{t('admin.bulk.category')}</Label>
                    <Input value={form.category} onChange={e => field('category', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('admin.bulk.enactment_date')}</Label>
                    <Input type="date" value={form.enactmentDate} onChange={e => field('enactmentDate', e.target.value)} />
                  </div>
                  <div>
                    <Label>{t('admin.bulk.publisher')}</Label>
                    <Input value={form.publisher} onChange={e => field('publisher', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Judgment-specific fields */}
            {form.documentType === 'JUDGMENT' && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('admin.bulk.judgment_details')}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('admin.bulk.case_number')}</Label>
                    <Input value={form.caseNumber} onChange={e => field('caseNumber', e.target.value)} />
                  </div>
                  <div>
                    <Label>{t('admin.bulk.case_name')}</Label>
                    <Input value={form.caseName} onChange={e => field('caseName', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('admin.bulk.court_name')}</Label>
                    <Input value={form.courtName} onChange={e => field('courtName', e.target.value)} />
                  </div>
                  <div>
                    <Label>{t('admin.bulk.court_level')}</Label>
                    <Select value={form.courtLevel} onValueChange={v => field('courtLevel', v)}>
                      <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Supreme Court">Supreme Court</SelectItem>
                        <SelectItem value="Court of Appeal">Court of Appeal</SelectItem>
                        <SelectItem value="High Court">High Court</SelectItem>
                        <SelectItem value="Customary Law Court">Customary Law Court</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('admin.bulk.judgment_date')}</Label>
                    <Input type="date" value={form.judgmentDate} onChange={e => field('judgmentDate', e.target.value)} />
                  </div>
                  <div>
                    <Label>{t('admin.bulk.verdict')}</Label>
                    <Select value={form.verdict} onValueChange={v => field('verdict', v)}>
                      <SelectTrigger><SelectValue placeholder="Select verdict" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Allowed">Allowed</SelectItem>
                        <SelectItem value="Dismissed">Dismissed</SelectItem>
                        <SelectItem value="Upheld">Upheld</SelectItem>
                        <SelectItem value="Overturned">Overturned</SelectItem>
                        <SelectItem value="Remanded">Remanded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>{t('admin.bulk.parties')}</Label>
                  <Input value={form.parties} onChange={e => field('parties', e.target.value)} placeholder="Plaintiff v. Defendant" />
                </div>
                <div>
                  <Label>{t('admin.bulk.judges_hint')}</Label>
                  <Input value={form.judges} onChange={e => field('judges', e.target.value)} />
                </div>
              </div>
            )}

            {/* Notice-specific fields */}
            {form.documentType === 'NOTICE' && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('admin.bulk.notice_details')}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('admin.bulk.notice_number')}</Label>
                    <Input value={form.noticeNumber} onChange={e => field('noticeNumber', e.target.value)} />
                  </div>
                  <div>
                    <Label>{t('admin.bulk.notice_type')}</Label>
                    <Select value={form.noticeType} onValueChange={v => field('noticeType', v)}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Government Notice">Government Notice</SelectItem>
                        <SelectItem value="Legal Notice">Legal Notice</SelectItem>
                        <SelectItem value="Gazette Notice">Gazette Notice</SelectItem>
                        <SelectItem value="Proclamation">Proclamation</SelectItem>
                        <SelectItem value="Circular">Circular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('admin.bulk.publication_date')}</Label>
                    <Input type="date" value={form.publicationDate} onChange={e => field('publicationDate', e.target.value)} />
                  </div>
                  <div>
                    <Label>{t('admin.bulk.effective_date')}</Label>
                    <Input type="date" value={form.effectiveDate} onChange={e => field('effectiveDate', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('admin.bulk.issuing_authority')}</Label>
                    <Input value={form.issuingAuthority} onChange={e => field('issuingAuthority', e.target.value)} />
                  </div>
                  <div>
                    <Label>{t('admin.bulk.gazette_issue')}</Label>
                    <Input value={form.gazetteIssue} onChange={e => field('gazetteIssue', e.target.value)} placeholder="e.g. Vol. 15 No. 3" />
                  </div>
                </div>
              </div>
            )}

            {/* Decree-specific fields */}
            {form.documentType === 'DECREE' && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('admin.bulk.decree_details')}</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>{t('admin.bulk.decree_number')}</Label>
                    <Input value={form.decreeNumber} onChange={e => field('decreeNumber', e.target.value)} placeholder="15/2024" />
                  </div>
                  <div>
                    <Label>{t('admin.bulk.year')}</Label>
                    <Input type="number" value={form.year} onChange={e => field('year', parseInt(e.target.value))} />
                  </div>
                  <div>
                    <Label>{t('admin.bulk.decree_date')}</Label>
                    <Input type="date" value={form.decreeDate} onChange={e => field('decreeDate', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('admin.bulk.decree_type')}</Label>
                    <Select value={form.decreeType} onValueChange={v => field('decreeType', v)}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APPOINTMENT">Appointment</SelectItem>
                        <SelectItem value="RELIEF">Relief</SelectItem>
                        <SelectItem value="REDEPLOYMENT">Redeployment</SelectItem>
                        <SelectItem value="ESTABLISHMENT">Establishment</SelectItem>
                        <SelectItem value="DISSOLUTION">Dissolution</SelectItem>
                        <SelectItem value="RATIFICATION">Ratification</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('admin.bulk.issued_by')}</Label>
                    <Input value={form.issuedBy} onChange={e => field('issuedBy', e.target.value)} placeholder="H.E. the President of the Republic of South Sudan" />
                  </div>
                </div>
                <div>
                  <Label>{t('admin.bulk.subject_field')}</Label>
                  <Input value={form.subject} onChange={e => field('subject', e.target.value)} />
                </div>
                <div>
                  <Label>{t('admin.bulk.personnel_hint')}</Label>
                  <Input value={form.personnel} onChange={e => field('personnel', e.target.value)} />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReviewItem(null)}>{t('admin.form.cancel')}</Button>
            <Button onClick={handleApprove} disabled={submitting || !form.title || !form.documentType}>
              {submitting ? t('admin.bulk.publishing') : t('admin.bulk.approve_publish')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={open => !open && setRejectTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('admin.bulk.reject_title')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t('admin.bulk.reject_question', { filename: rejectTarget?.filename })}
          </p>
          <div>
            <Label>{t('admin.bulk.reject_reason')}</Label>
            <Textarea
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              placeholder="Duplicate, poor quality, wrong format..."
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>{t('admin.form.cancel')}</Button>
            <Button variant="destructive" onClick={handleReject}>{t('admin.bulk.reject_btn')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BulkImport;
