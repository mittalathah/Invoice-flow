import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { Client } from '../types';
import { Search, Plus, MoreHorizontal, Phone, Mail, MessageSquare, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    mockApi.getClients().then(setClients);
  }, []);

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendWhatsApp = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const promise = mockApi.sendWhatsAppReminder(id, 'client');
    toast.promise(promise, {
      loading: 'Connecting to WhatsApp API...',
      success: (data) => data.message,
      error: 'Failed to send WhatsApp reminder',
    });
  };

  const handleCardClick = (id: string) => {
    navigate(`/clients/${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-heading">Clients</h1>
        <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
          <Plus size={16} /> Add Client
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input 
          type="text"
          placeholder="Search clients..."
          className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-md focus:outline-none focus:border-primary"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(client => (
          <div 
            key={client.id} 
            onClick={() => handleCardClick(client.id)}
            className="bg-white border border-zinc-200 rounded-sm p-6 hover:border-primary/50 transition-all flex flex-col cursor-pointer hover:shadow-md group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {client.name.charAt(0)}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); }}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <MoreHorizontal size={20} />
              </button>
            </div>
            
            <h3 className="font-bold text-lg mb-1 flex items-center justify-between">
              {client.name}
              <ChevronRight size={16} className="text-zinc-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </h3>
            <div className="space-y-2 mb-6 flex-1">
               <div className="flex items-center gap-2 text-sm text-zinc-500">
                 <Mail size={14} /> {client.email}
               </div>
               <div className="flex items-center gap-2 text-sm text-zinc-500">
                 <Phone size={14} /> {client.phone}
               </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Total Due</span>
                <span className={`font-mono font-bold ${client.total_due > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ₹{client.total_due.toLocaleString()}
                </span>
              </div>
              {client.total_due > 0 && (
                <button 
                  onClick={(e) => handleSendWhatsApp(e, client.id)}
                  className="bg-emerald-50 text-emerald-600 p-2 rounded hover:bg-emerald-100 transition-colors flex items-center gap-2 text-xs font-semibold"
                  title="Send WhatsApp Reminder"
                >
                  <MessageSquare size={14} /> 
                  <span className="hidden sm:inline">Remind</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};