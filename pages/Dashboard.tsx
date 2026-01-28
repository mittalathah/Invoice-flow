import React, { useEffect, useState } from 'react';
import { mockApi } from '../services/mockApi';
import { DashboardStats } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { TrendingUp, ShoppingBag, AlertCircle, Clock, Users, IndianRupee } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass, subtext }: any) => (
  <div className="bg-white p-6 rounded-sm border border-zinc-200">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-zinc-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold font-mono tracking-tight text-zinc-900">{value}</h3>
      </div>
      <div className={`p-2 rounded-md ${colorClass} bg-opacity-10`}>
        <Icon size={20} className={colorClass.replace('bg-', 'text-')} />
      </div>
    </div>
    {subtext && <p className="text-xs text-zinc-400 mt-2">{subtext}</p>}
  </div>
);

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await mockApi.getDashboardStats();
      setStats(data);
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-zinc-500">Loading dashboard...</div>;
  if (!stats) return null;

  // Mock data for charts
  const chartData = [
    { name: 'Mon', sales: 4000, purchase: 2400 },
    { name: 'Tue', sales: 3000, purchase: 1398 },
    { name: 'Wed', sales: 2000, purchase: 9800 },
    { name: 'Thu', sales: 2780, purchase: 3908 },
    { name: 'Fri', sales: 1890, purchase: 4800 },
    { name: 'Sat', sales: 2390, purchase: 3800 },
    { name: 'Sun', sales: 3490, purchase: 4300 },
  ];

  const formatCurrency = (val: number) => `₹${val.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Sales" 
          value={formatCurrency(stats.total_sales)} 
          icon={TrendingUp} 
          colorClass="text-blue-600 bg-blue-600"
          subtext="+12% from last month"
        />
        <StatCard 
          title="Total Purchases" 
          value={formatCurrency(stats.total_purchases)} 
          icon={ShoppingBag} 
          colorClass="text-purple-600 bg-purple-600" 
        />
        <StatCard 
          title="Total Due" 
          value={formatCurrency(stats.total_due)} 
          icon={IndianRupee} 
          colorClass="text-orange-600 bg-orange-600" 
          subtext="Pending collection"
        />
        <StatCard 
          title="Overdue Invoices" 
          value={stats.overdue_invoices} 
          icon={AlertCircle} 
          colorClass="text-red-600 bg-red-600"
          subtext="Requires immediate attention"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-sm border border-zinc-200">
          <h3 className="text-lg font-bold font-heading mb-6">Revenue Overview</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0033CC" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0033CC" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717A', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717A', fontSize: 12}} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E4E4E7', borderRadius: '4px' }}
                  formatter={(val: number) => [`₹${val}`, '']}
                />
                <Area type="monotone" dataKey="sales" stroke="#0033CC" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-sm border border-zinc-200">
          <h3 className="text-lg font-bold font-heading mb-6">Quick Actions</h3>
          <div className="space-y-3">
             <button className="w-full flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-md hover:border-primary transition-colors group">
               <span className="font-medium text-zinc-700 group-hover:text-primary">Create Invoice</span>
               <span className="bg-white p-1 rounded border border-zinc-200 text-zinc-400 group-hover:text-primary">+</span>
             </button>
             <button className="w-full flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-md hover:border-primary transition-colors group">
               <span className="font-medium text-zinc-700 group-hover:text-primary">Add Payment</span>
               <span className="bg-white p-1 rounded border border-zinc-200 text-zinc-400 group-hover:text-primary">₹</span>
             </button>
             <button className="w-full flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-md hover:border-primary transition-colors group">
               <span className="font-medium text-zinc-700 group-hover:text-primary">New Client</span>
               <span className="bg-white p-1 rounded border border-zinc-200 text-zinc-400 group-hover:text-primary">
                 <Users size={16} />
               </span>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};