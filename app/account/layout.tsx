'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Package, MapPin, Heart, Star, Bell, LayoutDashboard, ChevronRight, Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Identity</p>
                </div>
            </div>
        );
    }

    if (!user) return null;
    const initials = user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

    const navItems = [
        { label: 'Intelligence', sub: 'Dashboard', icon: LayoutDashboard, href: '/account' },
        { label: 'Acquisitions', sub: 'Your Orders', icon: Package, href: '/account/orders' },
        { label: 'Protocols', sub: 'Saved Addresses', icon: MapPin, href: '/account/addresses' },
        { label: 'Curation', sub: 'Your Wishlist', icon: Heart, href: '/account/wishlist' },
        { label: 'Feedback', sub: 'My Reviews', icon: Star, href: '/account/reviews' },
        { label: 'Signals', sub: 'Notifications', icon: Bell, href: '/account/notifications' },
    ];

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-white flex flex-col lg:flex-row">
            {/* Mobile Header */}
            <header className="lg:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/image.png" alt="Logo" className="w-8 h-8 object-contain" />
                        <span className="font-display font-black text-lg tracking-tight">
                            <span className="text-slate-900">Cart</span>
                            <span className="text-orange-600">izo</span>
                        </span>
                    </Link>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-black shadow-lg">
                    {initials}
                </div>
            </header>

            {/* Sidebar Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Navigation Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-80 bg-white z-[101] shadow-2xl transition-transform duration-300 transform lg:static lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-100 lg:z-0 flex flex-col h-screen lg:h-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex flex-col h-full bg-white">
                    {/* Sidebar Header (Mobile Only) */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between lg:hidden">
                        <div className="flex items-center gap-2.5">
                            <img src="/image.png" alt="Logo" className="w-8 h-8" />
                            <span className="text-xl font-black tracking-tight">Cartizo</span>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
                        {/* User Profile Card */}
                        <div className="relative group overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-indigo-500/20 transition-colors duration-500"></div>

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center text-3xl font-black text-white shadow-xl mb-6 group-hover:scale-105 transition-transform duration-500">
                                    {initials}
                                </div>
                                <div className="max-w-full">
                                    <h3 className="text-xl font-display font-black text-white tracking-tight leading-none mb-1 truncate">{user.name}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Authorized User</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <nav className="space-y-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`group flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${isActive
                                            ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                            : 'hover:bg-gray-50 text-slate-500 hover:text-slate-900'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border border-gray-100 group-hover:scale-110'
                                                }`}>
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className={`text-[9px] font-black uppercase tracking-widest leading-none mb-1 ${isActive ? 'text-indigo-600/70' : 'text-slate-400'}`}>{item.label}</p>
                                                <p className="text-sm font-bold tracking-tight">{item.sub}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0 group-hover:rotate-0 group-hover:opacity-100'}`} />
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all duration-300 group text-left"
                        >
                            <LogOut className="w-5 h-5" />
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-1 opacity-70">Session</p>
                                <p className="text-sm font-bold tracking-tight">Terminate Protocol</p>
                            </div>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen overflow-x-hidden">
                <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 lg:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {children}
                </div>
            </main>
        </div>
    );
}
