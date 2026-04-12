import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DataProvider } from "./contexts/DataContext";
import Dashboard from "./pages/Dashboard";
import CustomersPage from "./pages/CustomersPage";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import MessagesPage from "./pages/MessagesPage";
import SalesPage from "./pages/SalesPage";
import SettingsPage from "./pages/SettingsPage";
import BottomNav from "./components/BottomNav";
import NotFound from "./pages/NotFound";

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
          <DataProvider>
            <Router hook={useHashLocation}>
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
            </Router>
          </DataProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
