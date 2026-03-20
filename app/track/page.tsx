'use client';

import { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { TRACK_ORDER } from '@/app/(user)/dashboard/graphql/queries';
import {
  Package,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Loader2,
  Copy,
  Check,
  ChevronRight,
  Calendar,
  CreditCard,
  MapPin,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

const STATUS_STEPS = ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [trackOrder, { data, loading, error, called }] = useLazyQuery(TRACK_ORDER, {
    fetchPolicy: 'network-only'
  });
  const [copied, setCopied] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      trackOrder({ variables: { orderNumber: orderNumber.trim() } });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const order = data?.trackOrder;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING': return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Pending' };
      case 'SHIPPED': return { icon: Truck, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Shipped' };
      case 'DELIVERED': return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', label: 'Delivered' };
      case 'CANCELLED': return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Cancelled' };
      default: return { icon: Package, color: 'text-slate-500', bg: 'bg-slate-50', label: status };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const currentStatusIdx = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">

        {/* Search Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Track Your Order</h1>
          <p className="text-slate-500 text-sm font-medium">Enter your order number to see live status updates</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <form onSubmit={handleTrack} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Order Number (e.g. ORD-1740902262507)"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Track Now'}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 font-bold text-sm animate-pulse tracking-wide uppercase">Searching database...</p>
          </div>
        )}

        {error && called && (
          <div className="bg-white border border-red-100 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Order Not Found</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-xs mx-auto">We couldn't find an order with that number. Please check the ID and try again.</p>
            <button
              onClick={() => setOrderNumber('')}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 underline"
            >
              Clear and search again
            </button>
          </div>
        )}

        {data && order && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Order Identity Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden relative">
              <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order Identifier</p>
                    <button
                      onClick={() => copyToClipboard(order.orderNumber)}
                      className="text-blue-600 hover:bg-blue-50 p-1 rounded-md transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <h2 className="text-xl font-black text-slate-900">{order.orderNumber}</h2>
                </div>
                <div className="flex gap-6 text-sm font-bold text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-300" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-300" />
                    <span>{order.paymentMethod || 'COD'}</span>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${getStatusInfo(order.status).bg} ${getStatusInfo(order.status).color} border border-current opacity-70`}>
                  {order.status}
                </div>
              </div>
            </div>

            {/* Horizontal Stepper Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="relative mb-12">
                {/* Track Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2" />
                <div
                  className="absolute top-1/2 left-0 h-0.5 bg-green-500 -translate-y-1/2 transition-all duration-1000"
                  style={{ width: `${(currentStatusIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
                />

                {/* Steps */}
                <div className="relative flex justify-between">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCurrent = order.status === step;
                    const isPast = STATUS_STEPS.indexOf(order.status) > idx;
                    const StepIcon = getStatusInfo(step).icon;

                    return (
                      <div key={step} className="flex flex-col items-center">
                        <div className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white transition-all duration-500 ${isCurrent ? 'border-blue-500 ring-4 ring-blue-50 scale-110 z-10' : isPast ? 'border-green-500 bg-green-50' : 'border-slate-100 text-slate-300'
                          }`}>
                          <StepIcon className={`w-5 h-5 ${isCurrent ? 'text-blue-500' : isPast ? 'text-green-500' : 'text-slate-200'}`} />
                          {isCurrent && (
                            <div className="absolute -inset-1 border-2 border-blue-500 rounded-full animate-ping opacity-20" />
                          )}
                        </div>
                        <div className="absolute mt-12 text-center pointer-events-none">
                          <p className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${isCurrent ? 'text-blue-600' : isPast ? 'text-green-600' : 'text-slate-300'}`}>
                            {step}
                          </p>
                          {isCurrent && <p className="text-[9px] text-blue-400 font-bold mt-1">LATEST STATUS</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-6">

              {/* Manifest (Items) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-400" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Items Manifest</h3>
                </div>
                <div className="p-6 divide-y divide-slate-100 flex-1">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 text-xs font-black text-slate-500">
                          {item.quantity}x
                        </div>
                        <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.product.title || item.title}</p>
                      </div>
                      <p className="text-sm font-black text-slate-900">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Valuation</span>
                    <span className="text-xl font-black text-slate-900">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Link */}
            <div className="flex justify-center pt-8">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Secure Return to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
