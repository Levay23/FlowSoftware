import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import { useEffect, useState } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import WhatsApp from "@/pages/WhatsApp";
import Contacts from "@/pages/Contacts";
import Chatbot from "@/pages/Chatbot";
import Training from "@/pages/Training";
import Chat from "@/pages/Chat";
import Settings from "@/pages/Settings";
import AdminUsers from "@/pages/AdminUsers";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function ApiSetup() {
  const { token } = useAuth();

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || import.meta.env.BASE_URL.replace(/\/$/, "");
    setBaseUrl(apiBase);
    setAuthTokenGetter(() => token ?? null);
  }, [token]);

  return null;
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(true);
  }, []);

  useEffect(() => {
    if (checked && !isAuthenticated) {
      setLocation("/login");
    }
  }, [checked, isAuthenticated, setLocation]);

  if (!checked) return null;
  if (!isAuthenticated) return null;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/whatsapp">
        {() => <ProtectedRoute component={WhatsApp} />}
      </Route>
      <Route path="/contacts">
        {() => <ProtectedRoute component={Contacts} />}
      </Route>
      <Route path="/chatbot">
        {() => <ProtectedRoute component={Chatbot} />}
      </Route>
      <Route path="/training">
        {() => <ProtectedRoute component={Training} />}
      </Route>
      <Route path="/chat">
        {() => <ProtectedRoute component={Chat} />}
      </Route>
      <Route path="/settings">
        {() => <ProtectedRoute component={Settings} />}
      </Route>
      <Route path="/admin/users">
        {() => <ProtectedRoute component={AdminUsers} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <ApiSetup />
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
