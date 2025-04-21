import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SettingsPage } from "./pages/SettingsPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { ExpensesPage } from "./pages/ExpensesPage";
import { IncomePage } from "./pages/IncomePage";
import { BudgetsPage } from "./pages/BudgetsPage";
import { TagsPage } from "./pages/TagsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { BillsPage } from "./pages/BillsPage";
import { GoalsPage } from "./pages/GoalsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AuthProvider } from "./state/auth"; // Using the AuthProvider from auth.tsx
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DatabaseCheck } from "./components/DatabaseCheck";
import { ErrorBoundary } from "./shared/components/ErrorBoundary";
import { ToastProvider } from "./shared/components/Toast";
import { WelcomeModal } from "./shared/components/WelcomeModal";
import { KeyboardShortcutsProvider } from "./shared/components/KeyboardShortcutsProvider";

function App() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [userName] = useState("");

  // Check if this is the user's first visit
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem("hasVisitedBefore");
    if (!hasVisitedBefore) {
      // Wait a bit before showing the welcome modal
      const timer = setTimeout(() => {
        setShowWelcomeModal(true);
        localStorage.setItem("hasVisitedBefore", "true");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle welcome modal close
  const handleWelcomeModalClose = () => {
    setShowWelcomeModal(false);
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <KeyboardShortcutsProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LandingPage />} />
                <Route path="/register" element={<LandingPage />} />
                <Route path="/forgot-password" element={<LandingPage />} />
                <Route path="/reset-password" element={<LandingPage />} />

                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DashboardPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <SettingsPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/categories"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <CategoriesPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transactions"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <TransactionsPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/expenses"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <ExpensesPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/income"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <IncomePage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/budgets"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <BudgetsPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tags"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <TagsPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <AnalyticsPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bills"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <BillsPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/goals"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <GoalsPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/goals/:goalId"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <GoalsPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />

                {/* Redirect /home to /dashboard */}
                <Route
                  path="/home"
                  element={<Navigate to="/dashboard" replace />}
                />

                {/* Database check route */}
                <Route path="/db-check" element={<DatabaseCheck />} />

                {/* 404 route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>

              {/* Welcome Modal for new users */}
              <WelcomeModal
                isOpen={showWelcomeModal}
                onClose={handleWelcomeModalClose}
                userName={userName}
              />
            </KeyboardShortcutsProvider>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
