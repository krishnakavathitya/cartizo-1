'use client';

import { Heart, Star, ArrowRight, Edit, Trash2 } from 'lucide-react';
import { useWishlist } from '@/lib/context/wishlist-context';
import Link from 'next/link';

interface ProductCardProps {
    product: {
        id: string;
        title: string;
        slug: string;
        basePrice: number;
        discountPercentage: number;
        images: Array<{ url: string; altText: string; isPrimary: boolean }>;
        brand: { name: string } | null;
        averageRating: number;
        reviewCount: number;
        inStock: boolean;
    };
    isAdmin?: boolean;
    onEdit?: (e: React.MouseEvent, product: any) => void;
    onDelete?: (e: React.MouseEvent, productId: string, productTitle: string) => void;
}

export function ProductCard({ product, isAdmin, onEdit, onDelete }: ProductCardProps) {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
    const price = product.basePrice || 0;
    const discount = product.discountPercentage || 0;
    const discountedPrice = Math.round(price * (1 - discount / 100));
    const isSelected = isInWishlist(product.id);

    return (
        <div className="group relative bg-white border border-gray-200 rounded-[2.5rem] p-4 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-100/40 transition-all duration-500 flex flex-col h-full">
            {/* Wishlist Button - Top Right (Above everything) */}
            {!isAdmin && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        isSelected ? removeFromWishlist(product.id) : addToWishlist(product.id);
                    }}
                    className={`absolute top-3 right-3 w-7 h-7 rounded-full z-10 flex items-center justify-center transition-all duration-300 transform shadow-md ${isSelected
                        ? 'bg-orange-500 text-white scale-105 shadow-orange-100'
                        : 'bg-white/90 backdrop-blur-sm text-slate-400 border border-gray-100 hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:scale-105'
                        }`}
                >
                    <Heart className={`w-3.5 h-3.5 ${isSelected ? 'fill-current' : ''}`} strokeWidth={2} />
                </button>
            )}

            <Link href={`/products/${product.slug}`} className="flex flex-col h-full">
                {/* Product Image Container */}
                <div className="relative aspect-[1/1] rounded-[2rem] overflow-hidden bg-gray-50/50 mb-6 group-hover:bg-gray-100/50 transition-colors duration-500">
                    {/* Decorative Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-orange-500/10 transition-all duration-700"></div>

                    {primaryImage ? (
                        <img
                            src={primaryImage.url}
                            alt={primaryImage.altText}
                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700 p-8"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-20">
                            <span className="text-4xl">📦</span>
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                        {discount > 0 && (
                            <div className="bg-orange-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-orange-200/50 uppercase tracking-widest">
                                {discount}% off
                            </div>
                        )}
                        {!product.inStock && (
                            <div className="bg-slate-900 text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-widest">
                                Sold Out
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="px-2 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            {product.brand?.name || 'GENERIC'}
                        </span>
                        {product.averageRating > 0 && (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-lg border border-amber-100/50">
                                <Star className="w-3 h-3 text-amber-500 fill-current" />
                                <span className="text-[10px] font-black text-slate-700">{product.averageRating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>

                    <h3 className="text-base font-black text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-tight mb-4 min-h-[2.5rem] tracking-tight">
                        {product.title}
                    </h3>

                    <div className="mt-auto flex items-center justify-between py-2 border-t border-gray-50 group-hover:border-orange-50 transition-colors">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-black text-slate-900 tracking-tighter">₹{discountedPrice.toLocaleString()}</span>
                                {discount > 0 && (
                                    <span className="text-xs text-slate-400 line-through font-bold">₹{price.toLocaleString()}</span>
                                )}
                            </div>
                        </div>

                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-slate-300 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500">
                            <ArrowRight className="w-4 h-4" strokeWidth={3} />
                        </div>
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onEdit?.(e, product);
                                }}
                                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-md active:scale-95"
                            >
                                <Edit className="w-3 h-3" /> Modify
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onDelete?.(e, product.id, product.title);
                                }}
                                className="flex-1 flex items-center justify-center gap-2 bg-rose-50 text-rose-500 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
                            >
                                <Trash2 className="w-3 h-3" /> Revoke
                            </button>
                        </div>
                    )}
                </div>
            </Link>
        </div>
    );
}
