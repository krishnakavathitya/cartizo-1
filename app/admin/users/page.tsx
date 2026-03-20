'use client';

import { useEffect, useState } from 'react';
import { Trash2, Shield, User } from 'lucide-react';
import { useAuth } from '@/lib/context/auth-context';

interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function AdminUsers() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/users')
            .then(r => r.json())
            .then(d => setUsers(d.users || []))
            .finally(() => setLoading(false));
    }, []);

    const deleteUser = async (id: number) => {
        if (!confirm('Delete this user? This cannot be undone.')) return;
        const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        if (res.ok) setUsers(u => u.filter(x => x.id !== id));
        else {
            const data = await res.json();
            alert(data.error || 'Failed to delete');
        }
    };

    const toggleRole = async (user: AdminUser) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        if (!confirm(`Change ${user.name}'s role to "${newRole}"?`)) return;
        const res = await fetch(`/api/admin/users/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole }),
        });
        if (res.ok) {
            setUsers(u => u.map(x => x.id === user.id ? { ...x, role: newRole } : x));
        }
    };

    const admins = users.filter(u => u.role === 'admin').length;
    const regular = users.filter(u => u.role !== 'admin').length;

    return (
        <div className="p-1 lg:p-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Users</h1>
                    <p className="text-slate-500 mt-1 text-sm">{users.length} registered • {admins} admins • {regular} users</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto" />
                        <p className="mt-4 text-gray-500 text-sm">Loading users...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3 text-left font-bold text-gray-500 uppercase text-xs tracking-wider">User</th>
                                    <th className="px-5 py-3 text-left font-bold text-gray-500 uppercase text-xs tracking-wider">Role</th>
                                    <th className="px-5 py-3 text-left font-bold text-gray-500 uppercase text-xs tracking-wider">Joined</th>
                                    <th className="px-5 py-3 text-right font-bold text-gray-500 uppercase text-xs tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{user.name}</p>
                                                    <p className="text-xs text-slate-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${user.role === 'admin'
                                                ? 'bg-orange-100 text-orange-700'
                                                : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-400">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {user.id !== currentUser?.id && (
                                                    <>
                                                        <button
                                                            onClick={() => toggleRole(user)}
                                                            className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-50 transition text-slate-600"
                                                            title="Toggle role"
                                                        >
                                                            {user.role === 'admin' ? '→ User' : '→ Admin'}
                                                        </button>
                                                        <button
                                                            onClick={() => deleteUser(user.id)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {user.id === currentUser?.id && (
                                                    <span className="text-xs text-slate-400 italic">You</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
