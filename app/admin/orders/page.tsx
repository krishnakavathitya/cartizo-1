'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Filter } from 'lucide-react';

interface Order {
    id: string;
    orderNumber: string;
    userName: string;
    userEmail: string;
    items: { title: string; quantity: number; price: number }[];
    total: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    SHIPPED: 'bg-blue-100 text-blue-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
};

const STATUSES = ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || []);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    useEffect(() => {
        if (statusFilter === 'ALL') {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter(o => o.status === statusFilter));
        }
    }, [orders, statusFilter]);

    const updateStatus = async (orderId: string, status: string) => {
        setUpdating(orderId);
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                setOrders(o => o.map(x => x.id === orderId ? { ...x, status } : x));
            }
        } finally {
            setUpdating(null);
        }
    };

    const getStatusCount = (status: string) => {
        return orders.filter(o => o.status === status).length;
    };

    return (
        <div className="p-1 lg:p-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Orders</h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        {statusFilter === 'ALL'
                            ? `${orders.length} total orders`
                            : `${filteredOrders.length} ${statusFilter.toLowerCase()} orders`}
                    </p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 flex flex-wrap gap-2">
                <button
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${statusFilter === 'ALL'
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    All Orders ({orders.length})
                </button>
                <button
                    onClick={() => setStatusFilter('PENDING')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${statusFilter === 'PENDING'
                        ? 'bg-yellow-500 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    Pending ({getStatusCount('PENDING')})
                </button>
                <button
                    onClick={() => setStatusFilter('SHIPPED')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${statusFilter === 'SHIPPED'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    Shipped ({getStatusCount('SHIPPED')})
                </button>
                <button
                    onClick={() => setStatusFilter('DELIVERED')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${statusFilter === 'DELIVERED'
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    Delivered ({getStatusCount('DELIVERED')})
                </button>
                <button
                    onClick={() => setStatusFilter('CANCELLED')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${statusFilter === 'CANCELLED'
                        ? 'bg-red-500 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    Cancelled ({getStatusCount('CANCELLED')})
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto" />
                        <p className="mt-4 text-gray-500 text-sm">Loading orders...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-10 text-center">
                        <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">
                            {statusFilter === 'ALL' ? 'No orders yet.' : `No ${statusFilter.toLowerCase()} orders.`}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3 text-left font-bold text-gray-500 uppercase text-xs tracking-wider">Order</th>
                                    <th className="px-5 py-3 text-left font-bold text-gray-500 uppercase text-xs tracking-wider">Customer</th>
                                    <th className="px-5 py-3 text-left font-bold text-gray-500 uppercase text-xs tracking-wider">Items</th>
                                    <th className="px-5 py-3 text-left font-bold text-gray-500 uppercase text-xs tracking-wider">Total</th>
                                    <th className="px-5 py-3 text-left font-bold text-gray-500 uppercase text-xs tracking-wider">Payment</th>
                                    <th className="px-5 py-3 text-left font-bold text-gray-500 uppercase text-xs tracking-wider">Status</th>
                                    <th className="px-5 py-3 text-left font-bold text-gray-500 uppercase text-xs tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="font-bold text-slate-900 text-xs">{order.orderNumber || order.id}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-slate-900">{order.userName}</p>
                                            <p className="text-xs text-slate-400">{order.userEmail}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="space-y-0.5">
                                                {order.items?.slice(0, 2).map((item, i) => (
                                                    <p key={i} className="text-xs text-slate-600 truncate max-w-[160px]">
                                                        {item.title} × {item.quantity}
                                                    </p>
                                                ))}
                                                {order.items?.length > 2 && (
                                                    <p className="text-xs text-slate-400">+{order.items.length - 2} more</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 font-bold text-slate-900">
                                            ₹{order.total?.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                                                {order.paymentMethod || 'COD'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <select
                                                value={order.status}
                                                disabled={updating === order.id}
                                                onChange={e => updateStatus(order.id, e.target.value)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-200 ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}
                                            >
                                                {STATUSES.map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-400">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
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
