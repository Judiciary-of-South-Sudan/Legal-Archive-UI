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
import SearchPage from './pages/Search';

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
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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

            {/* Admin Routes - Protected */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/upload-law" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminUploadLaw />
              </ProtectedRoute>
            } />
            <Route path="/admin/upload-judgment" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminUploadJudgment />
              </ProtectedRoute>
            } />
            <Route path="/admin/upload-notice" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminUploadNotice />
              </ProtectedRoute>
            } />

            <Route path="/admin/edit-law/:id" element={
              <ProtectedRoute requireAdmin={true}>
                <EditLaw />
              </ProtectedRoute>
            } />
            <Route path="/admin/edit-judgment/:id" element={
              <ProtectedRoute requireAdmin={true}>
                <EditJudgment />
              </ProtectedRoute>
            } />
            <Route path="/admin/edit-notice/:id" element={
              <ProtectedRoute requireAdmin={true}>
                <EditNotice />
              </ProtectedRoute>
            } />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
