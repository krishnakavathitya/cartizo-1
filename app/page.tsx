'use client';

import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '@/lib/apollo/queries';
import { Hero } from '@/components/Hero';
import { ProductCard } from '@/components/ProductCard';
import { useAuth } from '@/lib/context/auth-context';
import { useMutation, gql } from '@apollo/client';
import { useState } from 'react';
import { Package } from 'lucide-react';

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($productId: ID!) {
    deleteProduct(productId: $productId)
  }
`;

interface Product {
  id: string;
  title: string;
  slug: string;
  basePrice: number;
  discountPercentage: number;
  images: Array<{ url: string; altText: string; isPrimary: boolean }>;
  brand: { name: string };
  averageRating: number;
  reviewCount: number;
  inStock: boolean;
}

export default function HomePage() {
  const { user } = useAuth();
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  const { data, loading } = useQuery(GET_PRODUCTS, {
    variables: {
      pagination: { page: 1, pageSize: 12 },
    },
  });

  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    onCompleted: () => {
      window.location.reload();
    }
  });

  const handleDelete = (e: React.MouseEvent, productId: string, productTitle: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${productTitle}"?`)) return;
    deleteProduct({ variables: { productId } });
  };

  const handleEdit = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/products?edit=${product.id}`;
  };

  const products: Product[] = data?.products?.items || [];

  // Use real products from database
  const displayProducts: Product[] = data?.products?.items || [];

  return (
    <div className="bg-slate-50/30">
      <Hero />

      {/* Featured Categories */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-[0.1em]">Store Categories</h2>
            <a href="/categories" className="text-xs font-black text-blue-600 hover:text-blue-500 transition-colors uppercase tracking-widest">Global Archive Catalog</a>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-y-12 gap-x-4">
            {[
              { name: 'Electronics', image: '/icon/Electronics.png' },
              { name: 'Fashion', image: '/icon/Fashion.png' },
              { name: 'Home', image: '/icon/Home.png' },
              { name: 'Beauty', image: '/icon/Beauty.png' },
              { name: 'Toys', image: '/icon/Toys.png' },
              { name: 'Groceries', image: '/icon/Groceries.png' },
            ].map((category) => (
              <a
                key={category.name}
                href={`/category/${category.name.toLowerCase()}`}
                className="flex flex-col items-center group relative pt-2"
              >
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex flex-col items-center justify-end mb-4 sm:mb-6">
                  <div className="absolute bottom-0 w-[95%] h-[20%] bg-gradient-to-b from-cyan-50 to-blue-100/40 rounded-full blur-[3px] opacity-70 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="absolute bottom-[2px] w-[90%] h-[15%] bg-blue-400/10 rounded-full blur-md group-hover:blur-lg transition-all duration-500"></div>

                  <div className="relative z-10 w-full h-[95%] flex items-center justify-center group-hover:-translate-y-4 transition-transform duration-500 ease-out">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-[110%] h-[110%] max-w-none object-contain drop-shadow-2xl"
                    />
                  </div>
                </div>

                <span className="text-[10px] sm:text-[11px] font-black text-slate-800 group-hover:text-blue-600 transition-colors text-center tracking-widest leading-none uppercase">
                  {category.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Featured Inventory</h2>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Real-time database synchronization</p>
            </div>
            <a href="/products" className="group flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-500 transition-colors uppercase tracking-widest w-fit">
              Full Inventory
              <span className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-[2.5rem] p-5 animate-pulse">
                  <div className="aspect-square bg-slate-50 rounded-[1.8rem] mb-6"></div>
                  <div className="space-y-4 px-2">
                    <div className="h-3 bg-slate-50 rounded-full w-1/4"></div>
                    <div className="h-6 bg-slate-50 rounded-full w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayProducts.length === 0 ? (
            <div className="py-20 sm:py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-8 h-8 sm:w-10 sm:h-10 text-slate-200" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-widest mb-2">Database Empty</h3>
              <p className="text-xs sm:text-sm font-bold text-slate-400 max-w-xs mx-auto mb-8 uppercase tracking-tight">Manual inventory entry required to populate storefront cards.</p>
              <a href="/admin/products/add" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                Initialize Inventory
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
              {displayProducts.slice(0, 12).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAdmin={isAdmin}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
