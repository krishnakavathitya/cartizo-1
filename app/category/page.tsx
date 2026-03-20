'use client';

import { mockCategories } from '@/lib/graphql/mock-data';
import { ArrowRight } from 'lucide-react';

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Shop by Category</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockCategories.map(category => (
            <a
              key={category.id}
              href={`/category/${category.slug}`}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2 group-hover:text-orange-500 transition">
                    {category.name}
                  </h2>
                  <p className="text-gray-600 text-sm">{category.description}</p>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition" />
              </div>

              <div className="text-sm text-gray-500">
                {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
