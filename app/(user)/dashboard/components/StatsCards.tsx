'use client';

import { useUserStats } from '../graphql/hooks';
import { useWishlist } from '@/lib/context/wishlist-context';
import { useOrders } from '@/lib/context/orders-context';
import { ShoppingBag, Star, Heart } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: number;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    loading?: boolean;
}

function StatCard({ label, value, icon: Icon, color, bgColor, loading }: StatCardProps) {
    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 animate-pulse h-32">
                <div className="flex items-center gap-4 h-full">
                    <div className="w-12 h-12 bg-gray-100 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-8 bg-gray-100 rounded w-16"></div>
                        <div className="h-4 bg-gray-100 rounded w-24"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${color}`} strokeWidth={2} />
                </div>
                <div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{label}</p>
                </div>
            </div>
        </div>
    );
}

export function StatsCards() {
    const { stats, loading } = useUserStats();
    const { totalItems: wishlistCount, isLoaded: wishlistLoaded } = useWishlist();
    const { totalOrders, isLoaded: ordersLoaded } = useOrders();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
                label="Total Orders"
                value={totalOrders}
                icon={ShoppingBag}
                color="text-blue-600"
                bgColor="bg-blue-50"
                loading={!ordersLoaded}
            />
            <StatCard
                label="Reviews Given"
                value={stats.totalReviews}
                icon={Star}
                color="text-amber-500"
                bgColor="bg-amber-50"
                loading={loading}
            />
            <StatCard
                label="Wishlist Items"
                value={wishlistCount}
                icon={Heart}
                color="text-rose-500"
                bgColor="bg-rose-50"
                loading={!wishlistLoaded}
            />
        </div>
    );
}

