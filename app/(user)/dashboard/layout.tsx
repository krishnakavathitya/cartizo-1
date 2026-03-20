'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Menu } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="bg-gray-50 h-screen overflow-hidden">
            <div className="flex h-full">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-[260px] flex-col flex-shrink-0 h-full border-r border-gray-100 bg-white overflow-hidden">
                    <Sidebar />
                </aside>

                {/* Mobile Sidebar Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Mobile Sidebar Drawer */}
                <div className={`lg:hidden fixed top-0 bottom-0 left-0 z-50 w-[260px] transform transition-transform duration-300 ease-in-out bg-white shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <Sidebar onMobileClose={() => setIsMobileMenuOpen(false)} />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 h-full">
                    {/* Mobile Header Bar */}
                    <div className="lg:hidden bg-white px-4 py-3 flex items-center gap-3 flex-shrink-0 border-b border-gray-100 shadow-sm">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 rounded-xl hover:bg-gray-100 text-slate-600 transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <span className="font-bold text-slate-800">My Account</span>
                    </div>

                    {/* Page Content - scrollable */}
                    <main className="flex-1 overflow-y-auto">
                        <div className="p-5 md:p-8 max-w-5xl mx-auto w-full min-h-full">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
