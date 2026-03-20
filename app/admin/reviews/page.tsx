'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, Trash2, Eye, Search, Filter, Loader2, RefreshCw } from 'lucide-react';

interface ReviewUser {
  id: string;
  name: string;
  email: string;
}

interface ReviewProduct {
  id: string;
  title: string;
  slug: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: ReviewUser | null;
  product: ReviewProduct | null;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (res.ok) {
        setReviews(data.reviews || []);
      } else {
        setError(data.error || 'Failed to load reviews');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (reviewId: string, productTitle: string) => {
    if (!confirm(`Delete this review for "${productTitle}"?`)) return;
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId }),
      });
      if (res.ok) {
        setReviews(r => r.filter(x => x.id !== reviewId));
      } else {
        alert('Failed to delete review');
      }
    } catch {
      alert('Network error');
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch =
      searchQuery === '' ||
      review.product?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = filterRating === null || review.rating === filterRating;
    return matchesSearch && matchesRating;
  });

  const getStarColor = (rating: number) => {
    if (rating >= 4) return 'text-emerald-500';
    if (rating >= 3) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none mb-1.5">
            Reviews Management
          </h1>
          <p className="text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-widest leading-tight">
            {loading ? 'Loading...' : `${filteredReviews.length} reviews found`}
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition shadow-md w-full sm:w-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product, user, or comment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilterModal(true)}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${filterRating !== null
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-100'
              : 'bg-gray-50 text-slate-600 hover:bg-slate-900 hover:text-white border border-gray-100'
              }`}
          >
            <Filter className="w-4 h-4" />
            {filterRating !== null ? `${filterRating} Stars` : 'Filter Rating'}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-10 text-center">
          <p className="text-red-600 font-bold text-sm mb-2">Failed to load reviews</p>
          <p className="text-red-400 text-xs font-medium mb-6">{error}</p>
          <button
            onClick={fetchReviews}
            className="bg-red-600 text-white font-black text-xs uppercase tracking-widest px-8 py-3 rounded-xl hover:bg-red-700 transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Reviews List */}
      {!error && (loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[3rem] p-20 text-center">
          <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <Star className="w-10 h-10 text-orange-200" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-4">No reviews found</h2>
          <p className="text-slate-500 max-w-xs mx-auto mb-10 font-medium">
            {searchQuery || filterRating !== null
              ? 'Try adjusting your search or filter criteria.'
              : 'No reviews have been submitted yet.'}
          </p>
          {(searchQuery || filterRating !== null) && (
            <button
              onClick={() => { setSearchQuery(''); setFilterRating(null); }}
              className="bg-slate-900 text-white font-black text-xs uppercase tracking-widest px-10 py-4 rounded-2xl hover:bg-orange-600 transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-gray-100 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-slate-100 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                {/* Review Content */}
                <div className="flex-1 space-y-4">
                  {/* Product Info */}
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <a
                        href={`/products/${review.product?.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-black text-slate-900 hover:text-orange-600 transition-colors flex items-center gap-2 group/link"
                      >
                        {review.product?.title || 'Unknown Product'}
                        <Eye className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </a>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= review.rating
                                ? `${getStarColor(review.rating)} fill-current`
                                : 'text-slate-200'
                                }`}
                            />
                          ))}
                        </div>
                        <span className={`text-sm font-black ${getStarColor(review.rating)}`}>
                          {review.rating}.0
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Review Comment */}
                  <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-orange-500">
                    <p className="text-slate-700 text-sm font-medium leading-relaxed italic">
                      "{review.comment || 'No comment provided'}"
                    </p>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black">
                      {review.user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{review.user?.name || 'Unknown User'}</p>
                      <p className="text-xs text-slate-400 font-medium">
                        {review.user?.email || ''} &nbsp;·&nbsp;{' '}
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col gap-2">
                  <button
                    onClick={() => handleDelete(review.id, review.product?.title || 'this product')}
                    className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Filter Modal */}
      {showFilterModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowFilterModal(false)}
        >
          <div
            className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 animate-in slide-in-from-bottom-10 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black mb-8 text-slate-900">Filter by Rating</h3>
            <div className="space-y-2">
              <button
                onClick={() => { setFilterRating(null); setShowFilterModal(false); }}
                className={`w-full text-left p-5 rounded-2xl font-bold text-sm transition-all ${filterRating === null
                  ? 'bg-orange-600 text-white shadow-xl shadow-orange-100'
                  : 'bg-gray-50 text-slate-600 hover:bg-slate-900 hover:text-white'
                  }`}
              >
                All Ratings
              </button>
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => { setFilterRating(rating); setShowFilterModal(false); }}
                  className={`w-full text-left p-5 rounded-2xl font-bold text-sm transition-all flex items-center gap-3 ${filterRating === rating
                    ? 'bg-orange-600 text-white shadow-xl shadow-orange-100'
                    : 'bg-gray-50 text-slate-600 hover:bg-slate-900 hover:text-white'
                    }`}
                >
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating
                          ? filterRating === rating
                            ? 'text-white fill-current'
                            : 'text-amber-400 fill-current'
                          : 'text-slate-300'
                          }`}
                      />
                    ))}
                  </div>
                  {rating} Stars
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
