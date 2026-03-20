'use client';

import { useWishlist } from '@/lib/context/wishlist-context';
import { useCart } from '@/lib/context/cart-context';
import { useAuth } from '@/lib/context/auth-context';
import { Trash2, ShoppingCart, Heart, ArrowRight, Lock } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function WishlistPage() {
  const { items: wishlistItems, removeFromWishlist, isLoaded } = useWishlist();
  const { addToCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Show loading state while checking authentication
  if (!isLoaded || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-8 w-48 bg-gray-200 rounded-lg mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 space-y-4 animate-pulse shadow-sm">
                <div className="aspect-[4/5] bg-gray-100 rounded-xl" />
                <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                <div className="h-4 bg-gray-100 rounded-full w-1/2" />
                <div className="h-10 bg-gray-100 rounded-full w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show guest info message if user is not authenticated
  const guestInfo = !user && isLoaded && (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Lock className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Guest Discovery Mode</p>
            <p className="text-xs text-slate-500">Log in to sync your wishlist across all devices.</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/auth/login?redirect=/wishlist')}
          className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all"
        >
          Login
        </button>
      </div>
    </div>
  );

  const handleMoveToCart = (item: any) => {
    const product = item.product;
    if (!product) return;

    addToCart(product.id, 1);
    removeFromWishlist(product.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {guestInfo}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 animate-fade-in">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
              My Wishlist
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              You have <span className="text-slate-900 font-bold">{wishlistItems.length}</span> items saved for later.
            </p>
          </div>
          {wishlistItems.length > 0 && (
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700 uppercase tracking-wider"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 animate-fade-in-up">
            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Heart className="w-10 h-10 text-rose-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your wishlist is empty</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              Looks like you haven't added anything to your wishlist yet. Explore our collections and find something you love!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-full font-bold hover:bg-orange-600 transition-all duration-300 shadow-lg shadow-slate-200 hover:shadow-orange-100 hover:scale-105 active:scale-95"
            >
              Start Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
            {wishlistItems.map((item) => {
              const product = item.product;
              if (!product) return null;

              return (
                <div key={item.id} className="group flex flex-col h-full bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                  <div className="relative flex-1">
                    <ProductCard product={product} />

                    {/* Absolute Remove Button Overlay */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromWishlist(product.id);
                      }}
                      className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-300 transform group-hover:scale-110 active:scale-95 border border-gray-100"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>

                  <div className="p-4 pt-0">
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-100 active:scale-95"
                    >
                      <ShoppingCart className="w-4 h-4" strokeWidth={2.5} />
                      Move to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
