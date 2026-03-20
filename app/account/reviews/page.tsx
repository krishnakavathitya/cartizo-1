'use client';

import { useState } from 'react';
import { Star, Edit, Trash2, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface Review {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  rating: number;
  comment: string;
  date: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      productId: '5',
      productTitle: 'Samsung Galaxy Smartphone 2024',
      productImage: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop',
      rating: 5,
      comment: 'Excellent phone! Great camera quality and battery life. Highly recommended!',
      date: '2024-02-15',
    },
    {
      id: '2',
      productId: '8',
      productTitle: 'Sony WH-1000XM5 Headphones',
      productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      rating: 4,
      comment: 'Amazing noise cancellation. Very comfortable for long listening sessions.',
      date: '2024-02-10',
    },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    rating: 5,
    comment: '',
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you certain you wish to remove this feedback manifest?')) {
      setReviews(reviews.filter(review => review.id !== id));
    }
  };

  const handleEdit = (review: Review) => {
    setEditingId(review.id);
    setEditForm({
      rating: review.rating,
      comment: review.comment,
    });
  };

  const handleUpdate = (id: string) => {
    setReviews(reviews.map(review =>
      review.id === id
        ? { ...review, ...editForm, date: new Date().toISOString().split('T')[0] }
        : review
    ));
    setEditingId(null);
  };

  const renderStars = (rating: number, interactive: boolean = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onChange && onChange(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform duration-200`}
          >
            <Star
              className={`w-5 h-5 ${star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-200'
                }`}
              strokeWidth={star <= rating ? 0 : 2}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-display font-black text-slate-900 tracking-tight leading-none mb-4">Feedback Archives</h1>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Temporal logs of quality assessments
          </p>
        </div>
        <div className="bg-amber-50 text-amber-600 px-5 py-2.5 rounded-2xl border border-amber-100 flex items-center gap-2 shadow-sm">
          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span className="text-[10px] font-black uppercase tracking-widest">Average Sentiment: 4.8</span>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="group relative bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-100/30 transition-all duration-500">
            {editingId === review.id ? (
              <div className="0">
                <div className="flex flex-col sm:flex-row gap-10">
                  <div className="w-32 h-32 bg-gray-50 rounded-[2rem] flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden">
                    <img src={review.productImage} alt={review.productTitle} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div className="flex-1 space-y-8">
                    <div>
                      <h3 className="text-2xl font-display font-black text-slate-900 mb-2">{review.productTitle}</h3>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metric Quantification</label>
                        {renderStars(editForm.rating, true, (rating) => setEditForm({ ...editForm, rating }))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Narrative Feedback</label>
                      <textarea
                        value={editForm.comment}
                        onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none font-medium text-slate-900"
                        rows={4}
                        placeholder="Share your experience..."
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleUpdate(review.id)}
                        className="flex-[2] bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
                      >
                        Commit Revision
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 border-2 border-gray-200 text-slate-600 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                      >
                        Abort
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10">
                <div className="flex flex-col sm:flex-row gap-10">
                  {/* Product Section */}
                  <div className="w-32 h-32 bg-gray-50 rounded-[2rem] flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    <img src={review.productImage} alt={review.productTitle} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>

                  {/* Review Section */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-6 mb-6">
                      <div>
                        <Link href={`/products/${review.productId}`} className="block">
                          <h3 className="text-2xl font-display font-black text-slate-900 hover:text-indigo-600 transition-colors mb-2">{review.productTitle}</h3>
                        </Link>
                        <div className="flex items-center gap-6">
                          {renderStars(review.rating)}
                          <div className="h-4 w-[1px] bg-gray-200"></div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Logged: {new Date(review.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(review)}
                          className="w-12 h-12 rounded-2xl bg-gray-50 text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all duration-300"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all duration-300"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="relative bg-gray-50/50 p-6 rounded-2xl border border-gray-50">
                      <MessageSquare className="absolute top-4 right-4 w-4 h-4 text-slate-200" />
                      <p className="text-slate-600 font-medium leading-relaxed italic">
                        "{review.comment}"
                      </p>
                    </div>

                    <div className="mt-8 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-500">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Verified Engagement</span>
                      </div>
                      <Link href={`/products/${review.productId}`} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 flex items-center gap-2 group/link">
                        Inspect Product
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <Star className="w-10 h-10 text-slate-200" strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-display font-black text-slate-900 mb-2">No Feedback Logged</h3>
          <p className="text-slate-500 max-w-xs mx-auto mb-10 font-medium">Your critical assessment buffer is empty. Acquire products to initialize feedback protocols.</p>
          <Link
            href="/products"
            className="inline-flex bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-slate-200"
          >
            Explore Gallery
          </Link>
        </div>
      )}
    </div>
  );
}
