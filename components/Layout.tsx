import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, ShoppingCart, 
  CreditCard, CheckSquare, Settings, LogOut, Bell, Menu, X
} from 'lucide-react';
import { useAuth } from '../App';

export const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive 
        ? 'bg-white text-primary border border-zinc-200 shadow-sm' 
        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
    }`;

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-zinc-50 border-r border-zinc-200 flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold font-heading text-primary flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white text-lg">IF</div>
            InvoiceFlow
          </h1>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-zinc-500 hover:text-zinc-800"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="px-6 mb-2">
          <div className="text-xs text-zinc-500 font-mono bg-zinc-100 p-1 rounded inline-block px-2">
            Role: {user?.role.toUpperCase()}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-2">
          {user?.role !== 'vendor' && (
            <NavLink to="/dashboard" className={navItemClass}>
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>
          )}

          {(user?.role === 'owner' || user?.permissions?.can_manage_clients) && (
            <NavLink to="/clients" className={navItemClass}>
              <Users size={18} />
              Clients
            </NavLink>
          )}

          {user?.role !== 'vendor' && (
            <NavLink to="/invoices/sales" className={navItemClass}>
              <FileText size={18} />
              Sales Invoices
            </NavLink>
          )}

          <NavLink to="/invoices/purchase" className={navItemClass}>
            <ShoppingCart size={18} />
            Purchase Invoices
          </NavLink>

          {(user?.role === 'owner' || user?.permissions?.can_view_payments) && (
            <NavLink to="/payments" className={navItemClass}>
              <CreditCard size={18} />
              Payments
            </NavLink>
          )}

          {user?.role === 'owner' && (
            <>
              <div className="pt-4 pb-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider px-3">
                Admin
              </div>
              <NavLink to="/approvals" className={navItemClass}>
                <CheckSquare size={18} />
                Approvals
              </NavLink>
              <NavLink to="/users" className={navItemClass}>
                <Settings size={18} />
                User Mgmt
              </NavLink>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">{user?.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-w-0 overflow-auto flex flex-col min-h-screen">
        <header className="h-16 border-b border-zinc-200 bg-white sticky top-0 z-20 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-zinc-500 hover:text-zinc-800 p-1 -ml-1"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-zinc-800 capitalize">
              {location.pathname.split('/')[1] || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>
        <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};