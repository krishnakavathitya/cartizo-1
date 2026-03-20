'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Groceries', 'Sports', 'Toys', 'Books'];

export default function EditProduct() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;

    const [categories, setCategories] = useState<string[]>(CATEGORIES);
    const [form, setForm] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/admin/categories')
            .then(r => r.json())
            .then(d => { if (d.categories?.length) setCategories(d.categories); });
    }, []);

    useEffect(() => {
        if (!productId) return;
        fetch(`/api/products/${productId}`)
            .then(r => r.json())
            .then(d => {
                if (d.product) {
                    setForm({
                        name: d.product.name || '',
                        slug: d.product.slug || '',
                        brand: d.product.brand || '',
                        category: d.product.category || '',
                        price: String(d.product.price || ''),
                        discount: String(d.product.discount || '0'),
                        stock: String(d.product.stock || '0'),
                        description: d.product.description || '',
                        image: d.product.image || '',
                        inStock: d.product.inStock !== false,
                    });
                }
            });
    }, [productId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((f: any) => ({ ...f, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    price: parseFloat(form.price),
                    discount: parseFloat(form.discount) || 0,
                    stock: parseInt(form.stock) || 0,
                    inStock: parseInt(form.stock) > 0,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                router.push('/admin/products');
            } else {
                setError(data.error || 'Failed to update product');
            }
        } finally { setSaving(false); }
    };

    if (!form) {
        return (
            <div className=" flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto" />
                    <p className="mt-4 text-gray-500 text-sm">Loading product...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Edit Product</h1>
                    <p className="text-slate-500 text-sm truncate max-w-xs">{form.name}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Product Details</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Product Name *</label>
                            <input name="name" value={form.name} onChange={handleChange} required
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Brand *</label>
                            <input name="brand" value={form.brand} onChange={handleChange} required
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Category *</label>
                            <select name="category" value={form.category} onChange={handleChange} required
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white">
                                <option value="">Select category</option>
                                {categories.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Price (₹) *</label>
                            <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Discount (%)</label>
                            <input name="discount" type="number" min="0" max="100" value={form.discount} onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Stock Quantity</label>
                            <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Description</label>
                        <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Image URL</label>
                        <input name="image" value={form.image} onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                            placeholder="https://..." />
                        {form.image && (
                            <img src={form.image} alt="preview" className="mt-2 w-20 h-20 rounded-xl object-cover border border-gray-100" />
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">{error}</div>
                )}

                <div className="flex gap-3">
                    <button type="button" onClick={() => router.back()}
                        className="flex-1 py-3 border border-gray-200 text-slate-600 font-bold rounded-xl hover:bg-gray-50 transition text-sm">
                        Cancel
                    </button>
                    <button type="submit" disabled={saving}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition text-sm disabled:opacity-60">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
