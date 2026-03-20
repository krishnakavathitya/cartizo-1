'use client';

import { useState } from 'react';
import { Package, MapPin, Clock, Search, Filter, ChevronRight, X, ExternalLink, ShoppingBag, Truck, CheckCircle2 } from 'lucide-react';
import { useOrders, LocalOrder } from '@/lib/context/orders-context';
import Link from 'next/link';

// ─── Status Badge ───────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
        PROCESSING: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        SHIPPED: 'bg-blue-50 text-blue-600 border-blue-100',
        DELIVERED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        CANCELLED: 'bg-rose-50 text-rose-600 border-rose-100',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
            {status}
        </span>
    );
}

// ─── Tracking Timeline Icon ──────────────────────────────────────────
function StatusIcon({ status, active }: { status: string; active?: boolean }) {
    switch (status) {
        case 'PENDING': return <Clock className={`w-4 h-4 ${active ? 'text-amber-500' : 'text-slate-300'}`} />;
        case 'PROCESSING': return <Package className={`w-4 h-4 ${active ? 'text-indigo-500' : 'text-slate-300'}`} />;
        case 'SHIPPED': return <Truck className={`w-4 h-4 ${active ? 'text-blue-500' : 'text-slate-300'}`} />;
        case 'DELIVERED': return <CheckCircle2 className={`w-4 h-4 ${active ? 'text-emerald-500' : 'text-slate-300'}`} />;
        case 'CANCELLED': return <X className={`w-4 h-4 ${active ? 'text-rose-500' : 'text-slate-300'}`} />;
        default: return <Package className="w-4 h-4 text-slate-300" />;
    }
}

// ─── Order Details Modal ──────────────────────────────────────────────
function OrderDetailsModal({ order, onClose }: { order: LocalOrder; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
                className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-6 flex items-center justify-between z-10">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Acquisition Analysis</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{order.orderNumber}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">✕</button>
                </div>

                <div className="p-8">
                    <div className="space-y-6">
                        {order.items.map((item) => {
                            const product = item.product;
                            const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];

                            return (
                                <div key={item.id} className="flex gap-6 items-center bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
                                    <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 p-2">
                                        <img
                                            src={primaryImage?.url || '/placeholder.png'}
                                            alt={product.title}
                                            className="w-full h-full object-contain mix-blend-multiply"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-slate-900 text-sm mb-1">{product.title}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-10 p-6 bg-slate-900 rounded-[2rem] text-white">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
                            <span className="font-bold">₹{order.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Allocation</span>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Complimentary</span>
                        </div>
                        <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                            <span className="text-xs font-black uppercase tracking-widest">Total Valuation</span>
                            <span className="text-3xl font-black tracking-tighter text-orange-500">₹{order.total.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Tracking Protocol</p>
                            <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-100">
                                {order.statusHistory?.map((entry, idx) => (
                                    <div key={entry.id} className="relative flex gap-6 pl-2">
                                        <div className={`w-10 h-10 rounded-xl bg-white border ${idx === order.statusHistory.length - 1 ? 'border-orange-500 shadow-lg shadow-orange-100' : 'border-gray-100'} flex items-center justify-center z-10 scale-90`}>
                                            <StatusIcon status={entry.status} active={idx === order.statusHistory.length - 1} />
                                        </div>
                                        <div>
                                            <p className={`text-xs font-black uppercase tracking-widest ${idx === order.statusHistory.length - 1 ? 'text-orange-600' : 'text-slate-900'}`}>{entry.status}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1">{new Date(entry.createdAt).toLocaleString()} • {entry.note || 'No additional logs'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Payment Protocol</p>
                            <div className="bg-gray-50 p-4 rounded-2xl">
                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{order.paymentMethod.replace('_', ' ')}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">Verified Infrastructure</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Target Destination</p>
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-slate-400">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-black text-slate-900 text-sm">{order.shippingAddress.name}</p>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    {order.shippingAddress.street}<br />
                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OrdersPage() {
    const { orders, isLoaded } = useOrders();
    const [selectedOrder, setSelectedOrder] = useState<LocalOrder | null>(null);

    if (!isLoaded) {
        return (
            <div className="space-y-6">
                <div className="h-10 w-64 bg-gray-100 rounded-2xl animate-pulse" />
                {[1, 2].map((i) => (
                    <div key={i} className="h-48 bg-white rounded-3xl border border-gray-50 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">Acquisition Logs</h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Management of your historical transactions</p>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-[3rem] p-20 text-center shadow-sm">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <ShoppingBag className="w-10 h-10 text-slate-200" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4">No Transactions Detected</h2>
                    <p className="text-slate-500 max-w-xs mx-auto mb-10 font-medium">Begin your acquisition journey by exploring our curated collections.</p>
                    <Link href="/products" className="inline-flex bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest px-10 py-5 rounded-2xl hover:bg-orange-600 transition-all">Explore Marketplace</Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="group bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500">
                            <div className="flex flex-col md:flex-row justify-between gap-8 mb-8 pb-8 border-b border-gray-50">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-4">
                                        <span className="text-lg font-black text-slate-900 tracking-tight">{order.orderNumber}</span>
                                        <StatusBadge status={order.status} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Recorded on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="md:text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Valuation</p>
                                    <p className="text-3xl font-black text-slate-900 tracking-tighter">₹{order.total.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex gap-4 items-center">
                                            <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-50 p-1.5">
                                                <img
                                                    src={item.product.images?.[0]?.url || '/placeholder.png'}
                                                    alt={item.product.title}
                                                    className="w-full h-full object-contain mix-blend-multiply"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-900 text-sm truncate">{item.product.title}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.quantity} Unit × ₹{item.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col justify-end items-start md:items-end gap-4">
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                        <Truck className="w-4 h-4 text-orange-500" />
                                        <span>Terminal: {order.shippingAddress.city}, {order.shippingAddress.state}</span>
                                    </div>
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="w-full md:w-auto bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-slate-100 active:scale-95"
                                    >
                                        Analysis Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedOrder && (
                <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}
        </div>
    );
}
