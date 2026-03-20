'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    brand: string;
    category: string;
    price: number;
    discount: number;
    image: string;
    inStock: boolean;
    stock: number;
}

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQ, setSearchQ] = useState('');

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/products');
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products || []);
            }
        } finally { setLoading(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this product? This cannot be undone.')) return;
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (res.ok) setProducts(p => p.filter(x => x.id !== id));
        else alert('Failed to delete product');
    };

    const toggleStock = async (product: Product) => {
        const res = await fetch(`/api/products/${product.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...product, inStock: !product.inStock }),
        });
        if (res.ok) {
            const data = await res.json();
            setProducts(p => p.map(x => x.id === product.id ? { ...x, inStock: !product.inStock } : x));
        }
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchQ.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQ.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQ.toLowerCase())
    );

    return (
        <div className="p-1 lg:p-4 ">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Products</h1>
                    <p className="text-slate-500 mt-1 text-sm">{products.length} total products</p>
                </div>
                <a
                    href="/admin/products/add"
                    className="flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl hover:bg-orange-600 transition font-bold text-sm shadow-md shadow-orange-100 sm:w-auto w-full max-w-[160px] sm:max-w-none"
                >
                    <Plus className="w-4 h-4" />
                    <span className="truncate">Add Product</span>
                </a>
            </div>

            {/* Search */}
            <div className="mb-5">
                <input
                    type="text"
                    placeholder="Search products, category, brand..."
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    className="w-full max-w-sm px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto" />
                        <p className="mt-4 text-gray-500 text-sm">Loading products...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 font-medium">No products found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3 text-left font-bold text-gray-500 uppercase text-xs tracking-wider">Product</th>
                                    <th className="px-5 py-3 text-left font-bold text-gray-500 uppercase text-xs tracking-wider">Category</th>
                                    <th className="px-5 py-3 text-left font-bold text-gray-500 uppercase text-xs tracking-wider">Price</th>
                                    <th className="px-5 py-3 text-left font-bold text-gray-500 uppercase text-xs tracking-wider">Stock</th>
                                    <th className="px-5 py-3 text-right font-bold text-gray-500 uppercase text-xs tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={product.image || '/placeholder.png'}
                                                    alt={product.name}
                                                    className="w-11 h-11 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                                                />
                                                <div>
                                                    <p className="font-semibold text-slate-900 truncate max-w-[200px]">{product.name}</p>
                                                    <p className="text-xs text-slate-400">{product.brand}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium capitalize">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <p className="font-semibold text-slate-900">₹{product.price.toLocaleString('en-IN')}</p>
                                            {product.discount > 0 && (
                                                <p className="text-xs text-green-600 font-medium">{product.discount}% off</p>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <button
                                                onClick={() => toggleStock(product)}
                                                className="flex items-center gap-1.5 text-xs font-semibold transition"
                                                title="Toggle stock"
                                            >
                                                {product.inStock ? (
                                                    <>
                                                        <ToggleRight className="w-5 h-5 text-green-500" />
                                                        <span className="text-green-600">In Stock</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ToggleLeft className="w-5 h-5 text-red-400" />
                                                        <span className="text-red-500">Out of Stock</span>
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <a
                                                    href={`/admin/products/edit/${product.id}`}
                                                    className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </a>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
