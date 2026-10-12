import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { FullPageLoader } from "@/components/auth/AuthShell";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ChurchProvider, useChurch } from "@/contexts/ChurchContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { isSupabaseConfigured } from "@/lib/supabase";
import AuthPage from "@/pages/AuthPage";
import Index from "@/pages/Index";
import InvitePage from "@/pages/InvitePage";
import JoinPage from "@/pages/JoinPage";
import NotFound from "@/pages/NotFound";
import SetupRequired from "@/pages/SetupRequired";
import WelcomePage from "@/pages/WelcomePage";

const ThemedToaster = () => {
  const { theme } = useTheme();
  return <Toaster theme={theme} position="top-center" toastOptions={{ className: "font-body" }} />;
};

/** Sends signed-out visitors to sign in, then back to where they were going. */
const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { session, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageLoader />;
  if (!session) return <Navigate to={`/auth?next=${encodeURIComponent(location.pathname)}`} replace />;
  return <>{children}</>;
};

/** The main app needs a named profile and an active church; otherwise go to the welcome flow. */
const RequireChurch = ({ children }: { children: ReactNode }) => {
  const { profile } = useAuth();
  const { current, loading } = useChurch();
  if (loading) return <FullPageLoader />;
  if (!current || !profile?.full_name) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/join/:code" element={<JoinPage />} />
    <Route path="/invite/:token" element={<InvitePage />} />
    <Route
      path="/welcome"
      element={
        <RequireAuth>
          <WelcomePage />
        </RequireAuth>
      }
    />
    <Route
      path="/"
      element={
        <RequireAuth>
          <RequireChurch>
            <Index />
          </RequireChurch>
        </RequireAuth>
      }
    />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <ThemeProvider>
    <ThemedToaster />
    {isSupabaseConfigured ? (
      <AuthProvider>
        <ChurchProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ChurchProvider>
      </AuthProvider>
    ) : (
      <SetupRequired />
    )}
  </ThemeProvider>
);

export default App;
