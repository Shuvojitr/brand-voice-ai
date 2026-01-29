import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { useFavicon } from "@/hooks/useFavicon";
import { useAnalyticsTracking } from "@/hooks/useAnalyticsTracking";
import { GlobalSeoHead } from "@/components/GlobalSeoHead";
import { ThirdPartyScripts } from "@/components/ThirdPartyScripts";
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
import LiveChat from "./pages/LiveChat";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogCategory from "./pages/BlogCategory";
import BlogAuthor from "./pages/BlogAuthor";
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
import AdminLiveChats from "./pages/admin/AdminLiveChats";
import AdminAiSettings from "./pages/admin/AdminAiSettings";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminIntegrations from "./pages/admin/AdminIntegrations";
import AdminBlogPosts from "./pages/admin/AdminBlogPosts";
import AdminBlogPostEditor from "./pages/admin/AdminBlogPostEditor";
import AdminNewsletterSubscribers from "./pages/admin/AdminNewsletterSubscribers";
import AdminMedia from "./pages/admin/AdminMedia";
import ManagerOverview from "./pages/manager/ManagerOverview";
import ManagerTemplates from "./pages/manager/ManagerTemplates";
import ManagerPages from "./pages/manager/ManagerPages";
import ManagerTestimonials from "./pages/manager/ManagerTestimonials";
import ManagerFaqs from "./pages/manager/ManagerFaqs";
import ManagerReports from "./pages/manager/ManagerReports";
import ManagerSupportTickets from "./pages/manager/ManagerSupportTickets";
import ManagerLiveChats from "./pages/manager/ManagerLiveChats";

const queryClient = new QueryClient();

function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
  useAnalyticsTracking();
  return <>{children}</>;
}

function AppContent() {
  useFavicon();
  
  return (
    <>
      <GlobalSeoHead />
      <ThirdPartyScripts />
      <BrowserRouter>
      <AnalyticsWrapper>
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
        <Route path="/dashboard/live-chat" element={<LiveChat />} />
        <Route path="/dashboard/getting-started" element={<GettingStarted />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/category/:category" element={<BlogCategory />} />
        <Route path="/blog/author/:name" element={<BlogAuthor />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminOverview />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/templates" element={<AdminTemplates />} />
        <Route path="/admin/api-keys" element={<AdminApiKeys />} />
        <Route path="/admin/pages" element={<AdminPages />} />
        <Route path="/admin/homepage" element={<AdminHomepage />} />
        <Route path="/admin/support" element={<AdminSupportPage />} />
        <Route path="/admin/tickets" element={<AdminSupportTickets />} />
        <Route path="/admin/live-chats" element={<AdminLiveChats />} />
        <Route path="/admin/ai-settings" element={<AdminAiSettings />} />
        <Route path="/admin/testimonials" element={<AdminTestimonials />} />
        <Route path="/admin/faqs" element={<AdminFaqs />} />
        <Route path="/admin/plans" element={<AdminPlans />} />
        <Route path="/admin/appearance" element={<AdminAppearance />} />
        <Route path="/admin/seo" element={<AdminSeo />} />
        <Route path="/admin/activity" element={<AdminActivityLog />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/integrations" element={<AdminIntegrations />} />
        <Route path="/admin/blog" element={<AdminBlogPosts />} />
        <Route path="/admin/blog/new" element={<AdminBlogPostEditor />} />
        <Route path="/admin/blog/edit/:postId" element={<AdminBlogPostEditor />} />
        <Route path="/admin/media" element={<AdminMedia />} />
        <Route path="/admin/subscribers" element={<AdminNewsletterSubscribers />} />
        {/* Manager Routes */}
        <Route path="/manager" element={<ManagerOverview />} />
        <Route path="/manager/templates" element={<ManagerTemplates />} />
        <Route path="/manager/pages" element={<ManagerPages />} />
        <Route path="/manager/testimonials" element={<ManagerTestimonials />} />
        <Route path="/manager/faqs" element={<ManagerFaqs />} />
        <Route path="/manager/tickets" element={<ManagerSupportTickets />} />
        <Route path="/manager/live-chats" element={<ManagerLiveChats />} />
        <Route path="/manager/reports" element={<ManagerReports />} />
        {/* Dynamic static pages - catches any slug not matched above */}
        <Route path="/:slug" element={<StaticPage />} />
        {/* 404 fallback */}
        <Route path="/404" element={<NotFound />} />
      </Routes>
      </AnalyticsWrapper>
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
