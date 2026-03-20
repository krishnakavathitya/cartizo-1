'use client';

import { useAuth } from '@/lib/context/auth-context';
import { useEffect, useState } from 'react';
import { Package, Star, Heart, ArrowUpRight, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ orders: 0, reviews: 0, wishlist: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const [ordersRes, reviewsRes, wishlistRes] = await Promise.all([
        fetch('/api/orders', { credentials: 'include' }),
        fetch('/api/reviews', { credentials: 'include' }),
        fetch('/api/wishlist', { credentials: 'include' }),
      ]);

      const ordersData = await ordersRes.json();
      const reviewsData = await reviewsRes.json();
      const wishlistData = await wishlistRes.json();

      setStats({
        orders: ordersData.total || 0,
        reviews: reviewsData.total || 0,
        wishlist: wishlistData.total || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Prime Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-display font-black text-slate-900 tracking-tight leading-none mb-4">Command Center</h1>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Intelligence & Status Overview
          </p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl border border-emerald-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Account Authenticated</span>
        </div>
      </div>

      {/* Hero Analytics Banner */}
      <div className="relative group overflow-hidden bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl shadow-slate-200">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-24 -mb-24 transition-transform duration-700 group-hover:scale-110"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-6">
              <Zap className="w-4 h-4 text-indigo-400 fill-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">Active Member Status</span>
            </div>
            <h2 className="text-4xl font-display font-black mb-4 leading-tight">Elite Access Protocol <br /><span className="text-indigo-400">Established</span></h2>
            <p className="text-slate-400 font-medium mb-8 leading-relaxed italic opacity-80">"Your engagement metrics indicate a high level of brand affinity. Continue your journey to unlock further acquisition tier benefits."</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 hover:scale-105 transition-all duration-300"
            >
              Launch Acquisition Mode
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Visual Stat Component */}
          <div className="hidden md:block w-px h-64 bg-white/10"></div>

          <div className="shrink-0 text-center md:text-right">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">Member Since</p>
            <p className="text-xl font-black text-white px-2 py-1 rounded bg-white/5 inline-block">JAN 2024</p>
            <div className="mt-8 flex items-center justify-center md:justify-end gap-2 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-bold tracking-tight">VIP Tier Progress: 78%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Acquisitions', value: stats.orders, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/account/orders' },
          { label: 'Feedback Provided', value: stats.reviews, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', link: '/account/reviews' },
          { label: 'Saved Masterpieces', value: stats.wishlist, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50', link: '/account/wishlist' },
        ].map((stat) => (
          <Link key={stat.label} href={stat.link} className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-8 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-100/30 transition-all duration-500 overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full blur-3xl -mr-16 -mt-16 opacity-40 group-hover:opacity-100 transition-opacity duration-500`}></div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm shadow-black/5`}>
                <stat.icon className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <p className="text-5xl font-black text-slate-900 tracking-tighter mb-2">
                {loadingStats ? '...' : stat.value}
              </p>
              <div className="flex flex-col">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Metrics</p>
                <p className="text-sm font-bold text-slate-900 tracking-tight">{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Chronology */}
      <div className="bg-white border border-gray-100 rounded-[3rem] p-10">
        <div className="flex items-center justify-between mb-10 border-b border-gray-50 pb-6">
          <div>
            <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight leading-none mb-1">Recent Manifests</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temporal transaction history</p>
          </div>
          <Link href="/account/orders" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-500 transition-colors border-2 border-indigo-50 px-6 py-2 rounded-xl">
            Explore History
          </Link>
        </div>

        <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
          <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Package className="w-10 h-10 text-slate-200" strokeWidth={1.5} />
            <div className="absolute top-0 right-0 w-6 h-6 bg-indigo-500 rounded-full animate-pulse border-4 border-white"></div>
          </div>
          <h3 className="text-2xl font-display font-black text-slate-900 mb-2">Pristine State Detected</h3>
          <p className="text-slate-500 max-w-xs mx-auto mb-8 font-medium">No temporal transaction logs found in the current buffer. Initiate your first acquisition protocol.</p>
          <Link
            href="/products"
            className="inline-flex bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-slate-200"
          >
            Launch Gallery
          </Link>
        </div>
      </div>
    </div>
  );
}
