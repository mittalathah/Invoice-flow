import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { User } from '../types';
import { ShieldCheck, User as UserIcon } from 'lucide-react';

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    mockApi.getUsers().then(setUsers);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">User Management</h1>
      <div className="bg-white border border-zinc-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Permissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {users.map(u => (
                <tr key={u.id}>
                  <td className="px-6 py-4">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-zinc-500 text-xs">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 capitalize">
                     <div className="flex items-center gap-2">
                       {u.role === 'owner' ? <ShieldCheck size={14} className="text-blue-600" /> : <UserIcon size={14} />}
                       {u.role}
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${u.is_approved ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {u.is_approved ? 'Active' : 'Pending Approval'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500 max-w-xs truncate">
                    {u.permissions ? Object.keys(u.permissions).filter(k => u.permissions[k]).length + ' active permissions' : '-'}
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