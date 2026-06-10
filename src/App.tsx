import React, { Component } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Judgments from "./pages/Judgments";
import Laws from "./pages/Laws";
import LegalNotices from "./pages/LegalNotices";
import JudiciaryDirectory from "./pages/JudiciaryDirectory";
import NotFound from "./pages/NotFound";
import About from "./pages/footer/quicklinks/About";
import Contact from "./pages/footer/quicklinks/Contact";
import Privacy from "./pages/footer/quicklinks/Privacy";
import Terms from "./pages/footer/quicklinks/Terms";
import Sitemap from "./pages/footer/quicklinks/Sitemap";
import SupremeCourt from "./pages/judgments/SupremeCourt";
import CourtOfAppeal from "./pages/judgments/CourtOfAppeal";
import HighCourt from "./pages/judgments/HighCourt";
import Constitution from "./pages/laws/Constitution";
import Acts from "./pages/laws/Acts";
import LawDetail from "./pages/laws/LawDetail";
import LawDocument from "./pages/laws/LawDocument";
import JudgmentDetail from "./pages/judgments/JudgmentDetail";
import JudgmentDocument from "./pages/judgments/JudgmentDocument";
import NoticeDetail from "./pages/notices/NoticeDetail";
import NoticeDocument from "./pages/notices/NoticeDocument";
import JudicialOpinions from "./pages/JudicialOpinions";
import LegalResources from "./pages/LegalResources";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminUploadLaw from "@/pages/admin/UploadLaw.tsx";
import AdminDashboard from "@/pages/admin/Dashboard.tsx";
import AdminUploadJudgment from "@/pages/admin/UploadJudgment.tsx";
import AdminUploadNotice from "@/pages/admin/UploadNotice.tsx";
import EditLaw from './pages/admin/EditLaw';
import EditJudgment from './pages/admin/EditJudgment';
import EditNotice from './pages/admin/EditNotice';
import AdminUsers from './pages/admin/Users';
import BulkImport from './pages/admin/BulkImport';
import SearchPage from './pages/Search';
import Decrees from './pages/Decrees';
import DecreeDetail from './pages/decrees/DecreeDetail';
import UploadDecree from './pages/admin/UploadDecree';
import EditDecree from './pages/admin/EditDecree';
import Library from './pages/Library';
import Profile from './pages/Profile';
import ScrollToTop from './components/ScrollToTop';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
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
      staleTime: 5 * 60 * 1000, // 5 minutes
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
          <ErrorBoundary>
            <ScrollToTop />
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
            <Route path="/library" element={
              <ProtectedRoute>
                <Library />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/resources" element={<LegalResources />} />
            <Route path="/judgments/supreme-court" element={<SupremeCourt />} />
            <Route path="/judgments/court-of-appeal" element={<CourtOfAppeal />} />
            <Route path="/judgments/high-court" element={<HighCourt />} />
            <Route path="/judgments/:id" element={<JudgmentDetail />} />
            <Route path="/judgments/:id/document" element={<JudgmentDocument />} />
            <Route path="/laws/constitution" element={<Constitution />} />
            <Route path="/laws/acts" element={<Acts />} />
            <Route path="/laws/:id" element={<LawDetail />} />
            <Route path="/laws/:id/document" element={<LawDocument />} />
            <Route path="/notices" element={<LegalNotices />} />
            <Route path="/notices/:id" element={<NoticeDetail />} />
            <Route path="/notices/:id/document" element={<NoticeDocument />} />
            <Route path="/decrees" element={<Decrees />} />
            <Route path="/decrees/:id" element={<DecreeDetail />} />

            {/* Admin Routes - Protected */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requireEditor={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/upload-law" element={
              <ProtectedRoute requireEditor={true}>
                <AdminUploadLaw />
              </ProtectedRoute>
            } />
            <Route path="/admin/upload-judgment" element={
              <ProtectedRoute requireEditor={true}>
                <AdminUploadJudgment />
              </ProtectedRoute>
            } />
            <Route path="/admin/upload-notice" element={
              <ProtectedRoute requireEditor={true}>
                <AdminUploadNotice />
              </ProtectedRoute>
            } />

            <Route path="/admin/edit-law/:id" element={
              <ProtectedRoute requireEditor={true}>
                <EditLaw />
              </ProtectedRoute>
            } />
            <Route path="/admin/edit-judgment/:id" element={
              <ProtectedRoute requireEditor={true}>
                <EditJudgment />
              </ProtectedRoute>
            } />
            <Route path="/admin/edit-notice/:id" element={
              <ProtectedRoute requireEditor={true}>
                <EditNotice />
              </ProtectedRoute>
            } />
            <Route path="/admin/upload-decree" element={
              <ProtectedRoute requireEditor={true}>
                <UploadDecree />
              </ProtectedRoute>
            } />
            <Route path="/admin/edit-decree/:id" element={
              <ProtectedRoute requireEditor={true}>
                <EditDecree />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/bulk-import" element={
              <ProtectedRoute requireAdmin={true}>
                <BulkImport />
              </ProtectedRoute>
            } />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
