import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import Index from "./pages/Index.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import AdminPage from "./pages/AdminPage.tsx";
import DashboardLayout from "./components/dashboard/DashboardLayout.tsx";
import DashboardHome from "./pages/dashboard/DashboardHome.tsx";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage.tsx";
import ReportsPage from "./pages/dashboard/ReportsPage.tsx";
import UsersPage from "./pages/dashboard/UsersPage.tsx";
import ActivityPage from "./pages/dashboard/ActivityPage.tsx";
import SettingsPage from "./pages/dashboard/SettingsPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

// Dashboard Index Wrapper to render correct home based on role
const DashboardIndex = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('users').select('role').eq('id', user.id).single().then(({ data, error }) => {
          if (error || !data?.role) {
            setRole('customer'); // Fallback if data sync fails
          } else {
            setRole(data.role);
          }
        });
      } else {
        setRole('customer');
      }
    });
  }, []);

  if (!role) return <div className="h-full flex items-center justify-center p-12">Loading Workspace...</div>;
  
  return role === 'admin' ? <AdminPage /> : <DashboardHome />;
};

// Simple protection wrapper
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }
      if (requiredRole) {
        supabase.from('users').select('role').eq('id', user.id).single().then(({ data }) => {
          setHasAccess(data?.role === requiredRole);
          setLoading(false);
        });
      } else {
        setHasAccess(true);
        setLoading(false);
      }
    });
  }, [requiredRole]);

  if (loading) return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  if (!hasAccess) return <Navigate to="/auth" />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          
          <Route path="/admin" element={<Navigate to="/dashboard" />} />
          
          {/* Dashboard nested routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardIndex />} />
            <Route path="analytics" element={<ProtectedRoute requiredRole="admin"><AnalyticsPage /></ProtectedRoute>} />
            <Route path="reports" element={<ProtectedRoute requiredRole="admin"><ReportsPage /></ProtectedRoute>} />
            <Route path="users" element={<ProtectedRoute requiredRole="admin"><UsersPage /></ProtectedRoute>} />
            <Route path="activity" element={<ProtectedRoute requiredRole="admin"><ActivityPage /></ProtectedRoute>} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

