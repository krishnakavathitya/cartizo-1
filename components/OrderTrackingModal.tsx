'use client';

import { X, MapPin, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { LocalOrder } from '@/lib/context/orders-context';

interface OrderTrackingModalProps {
  order: LocalOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderTrackingModal({ order, isOpen, onClose }: OrderTrackingModalProps) {
  if (!isOpen || !order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'text-emerald-500';
      case 'SHIPPED':
        return 'text-indigo-500';
      case 'PROCESSING':
        return 'text-amber-500';
      case 'CANCELLED':
        return 'text-rose-500';
      default:
        return 'text-orange-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'Delivered';
      case 'SHIPPED':
        return 'Shipped';
      case 'PROCESSING':
        return 'Processing';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-8 py-6 rounded-t-[3rem] flex items-center justify-between z-10">
          <div>
            <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight">Acquisition Analysis</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Order Items */}
          <div className="space-y-4">
            {order.items.map((item) => {
              const primaryImage = item.product.images?.find(img => img.isPrimary) || item.product.images?.[0];
              return (
                <div key={item.id} className="flex items-center gap-6 bg-slate-50 rounded-[2rem] p-6">
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={primaryImage?.url || '/placeholder-product.png'}
                      alt={item.product.title}
                      className="w-full h-full object-cover mix-blend-multiply"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-slate-900 mb-1">{item.product.title}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-600">QTY: {item.quantity} x ₹{item.price.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Price Summary */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Subtotal</span>
              <span className="text-xl font-black">₹{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Protocol Allocation</span>
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Complimentary</span>
            </div>
            <div className="border-t border-white/10 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-orange-400 uppercase tracking-widest">Total Valuation</span>
                <span className="text-3xl font-black text-orange-500">₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Tracking Protocol */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Tracking Protocol</h3>
              <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Payment Protocol</span>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-[2rem] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-sm font-black uppercase tracking-tight ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { 
                        month: 'numeric', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                      })} • Order initiated via decentralized gateway
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-[2rem] p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight text-slate-900">
                      {order.paymentMethod}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                      Verified Infrastructure
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Target Destination */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Target Destination</h3>
            <div className="bg-slate-50 rounded-[2rem] p-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="font-black text-slate-900 mb-1">{order.shippingAddress.name}</p>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">
                    {order.shippingAddress.street},<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}<br />
                    {order.shippingAddress.country}
                  </p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-2">
                    {order.shippingAddress.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Status Timeline</h3>
              <div className="space-y-3">
                {order.statusHistory.map((history, index) => (
                  <div key={history.id} className="flex items-start gap-4 bg-slate-50 rounded-2xl p-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      index === 0 ? 'bg-orange-500 text-white' : 'bg-white border border-slate-200 text-slate-400'
                    }`}>
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                        {getStatusLabel(history.status)}
                      </p>
                      <p className="text-xs font-medium text-slate-500 mt-1">
                        {new Date(history.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true
                        })}
                      </p>
                      {history.note && (
                        <p className="text-xs font-medium text-slate-400 mt-1">{history.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
