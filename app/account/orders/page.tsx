'use client';

import { useState } from 'react';
import { Package, Truck, CheckCircle, XCircle, ArrowUpRight, Search, Eye } from 'lucide-react';
import Link from 'next/link';
import { useOrders } from '@/lib/context/orders-context';
import OrderTrackingModal from '@/components/OrderTrackingModal';

export default function OrdersPage() {
  const { orders, loading } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTrackOrder = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return { color: 'text-emerald-500', bg: 'bg-emerald-50', icon: CheckCircle, label: 'Successfully Delivered' };
      case 'SHIPPED':
        return { color: 'text-indigo-500', bg: 'bg-indigo-50', icon: Truck, label: 'Currently in Transit' };
      case 'PROCESSING':
        return { color: 'text-amber-500', bg: 'bg-amber-50', icon: Package, label: 'Internal Processing' };
      case 'CANCELLED':
        return { color: 'text-rose-500', bg: 'bg-rose-50', icon: XCircle, label: 'Request Terminated' };
      default:
        return { color: 'text-orange-500', bg: 'bg-orange-50', icon: Package, label: 'Pending Verification' };
    }
  };

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.items.some(item => item.product.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-display font-black text-slate-900 tracking-tight leading-none mb-4">Acquisition History</h1>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Temporal record of all verified orders
          </p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Search Manifests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 pr-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none font-medium text-xs uppercase tracking-widest w-64"
          />
        </div>
      </div>

      <div className="space-y-6">
        {filteredOrders.map((order) => {
          const config = getStatusConfig(order.status);
          return (
            <div key={order.id} className="group bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-100/30 transition-all duration-500">
              {/* Order Header */}
              <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-50 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Manifest ID</p>
                    <p className="font-display font-black text-slate-900">{order.orderNumber}</p>
                  </div>
                  <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Logged Date</p>
                    <p className="font-bold text-slate-700">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Valuation</p>
                    <p className="font-black text-indigo-600">₹{order.total.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl ${config.bg} ${config.color} border border-current/10 shadow-sm`}>
                    <config.icon className="w-4 h-4" strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{config.label}</span>
                  </div>
                  <button
                    onClick={() => handleTrackOrder(order)}
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Analysis Report
                  </button>
                </div>
              </div>

              {/* Items */}
              <div className="p-8 space-y-6">
                {order.items.map((item) => {
                  const primaryImage = item.product.images?.find(img => img.isPrimary) || item.product.images?.[0];
                  return (
                    <div key={item.id} className="flex flex-col sm:flex-row items-center gap-8">
                      <div className="w-24 h-24 bg-gray-50 rounded-[1.8rem] flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-500">
                        <img 
                          src={primaryImage?.url || '/placeholder-product.png'} 
                          alt={item.product.title} 
                          className="w-full h-full object-cover mix-blend-multiply" 
                        />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">Series Acquisition</p>
                        <h3 className="text-xl font-display font-black text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">{item.product.title}</h3>
                        <div className="flex items-center justify-center sm:justify-start gap-3">
                          <span className="text-xs font-bold text-slate-600 bg-gray-100 px-3 py-1 rounded-lg">Unit Clear: ₹{item.price.toLocaleString()}</span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Quantity: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-xl shadow-slate-200"
                        >
                          Reorder
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                        <button className="px-6 py-3 border border-gray-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all">Support</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Tracking Modal */}
      <OrderTrackingModal 
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {filteredOrders.length === 0 && !loading && (
        <div className="text-center py-24 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <Package className="w-10 h-10 text-slate-200" strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-display font-black text-slate-900 mb-2">No Acquisitions Found</h3>
          <p className="text-slate-500 max-w-xs mx-auto mb-10 font-medium">Your temporal log of transactions is currently empty or has reached TTL expiration.</p>
          <Link
            href="/products"
            className="inline-flex bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-slate-200"
          >
            Initialize Collection
          </Link>
        </div>
      )}
    </div>
  );
}
