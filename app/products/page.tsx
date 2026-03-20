'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, Plus, ShoppingCart, Loader2 } from 'lucide-react';
import { useCart } from '@/lib/context/cart-context';
import { useWishlist } from '@/lib/context/wishlist-context';
import { useAuth } from '@/lib/context/auth-context';
import { ProductCard } from '@/components/ProductCard';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_PRODUCTS = gql`
  query GetProducts($filters: ProductFilters, $pagination: PaginationInput) {
    products(filters: $filters, pagination: $pagination) {
      items {
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
      total
      page
      pageSize
    }
  }
`;

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
    }
  }
`;

const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      title
      slug
    }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($productId: ID!, $input: UpdateProductInput!) {
    updateProduct(productId: $productId, input: $input) {
      id
      title
      slug
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($productId: ID!) {
    deleteProduct(productId: $productId)
  }
`;

export default function ProductsPage() {
  const router = useRouter();
  const [priceRange, setPriceRange] = useState(150000);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('new-arrivals');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState<{
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
  }>({ title: '', message: '' });
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  const { data: catData } = useQuery(GET_CATEGORIES);
  const categories = catData?.categories || [];

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { data: productsData, loading, fetchMore, refetch } = useQuery(GET_PRODUCTS, {
    variables: {
      filters: {
        categoryIds: selectedCategories.length > 0 ? selectedCategories : null,
        maxPrice: priceRange,
        search: searchQuery || null,
      },
      pagination: {
        page: 1,
        pageSize: 50,
        sortBy: sortBy === 'price-low-high' || sortBy === 'price-high-low' ? 'price' : sortBy,
        sortOrder: sortBy === 'price-low-high' ? 'asc' : 'desc'
      }
    },
    onCompleted: (data) => {
      setHasMore(data.products.hasMore);
    }
  });

  const handleLoadMore = () => {
    const nextPage = page + 1;
    fetchMore({
      variables: {
        pagination: {
          page: nextPage,
          pageSize: 50,
          sortBy: sortBy === 'price-low-high' || sortBy === 'price-high-low' ? 'price' : sortBy,
          sortOrder: sortBy === 'price-low-high' ? 'asc' : 'desc'
        }
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        setPage(nextPage);
        setHasMore(fetchMoreResult.products.hasMore);
        return {
          products: {
            ...fetchMoreResult.products,
            items: [...prev.products.items, ...fetchMoreResult.products.items]
          }
        };
      }
    });
  };          

  // Extract unique brands from all products (before filtering)
  const brands = useMemo(() => {
    const products = productsData?.products?.items || [];
    return Array.from(new Set(products.map((p: any) => p.brand?.name).filter(Boolean))) as string[];
  }, [productsData]);

  // Client-side brand filtering (since GraphQL doesn't support brand filter yet)
  const displayProducts = useMemo(() => {
    const products = productsData?.products?.items || [];
    if (!selectedBrand) return products;
    return products.filter((p: any) => p.brand?.name === selectedBrand);
  }, [productsData, selectedBrand]);

  const displayTotal = productsData?.products?.total || displayProducts.length;

  // Handle edit query parameter from other pages
  useEffect(() => {
    const editId = new URLSearchParams(window.location.search).get('edit');
    if (editId && productsData?.products?.items) {
      const productToEdit = productsData.products.items.find((p: any) => p.id === editId);
      if (productToEdit) {
        handleEdit(null as any, productToEdit);
        // Clear query param without refreshing
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [productsData]);

  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    onCompleted: () => {
      setInfoModalContent({ title: 'Success!', message: 'Product deleted successfully!' });
      setShowInfoModal(true);
      refetch();
    }
  });

  const [createProduct] = useMutation(CREATE_PRODUCT, {
    onCompleted: (data) => {
      const newProduct = data?.createProduct;
      setInfoModalContent({
        title: 'Success!',
        message: 'Product created successfully! It is now categorized in the marketplace.',
        actionLabel: 'View Asset Page',
        onAction: () => {
          setShowInfoModal(false);
          if (newProduct?.slug) router.push(`/products/${newProduct.slug}`);
        }
      });
      setShowInfoModal(true);
      setShowAddModal(false);
      refetch();
    }
  });

  const [updateProduct] = useMutation(UPDATE_PRODUCT, {
    onCompleted: (data) => {
      const updatedProduct = data?.updateProduct;
      setInfoModalContent({
        title: 'Success!',
        message: 'Product updated successfully!',
        actionLabel: 'View Asset Page',
        onAction: () => {
          setShowInfoModal(false);
          if (updatedProduct?.slug) router.push(`/products/${updatedProduct.slug}`);
        }
      });
      setShowInfoModal(true);
      setShowEditModal(false);
      refetch();
    }
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = {
      title: editForm.title,
      slug: editForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      description: editForm.description,
      basePrice: parseFloat(editForm.basePrice),
      discountPercentage: parseFloat(editForm.discountPercentage || 0),
      categoryId: editForm.category,
      brandId: editForm.brand,
      inStock: editForm.inStock !== undefined ? editForm.inStock : true,
      images: uploadedImages.map((url, idx) => ({
        url,
        altText: editForm.title,
        isPrimary: idx === 0,
        order: idx + 1
      }))
    };

    if (editingProduct) {
      updateProduct({ variables: { productId: editingProduct.id, input } });
    } else {
      createProduct({ variables: { input } });
    }
  };

  const handleDelete = async (e: React.MouseEvent, productId: string, productTitle: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${productTitle}"?`)) return;
    deleteProduct({ variables: { productId } });
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setEditForm({
      title: '',
      basePrice: '',
      discountPercentage: 0,
      brand: '',
      category: categories[0]?.name || 'Groceries',
      description: '',
      inStock: true,
    });
    setUploadedImages([]);
    setShowAddModal(true);
  };

  const handleEdit = (e: React.MouseEvent | null, product: any) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setEditingProduct(product);
    setEditForm({
      title: product.title,
      basePrice: product.basePrice,
      discountPercentage: product.discountPercentage,
      brand: product.brand?.name || '',
      category: product.category?.name || '',
      description: product.description || '',
      inStock: product.inStock,
    });
    setUploadedImages(product.images?.map((img: any) => img.url) || []);
    setShowEditModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] max-w-md w-full p-10 text-white shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-orange-600/20 rounded-2xl flex items-center justify-center mb-6">
              <Plus className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-2xl font-black mb-4 tracking-tight">{infoModalContent.title}</h3>
            <p className="text-slate-400 mb-10 font-medium leading-relaxed">{infoModalContent.message}</p>

            <div className="flex flex-col gap-3">
              {infoModalContent.onAction && infoModalContent.actionLabel && (
                <button
                  onClick={infoModalContent.onAction}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-5 rounded-2xl transition-all uppercase tracking-widest text-[10px] shadow-xl shadow-orange-900/20"
                >
                  {infoModalContent.actionLabel}
                </button>
              )}
              <button
                onClick={() => setShowInfoModal(false)}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${infoModalContent.onAction ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-orange-600 hover:bg-orange-500 text-white shadow-xl shadow-orange-900/20'}`}
              >
                {infoModalContent.onAction ? 'Dismiss' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar - Filters */}
          <aside className={`lg:w-72 flex-shrink-0 lg:block ${showMobileFilters ? 'block' : 'hidden'} sticky top-28 h-fit lg:h-[calc(100vh-140px)] overflow-y-auto scrollbar-hide`}>
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center justify-between lg:hidden mb-8">
                <h3 className="text-xl font-black text-slate-900">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-slate-400">✕</button>
              </div>
              <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Categories</h3>
                  {selectedCategories.length > 0 && (
                    <button onClick={() => setSelectedCategories([])} className="text-[10px] text-orange-600 font-black uppercase tracking-widest hover:text-orange-500">Clear</button>
                  )}
                </div>
                <div className="space-y-3">
                  {categories.map((cat: any) => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.name)}
                        onChange={() => {
                          if (selectedCategories.includes(cat.name)) {
                            setSelectedCategories(selectedCategories.filter(c => c !== cat.name));
                          } else {
                            setSelectedCategories([...selectedCategories, cat.name]);
                          }
                        }}
                        className="w-5 h-5 border-2 border-gray-100 rounded-lg checked:bg-orange-600 checked:border-orange-600 transition-all cursor-pointer appearance-none"
                      />
                      <span className={`text-sm font-bold transition-colors ${selectedCategories.includes(cat.name) ? 'text-orange-600' : 'text-slate-500'}`}>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-10 pt-8 border-t border-gray-50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Price Range</h3>
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">₹{priceRange.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-orange-600 mb-4"
                />
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>₹0</span>
                  <span>₹5L+</span>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Brand</h3>
                  {selectedBrand && (
                    <button onClick={() => setSelectedBrand(null)} className="text-[10px] text-orange-600 font-black uppercase tracking-widest hover:text-orange-500">Clear</button>
                  )}
                </div>
                <div className="space-y-3">
                  {brands.length > 0 ? (
                    brands.map((brand: string) => (
                      <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="brand"
                          checked={selectedBrand === brand}
                          onChange={() => setSelectedBrand(brand)}
                          className="w-5 h-5 border-2 border-gray-100 rounded-full checked:bg-orange-600 checked:border-orange-600 transition-all cursor-pointer appearance-none"
                        />
                        <span className={`text-sm font-bold transition-colors ${selectedBrand === brand ? 'text-orange-600' : 'text-slate-500'}`}>{brand}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 font-medium italic">No brands available</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full mt-10 lg:hidden bg-slate-900 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest"
              >
                Apply Filters
              </button>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">
                  {searchQuery ? `Search: ${searchQuery}` : 'Marketplace'}
                </h1>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{displayTotal} assets discovered</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden bg-white border border-gray-100 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 flex items-center gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                </button>
                {isAdmin && (
                  <button onClick={handleAdd} className="bg-orange-600 text-white font-black text-[10px] uppercase tracking-widest px-6 py-4 rounded-2xl hover:bg-orange-500 transition-all shadow-xl shadow-orange-100 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Asset
                  </button>
                )}
                <button onClick={() => setShowSortModal(true)} className="bg-white border border-gray-100 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> {sortBy.replace('-', ' ')}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white border border-gray-50 rounded-[2.5rem] p-6 animate-pulse space-y-4">
                    <div className="aspect-square bg-gray-50 rounded-[2rem]"></div>
                    <div className="h-4 bg-gray-50 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-50 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : displayProducts.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-[3rem] p-20 text-center">
                <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-8">
                  <ShoppingCart className="w-10 h-10 text-orange-200" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-4">No assets found</h2>
                <p className="text-slate-500 max-w-xs mx-auto mb-10 font-medium">Try adjusting your compliance parameters or resetting your filters.</p>
                <button onClick={() => { setSelectedCategories([]); setSelectedBrand(null); setPriceRange(500000); router.push('/products'); }} className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest px-10 py-5 rounded-2xl hover:bg-orange-600 transition-all">Clear Protocol</button>
              </div>
            ) : (
              <div className="space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8">
                  {displayProducts.map((product: any) => (
                    <div key={product.id} className="group relative flex flex-col h-full bg-white border border-gray-100 rounded-[2.5rem] p-4 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-100">
                      <ProductCard
                        product={product}
                        isAdmin={isAdmin}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    </div>
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center pt-8">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="px-10 py-5 bg-white border border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center gap-3 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      Load More Discovery
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showEditModal || showAddModal) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-12 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{showAddModal ? 'Create Asset' : 'Modify Asset'}</h3>
              <button onClick={() => { setShowEditModal(false); setShowAddModal(false); }} className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
              {/* Image Upload Protocol */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Asset Visuals</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group/img border border-gray-100 shadow-sm">
                      <img src={img} alt="Asset" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all font-black text-xs uppercase tracking-widest"
                      >
                        Revoke
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all group/upload">
                    <Plus className="w-6 h-6 text-slate-300 group-hover/upload:text-orange-500 transition-colors" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 group-hover/upload:text-orange-500 transition-colors">Upload</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Title</label>
                  <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Brand</label>
                  <input type="text" value={editForm.brand} onChange={e => setEditForm({ ...editForm, brand: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Valuation (₹)</label>
                  <input type="number" value={editForm.basePrice} onChange={e => setEditForm({ ...editForm, basePrice: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Discount (%)</label>
                  <input type="number" value={editForm.discountPercentage} onChange={e => setEditForm({ ...editForm, discountPercentage: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Category</label>
                  <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20">
                    {categories.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Description</label>
                <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 min-h-[120px]" />
              </div>

              <div className="flex items-center gap-4">
                <button type="submit" className="flex-1 bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-orange-600 transition-all uppercase tracking-widest text-xs shadow-xl shadow-slate-200">
                  {showAddModal ? 'Authorize Creation' : 'Record Amendments'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sort Modal */}
      {showSortModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowSortModal(false)}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 animate-in slide-in-from-bottom-10 duration-500" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black mb-8 text-slate-900">Sort Protocol</h3>
            <div className="space-y-2">
              {[
                { label: 'Recently Acquired', value: 'new-arrivals' },
                { label: 'Evaluation: Low to High', value: 'price-low-high' },
                { label: 'Evaluation: High to Low', value: 'price-high-low' },
                { label: 'Customer Sentiment', value: 'rating' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSortBy(opt.value); setShowSortModal(false); }}
                  className={`w-full text-left p-5 rounded-2xl font-bold text-sm transition-all ${sortBy === opt.value ? 'bg-orange-600 text-white shadow-xl shadow-orange-100' : 'bg-gray-50 text-slate-600 hover:bg-slate-900 hover:text-white'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
