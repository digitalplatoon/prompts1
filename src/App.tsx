import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { PageLoader } from "@/components/PageLoader";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import CookieConsent from "@/components/CookieConsent";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Redirect component for old URLs
const ProductRedirect = () => {
  const id = window.location.pathname.split('/').pop();
  return <Navigate to={`/prompt/${id}`} replace />;
};

// Lazy load all pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Browse = lazy(() => import("./pages/Browse"));
const Categories = lazy(() => import("./pages/Categories"));
const PromptDetail = lazy(() => import("./pages/PromptDetail"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Auth = lazy(() => import("./pages/Auth"));
const MyPrompts = lazy(() => import("./pages/MyPrompts"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const Profile = lazy(() => import("./pages/Profile"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Refunds = lazy(() => import("./pages/Refunds"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Admin = lazy(() => import("./pages/Admin"));
const SubmitPrompt = lazy(() => import("./pages/SubmitPrompt"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Api = lazy(() => import("./pages/Api"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Careers = lazy(() => import("./pages/Careers"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const Security = lazy(() => import("./pages/Security"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/prompt/:id" element={<PromptDetail />} />
              
              {/* Redirects for old/incorrect URLs that Google indexed */}
              <Route path="/products" element={<Navigate to="/browse" replace />} />
              <Route path="/products/:id" element={<ProductRedirect />} />
              <Route path="/catalog" element={<Navigate to="/browse" replace />} />
              <Route path="/de" element={<Navigate to="/" replace />} />
              <Route path="/de/*" element={<Navigate to="/" replace />} />
              <Route path="/es" element={<Navigate to="/" replace />} />
              <Route path="/es/*" element={<Navigate to="/" replace />} />
              <Route path="/fr" element={<Navigate to="/" replace />} />
              <Route path="/fr/*" element={<Navigate to="/" replace />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/refunds" element={<Refunds />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/api" element={<Api />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/security" element={<Security />} />
              <Route path="/unsubscribe" element={<Unsubscribe />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route 
                path="/my-prompts" 
                element={
                  <ProtectedRoute>
                    <MyPrompts />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/favorites" 
                element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/submit-prompt" 
                element={
                  <ProtectedRoute>
                    <SubmitPrompt />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <GoogleAnalytics />
          <CookieConsent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
