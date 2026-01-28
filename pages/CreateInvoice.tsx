import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockApi } from '../services/mockApi';
import { Client, LineItem } from '../types';
import { Plus, Trash, Save } from 'lucide-react';
import { useAuth } from '../App';
import { toast } from 'sonner';

export const CreateInvoice = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [items, setItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unit_price: 0, amount: 0 }
  ]);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    mockApi.getClients().then(setClients);
  }, []);

  const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    item.amount = item.quantity * item.unit_price;
    newItems[index] = item;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => items.reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return toast.error('Please select a client');

    const client = clients.find(c => c.id === selectedClient);
    const total = calculateTotal();

    try {
      await mockApi.createInvoice({
        invoice_number: `SI${Math.floor(Math.random() * 10000)}`,
        invoice_type: 'sales',
        client_id: selectedClient,
        client_name: client?.name,
        issue_date: issueDate,
        due_date: dueDate,
        items,
        subtotal: total,
        tax_rate: 0,
        tax_amount: 0,
        total_amount: total,
        uploaded_by: user?.id || ''
      }, user?.role || 'accountant');

      toast.success('Invoice created successfully');
      navigate('/invoices/sales');
    } catch (err) {
      toast.error('Failed to create invoice');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold font-heading">New Sales Invoice</h1>
         <button 
           type="button" 
           onClick={() => navigate(-1)} 
           className="text-sm text-zinc-500 hover:text-zinc-800"
         >
           Cancel
         </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-sm p-4 md:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Client</label>
              <select 
                className="w-full border border-zinc-300 rounded-md p-2 bg-white"
                value={selectedClient}
                onChange={e => setSelectedClient(e.target.value)}
                required
              >
                <option value="">Select a client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Issue Date</label>
              <input 
                type="date" 
                className="w-full border border-zinc-300 rounded-md p-2"
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Due Date</label>
              <input 
                type="date" 
                className="w-full border border-zinc-300 rounded-md p-2"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-zinc-800 mb-4 border-b border-zinc-100 pb-2">Line Items</h3>
          <div className="space-y-6 md:space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 md:items-end border-b border-zinc-100 pb-4 md:border-0 md:pb-0">
                <div className="flex-1">
                  <label className="block text-xs text-zinc-500 mb-1">Description</label>
                  <input 
                    type="text" 
                    className="w-full border border-zinc-300 rounded-md p-2 text-sm"
                    value={item.description}
                    onChange={e => handleItemChange(index, 'description', e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <div className="w-24 md:w-20">
                    <label className="block text-xs text-zinc-500 mb-1">Qty</label>
                    <input 
                      type="number" 
                      className="w-full border border-zinc-300 rounded-md p-2 text-sm text-right"
                      value={item.quantity}
                      onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div className="flex-1 md:w-32">
                    <label className="block text-xs text-zinc-500 mb-1">Price</label>
                    <input 
                      type="number" 
                      className="w-full border border-zinc-300 rounded-md p-2 text-sm text-right"
                      value={item.unit_price}
                      onChange={e => handleItemChange(index, 'unit_price', Number(e.target.value))}
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center md:block md:w-32 md:text-right md:pb-2">
                  <span className="text-sm font-medium text-zinc-500 md:hidden">Amount:</span>
                  <span className="font-mono font-medium text-zinc-700">₹{item.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-end md:block">
                  <button 
                    type="button" 
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-400 hover:text-red-600 mb-0.5"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button 
            type="button"
            onClick={addItem}
            className="mt-4 text-sm text-primary font-medium flex items-center gap-1 hover:underline"
          >
            <Plus size={16} /> Add Line Item
          </button>
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-100">
          <div className="w-full md:w-64 space-y-2">
            <div className="flex justify-between text-sm text-zinc-600">
              <span>Subtotal</span>
              <span>₹{calculateTotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-zinc-900 border-t border-zinc-200 pt-2">
              <span>Total</span>
              <span>₹{calculateTotal().toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <button 
            type="submit" 
            className="w-full md:w-auto bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-md font-medium flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Save Invoice
          </button>
        </div>
      </form>
    </div>
  );
};