'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useRouter } from 'next/navigation';
import { DealsBanner } from '@/components/DealsBanner';
import { StatsCard } from '@/components/StatsCard';
import { OrderCard } from '@/components/OrderCard';
import { ShoppingBag, Star, Heart } from 'lucide-react';

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ orders: 0, reviews: 0, wishlist: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
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

      setRecentOrders(ordersData.orders?.slice(0, 5) || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Deals Banner */}
      <DealsBanner />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          icon={ShoppingBag}
          count={stats.orders}
          label="Total Orders"
          bgColor="bg-blue-50"
          iconColor="bg-blue-500"
          textColor="text-blue-600"
        />
        <StatsCard
          icon={Star}
          count={stats.reviews}
          label="Reviews Given"
          bgColor="bg-green-50"
          iconColor="bg-green-500"
          textColor="text-green-600"
        />
        <StatsCard
          icon={Heart}
          count={stats.wishlist}
          label="Wishlist Items"
          bgColor="bg-purple-50"
          iconColor="bg-purple-500"
          textColor="text-purple-600"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Orders</h2>
          <a
            href="/profile/orders/all"
            className="text-orange-500 font-semibold hover:underline"
          >
            View All
          </a>
        </div>

        {loadingData ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
            <a
              href="/products"
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition font-semibold"
            >
              Browse Products
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order: any) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
