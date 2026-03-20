'use client';

import { useState, useEffect } from 'react';
import { MapPin, Plus, Edit, Trash2, ShieldCheck, X, Navigation, Loader } from 'lucide-react';

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Fetch addresses on mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/addresses');
      if (!response.ok) throw new Error('Failed to fetch addresses');
      const data = await response.json();
      setAddresses(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load addresses');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you certain you wish to decommission this physical location?')) {
      try {
        setIsSubmitting(true);
        const response = await fetch(`/api/addresses/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete address');
        setAddresses(addresses.filter(addr => addr.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete address');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/addresses/${id}/set-default`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to set default address');
      const updatedAddress = await response.json();
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    setFormData({
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setError(null);

      if (editingId) {
        // Update existing address
        const response = await fetch(`/api/addresses/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error('Failed to update address');
        const updatedAddress = await response.json();
        setAddresses(addresses.map(addr =>
          addr.id === editingId
            ? updatedAddress
            : addr
        ));
      } else {
        // Create new address
        const response = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error('Failed to add address');
        const newAddress = await response.json();
        setAddresses([...addresses, newAddress]);
      }

      setFormData({ name: '', phone: '', address: '', city: '', state: '', pincode: '' });
      setShowAddForm(false);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-red-600 font-bold text-sm">!</span>
          </div>
          <div className="flex-1">
            <h3 className="font-black text-red-900 text-sm uppercase tracking-widest">Error</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[3rem] py-20 flex flex-col items-center justify-center gap-6">
          <Loader className="w-12 h-12 text-slate-400 animate-spin" />
          <p className="text-slate-600 font-semibold uppercase tracking-widest text-sm">Loading your addresses...</p>
        </div>
      )}

      {!loading && (
        <>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl font-display font-black text-slate-900 tracking-tight leading-none mb-4">Logistical Bases</h1>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Management of all physical reception protocol points
              </p>
            </div>
            {!showAddForm && (
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setEditingId(null);
                  setFormData({ name: '', phone: '', address: '', city: '', state: '', pincode: '' });
                }}
                disabled={isSubmitting}
                className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                Register New Base
              </button>
            )}
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="relative group bg-white border-2 border-indigo-600 rounded-[3rem] p-12 shadow-3xl shadow-indigo-100/50 overflow-hidden animate-in zoom-in duration-500">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full blur-3xl -mr-24 -mt-24"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl font-display font-black text-slate-900">
                    {editingId ? 'Modify Configuration' : 'Establish Operational Base'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingId(null);
                    }}
                    disabled={isSubmitting}
                    className="w-12 h-12 rounded-2xl hover:bg-gray-50 flex items-center justify-center transition-colors border border-gray-100 disabled:opacity-50"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Universal Identity *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={isSubmitting}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none font-medium text-slate-900 disabled:opacity-50"
                        placeholder="Personnel Name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Communication Channel *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={isSubmitting}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none font-medium text-slate-900 disabled:opacity-50"
                        placeholder="+91 00000 00000"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Physical Coordinates *</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={isSubmitting}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none font-medium text-slate-900 disabled:opacity-50"
                      placeholder="Complete base location details..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Municipal Sector *</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        disabled={isSubmitting}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none font-medium text-slate-900 disabled:opacity-50"
                        placeholder="City"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Administrative Region *</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        disabled={isSubmitting}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none font-medium text-slate-900 disabled:opacity-50"
                        placeholder="State"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Postal Key *</label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        disabled={isSubmitting}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none font-medium text-slate-900 text-center tracking-widest disabled:opacity-50"
                        placeholder="000000"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-[2] bg-slate-900 text-white py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        editingId ? 'Commit Modification' : 'Establish Base'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingId(null);
                      }}
                      disabled={isSubmitting}
                      className="flex-1 border-2 border-gray-200 text-slate-600 py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                      Abort
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Address List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {addresses.map((address) => (
              <div key={address.id} className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-8 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-100/30 transition-all duration-500">
                {address.isDefault && (
                  <div className="absolute top-6 right-6 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck className="w-3 h-3" />
                    Primary Base
                  </div>
                )}

                <div className="flex items-start gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm border border-gray-100">
                    <Navigation className="w-6 h-6" />
                  </div>
                  <div className="flex-1 mt-1">
                    <h3 className="font-display font-black text-2xl text-slate-900 mb-1">{address.name}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-4">{address.phone}</p>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed mb-1">{address.address}</p>
                    <p className="text-sm font-black text-slate-900 px-3 py-1 bg-gray-50 rounded-lg inline-block uppercase tracking-tighter">
                      {address.city}, {address.state} — {address.pincode}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-8 border-t border-gray-50">
                  <button
                    onClick={() => handleEdit(address)}
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-slate-600 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-50"
                  >
                    <Edit className="w-4 h-4" />
                    Revise
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 border border-rose-100 text-rose-500 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Decommission
                  </button>
                </div>

                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    disabled={isSubmitting}
                    className="w-full mt-6 text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-600 hover:underline transition-all disabled:opacity-50"
                  >
                    Establish as Primary Infrastructure
                  </button>
                )}
              </div>
            ))}

            {!loading && addresses.length === 0 && !showAddForm && (
              <div className="col-span-full py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100 text-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                  <MapPin className="w-10 h-10 text-slate-200" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-display font-black text-slate-900 mb-2">Null Coordinates</h3>
                <p className="text-slate-500 max-w-xs mx-auto mb-10 font-medium">No logistical reception points registered. Establish your first base to enable acquisition delivery.</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-slate-200"
                >
                  Register First Base
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
