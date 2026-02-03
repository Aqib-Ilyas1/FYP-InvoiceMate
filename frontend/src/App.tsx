import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Invoices from '@/pages/Invoices';
import InvoiceEditor from '@/pages/InvoiceEditor';
import InvoiceDetail from '@/pages/InvoiceDetail';
import InvoiceOCR from '@/pages/InvoiceOCR';
import InvoiceNLP from '@/pages/InvoiceNLP';
import Clients from '@/pages/Clients';
import Settings from '@/pages/Settings';
import NewInvoice from '@/pages/NewInvoice';
import LandingPage from '@/pages/LandingPage';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function Root() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Root />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <Invoices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/new"
          element={
            <ProtectedRoute>
              <NewInvoice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/new/manual"
          element={
            <ProtectedRoute>
              <InvoiceEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/scan"
          element={
            <ProtectedRoute>
              <InvoiceOCR />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/quick-create"
          element={
            <ProtectedRoute>
              <InvoiceNLP />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/:id"
          element={
            <ProtectedRoute>
              <InvoiceDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/:id/edit"
          element={
            <ProtectedRoute>
              <InvoiceEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;