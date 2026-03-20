'use client';

import { useAuth } from '@/lib/context/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, MapPin, Heart, Star, Bell, LogOut } from 'lucide-react';

export function UserSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!user) return null;

  const menuItems = [
    { icon: ShoppingBag, label: 'My Orders', href: '/profile/orders' },
    { icon: MapPin, label: 'Addresses', href: '/account/addresses' },
    { icon: Heart, label: 'Wishlist', href: '/wishlist' },
    { icon: Star, label: 'My Reviews', href: '/account/reviews' },
    { icon: Bell, label: 'Notifications', href: '/account/notifications' },
  ];

  return (
    <div className="space-y-4">
      {/* User Info Card */}
      <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold bg-orange-500">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm text-gray-400">HELLO,</p>
            <p className="font-bold">{user.name}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="bg-white rounded-2xl overflow-hidden shadow-md">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href);

          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-4 transition border-b last:border-b-0 ${isActive
                ? 'bg-gray-900 text-white font-semibold'
                : 'hover:bg-gray-50 text-gray-700'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </a>
          );
        })}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-6 py-4 hover:bg-red-50 transition text-red-600"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-semibold">Logout</span>
        </button>
      </nav>
    </div>
  );
}
