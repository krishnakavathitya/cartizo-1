'use client';

import { useOrders } from '@/lib/context/orders-context';
import { Package, ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { bg: string; text: string; label: string }> = {
        PENDING: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-600', label: 'Pending' },
        PROCESSING: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-600', label: 'Processing' },
        SHIPPED: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-600', label: 'Shipped' },
        DELIVERED: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-600', label: 'Delivered' },
        CANCELLED: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-600', label: 'Cancelled' },
    };
    const { bg, text, label } = config[status] || config.PENDING;
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${bg} ${text}`}>
            {label}
        </span>
    );
}

export function RecentOrders() {
    const { orders, isLoaded } = useOrders();

    if (!isLoaded) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div className="h-6 bg-gray-100 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-gray-100 rounded w-16 animate-pulse"></div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-gray-50 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    // Take the 5 most recent orders
    const recentOrders = orders.slice(0, 5);

    return (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <Package className="w-5 h-5 text-orange-500" />
                    Recent Orders
                </h2>
                <Link
                    href="/dashboard/orders"
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 uppercase tracking-wider flex items-center gap-1 group"
                >
                    View All
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

            {recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <ShoppingBag className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-slate-900 font-bold mb-1">No orders yet</h3>
                    <p className="text-slate-500 text-sm mb-4">Start shopping to see your orders here.</p>
                    <Link
                        href="/products"
                        className="text-orange-600 font-bold text-sm hover:underline"
                    >
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {recentOrders.map((order) => (
                        <div
                            key={order.id}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md hover:border-orange-100 transition-all duration-300 gap-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm text-slate-400 group-hover:text-orange-500 transition-colors">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{order.orderNumber}</p>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto">
                                <StatusBadge status={order.status} />
                                <span className="text-sm font-black text-slate-900">
                                    ₹{order.total.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
