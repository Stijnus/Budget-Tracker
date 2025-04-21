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
import { NotFoundPage } from "./pages/NotFoundPage";
import { AuthProvider } from "./state/auth"; // Using the AuthProvider from auth.tsx
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DatabaseCheck } from "./components/DatabaseCheck";

function App() {
  return (
    <AuthProvider>
      <Router>
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
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <CategoriesPage />
              </ProtectedRoute>
            }
          />

          {/* Redirect /home to /dashboard */}
          <Route path="/home" element={<Navigate to="/dashboard" replace />} />

          {/* Database check route */}
          <Route path="/db-check" element={<DatabaseCheck />} />

          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
