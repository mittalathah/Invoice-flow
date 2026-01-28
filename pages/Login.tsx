import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { toast } from 'sonner';

export const Login = () => {
  const [email, setEmail] = useState('owner@invoiceflow.com');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg border border-zinc-200 p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-heading text-primary mb-2">InvoiceFlow</h1>
          <p className="text-zinc-500">Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="name@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
            <input
              type="password"
              value="dummy-password"
              readOnly
              className="w-full px-3 py-2 border border-zinc-300 rounded-md bg-zinc-50 text-zinc-400 cursor-not-allowed"
            />
            <p className="text-xs text-zinc-400 mt-1">Any password works for this demo.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2.5 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
          <p className="text-sm text-zinc-500 mb-4">Demo Accounts:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button 
              onClick={() => setEmail('owner@invoiceflow.com')}
              className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100"
            >
              Owner
            </button>
            <button 
              onClick={() => setEmail('acc@invoiceflow.com')}
              className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded hover:bg-purple-100"
            >
              Accountant
            </button>
            <button 
              onClick={() => setEmail('vendor@supplies.com')}
              className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded hover:bg-orange-100"
            >
              Vendor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};