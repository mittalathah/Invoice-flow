import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { Invoice } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Download, FileText, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export const SalesInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    mockApi.getInvoices('sales').then(setInvoices);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-50 text-green-700 border-green-200';
      case 'partial': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'pending': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-zinc-50 text-zinc-700';
    }
  };

  const handleSendWhatsApp = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const result = await mockApi.sendWhatsAppReminder(id, 'invoice');
      if (result.method === 'link') {
        toast.success(`WhatsApp Web opened for reminder.`);
      } else {
        toast.success(`Reminder sent via WhatsApp API.`);
      }
    } catch (err) {
      toast.error('Could not connect to WhatsApp. Please check client phone number.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Sales Invoices</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage outbound invoices and track payments.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => navigate('/invoices/create')}
             className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
           >
            <Plus size={16} /> <span className="hidden md:inline">Create Invoice</span> <span className="md:hidden">Create</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[900px]">
            <thead className="bg-zinc-50 border-b border-zinc-200 font-medium text-zinc-500">
              <tr>
                <th className="px-6 py-3">Invoice #</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Due Date</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Approval</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-4 font-mono font-medium text-zinc-900">
                    <Link to={`/invoices/${inv.id}`} className="hover:underline text-primary">
                      {inv.invoice_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{inv.client_name}</td>
                  <td className="px-6 py-4 text-zinc-500">{new Date(inv.issue_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-zinc-500">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4 text-right font-mono">₹{inv.total_amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(inv.status)} capitalize`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {inv.approval_status === 'approved' ? (
                       <span className="text-green-600 flex items-center justify-center gap-1 text-xs font-medium">
                         <CheckCircle size={12} /> Approved
                       </span>
                    ) : (
                      <span className="text-amber-600 flex items-center justify-center gap-1 text-xs font-medium">
                         <Clock size={12} /> Pending
                       </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {inv.status !== 'paid' && (
                        <button 
                          onClick={(e) => handleSendWhatsApp(e, inv.id)}
                          className="text-emerald-500 hover:text-emerald-700 p-1 transition-colors"
                          title="Send WhatsApp Reminder"
                        >
                          <MessageSquare size={16} />
                        </button>
                      )}
                      <button className="text-zinc-400 hover:text-zinc-600 p-1">
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {invoices.length === 0 && (
          <div className="p-12 text-center text-zinc-400">
            No invoices found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
};