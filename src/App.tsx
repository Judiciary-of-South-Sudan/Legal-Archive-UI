import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import JudicialOpinions from "./pages/JudicialOpinions";
import LegalResources from "./pages/LegalResources";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
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
          <Route path="/resources" element={<LegalResources />} />
          <Route path="/judgments/supreme-court" element={<SupremeCourt />} />
          <Route path="/judgments/court-of-appeal" element={<CourtOfAppeal />} />
          <Route path="/judgments/high-court" element={<HighCourt />} />
          <Route path="/laws/constitution" element={<Constitution />} />
          <Route path="/laws/acts" element={<Acts />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
