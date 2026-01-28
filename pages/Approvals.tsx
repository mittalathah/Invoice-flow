import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { Invoice } from '../types';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';

export const Approvals = () => {
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    mockApi.getInvoices().then(invs => {
      setPendingInvoices(invs.filter(i => i.approval_status === 'pending'));
    });
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await mockApi.approveInvoice(id);
      setPendingInvoices(prev => prev.filter(i => i.id !== id));
      toast.success('Invoice approved');
    } catch {
      toast.error('Failed to approve');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">Pending Approvals</h1>
      <div className="grid gap-4">
        {pendingInvoices.length === 0 ? (
          <p className="text-zinc-500">No pending approvals.</p>
        ) : (
          pendingInvoices.map(inv => (
            <div key={inv.id} className="bg-white border border-zinc-200 p-4 rounded-sm flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded border uppercase font-bold ${inv.invoice_type === 'sales' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-purple-50 border-purple-200 text-purple-700'}`}>
                    {inv.invoice_type}
                  </span>
                  <span className="font-mono font-bold">{inv.invoice_number}</span>
                </div>
                <div className="text-sm text-zinc-500 mt-1">
                  {inv.client_name || inv.vendor_name} • ₹{inv.total_amount.toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleApprove(inv.id)}
                  className="p-2 bg-green-50 text-green-700 rounded hover:bg-green-100"
                >
                  <Check size={18} />
                </button>
                <button className="p-2 bg-red-50 text-red-700 rounded hover:bg-red-100">
                  <X size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};