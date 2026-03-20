'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { mockCategories } from '@/lib/graphql/mock-data';
import { useCart } from '@/lib/context/cart-context';
import { useWishlist } from '@/lib/context/wishlist-context';
import { useAuth } from '@/lib/context/auth-context';
import { ProductCard } from '@/components/ProductCard';

interface Product {
  id: string;
  title: string;
  slug: string;
  basePrice: number;
  discountPercentage: number;
  images: Array<{ url: string; altText: string }>;
  category: { name: string; slug: string };
  brand: { name: string };
  averageRating: number;
  reviewCount: number;
  inStock: boolean;
  stock?: number;
}

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const categorySlug = params.slug as string;
  const minPrice = searchParams.get('min') ? Number(searchParams.get('min')) : 0;
  const maxPrice = searchParams.get('max') ? Number(searchParams.get('max')) : 200000;

  const [priceRange, setPriceRange] = useState({ min: minPrice, max: maxPrice });
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('new-arrivals');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState({ title: '', message: '' });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          // Transform API products to match Product interface
          const transformedProducts = data.products.map((p: any) => ({
            id: p.id.toString(),
            title: p.name,
            slug: p.slug,
            basePrice: p.price,
            discountPercentage: p.discount || 0,
            images: [{ url: p.image, altText: p.name }],
            category: {
              name: p.category,
              slug: p.category.toLowerCase().replace(/\s+/g, '-')
            },
            brand: { name: p.brand },
            averageRating: p.averageRating || 0,
            reviewCount: p.reviewCount || 0,
            inStock: p.inStock !== false,
          }));
          setProducts(transformedProducts);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handler functions for edit and delete
  const handleDelete = async (e: React.MouseEvent, productId: string, productTitle: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Are you sure you want to delete "${productTitle}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setInfoModalContent({
          title: 'Success!',
          message: 'Product deleted successfully!'
        });
        setShowInfoModal(true);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const data = await response.json();
        setInfoModalContent({
          title: 'Error',
          message: data.error || 'Failed to delete product'
        });
        setShowInfoModal(true);
      }
    } catch (error) {
      console.error('Delete error:', error);
      setInfoModalContent({
        title: 'Error',
        message: 'Failed to delete product. Please try again.'
      });
      setShowInfoModal(true);
    }
  };

  const handleEdit = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProduct(product);
    const primaryImage = product.images[0];
    setEditForm({
      title: product.title,
      basePrice: product.basePrice,
      discountPercentage: product.discountPercentage,
      brand: product.brand.name,
      category: product.category.name,
      description: 'Fresh and pure product with high quality ingredients. Perfect for daily use.',
      specifications: '',
      inStock: product.inStock,
      stock: product.stock || 100,
    });
    if (primaryImage?.url) {
      setUploadedImages([primaryImage.url]);
    }
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingProduct(null);
    setEditForm({});
    setUploadedImages([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: editForm.title,
          price: parseFloat(editForm.basePrice),
          discount: parseFloat(editForm.discountPercentage),
          brand: editForm.brand,
          category: editForm.category,
          description: editForm.description,
          specifications: editForm.specifications,
          inStock: editForm.inStock,
          stock: editForm.stock || 0,
          images: uploadedImages,
        }),
      });

      if (response.ok) {
        setInfoModalContent({
          title: 'Success!',
          message: 'Product updated successfully!'
        });
        setShowInfoModal(true);
        handleCloseEditModal();
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const data = await response.json();
        setInfoModalContent({
          title: 'Error',
          message: data.error || 'Failed to update product'
        });
        setShowInfoModal(true);
      }
    } catch (error) {
      console.error('Update error:', error);
      setInfoModalContent({
        title: 'Error',
        message: 'Failed to update product. Please try again.'
      });
      setShowInfoModal(true);
    }
  };

  // Find category
  const category = mockCategories.find(cat => cat.slug === categorySlug);

  // Get brands available in this category
  const getAvailableBrands = () => {
    const categoryProducts = products.filter(p => p.category.slug === categorySlug);
    return Array.from(new Set(categoryProducts.map(p => p.brand.name))).sort();
  };

  // Filter products
  let filteredProducts = products.filter(product => {
    const finalPrice = product.basePrice * (1 - product.discountPercentage / 100);
    const matchesCategory = product.category.slug === categorySlug;
    const matchesPrice = finalPrice >= priceRange.min && finalPrice <= priceRange.max;
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand.name);
    return matchesCategory && matchesPrice && matchesBrand;
  });

  // Apply sorting
  if (sortBy === 'price-low-high') {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      const priceA = a.basePrice * (1 - a.discountPercentage / 100);
      const priceB = b.basePrice * (1 - b.discountPercentage / 100);
      return priceA - priceB;
    });
  } else if (sortBy === 'price-high-low') {
    filteredProducts = [...filteredProducts].sort((a, b) => {
      const priceA = a.basePrice * (1 - a.discountPercentage / 100);
      const priceB = b.basePrice * (1 - b.discountPercentage / 100);
      return priceB - priceA;
    });
  } else if (sortBy === 'new-arrivals') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.id.localeCompare(a.id));
  } else if (sortBy === 'rating') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.averageRating - a.averageRating);
  } else if (sortBy === 'discount') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.discountPercentage - a.discountPercentage);
  } else if (sortBy === 'popularity') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.reviewCount - a.reviewCount);
  }

  // Update URL when price range changes
  const updatePriceFilter = (min: number, max: number) => {
    setPriceRange({ min, max });
    const params = new URLSearchParams();
    if (min > 0) params.set('min', min.toString());
    if (max < 200000) params.set('max', max.toString());
    const queryString = params.toString();
    router.push(`/category/${categorySlug}${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  const handleAddToCart = (product: any) => {
    addToCart(product.id);
  };

  const handleWishlistToggle = (product: any) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  // Category not found
  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h1 className="text-3xl font-bold mb-2">Category Not Found</h1>
          <p className="text-gray-600 mb-6">The category you&apos;re looking for doesn&apos;t exist.</p>
          <a
            href="/products"
            className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition font-semibold"
          >
            Browse All Products
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 text-white">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">{infoModalContent.title}</h3>
                <p className="text-gray-300 whitespace-pre-line text-sm leading-relaxed">
                  {infoModalContent.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition mt-4"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Edit Product Modal - Copy from products page */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Edit Product</h2>
              <button
                onClick={handleCloseEditModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <span className="text-2xl text-gray-500">×</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Images</label>
                <div className="flex items-start gap-3 flex-wrap">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition">
                    <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-xs text-gray-500 font-medium">Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Title and Brand */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Brand</label>
                  <input
                    type="text"
                    value={editForm.brand}
                    onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  placeholder="Fresh and pure full cream milk rich in calcium and protein. Perfect for tea, coffee, and daily nutrition."
                />
              </div>

              {/* Price, MRP, Discount, Stock */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    value={editForm.basePrice}
                    onChange={(e) => setEditForm({ ...editForm, basePrice: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">MRP (₹)</label>
                  <input
                    type="number"
                    value={editForm.basePrice}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    value={editForm.discountPercentage}
                    onChange={(e) => setEditForm({ ...editForm, discountPercentage: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stock</label>
                  <input
                    type="number"
                    value={editForm.stock || 0}
                    onChange={(e) => {
                      const stockValue = parseInt(e.target.value) || 0;
                      setEditForm({
                        ...editForm,
                        stock: stockValue,
                        inStock: stockValue > 0
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    min="0"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="Groceries">Groceries</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home">Home</option>
                  <option value="Books">Books</option>
                  <option value="Toys">Toys</option>
                  <option value="Beauty">Beauty</option>
                </select>
              </div>

              {/* Specifications */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Specifications (JSON format)
                </label>
                <textarea
                  value={editForm.specifications}
                  onChange={(e) => setEditForm({ ...editForm, specifications: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
                  placeholder='e.g. {"Color": "Space Gray", "RAM": "12GB"}'
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition font-semibold"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCloseEditModal}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Filter Products</h2>
              <button
                onClick={() => setShowFilterModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <span className="text-2xl text-gray-500">×</span>
              </button>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold mb-4 uppercase">Popular Brands</h3>
              <div className="grid grid-cols-2 gap-4">
                {getAvailableBrands().map((brand) => (
                  <label key={brand} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-4 py-3 rounded-lg transition">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => {
                        if (selectedBrands.includes(brand)) {
                          setSelectedBrands(selectedBrands.filter(b => b !== brand));
                        } else {
                          setSelectedBrands([...selectedBrands, brand]);
                        }
                      }}
                      className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-base font-medium">{brand}</span>
                  </label>
                ))}
              </div>

              {getAvailableBrands().length === 0 && (
                <p className="text-gray-500 text-center py-8">No brands available for this category</p>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-4">
              <button
                onClick={() => {
                  setSelectedBrands([]);
                }}
                className="flex-1 py-3 rounded-lg border-2 border-gray-300 font-semibold hover:bg-gray-50 transition"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 py-3 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sort Modal */}
      {showSortModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Sort By</h2>
              <button
                onClick={() => setShowSortModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <span className="text-2xl text-gray-500">×</span>
              </button>
            </div>

            <div className="p-4">
              {[
                { value: 'new-arrivals', label: 'New Arrivals' },
                { value: 'price-low-high', label: 'Price: Low to High' },
                { value: 'price-high-low', label: 'Price: High to Low' },
                { value: 'popularity', label: 'Popularity' },
                { value: 'rating', label: 'Customer Rating' },
                { value: 'discount', label: 'Discount' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value);
                    setShowSortModal(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition ${sortBy === option.value
                    ? 'bg-orange-50 text-orange-600 font-semibold'
                    : 'hover:bg-gray-50'
                    }`}
                >
                  {option.label}
                  {sortBy === option.value && <span className="float-right">✓</span>}
                </button>
              ))}

              {/* Clear Sort Button */}
              <button
                onClick={() => {
                  setSortBy('new-arrivals');
                  setShowSortModal(false);
                }}
                className="w-full text-center px-4 py-3 rounded-lg mt-4 border-2 border-gray-300 font-semibold hover:bg-gray-50 transition text-gray-700"
              >
                Clear Sort
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
          <p className="text-gray-600">{category.description}</p>
          <p className="text-sm text-gray-500 mt-2">{filteredProducts.length} products found</p>
        </div>

        {/* Filter and Sort Buttons */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex-1 lg:flex-none bg-white border border-gray-300 rounded-lg py-2 px-4 flex items-center justify-center gap-2 font-semibold text-sm hover:border-orange-500 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            FILTER
            {selectedBrands.length > 0 && (
              <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {selectedBrands.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowSortModal(true)}
            className="flex-1 lg:flex-none bg-white border border-gray-300 rounded-lg py-2 px-4 flex items-center justify-center gap-2 font-semibold text-sm hover:border-orange-500 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            SORT
          </button>
        </div>

        {/* Active Filters */}
        {selectedBrands.length > 0 && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            {selectedBrands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrands(selectedBrands.filter(b => b !== brand))}
                className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-orange-200"
              >
                {brand}
                <span className="text-orange-500">×</span>
              </button>
            ))}
            <button
              onClick={() => setSelectedBrands([])}
              className="text-sm text-orange-500 hover:text-orange-600 font-semibold ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="w-full">
          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-semibold mb-2">No products found</h2>
              <p className="text-gray-600 mb-6">Try adjusting your price range</p>
              <button
                onClick={() => updatePriceFilter(0, 200000)}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition font-semibold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="flex flex-col h-full group">
                  <ProductCard
                    product={{
                      ...product,
                      images: product.images.map(img => ({ ...img, isPrimary: false }))
                    } as any}
                    isAdmin={isAdmin}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
