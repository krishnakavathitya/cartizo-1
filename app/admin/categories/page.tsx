'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';

export default function AdminCategories() {
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCat, setNewCat] = useState('');
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories || []);
            }
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchCategories(); }, []);

    const addCategory = async    (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCat.trim()) return;
        setAdding(true);
        setError('');
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCat.trim() }),
            });
            const data = await res.json();
            if (res.ok) {
                setCategories(data.categories);
                setNewCat('');
            } else {
                setError(data.error || 'Failed to add category');
            }
        } finally { setAdding(false); }
    };

    const deleteCategory = async (name: string) => {
        if (!confirm(`Delete category "${name}"?`)) return;
        const res = await fetch('/api/admin/categories', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        if (res.ok) {
            const data = await res.json();
            setCategories(data.categories);
        }
    };

    return (
        <div className="p-1 lg:p-4 space-y-5 sm:space-y-6">
            <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Categories</h1>
                <p className="text-slate-500 mt-0.5 text-sm">{categories.length} categories</p>
            </div>

            {/* Add form */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-0">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Add New Category</h2>
                <form onSubmit={addCategory} className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Category name (e.g. Sports)"
                        value={newCat}
                        onChange={e => setNewCat(e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 bg-gray-50/50 focus:bg-white transition-all shadow-sm"
                    />
                    <button
                        type="submit"
                        disabled={adding}
                        className="flex items-center justify-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl hover:bg-orange-600 transition font-black text-sm disabled:opacity-60 shadow-md shadow-orange-100 w-full sm:w-auto"
                    >
                        <Plus className="w-4 h-4" />
                        Add
                    </button>
                </form>
                {error && <p className="mt-3 text-xs text-red-500 font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 inline-block">{error}</p>}
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto" />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 font-medium">No categories yet.</div>
                ) : (
                    <ul className="divide-y divide-gray-50">
                        {categories.map(cat => (
                            <li key={cat} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/60 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                        <Tag className="w-4 h-4 text-orange-500" />
                                    </div>
                                    <span className="font-semibold text-slate-800 capitalize">{cat}</span>
                                </div>
                                <button
                                    onClick={() => deleteCategory(cat)}
                                    className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
                                    title="Delete category"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
