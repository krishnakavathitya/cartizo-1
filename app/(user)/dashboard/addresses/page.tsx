'use client';

import { useAddresses } from '../graphql/hooks';
import { Plus, MapPin, Trash2, Home, Briefcase, MoreVertical } from 'lucide-react';
import { useState } from 'react';

export default function AddressesPage() {
    const { addresses, loading, error, createAddress, deleteAddress } = useAddresses();
    const [isAdding, setIsAdding] = useState(false);
    const [newAddress, setNewAddress] = useState({
        name: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        phone: '',
        type: 'Home' // For UI icon selection
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        await createAddress(newAddress);
        setIsAdding(false);
        setNewAddress({ name: '', street: '', city: '', state: '', postalCode: '', country: '', phone: '', type: 'Home' });
    };

    if (loading) return <div className="p-8 text-center animate-pulse">Loading addresses...</div>;
    if (error) return <div className="p-8 text-center text-rose-500">Error loading addresses</div>;

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Addresses</h1>
                    <p className="text-slate-500 text-sm">Manage your shipping and billing locations</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all shadow-lg shadow-slate-200 hover:shadow-orange-100"
                >
                    <Plus className="w-4 h-4" />
                    Add New Address
                </button>
            </div>

            {isAdding && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
                    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-lg shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Add New Address</h2>
                        <form onSubmit={handleCreate} className="space-y-3 sm:space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <input required placeholder="Full Name" className="p-2.5 sm:p-3 text-sm bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100 focus:border-orange-500 outline-none w-full" value={newAddress.name} onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} />
                                <input required placeholder="Phone Number" className="p-2.5 sm:p-3 text-sm bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100 focus:border-orange-500 outline-none w-full" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} />
                            </div>
                            <input required placeholder="Street Address" className="p-2.5 sm:p-3 text-sm bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100 focus:border-orange-500 outline-none w-full" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <input required placeholder="City" className="p-2.5 sm:p-3 text-sm bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100 focus:border-orange-500 outline-none w-full" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                                <input required placeholder="State / Province" className="p-2.5 sm:p-3 text-sm bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100 focus:border-orange-500 outline-none w-full" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <input required placeholder="Postal Code" className="p-2.5 sm:p-3 text-sm bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100 focus:border-orange-500 outline-none w-full" value={newAddress.postalCode} onChange={e => setNewAddress({ ...newAddress, postalCode: e.target.value })} />
                                <input required placeholder="Country" className="p-2.5 sm:p-3 text-sm bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100 focus:border-orange-500 outline-none w-full" value={newAddress.country} onChange={e => setNewAddress({ ...newAddress, country: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">Address Type</label>
                                <select
                                    value={newAddress.type}
                                    onChange={e => setNewAddress({ ...newAddress, type: e.target.value as 'Home' | 'Work' })}
                                    className="w-full p-2.5 sm:p-3 text-sm bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100 focus:border-orange-500 outline-none"
                                >
                                    <option value="Home">Home</option>
                                    <option value="Work">Work</option>
                                </select>
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
                                <button type="button" onClick={() => setIsAdding(false)} className="w-full sm:w-auto px-3 sm:px-5 py-2 text-xs sm:text-sm text-slate-500 font-bold hover:bg-gray-50 rounded-lg sm:rounded-xl transition-colors text-center">Cancel</button>
                                <button type="submit" className="w-full sm:w-auto px-4 sm:px-6 py-2 text-xs sm:text-sm bg-slate-900 text-white font-bold rounded-lg sm:rounded-xl hover:bg-orange-600 transition-colors shadow-lg text-center">Save Address</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((addr: any) => (
                    <div key={addr.id} className="group bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-lg transition-all duration-300 relative">
                        <div className="flex justify-between items-start mb-4">                                          
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                                    {addr.type === 'Work' ? <Briefcase className="w-6 h-6" /> : <Home className="w-6 h-6" />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{addr.type || 'Home'}</p>
                                </div>
                            </div>
                            {addr.isDefault && (
                                <span className="bg-slate-900 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wider">Default</span>
                            )}
                        </div>

                        <h3 className="font-bold text-lg text-slate-900 mb-1">{addr.name}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-4">
                            {addr.street}<br />
                            {addr.city}, {addr.state} {addr.postalCode}<br />
                            {addr.country}
                        </p>
                        <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <span className="text-slate-400">Phone:</span> {addr.phone}
                        </p>

                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => deleteAddress(addr.id)}
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {addresses.length === 0 && (
                    <div className="col-span-1 md:col-span-2 text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No addresses saved yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
