import React, { Component, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from './components/ScrollToTop';
import PageErrorBoundary from './components/PageErrorBoundary';

// ── Page-level lazy imports (code-split per route) ─────────────────────────
const Index            = React.lazy(() => import('./pages/Index'));
const Login            = React.lazy(() => import('./pages/Login'));
const Register         = React.lazy(() => import('./pages/Register'));
const ForgotPassword   = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword    = React.lazy(() => import('./pages/ResetPassword'));
const Judgments        = React.lazy(() => import('./pages/Judgments'));
const Laws             = React.lazy(() => import('./pages/Laws'));
const LegalNotices     = React.lazy(() => import('./pages/LegalNotices'));
const JudiciaryDirectory = React.lazy(() => import('./pages/JudiciaryDirectory'));
const About            = React.lazy(() => import('./pages/footer/quicklinks/About'));
const Contact          = React.lazy(() => import('./pages/footer/quicklinks/Contact'));
const Privacy          = React.lazy(() => import('./pages/footer/quicklinks/Privacy'));
const Terms            = React.lazy(() => import('./pages/footer/quicklinks/Terms'));
const Sitemap          = React.lazy(() => import('./pages/footer/quicklinks/Sitemap'));
const JudicialOpinions = React.lazy(() => import('./pages/JudicialOpinions'));
const SearchPage       = React.lazy(() => import('./pages/Search'));
const Library          = React.lazy(() => import('./pages/Library'));
const Profile          = React.lazy(() => import('./pages/Profile'));
const LegalResources   = React.lazy(() => import('./pages/LegalResources'));
const SupremeCourt     = React.lazy(() => import('./pages/judgments/SupremeCourt'));
const CourtOfAppeal    = React.lazy(() => import('./pages/judgments/CourtOfAppeal'));
const HighCourt        = React.lazy(() => import('./pages/judgments/HighCourt'));
const JudgmentDetail   = React.lazy(() => import('./pages/judgments/JudgmentDetail'));
const JudgmentDocument = React.lazy(() => import('./pages/judgments/JudgmentDocument'));
const Constitution     = React.lazy(() => import('./pages/laws/Constitution'));
const Acts             = React.lazy(() => import('./pages/laws/Acts'));
const LawDetail        = React.lazy(() => import('./pages/laws/LawDetail'));
const LawDocument      = React.lazy(() => import('./pages/laws/LawDocument'));
const NoticeDetail     = React.lazy(() => import('./pages/notices/NoticeDetail'));
const NoticeDocument   = React.lazy(() => import('./pages/notices/NoticeDocument'));
const Decrees          = React.lazy(() => import('./pages/Decrees'));
const DecreeDetail     = React.lazy(() => import('./pages/decrees/DecreeDetail'));
const AdminDashboard   = React.lazy(() => import('./pages/admin/Dashboard'));
const AdminUploadLaw   = React.lazy(() => import('./pages/admin/UploadLaw'));
const AdminUploadJudgment = React.lazy(() => import('./pages/admin/UploadJudgment'));
const AdminUploadNotice   = React.lazy(() => import('./pages/admin/UploadNotice'));
const EditLaw          = React.lazy(() => import('./pages/admin/EditLaw'));
const EditJudgment     = React.lazy(() => import('./pages/admin/EditJudgment'));
const EditNotice       = React.lazy(() => import('./pages/admin/EditNotice'));
const AdminUsers       = React.lazy(() => import('./pages/admin/Users'));
const BulkImport       = React.lazy(() => import('./pages/admin/BulkImport'));
const SentryTest       = React.lazy(() => import('./pages/admin/SentryTest'));
const UploadDecree     = React.lazy(() => import('./pages/admin/UploadDecree'));
const EditDecree       = React.lazy(() => import('./pages/admin/EditDecree'));
const NotFound         = React.lazy(() => import('./pages/NotFound'));

// ── Route-loading fallback ────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

// ── Global error boundary (catches catastrophic render failures) ──────────
class GlobalErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center max-w-md p-8">
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">An unexpected error occurred. Please refresh the page.</p>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              onClick={() => window.location.reload()}
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <GlobalErrorBoundary>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/judgments" element={<Judgments />} />
                <Route path="/laws" element={<Laws />} />
                <Route path="/notices" element={<LegalNotices />} />
                <Route path="/directory" element={<JudiciaryDirectory />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/sitemap" element={<Sitemap />} />
                <Route path="/opinions" element={<JudicialOpinions />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/resources" element={<LegalResources />} />
                <Route path="/library" element={
                  <ProtectedRoute><Library /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute><Profile /></ProtectedRoute>
                } />

                {/* Judgment routes */}
                <Route path="/judgments/supreme-court" element={<SupremeCourt />} />
                <Route path="/judgments/court-of-appeal" element={<CourtOfAppeal />} />
                <Route path="/judgments/high-court" element={<HighCourt />} />
                <Route path="/judgments/:id" element={
                  <PageErrorBoundary backHref="/judgments" backLabel="Back to Judgments">
                    <JudgmentDetail />
                  </PageErrorBoundary>
                } />
                <Route path="/judgments/:id/document" element={<JudgmentDocument />} />

                {/* Law routes */}
                <Route path="/laws/constitution" element={<Constitution />} />
                <Route path="/laws/acts" element={<Acts />} />
                <Route path="/laws/:id" element={
                  <PageErrorBoundary backHref="/laws" backLabel="Back to Laws">
                    <LawDetail />
                  </PageErrorBoundary>
                } />
                <Route path="/laws/:id/document" element={<LawDocument />} />

                {/* Notice routes */}
                <Route path="/notices/:id" element={
                  <PageErrorBoundary backHref="/notices" backLabel="Back to Notices">
                    <NoticeDetail />
                  </PageErrorBoundary>
                } />
                <Route path="/notices/:id/document" element={<NoticeDocument />} />

                {/* Decree routes */}
                <Route path="/decrees" element={<Decrees />} />
                <Route path="/decrees/:id" element={
                  <PageErrorBoundary backHref="/decrees" backLabel="Back to Decrees">
                    <DecreeDetail />
                  </PageErrorBoundary>
                } />

                {/* Admin routes */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute requireEditor={true}><AdminDashboard /></ProtectedRoute>
                } />
                <Route path="/admin/upload-law" element={
                  <ProtectedRoute requireEditor={true}><AdminUploadLaw /></ProtectedRoute>
                } />
                <Route path="/admin/upload-judgment" element={
                  <ProtectedRoute requireEditor={true}><AdminUploadJudgment /></ProtectedRoute>
                } />
                <Route path="/admin/upload-notice" element={
                  <ProtectedRoute requireEditor={true}><AdminUploadNotice /></ProtectedRoute>
                } />
                <Route path="/admin/edit-law/:id" element={
                  <ProtectedRoute requireEditor={true}><EditLaw /></ProtectedRoute>
                } />
                <Route path="/admin/edit-judgment/:id" element={
                  <ProtectedRoute requireEditor={true}><EditJudgment /></ProtectedRoute>
                } />
                <Route path="/admin/edit-notice/:id" element={
                  <ProtectedRoute requireEditor={true}><EditNotice /></ProtectedRoute>
                } />
                <Route path="/admin/upload-decree" element={
                  <ProtectedRoute requireEditor={true}><UploadDecree /></ProtectedRoute>
                } />
                <Route path="/admin/edit-decree/:id" element={
                  <ProtectedRoute requireEditor={true}><EditDecree /></ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute requireAdmin={true}><AdminUsers /></ProtectedRoute>
                } />
                <Route path="/admin/bulk-import" element={
                  <ProtectedRoute requireAdmin={true}><BulkImport /></ProtectedRoute>
                } />
                <Route path="/admin/sentry-test" element={
                  <ProtectedRoute requireAdmin={true}><SentryTest /></ProtectedRoute>
                } />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </GlobalErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
