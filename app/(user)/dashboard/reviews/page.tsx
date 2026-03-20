'use client';

import { useQuery, useMutation } from '@apollo/client';
import { GET_MY_REVIEWS, DELETE_REVIEW } from '../graphql/queries';
import { Star, Trash2, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function ReviewsPage() {
    const { data, loading, error, refetch } = useQuery(GET_MY_REVIEWS);
    const [deleteReviewMutation] = useMutation(DELETE_REVIEW);

    const handleDelete = async (reviewId: string) => {
        if (!confirm('Remove this review?')) return;
        try {
            await deleteReviewMutation({ variables: { reviewId } });
            await refetch();
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 space-y-4 animate-pulse shadow-sm border border-gray-100">
                        <div className="h-5 bg-gray-100 rounded w-2/3" />
                        <div className="h-4 bg-gray-100 rounded w-full" />
                        <div className="h-4 bg-gray-100 rounded w-3/4" />
                    </div>
                ))}
            </div>
        );
    }

    if (error) return <div className="p-8 text-rose-500">Error loading reviews.</div>;

    const reviews = data?.myReviews || [];

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <MessageSquare className="w-7 h-7 text-orange-500" />
                    My Reviews
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    You have written <span className="font-bold text-slate-900">{reviews.length}</span> review{reviews.length !== 1 ? 's' : ''}
                </p>
            </div>

            {reviews.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center">
                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Star className="w-10 h-10 text-orange-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No reviews yet</h3>
                    <p className="text-slate-500 mb-8">Purchase products and share your experience with the community.</p>
                    <Link href="/products" className="inline-flex items-center gap-2 bg-slate-900 text-white px-7 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors shadow-lg">
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review: any) => (
                        <div key={review.id} className="bg-white border border-gray-100 rounded-3xl p-4 sm:p-6 hover:shadow-md transition-all duration-300 group">
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                                    <img
                                        src={review.product?.images?.[0]?.url || 'https://via.placeholder.com/80'}
                                        alt={review.product?.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                                        <div className="flex-1 min-w-0">
                                            <Link href={`/product/${review.product?.slug}`} className="font-bold text-slate-900 hover:text-orange-600 transition-colors line-clamp-1 text-sm sm:text-base">
                                                {review.product?.title}
                                            </Link>
                                            <div className="flex items-center gap-1 mt-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-3 h-3 sm:w-4 sm:h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
                                                    />
                                                ))}
                                                <span className="text-[10px] sm:text-xs text-slate-400 ml-1 font-medium">{review.rating}/5</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 border-t sm:border-t-0 border-gray-50 pt-2 sm:pt-0">
                                            <span className="text-[10px] sm:text-xs text-slate-400 font-medium whitespace-nowrap">
                                                {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                className="p-1.5 sm:p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p className="text-slate-600 text-xs sm:text-sm mt-2 sm:mt-3 leading-relaxed">{review.comment}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
