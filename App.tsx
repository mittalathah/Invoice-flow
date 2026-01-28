import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { User } from './types';
import { mockApi } from './services/mockApi';
import { Toaster } from 'sonner';

// --- Components ---
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Clients } from './pages/Clients';
import { ClientDetail } from './pages/ClientDetail';
import { SalesInvoices } from './pages/SalesInvoices';
import { PurchaseInvoices } from './pages/PurchaseInvoices';
import { CreateInvoice } from './pages/CreateInvoice';
import { InvoiceDetail } from './pages/InvoiceDetail';
import { Payments } from './pages/Payments';
import { UserManagement } from './pages/UserManagement';
import { Approvals } from './pages/Approvals';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

// --- Protected Route Wrapper ---
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage on mount
    const storedUser = localStorage.getItem('invoiceflow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const user = await mockApi.login(email);
      if (user) {
        setUser(user);
        localStorage.setItem('invoiceflow_user', JSON.stringify(user));
      } else {
        throw new Error('User not found');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('invoiceflow_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="invoices/sales" element={<SalesInvoices />} />
            <Route path="invoices/purchase" element={<PurchaseInvoices />} />
            <Route path="invoices/create" element={<CreateInvoice />} />
            <Route path="invoices/:id" element={<InvoiceDetail />} />
            <Route path="payments" element={<Payments />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="approvals" element={<Approvals />} />
          </Route>
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}