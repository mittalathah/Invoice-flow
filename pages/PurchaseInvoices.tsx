import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { Invoice } from '../types';
import { Plus } from 'lucide-react';
import { useAuth } from '../App';

export const PurchaseInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // In a real app, filtering happens on backend based on role
    mockApi.getInvoices('purchase').then(data => {
      if (user?.role === 'vendor') {
        // Vendors only see their own - simplistic mock logic
        setInvoices(data.filter(i => i.uploaded_by === user.id || true)); // Allowing all for demo
      } else {
        setInvoices(data);
      }
    });
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Purchase Invoices</h1>
          <p className="text-zinc-500 text-sm mt-1">Track expenses and vendor bills.</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 w-full md:w-auto justify-center">
          <Plus size={16} /> Upload Invoice
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-zinc-50 border-b border-zinc-200 font-medium text-zinc-500">
              <tr>
                <th className="px-6 py-3">Ref #</th>
                <th className="px-6 py-3">Vendor</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-zinc-600">{inv.invoice_number}</td>
                  <td className="px-6 py-4 font-medium">{inv.vendor_name}</td>
                  <td className="px-6 py-4 text-zinc-500">{new Date(inv.issue_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right font-mono">₹{inv.total_amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border capitalize ${inv.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};