'use client';

import { useOrders } from '../graphql/hooks';
import { Bell, Package, Tag, Info } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
    const { orders, loading } = useOrders();

    // Derive notifications from real order data
    const notifications = [
        // Welcome Notification (Always present)
        {
            id: 'welcome',
            title: 'Welcome to Cartizo Premium!',
            message: 'Complete your profile to get personalized recommendations.',
            date: new Date(), // Today
            type: 'info',
            icon: Info,
            color: 'bg-blue-50 text-blue-600',
            link: '/profile'
        },
        // Generate notifications from recent orders
        ...orders.slice(0, 5).map((order: any) => ({
            id: `order-${order.id}`,
            title: `Order #${order.id.slice(-6).toUpperCase()} Placed Successfully`,
            message: `Your order of $${order.total.toFixed(2)} has been confirmed and is being processed.`,
            date: new Date(Number(order.createdAt)),
            type: 'order',
            icon: Package,
            color: 'bg-green-50 text-green-600',
            link: '/dashboard/orders'
        })),
        // Example Promo (Static for now, but feels real)
        {
            id: 'promo-1',
            title: 'Member Exclusive: 20% Off',
            message: 'Use code CARTIZO20 at checkout for your next purchase.',
            date: new Date(Date.now() - 86400000 * 2), // 2 days ago
            type: 'promo',
            icon: Tag,
            color: 'bg-orange-50 text-orange-600',
            link: '/products'
        }
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    if (loading) return <div className="p-8 text-center animate-pulse">Loading notifications...</div>;

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                <p className="text-slate-500 text-sm">Stay updated with your orders and exclusive offers</p>
            </div>

            <div className="space-y-4">
                {notifications.map((notification) => {
                    const Icon = notification.icon;
                    return (
                        <div key={notification.id} className="bg-white border border-gray-100 rounded-3xl p-5 hover:shadow-md transition-all duration-300 flex gap-4 group">
                            <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${notification.color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{notification.title}</h3>
                                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap ml-2">
                                        {notification.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-slate-500 text-sm mt-1 leading-relaxed">{notification.message}</p>
                                {notification.link && (
                                    <Link href={notification.link} className="inline-block mt-3 text-xs font-bold text-slate-900 border-b border-slate-200 hover:text-orange-600 hover:border-orange-600 transition-all uppercase tracking-wider">
                                        View Details
                                    </Link>
                                )}
                            </div>
                        </div>
                    );
                })}
                {notifications.length === 0 && (
                    <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No new notifications.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
