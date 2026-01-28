import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockApi } from '../services/mockApi';
import { Invoice, Payment } from '../types';
import { ArrowLeft, Download, Send, CreditCard, CheckCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export const InvoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const inv = await mockApi.getInvoiceById(id);
      const pmts = await mockApi.getPayments(id);
      setInvoice(inv || null);
      setPayments(pmts);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleSendWhatsApp = async () => {
    if (!id) return;
    const promise = mockApi.sendWhatsAppReminder(id, 'invoice');
    toast.promise(promise, {
      loading: 'Connecting to WhatsApp API...',
      success: (data) => data.message,
      error: 'Failed to send WhatsApp reminder',
    });
  };

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading invoice details...</div>;
  if (!invoice) return <div className="p-8 text-center text-red-500">Invoice not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <button 
        onClick={() => navigate(-1)} 
        className="text-zinc-500 hover:text-zinc-800 flex items-center gap-2 text-sm"
      >
        <ArrowLeft size={16} /> Back to Invoices
      </button>

      <div className="bg-white border border-zinc-200 rounded-sm overflow-hidden shadow-sm">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-zinc-200 flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold font-mono text-primary mb-1">{invoice.invoice_number}</h1>
            <p className="text-zinc-500 text-sm">Issued: {new Date(invoice.issue_date).toLocaleDateString()}</p>
          </div>
          <div className="text-left md:text-right">
            <h2 className="text-xl font-bold text-zinc-800">{invoice.client_name || invoice.vendor_name}</h2>
            <div className={`mt-2 inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase border ${
               invoice.status === 'paid' ? 'bg-green-100 text-green-800 border-green-200' : 
               invoice.status === 'partial' ? 'bg-orange-100 text-orange-800 border-orange-200' :
               'bg-blue-100 text-blue-800 border-blue-200'
            }`}>
              {invoice.status}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
           {invoice.items && invoice.items.length > 0 ? (
             <div className="overflow-x-auto -mx-6 md:mx-0 px-6 md:px-0 mb-8">
               <table className="w-full text-left text-sm min-w-[500px]">
                 <thead>
                   <tr className="border-b border-zinc-200 text-zinc-500">
                     <th className="py-3 font-medium">Description</th>
                     <th className="py-3 text-right font-medium">Qty</th>
                     <th className="py-3 text-right font-medium">Price</th>
                     <th className="py-3 text-right font-medium">Amount</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-100">
                   {invoice.items.map((item, idx) => (
                     <tr key={idx}>
                       <td className="py-4 pr-4">{item.description}</td>
                       <td className="py-4 text-right">{item.quantity}</td>
                       <td className="py-4 text-right">₹{item.unit_price}</td>
                       <td className="py-4 text-right font-mono">₹{item.amount}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           ) : (
             <div className="bg-zinc-50 p-4 rounded text-center text-zinc-500 mb-8">No line items (Summary Invoice)</div>
           )}

           <div className="flex justify-end">
             <div className="w-full md:w-64 space-y-2">
               <div className="flex justify-between text-zinc-600">
                 <span>Total Amount</span>
                 <span className="font-mono">₹{invoice.total_amount.toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-zinc-600">
                 <span>Paid Amount</span>
                 <span className="font-mono">₹{invoice.paid_amount.toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-lg font-bold text-primary border-t border-zinc-200 pt-2">
                 <span>Balance Due</span>
                 <span className="font-mono">₹{(invoice.total_amount - invoice.paid_amount).toLocaleString()}</span>
               </div>
             </div>
           </div>
        </div>

        {/* Actions */}
        <div className="bg-zinc-50 p-6 border-t border-zinc-200 flex flex-col md:flex-row gap-4 justify-between items-center">
           <div className="flex flex-wrap gap-2 w-full md:w-auto">
             <button className="flex-1 md:flex-none px-4 py-2 bg-white border border-zinc-300 rounded text-sm font-medium text-zinc-700 hover:bg-zinc-50 flex items-center justify-center gap-2">
               <Download size={16} /> PDF
             </button>
             <button className="flex-1 md:flex-none px-4 py-2 bg-white border border-zinc-300 rounded text-sm font-medium text-zinc-700 hover:bg-zinc-50 flex items-center justify-center gap-2">
               <Send size={16} /> Email
             </button>
             {invoice.status !== 'paid' && invoice.invoice_type === 'sales' && (
               <button 
                 onClick={handleSendWhatsApp}
                 className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 text-white rounded text-sm font-medium hover:bg-emerald-700 flex items-center justify-center gap-2"
               >
                 <MessageSquare size={16} /> WhatsApp Reminder
               </button>
             )}
           </div>
           {invoice.status !== 'paid' && invoice.invoice_type === 'sales' && (
             <button className="w-full md:w-auto px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-hover flex items-center justify-center gap-2">
               <CreditCard size={16} /> Record Payment
             </button>
           )}
        </div>
      </div>
    </div>
  );
};