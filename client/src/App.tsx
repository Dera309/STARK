import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { UserPreferencesProvider } from "./contexts/UserPreferencesContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppSkeleton from "./components/ui/AppSkeleton";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";

// Lazy load all components for better performance
const CustomerLayout = lazy(() => import("./components/layout/CustomerLayout"));
const AdminLayout = lazy(() => import("./components/layout/AdminLayout"));
const PremiumLogin = lazy(() => import("./pages/auth/PremiumLogin"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const PremiumDashboard = lazy(() => import("./pages/customer/PremiumDashboard"));
const Dashboard = lazy(() => import("./pages/customer/Dashboard"));
const Transfers = lazy(() => import("./pages/customer/Transfers"));
const TransactionsPage = lazy(() => import("./pages/customer/Transactions"));
const LoansPage = lazy(() => import("./pages/customer/Loans"));
const WealthPage = lazy(() => import("./pages/customer/Wealth"));
const InvestmentsPage = lazy(() => import("./pages/customer/Investments"));
const CardsPage = lazy(() => import("./pages/customer/Cards"));
const Settings = lazy(() => import("./pages/customer/Settings"));
const AdminOverview = lazy(() => import("./pages/admin/Overview"));
const AdminUserManagement = lazy(() => import("./pages/admin/UserManagement"));
const AdminOperations = lazy(() => import("./pages/admin/Operations"));

export default function App() {
  const routerFuture = {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  };

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UserPreferencesProvider>
          <AuthProvider>
            <BrowserRouter future={routerFuture}>
              <Suspense fallback={<AppSkeleton />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<PremiumLogin />} />
                <Route path="/login/classic" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Customer Protected Routes — wrapped in CustomerLayout */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<CustomerLayout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<PremiumDashboard />} />
                    <Route path="/dashboard/classic" element={<Dashboard />} />
                    <Route path="/transfers" element={<Transfers />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/loans" element={<LoansPage />} />
                    <Route path="/wealth" element={<WealthPage />} />
                    <Route path="/investments" element={<InvestmentsPage />} />
                    <Route path="/cards" element={<CardsPage />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                </Route>

                {/* Admin Protected Routes */}
                <Route element={<ProtectedRoute adminOnly />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
                    <Route path="/admin/overview" element={<AdminOverview />} />
                    <Route path="/admin/users" element={<AdminUserManagement />} />
                    <Route path="/admin/operations" element={<AdminOperations />} />
                  </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </UserPreferencesProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
