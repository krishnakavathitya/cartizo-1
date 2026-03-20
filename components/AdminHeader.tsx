'use client';

import { Search, Bell, ExternalLink, ChevronDown, LogOut, User, Settings, Menu } from 'lucide-react';
import { useAuth } from '@/lib/context/auth-context';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AdminHeaderProps {
    onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    const { user, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    if (!user) return null;

    return (
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-50 flex items-center justify-between px-3 sm:px-6 shadow-sm">
            {/* Left: Brand */}
            <div className="flex items-center gap-2 sm:gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-1 sm:-ml-2 text-slate-500 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                >
                    <Menu className="w-5 h-5 sm:w-6 h-6" />
                </button>
                <a href="/" className="flex items-center gap-2 sm:gap-2.5 group">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 overflow-hidden rounded-lg sm:rounded-xl shadow-orange-100 shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <img
                    src="/image.png"
                    alt="Cartizo Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-xl sm:text-2xl font-display font-extrabold tracking-tight flex items-center">
                  <span className="text-slate-900">Cart</span>
                  <span className="text-orange-600">izo</span>
                </div>
              </a>
            </div>

            {/* Middle: Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search for orders, products or users..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative hidden min-[400px]:block">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 text-slate-500 hover:bg-gray-100 rounded-lg transition-colors relative group"
                    >
                        <Bell className={`w-5 h-5 transition-transform duration-300 ${showNotifications ? 'scale-110' : 'group-hover:scale-110'}`} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">New</span>
                                </div>
                                <div className="p-8 text-center">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Bell className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-900">No new notifications</p>
                                    <p className="text-xs text-slate-500 mt-1">We'll notify you when something important happens.</p>
                                </div>
                                <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50 text-center">
                                    <button className="text-xs font-bold text-slate-400 hover:text-orange-600 transition-colors">
                                        View all notifications
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="h-6 w-px bg-gray-200 mx-0.5 hidden min-[400px]:block"></div>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-1.5 sm:gap-3 p-1 rounded-full hover:bg-gray-50 transition-all group"
                    >
                        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-slate-200 group-hover:scale-105 transition-transform overflow-hidden">
                            {user.photo ? (
                                <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                user.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="hidden lg:block text-left mr-1">
                            <p className="text-xs font-bold text-slate-900 leading-none">{user.name}</p>
                            <p className="text-[10px] text-slate-500 mt-1 leading-none font-medium truncate max-w-[100px] italic">Administrator</p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 hidden md:block ${showDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showDropdown && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
                            <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Administrator</p>
                                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                                </div>

                                <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-gray-50 hover:text-orange-600 transition-colors">
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </Link>

                                <div className="my-1 border-t border-gray-50"></div>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
