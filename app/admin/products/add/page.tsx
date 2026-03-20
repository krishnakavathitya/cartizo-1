'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';

const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Groceries', 'Sports', 'Toys', 'Books'];

export default function AddProductPage() {
    const router = useRouter();
    const categories = CATEGORIES;
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: '',
        slug: '',
        brand: '',
        category: '',
        price: '',
        discount: '0',
        stock: '100',
        description: '',
        image: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => {
            const newForm = { ...prev, [name]: value };
            if (name === 'name') {
                newForm.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            }
            return newForm;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    price: parseFloat(form.price),
                    discount: parseFloat(form.discount || '0'),
                    stock: parseInt(form.stock || '0'),
                    images: form.image ? [{ url: form.image, altText: form.name, isPrimary: true }] : []
                })
            });

            if (!response.ok) throw new Error('Failed to commit to database');
            router.push('/admin/products');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition shadow-sm">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manual Inventory Entry</h1>
                            <p className="text-slate-500 text-sm font-medium">Create a new professional product listing</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-8">
                            <div>
                                <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-6">Core Identification</h2>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Technical Product Name *</label>
                                        <input name="name" value={form.name} onChange={handleChange} required
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none"
                                            placeholder="e.g. Sony WH-1000XM5 Wireless Headphones" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Manufacturer / Brand *</label>
                                            <input name="brand" value={form.brand} onChange={handleChange} required
                                                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none"
                                                placeholder="e.g. Sony" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Inventory Classification *</label>
                                            <select name="category" value={form.category} onChange={handleChange} required
                                                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none appearance-none">
                                                <option value="">Select Category</option>
                                                {categories.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-50">
                                <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-6">Commercial Details</h3>
                                <div className="grid grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Base MRP (₹) *</label>
                                        <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none"
                                            placeholder="0" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Markdown (%)</label>
                                        <input name="discount" type="number" min="0" max="100" value={form.discount} onChange={handleChange}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none"
                                            placeholder="0" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Units in Stock</label>
                                        <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none"
                                            placeholder="100" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-50">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Product Narrative / Description</label>
                                <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none resize-none"
                                    placeholder="Provide a professional description..." />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                            <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Media Asset</h2>
                            <div className="space-y-4">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Asset URL</label>
                                <input name="image" value={form.image} onChange={handleChange}
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-bold text-slate-500 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none"
                                    placeholder="https://images.unsplash.com/..." />

                                <div className="aspect-square w-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group">
                                    {form.image ? (
                                        <img src={form.image} alt="preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="text-center p-6">
                                            <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Preview</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Canonical Permalink Identifier</label>
                                <input name="slug" value={form.slug} onChange={handleChange}
                                    className="w-full px-5 py-3 bg-slate-100 border border-transparent rounded-2xl text-[10px] font-bold text-slate-400 cursor-not-allowed"
                                    placeholder="auto-generated" readOnly />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 text-[11px] font-black uppercase tracking-widest p-4 rounded-2xl animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <button type="submit" disabled={saving}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-60 disabled:shadow-none flex items-center justify-center gap-2 text-xs">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Commit to Database'}
                            </button>
                            <button type="button" onClick={() => setForm({ name: '', slug: '', brand: '', category: '', price: '', discount: '0', stock: '100', description: '', image: '' })}
                                className="w-full py-4 bg-white border border-slate-200 text-slate-400 font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 hover:text-slate-600 transition text-[10px]">
                                Clear Documentation
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
