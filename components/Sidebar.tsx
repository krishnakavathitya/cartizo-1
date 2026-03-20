'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import {
    ShoppingBag,
    MapPin,
    Heart,
    Star,
    Bell,
    LogOut,
    LayoutDashboard,
    User,
    ChevronRight
} from 'lucide-react';

interface SidebarProps {
    onMobileClose?: () => void;
}

export function Sidebar({ onMobileClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.push('/auth/login');
    };

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'My Orders', href: '/dashboard/orders', icon: ShoppingBag },
        { name: 'Addresses', href: '/dashboard/addresses', icon: MapPin },
        { name: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
        { name: 'My Reviews', href: '/dashboard/reviews', icon: Star },
        { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
        { name: 'Profile Settings', href: '/dashboard/profile-settings', icon: User },
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    return (
        <div className="bg-white h-full flex flex-col border-r border-gray-100/80">
            {/* User Profile Card */}
            <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold shadow-lg border-2 border-white/20 flex-shrink-0 bg-orange-500">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Welcome back</p>
                        <h3 className="text-sm font-bold leading-tight truncate">{user?.name || 'Guest User'}</h3>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Navigation - scrollable */}
            <nav className="flex-1 overflow-y-auto py-3 px-3">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onMobileClose}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-150 group ${active
                                ? 'bg-orange-50 text-orange-600'
                                : 'text-slate-600 hover:bg-gray-50 hover:text-slate-900'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon
                                    className={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'text-orange-500' : 'text-slate-400 group-hover:text-slate-600'}`}
                                    strokeWidth={active ? 2.5 : 2}
                                />
                                <span className={`text-sm tracking-wide ${active ? 'font-bold' : 'font-medium'}`}>{item.name}</span>
                            </div>
                            {active && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout - always visible at bottom */}
            <div className="p-3 border-t border-gray-100 flex-shrink-0">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-sm transition-all duration-150 group"
                >
                    <LogOut className="w-[18px] h-[18px] group-hover:-translate-x-0.5 transition-transform flex-shrink-0" />
                    <span>Sign Out</span>
                </button>
                <p className="text-[9px] text-center text-slate-300 mt-3 uppercase tracking-widest font-black">
                    Cartizo v1.0.0
                </p>
            </div>
        </div>
    );
}
