'use client';

import { useAuth } from '@/lib/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/AdminHeader';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Star,
    Tag,
    Settings,
    LogOut,
    ChevronRight,
    Menu,
    X,
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Reviews', href: '/admin/reviews', icon: Star },
    { label: 'Categories', href: '/admin/categories', icon: Tag },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && (!user || user.role?.toLowerCase() !== 'admin')) {
            router.push('/');
        }
    }, [user, loading, router]);

    // Close sidebar on navigation (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto" />
                    <p className="mt-4 text-gray-600 font-medium">Loading admin panel...</p>
                </div>
            </div>
        );
    }

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50/50">
            {/* Top Header - Full Width */}
            <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

            <div className="flex flex-1 overflow-hidden relative">
                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                        style={{ marginTop: '0' }} // Ensure it covers the area below header
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col z-50 border-r border-slate-800 transition-transform duration-300 lg:static lg:h-full lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    {/* Premium Admin Profile Section */}
                    <div className="px-5 py-7 border-b border-slate-800/60 bg-slate-900 group flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="relative group/avatar flex-shrink-0">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-lg font-black shadow-xl shadow-orange-950/40 relative z-10 group-hover/avatar:scale-105 transition-transform duration-300">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute -inset-1 bg-orange-500/20 rounded-2xl blur-md opacity-0 group-hover/avatar:opacity-100 transition-opacity"></div>
                            </div>

                            <div className="min-w-0 flex flex-col justify-center">
                                <p className="text-sm font-black text-white tracking-tight leading-none truncate">{user.name}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.15em] bg-orange-500/10 px-2 py-0.5 rounded-md ring-1 ring-orange-500/30">
                                        Admin
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Live</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden ml-auto p-2 bg-slate-800/50 hover:bg-slate-700 rounded-xl text-slate-400 transition-all border border-slate-700/50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto scrollbar-hide">
                        <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Main Menu</p>
                        {navItems.map(({ label, href, icon: Icon }) => {
                            const isActive = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/30 font-bold'
                                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <Icon
                                            className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}
                                            strokeWidth={isActive ? 2.5 : 2}
                                        />
                                        <span className="text-sm">{label}</span>
                                    </div>
                                    {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer in Sidebar */}
                    <div className="p-4 border-t border-slate-800/60 flex-shrink-0">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group text-sm font-bold"
                        >
                            <LogOut className="w-4.5 h-4.5 transition-transform duration-200 group-hover:-translate-x-1" />
                            Sign Out
                        </button>
                    </div>
                </aside>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-6 md:p-10">
                    <div className="max-w-[1600px] mx-auto min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
