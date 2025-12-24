import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useFavicon } from "@/hooks/useFavicon";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Templates from "./pages/Templates";
import CreateContent from "./pages/CreateContent";
import Documents from "./pages/Documents";
import DocumentEditor from "./pages/DocumentEditor";
import BrandVoices from "./pages/BrandVoices";
import History from "./pages/History";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Support from "./pages/Support";
import EmailSupport from "./pages/EmailSupport";
import GettingStarted from "./pages/GettingStarted";
import Docs from "./pages/Docs";
import Banned from "./pages/Banned";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTemplates from "./pages/admin/AdminTemplates";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminFaqs from "./pages/admin/AdminFaqs";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminAppearance from "./pages/admin/AdminAppearance";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

function AppContent() {
  useFavicon();
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />
        <Route path="/banned" element={<Banned />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/templates" element={<Templates />} />
        <Route path="/dashboard/create/:templateId" element={<CreateContent />} />
        <Route path="/dashboard/documents" element={<Documents />} />
        <Route path="/dashboard/document/:documentId" element={<DocumentEditor />} />
        <Route path="/dashboard/brand-voices" element={<BrandVoices />} />
        <Route path="/dashboard/history" element={<History />} />
        <Route path="/dashboard/billing" element={<Billing />} />
        <Route path="/dashboard/settings" element={<Settings />} />
        <Route path="/dashboard/support" element={<Support />} />
        <Route path="/dashboard/support/email" element={<EmailSupport />} />
        <Route path="/dashboard/getting-started" element={<GettingStarted />} />
        <Route path="/docs" element={<Docs />} />
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminOverview />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/templates" element={<AdminTemplates />} />
        <Route path="/admin/testimonials" element={<AdminTestimonials />} />
        <Route path="/admin/faqs" element={<AdminFaqs />} />
        <Route path="/admin/plans" element={<AdminPlans />} />
        <Route path="/admin/appearance" element={<AdminAppearance />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
