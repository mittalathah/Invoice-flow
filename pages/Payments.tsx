import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { Payment } from '../types';

export const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    mockApi.getPayments().then(setPayments);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">Payment History</h1>
      <div className="bg-white border border-zinc-200 rounded-sm overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">No payments recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[700px]">
              <thead className="bg-zinc-50 border-b border-zinc-200 font-medium text-zinc-500">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Invoice</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Method</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {payments.map(pay => (
                  <tr key={pay.id}>
                    <td className="px-6 py-4">{new Date(pay.payment_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-mono text-primary">{pay.invoice_number}</td>
                    <td className="px-6 py-4">{pay.client_name}</td>
                    <td className="px-6 py-4 capitalize">{pay.payment_method}</td>
                    <td className="px-6 py-4 text-right font-mono font-medium">₹{pay.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};