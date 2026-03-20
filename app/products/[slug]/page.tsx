'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/lib/context/cart-context';
import { useWishlist } from '@/lib/context/wishlist-context';
import { useAuth } from '@/lib/context/auth-context';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
  ShoppingCart,
  Heart,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  Plus,
  Loader2,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Share2
} from 'lucide-react';
import Link from 'next/link';

const GET_PRODUCT_DETAIL = gql`
  query GetProductDetail($slug: String!) {
    product(slug: $slug) {
      id
      title
      slug
      description
      basePrice
      discountPercentage
      inStock
      averageRating
      reviewCount
      category {
        id
        name
      }
      brand {
        id
        name
      }
      images {
        id
        url
        altText
        isPrimary
      }
    }
  }
`;

const GET_PRODUCT_REVIEWS = gql`
  query GetProductReviews($productId: ID!) {
    productReviews(productId: $productId) {
      id
      rating
      comment
      createdAt
      user {
        id
        name
        email
      }
    }
  }
`;

const CREATE_REVIEW = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      rating
      comment
      createdAt
      user {
        id
        name
      }
    }
  }
`;

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const { addToCart, items: cartItems } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const { data, loading, error, refetch: refetchProduct } = useQuery(GET_PRODUCT_DETAIL, {
    variables: { slug },
  });

  const product = data?.product;

  const { data: reviewsData, loading: reviewsLoading, refetch: refetchReviews } = useQuery(GET_PRODUCT_REVIEWS, {
    variables: { productId: product?.id },
    skip: !product?.id,
  });

  const [createReview] = useMutation(CREATE_REVIEW);

  const handleShare = async () => {
    const shareData = {
      title: product.title,
      text: `Check out ${product.title} on Cartizo!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        // Use native share API if available (mobile devices)
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (err) {
      // User cancelled or error occurred
      console.log('Share cancelled or failed');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    setIsSubmittingReview(true);
    setReviewError('');
    setReviewSuccess(false);

    try {
      await createReview({
        variables: {
          input: {
            productId: product.id,
            rating: reviewRating,
            comment: reviewComment,
          }
        }
      });
      setReviewSuccess(true);
      setReviewComment('');
      setReviewRating(5);
      refetchReviews();
      refetchProduct();
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-orange-600 animate-spin mx-auto" strokeWidth={2} />
          <p className="text-xs font-bold text-slate-400 font-display uppercase tracking-widest">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-12 rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-100 text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            🏷️
          </div>
          <h2 className="text-3xl font-display font-black text-slate-900 mb-2">Product Not Found</h2>
          <p className="text-slate-500 mb-8 font-medium">The product you're looking for might have been moved or is currently unavailable.</p>
          <button
            onClick={() => router.push('/products')}
            className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-500 transition-all shadow-lg active:scale-95"
          >
            Browse All Products
          </button>
        </div>
      </div>
    );
  }

  const primaryImage = product.images?.find((img: any) => img.isPrimary) || product.images?.[0];
  const discountedPrice = Math.round(product.basePrice * (1 - product.discountPercentage / 100));
  const inWishlist = isInWishlist(product.id);
  const isInCart = cartItems.some(item => item.product?.id === product.id);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <Link href="/" className="hover:text-orange-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-200" />
            <Link href="/products" className="hover:text-orange-600 transition-colors">Shop</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-200" />
            <span className="text-orange-600 font-display truncate max-w-[150px]">{product.title}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleShare}
              className="relative p-2.5 rounded-full bg-slate-50 border border-slate-100 text-slate-500 hover:text-orange-600 hover:bg-white hover:shadow-lg transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {shareSuccess && (
              <div className="absolute top-16 right-0 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg animate-in slide-in-from-top-2 fade-in">
                Link copied!
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          {/* Visual Section - Left (5/12 for smaller footprint) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            <div className="space-y-6 w-full max-w-sm lg:max-w-none">
              {/* Main Photo Container */}
              <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-[2.5rem] overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-500 flex items-center justify-center p-12">
                <img
                  src={primaryImage?.url || '/placeholder-product.png'}
                  alt={primaryImage?.altText || product.title}
                  className="max-w-full max-h-full object-contain transition-transform duration-700 ease-out group-hover:scale-110"
                />

                {/* Discount Badge - Top Left */}
                {product.discountPercentage > 0 && (
                  <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-10">
                    <div className="relative">
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                      {/* Badge */}
                      <div className="relative w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-orange-600 text-white flex flex-col items-center justify-center rounded-full shadow-2xl shadow-orange-500/50 border-2 border-white">
                        <span className="text-xs sm:text-lg font-black leading-none">{product.discountPercentage}%</span>
                        <span className="text-[6px] sm:text-[7px] font-bold uppercase tracking-wider opacity-90">OFF</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Wishlist Button - Top Right */}
                {user?.role !== 'admin' && (
                  <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-10">
                    <button
                      onClick={() => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product.id)}
                      className={`group/btn relative w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 ${inWishlist
                        ? 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-2xl shadow-rose-500/50'
                        : 'bg-white/90 backdrop-blur-md shadow-xl hover:shadow-2xl border-2 border-white'
                        }`}
                    >
                      {/* Glow effect for active state */}
                      {inWishlist && (
                        <div className="absolute inset-0 bg-rose-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                      )}
                      {/* Icon */}
                      <Heart
                        className={`relative w-3.5 h-3.5 sm:w-5 sm:h-5 transition-all duration-300 ${inWishlist
                          ? 'fill-white text-white scale-110'
                          : 'text-slate-400 group-hover/btn:text-rose-500 group-hover/btn:scale-110'
                          }`}
                        strokeWidth={2.5}
                      />
                    </button>
                  </div>
                )}
              </div>

              {/* Enhanced Trust Bar */}
              <div className="grid grid-cols-3 gap-1 px-2">
                {[
                  { icon: Truck, label: 'Free Express Delivery', desc: 'Ships within 24 hours' },
                  { icon: ShieldCheck, label: 'Secure Checkout', desc: '100% Protection' },
                  { icon: RotateCcw, label: 'Easy Returns', desc: '30-day policy' }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center p-6 bg-white border border-slate-50 rounded-[2rem] hover:shadow-xl hover:shadow-slate-100 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <item.icon className="w-6 h-6" strokeWidth={2.2} />
                    </div>
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest text-center mb-1">{item.label}</span>
                    <span className="text-[9px] font-medium text-slate-400 text-center">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Details Section - Right (7/12) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="sticky top-28 space-y-8">
              {/* Product Info Head */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                    {product.brand?.name || 'STORE ORIGINAL'}
                  </span>
                  <div className="h-4 w-[1px] bg-slate-200"></div>
                  {product.averageRating > 0 ? (
                    <div className="flex items-center gap-1">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(product.averageRating) ? 'text-amber-400 fill-current' : 'text-slate-100'}`} />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-900 ml-1">{product.averageRating.toFixed(1)}</span>
                      <span className="text-[10px] font-bold text-slate-400">({product.reviewCount} Reviews)</span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Star className="w-3 h-3" /> New Product
                    </span>
                  )}
                </div>

                <h1 className="text-2xl md:text-4xl font-display font-black text-slate-900 leading-tight">
                  {product.title}
                </h1>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      ₹{discountedPrice.toLocaleString()}
                    </span>
                    {product.discountPercentage > 0 && (
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-lg text-slate-300 line-through font-bold">
                          ₹{product.basePrice.toLocaleString()}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase rounded-md tracking-wider">
                          SAVE ₹{(product.basePrice - discountedPrice).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Actions */}
              <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-5 shadow-sm">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400 font-display">
                  <span>Selection</span>
                  <span className={product.inStock ? 'text-emerald-500' : 'text-rose-500'}>
                    {product.inStock ? '● In Stock' : '✕ Out of Stock'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {isInCart ? (
                    <Link
                      href="/cart"
                      className="w-full sm:flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 active:scale-95 group"
                    >
                      <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      View in Cart
                    </Link>
                  ) : (
                    <button
                      onClick={() => addToCart(product.id, 1)}
                      disabled={!product.inStock || user?.role === 'admin'}
                      className={`w-full sm:flex-1 py-4 text-white rounded-2xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 group ${product.inStock && user?.role !== 'admin' ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-100' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        }`}
                    >
                      <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                      Add to Cart
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      if (!isInCart) await addToCart(product.id, 1);
                      router.push('/checkout');
                    }}
                    disabled={!product.inStock || user?.role === 'admin'}
                    className={`w-full sm:flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 ${(!product.inStock || user?.role === 'admin') && 'bg-slate-100 text-slate-300 transform-none shadow-none cursor-not-allowed'
                      }`}
                  >
                    Buy Now
                  </button>
                </div>

                {user?.role === 'admin' ? (
                  <p className="text-[10px] text-center text-orange-600 font-bold uppercase tracking-widest bg-orange-50 py-2 rounded-xl border border-orange-100">
                    Administrator accounts cannot perform shopping actions
                  </p>
                ) : (
                  <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                    Secure checkout with standard encryption
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Section - Full Width Below  */}
        <div className="mt-[10px] border-t border-slate-100 pt-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-start sm:justify-center gap-2 sm:gap-8 border-b border-slate-100 pb-0 overflow-x-auto scrollbar-hide mb-8 sm:mb-12 px-4 sm:px-0">
              {[
                { id: 'description', label: 'Description' },
                { id: 'specifications', label: 'Specifications' },
                { id: 'reviews', label: `Reviews (${product.reviewCount || 0})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 sm:px-20 py-3 text-xs sm:text-[14px] font-bold transition-all shrink-0 border-b-2 whitespace-nowrap ${activeTab === tab.id
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {activeTab === 'description' && (
                <div className="prose prose-slate max-w-none text-center sm:text-left">
                  <h2 className="text-2xl font-display font-black text-slate-900 mb-6">Product Insight</h2>
                  <p className="text-slate-600 font-medium text-[16px] leading-[1.8]">
                    {product.description || 'This premium product is crafted with high-quality materials and designed for durability and comfort. A perfect addition to your lifestyle collections.'}
                  </p>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Category', value: product.category.name },
                    { label: 'Brand', value: product.brand?.name || 'Original' },
                    { label: 'Asset Reference', value: `REF-${product.id}` },
                    { label: 'Stock Level', value: product.inStock ? 'OPTIMIZED' : 'BACKORDER' },
                    { label: 'Material', value: 'Technical Composite' },
                    { label: 'Certification', value: 'Hub Verified' },
                  ].map((spec) => (
                    <div key={spec.label} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{spec.label}</span>
                      <span className="text-[12px] font-black text-slate-900 uppercase">{spec.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Review List */}
                  <div className="space-y-8">
                    <h3 className="text-xl font-display font-black text-slate-900 flex items-center gap-3">
                      Global Sentiment
                      <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest mt-1">Verified Feedback</span>
                    </h3>

                    <div className="space-y-6">
                      {reviewsLoading ? (
                        <div className="py-12 flex flex-col items-center gap-3">
                          <Loader2 className="w-6 h-6 text-slate-200 animate-spin" />
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Synchronizing Logs...</span>
                        </div>
                      ) : (reviewsData?.productReviews?.length || 0) > 0 ? (
                        reviewsData.productReviews.map((review: any) => (
                          <div key={review.id} className="p-6 bg-white border border-slate-100 rounded-[2rem] hover:shadow-xl hover:shadow-slate-100 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-black text-[10px] uppercase group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                                  {review.user.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{review.user.name}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(review.createdAt).toLocaleDateString()} • Verified Hub</p>
                                </div>
                              </div>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-amber-400 fill-current' : 'text-slate-100'}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-slate-600 text-sm font-medium leading-relaxed italic border-l-2 border-slate-100 pl-4">"{review.comment}"</p>
                          </div>
                        ))
                      ) : (
                        <div className="py-20 border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center text-center px-10">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Star className="w-8 h-8 text-slate-200" />
                          </div>
                          <h4 className="text-lg font-display font-black text-slate-900 mb-2">No Verified Evaluations</h4>
                          <p className="text-slate-400 text-xs font-medium max-w-[200px] leading-relaxed">Be the first to perform a qualitative analysis of this asset.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add Review Form */}
                  <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100 h-fit sticky top-28">
                    <h3 className="text-xl font-display font-black text-slate-900 mb-8 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-100">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      Add Assessment
                    </h3>

                    <form onSubmit={handleReviewSubmit} className="space-y-8">
                      <div className="space-y-4">
                        <p className="text-[10px] font-black font-display text-slate-400 uppercase tracking-widest ml-1">Quality Metric</p>
                        <div className="flex gap-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className={`p-1 transition-all transform active:scale-90 ${star <= reviewRating ? 'text-amber-400 scale-110' : 'text-slate-200'}`}
                            >
                              <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-current' : ''}`} strokeWidth={2} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black font-display text-slate-400 uppercase tracking-widest ml-1">Analytical Comment</label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Provide your experience with this asset..."
                          className="w-full px-6 py-5 bg-white border border-slate-100 rounded-3xl focus:ring-4 focus:ring-orange-50 focus:border-orange-500 transition-all outline-none text-sm font-medium min-h-[140px] shadow-sm"
                          required
                        />
                      </div>

                      {reviewError && (
                        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-3 border border-rose-100 animate-in slide-in-from-top-2">
                          <AlertCircle className="w-5 h-5" /> {reviewError}
                        </div>
                      )}

                      {reviewSuccess && (
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-3 border border-emerald-100 animate-in slide-in-from-top-2">
                          <CheckCircle className="w-5 h-5" /> Protocol logged successfully
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {isSubmittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log assessment'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
