import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import Categories from "./pages/Categories";
import PromptDetail from "./pages/PromptDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import MyPrompts from "./pages/MyPrompts";
import PaymentSuccess from "./pages/PaymentSuccess";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/prompt/:id" element={<PromptDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
