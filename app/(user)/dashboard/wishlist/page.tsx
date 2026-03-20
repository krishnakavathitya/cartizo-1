'use client';

import { useWishlist } from '@/lib/context/wishlist-context';
import { useCart } from '@/lib/context/cart-context';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import Link from 'next/link';

export default function DashboardWishlistPage() {
    const { items: wishlistItems, removeFromWishlist, isLoaded } = useWishlist();
    const { addToCart } = useCart();

    const handleMoveToCart = (item: any) => {
        const product = item.product;
        if (!product) return;

        addToCart(product.id, 1);
        removeFromWishlist(product.id);
    };

    if (!isLoaded) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-gray-100 rounded-2xl animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-[2rem] p-4 space-y-4 animate-pulse shadow-sm border border-gray-50">
                            <div className="aspect-square bg-gray-50 rounded-2xl" />
                            <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                            <div className="h-4 bg-gray-100 rounded-full w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Curated Collection</h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        Management of your priority assets
                    </p>
                </div>
                {wishlistItems.length > 0 && (
                    <Link href="/products" className="group inline-flex items-center gap-2 text-[10px] font-black text-orange-600 hover:text-orange-700 uppercase tracking-widest">
                        Acquire More
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                )}
            </div>

            {wishlistItems.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-[2.5rem] p-16 text-center shadow-sm">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Heart className="w-8 h-8 text-rose-300 fill-rose-100" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Curation Buffer Empty</h3>
                    <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm font-medium">Explore the high-performance catalog to begin populating your wishlist.</p>
                    <Link href="/products" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-slate-200">
                        Launch Gallery
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {wishlistItems.map((item) => {
                        const product = item.product;
                        if (!product) return null;

                        return (
                            <div key={item.id} className="group relative bg-white border border-gray-100 rounded-[2rem] p-4 hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 flex flex-col">
                                <div className="relative flex-1">
                                    <ProductCard product={product} />

                                    {/* Remove Button Overlay */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            removeFromWishlist(product.id);
                                        }}
                                        className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-300 transform active:scale-95 border border-gray-100"
                                        title="Remove from wishlist"
                                    >
                                        <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                                    </button>
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={() => handleMoveToCart(item)}
                                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-slate-100 active:scale-95"
                                    >
                                        <ShoppingCart className="w-4 h-4" strokeWidth={2.5} />
                                        Initialize Acquisition
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
