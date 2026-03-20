'use client';

import { ArrowRight, Gift } from 'lucide-react';
import Link from 'next/link';

export function OfferBanner() {
    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl shadow-lg p-8 text-white">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 bg-black opacity-10 rounded-full blur-2xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-lg">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                        <Gift className="w-3.5 h-3.5" />
                        <span>Limited Time Offer</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                        Get 20% Off Your Next Order!
                    </h2>
                    <p className="text-orange-100 font-medium text-lg">
                        Use code <span className="bg-white text-orange-600 px-2 py-0.5 rounded font-black tracking-wider">CARTIZO20</span> at checkout breakdown.
                    </p>
                </div>

                <Link
                    href="/products"
                    className="group bg-white text-orange-600 px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-xl hover:bg-orange-50 hover:scale-105 transition-all duration-300"
                >
                    Explore Now
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>
        </div>
    );
}
