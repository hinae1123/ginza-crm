import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import CustomersPage from "./pages/CustomersPage";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import MessagesPage from "./pages/MessagesPage";
import SalesPage from "./pages/SalesPage";
import SettingsPage from "./pages/SettingsPage";
import BottomNav from "./components/BottomNav";
import NotFound from "./pages/NotFound";

function AuthenticatedApp() {
  return (
    <DataProvider>
      <div className="min-h-screen flex flex-col pb-20">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/customers" component={CustomersPage} />
          <Route path="/customers/:id" component={CustomerDetailPage} />
          <Route path="/messages" component={MessagesPage} />
          <Route path="/sales" component={SalesPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route component={NotFound} />
        </Switch>
        <BottomNav />
      </div>
    </DataProvider>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: 'oklch(0.18 0.01 280)',
                border: '1px solid oklch(1 0 0 / 8%)',
                color: 'oklch(0.88 0.01 70)',
              },
            }}
          />
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
