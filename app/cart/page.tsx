'use client';

import { useCart } from '@/lib/context/cart-context';
import { useAuth } from '@/lib/context/auth-context';
import { Trash2, ShoppingCart, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items: cartItems, updateQuantity, removeFromCart, totalPrice, isLoaded } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Show loading state while checking authentication
  if (!isLoaded || authLoading) {
    return (
      <div className="min-h-screen bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 flex gap-8 animate-pulse">
                <div className="w-24 h-24 bg-gray-100 rounded-[2rem]" />
                <div className="flex-1 space-y-4 py-2">
                  <div className="h-6 bg-gray-100 rounded-full w-3/4" />
                  <div className="h-10 bg-gray-100 rounded-2xl w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show "Please Login" message if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            {/* Lock Icon */}
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-orange-500" />
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Please Login to Continue
            </h2>

            {/* Description */}
            <p className="text-gray-600 mb-8">
              You need to be logged in to view your cart and proceed with checkout.
            </p>

            {/* Login Button */}
            <button
              onClick={() => router.push('/auth/login?redirect=/cart')}
              className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors mb-4"
            >
              Login to View Cart
            </button>

            {/* Sign Up Link */}
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a
                href="/auth/signup?redirect=/cart"
                className="text-orange-500 font-semibold hover:text-orange-600"
              >
                Sign up
              </a>
            </p>

            {/* Continue Shopping */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <a
                href="/products"
                className="text-gray-600 hover:text-gray-900 font-medium text-sm"
              >
                ← Continue Shopping
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const bagTotal = totalPrice;
  const deliveryCharges = 0;
  const totalAmount = bagTotal + deliveryCharges;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl sm:text-5xl font-display font-black text-slate-900 tracking-tight leading-none mb-4">Your Collection</h1>
            <p className="text-[10px] sm:text-sm font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Management of your curated items
            </p>
          </div>
          <a href="/products" className="text-[10px] sm:text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-500 transition-colors border-b-2 border-indigo-100 pb-1 w-fit">Continue Acquisition</a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-6">
            {cartItems.length === 0 ? (
              <div className="bg-gray-50 border border-gray-100 rounded-[2.5rem] p-10 sm:p-20 text-center">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                  <ShoppingCart className="w-8 h-8 sm:w-12 sm:h-12 text-slate-200" strokeWidth={1.5} />
                  <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold animate-bounce">0</div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 mb-4">Pristine State</h2>
                <p className="text-[10px] sm:text-sm text-slate-500 max-w-sm mx-auto mb-10 font-medium font-bold uppercase tracking-widest leading-relaxed">Your collection is currently empty.</p>
                <a
                  href="/products"
                  className="inline-flex bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all duration-300 shadow-xl shadow-slate-200 active:scale-95"
                >
                  Explore Collections
                </a>
              </div>
            ) : (
              cartItems.map(item => {
                const product = item.product;
                if (!product) return null;

                const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
                const itemPrice = product.basePrice * (1 - (product.discountPercentage || 0) / 100);

                return (
                  <div key={item.id} className="group bg-white border border-gray-100 rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-100/30 transition-all duration-500">

                    {/* Row 1: Image (left) + Controls (right) */}
                    <div className="flex items-center justify-between gap-4">
                      {/* Product Image */}
                      <a href={`/products/${product.slug}`} className="w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gray-50 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                        {primaryImage?.url ? (
                          <img
                            src={primaryImage.url}
                            alt={product.title}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        ) : (
                          <span className="text-5xl grayscale opacity-20">📦</span>
                        )}
                      </a>

                      {/* Quantity Controls + Delete */}
                      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        <div className="flex items-center gap-1 bg-gray-50 p-1 sm:p-1.5 rounded-2xl border border-gray-100">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.id, item.quantity - 1);
                              }
                            }}
                            disabled={item.quantity === 1}
                            className={`w-7 h-7 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${item.quantity === 1
                              ? 'text-gray-200 cursor-not-allowed'
                              : 'bg-white text-slate-900 shadow-sm hover:bg-slate-900 hover:text-white'
                              }`}
                          >
                            <span className="text-base sm:text-lg font-light">−</span>
                          </button>
                          <span className="w-7 sm:w-12 text-center font-black text-slate-900 text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 sm:w-10 sm:h-10 bg-white text-slate-900 rounded-xl shadow-sm flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all duration-300"
                          >
                            <span className="text-base sm:text-lg font-light">+</span>
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all duration-300 flex-shrink-0"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    {/* Row 2: Product Details */}
                    <div>
                      <span className="text-[10px] font-black text-indigo-500/80 uppercase tracking-widest mb-1 block">Selected Series</span>
                      <a href={`/products/${product.slug}`}>
                        <h3 className="font-display font-black text-base sm:text-xl text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1 leading-tight tracking-tight">{product.title}</h3>
                      </a>
                      <div className="flex items-center gap-3">
                        <p className="text-lg sm:text-2xl font-black text-slate-900">₹{itemPrice.toLocaleString()}</p>
                        <div className="h-4 w-[1px] bg-gray-200"></div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Unit Valuation</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 sticky top-32 shadow-2xl shadow-slate-200 overflow-hidden">
              {/* Decorative Element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

              <h2 className="text-2xl font-display font-black text-white mb-8 relative z-10">Financial Summary</h2>

              <div className="space-y-6 mb-10 relative z-10">
                <div className="flex justify-between items-center group">
                  <span className="text-sm font-bold text-slate-400 group-hover:text-indigo-400 transition-colors">Gross Valuation</span>
                  <span className="font-black text-white text-lg">₹{bagTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-sm font-bold text-slate-400 group-hover:text-indigo-400 transition-colors">Logistical Allocation</span>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-lg uppercase tracking-widest">Complimentary</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-sm font-bold text-slate-400 group-hover:text-indigo-400 transition-colors">Statutory GST</span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inclusive</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-8 mb-10 relative z-10">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Acquisition</span>
                    <span className="text-2xl sm:text-4xl font-black text-white tracking-tighter">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {cartItems.length > 0 ? (
                <a
                  href="/checkout"
                  className="block w-full bg-white text-slate-900 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] text-center hover:bg-indigo-50 transition-all duration-300 shadow-xl active:scale-95 relative z-10"
                >
                  Proceed to Checkout
                </a>
              ) : (
                <button
                  disabled
                  className="block w-full bg-white/50 text-slate-500 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] text-center cursor-not-allowed relative z-10 border border-white/10"
                >
                  Proceed to Checkout
                </button>
              )}

              <p className="mt-8 text-center text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Validated Infrastructure • SSL Protocol</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
