import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { useFavicon } from "@/hooks/useFavicon";
import { GlobalSeoHead } from "@/components/GlobalSeoHead";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
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
import StaticPage from "./pages/StaticPage";
import MyTickets from "./pages/MyTickets";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTemplates from "./pages/admin/AdminTemplates";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminFaqs from "./pages/admin/AdminFaqs";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminAppearance from "./pages/admin/AdminAppearance";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminApiKeys from "./pages/admin/AdminApiKeys";
import AdminPages from "./pages/admin/AdminPages";
import AdminHomepage from "./pages/admin/AdminHomepage";
import AdminSeo from "./pages/admin/AdminSeo";
import AdminActivityLog from "./pages/admin/AdminActivityLog";
import AdminSupportPage from "./pages/admin/AdminSupportPage";
import AdminSupportTickets from "./pages/admin/AdminSupportTickets";
import ManagerOverview from "./pages/manager/ManagerOverview";
import ManagerTemplates from "./pages/manager/ManagerTemplates";
import ManagerPages from "./pages/manager/ManagerPages";
import ManagerTestimonials from "./pages/manager/ManagerTestimonials";
import ManagerFaqs from "./pages/manager/ManagerFaqs";
import ManagerReports from "./pages/manager/ManagerReports";

const queryClient = new QueryClient();

function AppContent() {
  useFavicon();
  
  return (
    <>
      <GlobalSeoHead />
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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
        <Route path="/dashboard/my-tickets" element={<MyTickets />} />
        <Route path="/dashboard/getting-started" element={<GettingStarted />} />
        <Route path="/docs" element={<Docs />} />
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminOverview />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/templates" element={<AdminTemplates />} />
        <Route path="/admin/api-keys" element={<AdminApiKeys />} />
        <Route path="/admin/pages" element={<AdminPages />} />
        <Route path="/admin/homepage" element={<AdminHomepage />} />
        <Route path="/admin/support" element={<AdminSupportPage />} />
        <Route path="/admin/tickets" element={<AdminSupportTickets />} />
        <Route path="/admin/testimonials" element={<AdminTestimonials />} />
        <Route path="/admin/faqs" element={<AdminFaqs />} />
        <Route path="/admin/plans" element={<AdminPlans />} />
        <Route path="/admin/appearance" element={<AdminAppearance />} />
        <Route path="/admin/seo" element={<AdminSeo />} />
        <Route path="/admin/activity" element={<AdminActivityLog />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        {/* Manager Routes */}
        <Route path="/manager" element={<ManagerOverview />} />
        <Route path="/manager/templates" element={<ManagerTemplates />} />
        <Route path="/manager/pages" element={<ManagerPages />} />
        <Route path="/manager/testimonials" element={<ManagerTestimonials />} />
        <Route path="/manager/faqs" element={<ManagerFaqs />} />
        <Route path="/manager/reports" element={<ManagerReports />} />
        {/* Dynamic static pages - catches any slug not matched above */}
        <Route path="/:slug" element={<StaticPage />} />
        {/* 404 fallback */}
        <Route path="/404" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
