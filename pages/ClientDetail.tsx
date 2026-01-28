import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { mockApi } from '../services/mockApi';
import { Client, Invoice } from '../types';
import { ArrowLeft, Mail, Phone, MessageSquare, ExternalLink, IndianRupee, FileText } from 'lucide-react';
import { toast } from 'sonner';

export const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!id) return;
      try {
        const clientData = await mockApi.getClientById(id);
        const invoiceData = await mockApi.getInvoices('sales', id);
        setClient(clientData || null);
        setInvoices(invoiceData);
      } catch (error) {
        toast.error('Failed to fetch client data');
      } finally {
        setLoading(false);
      }
    };
    fetchClientData();
  }, [id]);

  const handleSendWhatsApp = async () => {
    if (!id) return;
    const promise = mockApi.sendWhatsAppReminder(id, 'client');
    toast.promise(promise, {
      loading: 'Connecting to WhatsApp API...',
      success: (data) => data.message,
      error: 'Failed to send WhatsApp reminder',
    });
  };

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading client profile...</div>;
  if (!client) return <div className="p-8 text-center text-red-500">Client not found</div>;

  const totalBilled = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paid_amount, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <button 
        onClick={() => navigate('/clients')} 
        className="text-zinc-500 hover:text-zinc-800 flex items-center gap-2 text-sm"
      >
        <ArrowLeft size={16} /> Back to Clients
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Profile Card */}
        <div className="lg:col-span-1 bg-white border border-zinc-200 rounded-sm p-6 shadow-sm h-fit">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mb-4">
              {client.name.charAt(0)}
            </div>
            <h1 className="text-xl font-bold text-zinc-900">{client.name}</h1>
            <p className="text-zinc-500 text-sm">Client ID: {client.id}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-zinc-600">
              <Mail size={16} className="text-zinc-400" />
              <span>{client.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-600">
              <Phone size={16} className="text-zinc-400" />
              <span>{client.phone}</span>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <button 
              onClick={handleSendWhatsApp}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              <MessageSquare size={16} /> WhatsApp Reminder
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-zinc-300 text-zinc-700 rounded text-sm font-medium hover:bg-zinc-50 transition-colors">
              <Mail size={16} /> Send Email
            </button>
          </div>
        </div>

        {/* Financial Summary & Invoices */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 border border-zinc-200 rounded-sm shadow-sm">
              <p className="text-xs font-medium text-zinc-500 uppercase mb-1">Total Billed</p>
              <p className="text-lg font-bold font-mono">₹{totalBilled.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 border border-zinc-200 rounded-sm shadow-sm">
              <p className="text-xs font-medium text-zinc-500 uppercase mb-1">Total Paid</p>
              <p className="text-lg font-bold font-mono text-green-600">₹{totalPaid.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 border border-zinc-200 rounded-sm shadow-sm">
              <p className="text-xs font-medium text-zinc-500 uppercase mb-1">Outstanding</p>
              <p className="text-lg font-bold font-mono text-red-600">₹{client.total_due.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-sm overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center">
              <h3 className="font-bold text-zinc-800 flex items-center gap-2">
                <FileText size={18} className="text-zinc-400" />
                Invoices
              </h3>
              <Link to="/invoices/create" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                New Invoice <ExternalLink size={12} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200 font-medium text-zinc-500">
                  <tr>
                    <th className="px-6 py-3">Number</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-zinc-400 italic">No invoices found for this client.</td>
                    </tr>
                  ) : (
                    invoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-primary">
                          <Link to={`/invoices/${inv.id}`} className="hover:underline">{inv.invoice_number}</Link>
                        </td>
                        <td className="px-6 py-4 text-zinc-500">{new Date(inv.issue_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right font-mono">₹{inv.total_amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            inv.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' :
                            inv.status === 'partial' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link to={`/invoices/${inv.id}`} className="text-zinc-400 hover:text-zinc-600">
                            <ExternalLink size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};