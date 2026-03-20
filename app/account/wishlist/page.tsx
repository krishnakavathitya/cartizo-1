'use client';

import { useAuth } from '@/lib/context/auth-context';
import { useWishlist } from '@/lib/context/wishlist-context';
import { useCart } from '@/lib/context/cart-context';
import { Trash2, ShoppingCart, Heart, ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import Link from 'next/link';

export default function AccountWishlistPage() {
  const { items: wishlistItems, removeFromWishlist, isLoaded } = useWishlist();
  const { addToCart } = useCart();

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded-lg mb-8 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 space-y-4 animate-pulse shadow-sm">
              <div className="aspect-[4/5] bg-gray-100 rounded-xl" />
              <div className="h-4 bg-gray-100 rounded-full w-3/4" />
              <div className="h-4 bg-gray-100 rounded-full w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleMoveToCart = (item: any) => {
    const product = item.product;
    if (!product) return;

    addToCart(product.id, 1);
    removeFromWishlist(product.id);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight leading-none mb-3">Curated Assets</h1>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Management of your high-priority acquisitions
          </p>
        </div>
        <div className="bg-rose-50 text-rose-600 px-6 py-3 rounded-2xl border border-rose-100 flex items-center gap-3 shadow-sm">
          <Heart className="w-5 h-5 fill-rose-600" />
          <span className="text-xs font-black uppercase tracking-widest">{wishlistItems.length} Saved Protocols</span>
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[3rem] p-20 text-center shadow-sm">
          <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <Heart className="w-10 h-10 text-rose-200" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-4">Pristine State</h2>
          <p className="text-slate-500 max-w-xs mx-auto mb-10 font-medium">Your curation buffer is currently empty. Explore our premium marketplace to begin your acquisition journey.</p>
          <Link
            href="/products"
            className="inline-flex bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest px-10 py-5 rounded-2xl hover:bg-rose-600 transition-all shadow-xl shadow-slate-100"
          >
            Launch Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => {
            const product = item.product;
            if (!product) return null;

            return (
              <div key={item.id} className="group relative flex flex-col h-full bg-white border border-gray-100 rounded-3xl p-3 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-100">
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

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-slate-100 active:scale-95"
                  >
                    <ShoppingCart className="w-4 h-4" strokeWidth={2.5} />
                    Acquire
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
