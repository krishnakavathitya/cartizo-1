'use client';

import { OfferBanner } from './components/OfferBanner';
import { StatsCards } from './components/StatsCards';
import { RecentOrders } from './components/RecentOrders';
import { useAuth } from '@/lib/context/auth-context';

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header Section */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-slate-900">
                    Hello, {user?.name || 'Guest'} 👋
                </h1>
                <p className="text-slate-500">Here's what's happening with your account today.</p>
            </div>

            {/* Banner Section */}
            <section>
                <OfferBanner />
            </section>

            {/* Stats Section */}
            <section>
                <h2 className="text-xl font-bold text-slate-800 mb-4 px-1">Overview</h2>
                <StatsCards />
            </section>

            {/* Recent Orders Section */}
            <section>
                <RecentOrders />
            </section>
        </div>
    );
}
