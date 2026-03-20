'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/context/cart-context';
import { useAuth } from '@/lib/context/auth-context';
import { useOrders } from '@/lib/context/orders-context';
import { useAddresses, Address } from '@/lib/context/address-context';
import { useRouter } from 'next/navigation';
import { MapPin, X, ChevronLeft, CreditCard, Wallet, Banknote, CheckCircle2, ShieldCheck, PartyPopper, ArrowRight } from 'lucide-react';

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { addresses, createAddress, updateAddress, loading: addressesLoading } = useAddresses();
  const router = useRouter();

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<'upi' | 'card' | 'cod'>('upi');
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string>('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Payment form validation state
  const [upiIdentifier, setUpiIdentifier] = useState('');
  const [upiError, setUpiError] = useState('');
  
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [cardErrors, setCardErrors] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  // Set initial selected address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    type: 'Home' as 'Home' | 'Work',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createAddress(formData);
      // The mutation returns the new address
      const newAddress = result.data?.createAddress;

      if (newAddress) {
        setSelectedAddressId(newAddress.id);
        // Automatically proceed to payment step
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      setFormData({ name: user?.name || '', phone: '', street: '', city: '', state: '', postalCode: '', country: '', type: 'Home' });
      setShowAddressForm(false);
    } catch (err) {
      console.error('Error adding address:', err);
      alert('Failed to add address. Please check your data or connection.');
    }
  };

  const handleEditAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddress) {
      try {
        await updateAddress(editingAddress.id, formData);
        setEditingAddress(null);
        setFormData({ name: user?.name || '', phone: '', street: '', city: '', state: '', postalCode: '', country: '', type: 'Home' });
        setShowAddressForm(false);
      } catch (err) {
        console.error('Error updating address:', err);
        alert('Failed to update address.');
      }
    }
  };

  const openEditForm = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country || 'India  ',
      type: address.type || 'Home',
    });
    setShowAddressForm(true);
  };

  const handleDeliverHere = (addressId: string) => {
    setSelectedAddressId(addressId);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setIsPlacingOrder(true);

    try {
      const paymentMethod = selectedPayment === 'upi' ? 'UPI' : selectedPayment === 'card' ? 'CREDIT_CARD' : 'COD';
      const result = await placeOrder({
        addressId: selectedAddressId,
        paymentMethod,
      });

      if (result.data?.createOrder) {
        // Clear the cart after successful order
        await clearCart();

        setPlacedOrderNumber(result.data.createOrder.orderNumber);
        setStep(4);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // UPI Validation
  const validateUPI = () => {
    let isValid = true;
    const newErrors = { upi: '' };

    if (!upiIdentifier.trim()) {
      newErrors.upi = 'Digital Identifier is required';
      isValid = false;
    } else if (upiIdentifier.trim().length < 3) {
      newErrors.upi = 'Please enter a valid identifier';
      isValid = false;
    }

    setUpiError(newErrors.upi);
    return isValid;
  };

  // Card Validation
  const validateCard = () => {
    const newErrors = { number: '', name: '', expiry: '', cvv: '' };
    let isValid = true;

    if (!cardData.number.trim()) {
      newErrors.number = 'Card number is required';
      isValid = false;
    } else if (cardData.number.replace(/\s/g, '').length !== 16) {
      newErrors.number = 'Card number must be 16 digits';
      isValid = false;
    }

    if (!cardData.name.trim()) {
      newErrors.name = 'Cardholder name is required';
      isValid = false;
    }

    if (!cardData.expiry.trim()) {
      newErrors.expiry = 'Expiry date is required';
      isValid = false;
    } else if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      newErrors.expiry = 'Format: MM/YY';
      isValid = false;
    }

    if (!cardData.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
      isValid = false;
    } else if (cardData.cvv.length !== 3) {
      newErrors.cvv = 'CVV must be 3 digits';
      isValid = false;
    }

    setCardErrors(newErrors);
    return isValid;
  };

  const handleUPIVerify = () => {
    if (validateUPI()) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCardVerify = () => {
    if (validateCard()) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Authentication Required</h2>
          <p className="text-slate-600">Please sign in to proceed with checkout.</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="flex items-center justify-between relative">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-700 ease-in-out"
              style={{ width: `${(step - 1) * 50}%` }}
            ></div>

            {/* Steps */}
            {[
              { id: 1, label: 'Protocols', sub: 'Address' },
              { id: 2, label: 'Auth', sub: 'Payment' },
              { id: 3, label: 'Confirm', sub: 'Summary' }
            ].map((s) => (
              <div key={s.id} className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${step >= s.id ? 'bg-slate-900 text-white shadow-indigo-200' : 'bg-white text-slate-300 border border-gray-100 shadow-sm'
                  } ${step === s.id ? 'scale-110 ring-4 ring-indigo-50' : ''}`}>
                  {step > s.id ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : <span className="text-base sm:text-xl font-black">{s.id}</span>}
                </div>
                <div className="absolute top-12 sm:top-16 whitespace-nowrap text-center">
                  <p className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${step >= s.id ? 'text-indigo-600' : 'text-slate-400'}`}>{s.label}</p>
                  <p className={`hidden xs:block text-[8px] sm:text-[9px] font-bold uppercase tracking-tighter mt-0.5 ${step >= s.id ? 'text-slate-900' : 'text-slate-300'}`}>{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-24">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Step 1: Delivery Address */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-6">
                  <div>
                    <h2 className="text-2xl sm:text-4xl font-display font-black text-slate-900 tracking-tight mb-2">Delivery Infrastructure</h2>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Designate your operational base</p>
                  </div>
                </div>

                {/* Address List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addressesLoading ? (
                    [1, 2].map(i => <div key={i} className="h-64 rounded-[2.5rem] bg-gray-50 animate-pulse" />)
                  ) : (
                    addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`group relative border-2 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 transition-all duration-500 ${selectedAddressId === address.id
                          ? 'border-indigo-600 bg-indigo-50/30'
                          : 'border-gray-100 bg-white hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-100/30'
                          }`}
                      >
                        <div className="flex items-start justify-between mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <MapPin className={`w-5 h-5 ${selectedAddressId === address.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                          </div>
                          {address.isDefault && (
                            <span className="bg-slate-900 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                              Primary
                            </span>
                          )}
                        </div>

                        <div className="space-y-4 mb-8">
                          <div>
                            <h3 className="font-display font-black text-xl text-slate-900">{address.name}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{address.phone}</p>
                          </div>
                          <p className="text-sm font-medium text-slate-600 leading-relaxed">
                            {address.street},<br />
                            {address.city}, {address.state} - {address.postalCode}<br />
                            {address.country}
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => openEditForm(address)}
                            className="flex-1 border border-gray-200 text-slate-600 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white hover:border-indigo-200 transition-all"
                          >
                            Modify
                          </button>
                          <button
                            onClick={() => handleDeliverHere(address.id)}
                            className="flex-1 bg-slate-900 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
                          >
                            Establish
                          </button>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Add New Address Button */}
                  {!showAddressForm && (
                    <button
                      onClick={() => {
                        setEditingAddress(null);
                        setFormData({ name: user?.name || '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'India', type: 'Home' });
                        setShowAddressForm(true);
                      }}
                      className="border-2 border-dashed border-gray-200 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/20 transition-all group"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-2xl sm:text-3xl font-light">+</span>
                      </div>
                      <span className="font-black text-[10px] sm:text-xs uppercase tracking-widest">Register New Base</span>
                    </button>
                  )}
                </div>

                {/* Address Form Modal/Section */}
                {showAddressForm && (
                  <div className="border-2 border-indigo-600 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 bg-white shadow-3xl shadow-indigo-100/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16"></div>

                    <div className="flex items-center justify-between mb-8 sm:mb-10 relative z-10">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-display font-black text-slate-900">
                          {editingAddress ? 'Update Infrastructure' : 'New Operational Base'}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Specify logistical parameters</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddress(null);
                          setFormData({ name: user?.name || '', phone: '', street: '', city: '', state: '', postalCode: '', country: '', type: 'Home' });
                        }}
                        className="w-10 h-10 rounded-xl hover:bg-gray-50 flex items-center justify-center transition-colors"
                      >
                        <X className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>

                    <form onSubmit={editingAddress ? handleEditAddress : handleAddAddress} className="space-y-6 relative z-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Identity *</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none font-medium text-slate-900"
                            placeholder="Recipient Name"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Communication Line *</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none font-medium text-slate-900"
                            placeholder="+91 00000 00000"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tactical Location (Street) *</label>
                        <textarea
                          name="street"
                          value={formData.street}
                          onChange={handleInputChange}
                          required
                          rows={3}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none font-medium text-slate-900"
                          placeholder="Complete physical street details..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">District (City) *</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none font-medium text-slate-900"
                            placeholder="City"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Region (State) *</label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            required
                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none font-medium text-slate-900"
                            placeholder="State"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Postal Code *</label>
                          <input
                            type="text"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            required
                            pattern="[0-9]{6}"
                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none font-medium text-slate-900"
                            placeholder="000 000"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Country *</label>
                          <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            required
                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none font-medium text-slate-900"
                            placeholder="Country"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Location Type *</label>
                        <select
                          name="type"
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: (e.target.value as 'Home' | 'Work') })}
                          required
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none font-medium text-slate-900"
                        >
                          <option value="Home">Home</option>
                          <option value="Work">Work</option>
                        </select>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddress(null);
                          setFormData({ name: user?.name || '', phone: '', street: '', city: '', state: '', postalCode: '', country: '', type: 'Home' });
                          }}
                          className="flex-1 bg-white border border-gray-200 text-slate-600 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                        >
                          Abort
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
                        >
                          {editingAddress ? 'Revise Base' : 'Register Base'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-4xl font-display font-black text-slate-900 tracking-tight mb-2">Financial Authorization</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select your preferred transactional protocol</p>
                </div>

                {/* Selected Address Summary Bar */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-center sm:text-left">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Base Verified</p>
                      <p className="text-sm font-bold text-slate-800">
                        {addresses.find(a => a.id === selectedAddressId)?.street.substring(0, 30)}...
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-2 bg-white border border-emerald-200 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                  >
                    Modify
                  </button>
                </div>

                {/* Payment Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { id: 'upi', label: 'Digital Transfer', sub: 'Unified Payments', icon: Wallet },
                    { id: 'card', label: 'Credit Control', sub: 'Instant Clearance', icon: CreditCard },
                    { id: 'cod', label: 'Liquid Asset', sub: 'Upon Reception', icon: Banknote },
                  ].map((p) => (
                    <div
                      key={p.id}
                      className={`relative cursor-pointer rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border-2 transition-all duration-500 overflow-hidden group ${selectedPayment === p.id
                        ? 'border-indigo-600 bg-indigo-50/20'
                        : 'border-gray-100 bg-white hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-100/30'
                        }`}
                      onClick={() => setSelectedPayment(p.id as any)}
                    >
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${selectedPayment === p.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-gray-50 text-slate-400 group-hover:scale-110'
                        }`}>
                        <p.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>

                      <div className="relative z-10">
                        <p className={`text-[10px] font-black uppercase tracking-[0.15em] mb-1 ${selectedPayment === p.id ? 'text-indigo-600' : 'text-slate-400'}`}>{p.sub}</p>
                        <h3 className="font-display font-black text-xl text-slate-900 tracking-tight">{p.label}</h3>
                      </div>

                      <div className={`absolute -bottom-2 -right-2 w-16 h-16 transition-opacity duration-500 ${selectedPayment === p.id ? 'opacity-100' : 'opacity-0'}`}>
                        <CheckCircle2 className="w-12 h-12 text-indigo-500/10" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Specific Payment Forms */}
                <div className="mt-8">
                  {selectedPayment === 'upi' && (
                    <div className="border-2 border-indigo-600 rounded-[3rem] p-10 bg-white animate-in zoom-in duration-300">
                      <h3 className="text-2xl font-display font-black text-slate-900 mb-2">Protocol Identification</h3>
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-8">Establish secure digital handshake</p>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Digital Identifier *</label>
                          <input
                            type="text"
                            placeholder="identifier@handshake"
                            value={upiIdentifier}
                            onChange={(e) => {
                              setUpiIdentifier(e.target.value);
                              if (upiError) setUpiError(''); // Clear error on input change
                            }}
                            className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all outline-none font-medium text-slate-900 ${
                              upiError 
                                ? 'border-red-500 focus:border-red-500' 
                                : 'border-gray-100 focus:border-indigo-500'
                            }`}
                          />
                          {upiError && (
                            <p className="text-xs font-bold text-red-600 uppercase tracking-tighter mt-2 ml-1 flex items-center gap-1">
                              <span>⚠</span> {upiError}
                            </p>
                          )}
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-2 ml-1">Supported: GPay, PhonePe, Paytm, BHIM</p>
                        </div>
                        <button
                          onClick={handleUPIVerify}
                          className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
                        >
                          Verify & Proceed
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedPayment === 'card' && (
                    <div className="border-2 border-indigo-600 rounded-[3rem] p-10 bg-white animate-in zoom-in duration-300">
                      <h3 className="text-2xl font-display font-black text-slate-900 mb-2">Asset Encryption</h3>
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-8">End-to-end encrypted clearance</p>

                      <form className="space-y-6" autoComplete="off">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Universal Asset Number *</label>
                          <input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            autoComplete="off"
                            value={cardData.number}
                            onChange={(e) => {
                              setCardData({ ...cardData, number: e.target.value });
                              if (cardErrors.number) setCardErrors({ ...cardErrors, number: '' });
                            }}
                            className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all outline-none font-medium text-slate-900 tracking-widest ${
                              cardErrors.number 
                                ? 'border-red-500 focus:border-red-500' 
                                : 'border-gray-100 focus:border-indigo-500'
                            }`}
                          />
                          {cardErrors.number && (
                            <p className="text-xs font-bold text-red-600 uppercase tracking-tighter mt-1 ml-1 flex items-center gap-1">
                              <span>⚠</span> {cardErrors.number}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Authorized Holder *</label>
                          <input
                            type="text"
                            placeholder="Full name as registered"
                            autoComplete="off"
                            value={cardData.name}
                            onChange={(e) => {
                              setCardData({ ...cardData, name: e.target.value });
                              if (cardErrors.name) setCardErrors({ ...cardErrors, name: '' });
                            }}
                            className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all outline-none font-medium text-slate-900 uppercase ${
                              cardErrors.name 
                                ? 'border-red-500 focus:border-red-500' 
                                : 'border-gray-100 focus:border-indigo-500'
                            }`}
                          />
                          {cardErrors.name && (
                            <p className="text-xs font-bold text-red-600 uppercase tracking-tighter mt-1 ml-1 flex items-center gap-1">
                              <span>⚠</span> {cardErrors.name}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Temporal Expiration *</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              maxLength={5}
                              autoComplete="off"
                              value={cardData.expiry}
                              onChange={(e) => {
                                setCardData({ ...cardData, expiry: e.target.value });
                                if (cardErrors.expiry) setCardErrors({ ...cardErrors, expiry: '' });
                              }}
                              className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all outline-none font-medium text-slate-900 text-center ${
                                cardErrors.expiry 
                                  ? 'border-red-500 focus:border-red-500' 
                                  : 'border-gray-100 focus:border-indigo-500'
                              }`}
                            />
                            {cardErrors.expiry && (
                              <p className="text-xs font-bold text-red-600 uppercase tracking-tighter mt-1 ml-1 flex items-center gap-1">
                                <span>⚠</span> {cardErrors.expiry}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Verification Key *</label>
                            <input
                              type="password"
                              placeholder="CVV"
                              maxLength={3}
                              autoComplete="new-password"
                              value={cardData.cvv}
                              onChange={(e) => {
                                setCardData({ ...cardData, cvv: e.target.value });
                                if (cardErrors.cvv) setCardErrors({ ...cardErrors, cvv: '' });
                              }}
                              className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all outline-none font-medium text-slate-900 text-center ${
                                cardErrors.cvv 
                                  ? 'border-red-500 focus:border-red-500' 
                                  : 'border-gray-100 focus:border-indigo-500'
                              }`}
                            />
                            {cardErrors.cvv && (
                              <p className="text-xs font-bold text-red-600 uppercase tracking-tighter mt-1 ml-1 flex items-center gap-1">
                                <span>⚠</span> {cardErrors.cvv}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="bg-slate-900/5 rounded-2xl p-4 flex items-center gap-3">
                          <ShieldCheck className="w-5 h-5 text-indigo-600" />
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PCI-DSS Compliant Infrastructure Verified</p>
                        </div>

                        <button
                          type="button"
                          onClick={handleCardVerify}
                          className="w-full bg-slate-900 text-white py-3 sm:py-5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
                        >
                          Authorize Transaction
                        </button>
                      </form>
                    </div>
                  )}

                  {selectedPayment === 'cod' && (
                    <div className="border-2 border-indigo-600 rounded-[3rem] p-10 bg-white animate-in zoom-in duration-300">
                      <div className="flex items-start gap-6">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center shrink-0">
                          <Banknote className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-display font-black text-slate-900 mb-2">Physical Asset Exchange</h3>
                          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-6">Valuation settlement upon reception</p>
                          <div className="space-y-4 max-w-md">
                            <p className="text-sm font-medium text-slate-600 leading-relaxed">
                              Selection of this protocol designates settlement in physical currency upon handover at the specified base.
                            </p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requirement: Exact valuation preferred</p>
                            <button
                              onClick={() => setStep(3)}
                              className="inline-flex bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95 mt-4"
                            >
                              Confirm Handover Protocol
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Order Summary */}
            {step === 3 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-4xl font-display font-black text-slate-900 tracking-tight mb-2">Final Manifest</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Review all acquisition parameters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Summary: Destination */}
                  <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">Destination Base</p>
                    <div className="flex gap-4">
                      <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                      <div>
                        {(() => {
                          const addr = addresses.find(a => a.id === selectedAddressId);
                          return (
                            <>
                              <p className="font-black text-slate-900 mb-1">{addr?.name}</p>
                              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                {addr?.street},<br />
                                {addr?.city}, {addr?.state} - {addr?.postalCode}
                              </p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-3">{addr?.phone}</p>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Summary: Payment */}
                  <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">Settlement Protocol</p>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0">
                        {selectedPayment === 'upi' && <Wallet className="w-5 h-5 text-indigo-600" />}
                        {selectedPayment === 'card' && <CreditCard className="w-5 h-5 text-indigo-600" />}
                        {selectedPayment === 'cod' && <Banknote className="w-5 h-5 text-indigo-600" />}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 mb-1 uppercase tracking-tight">
                          {selectedPayment === 'upi' ? 'Unified Payments Interface' : selectedPayment === 'card' ? 'Universal Credit Asset' : 'Physical Cash Settlement'}
                        </p>
                        <p className="text-sm font-medium text-slate-600">Verification complete. Authorization pending final manual trigger.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary: Item List */}
                <div className="space-y-6">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Curated Items Manifest</p>
                  <div className="bg-white border border-gray-100 rounded-[3rem] overflow-hidden">
                    {items.map((item, idx) => {
                      const discountedPrice = Math.round((item.product?.basePrice || 0) * (1 - (item.product?.discountPercentage || 0) / 100));
                      return (
                        <div key={item.id} className={`flex items-center gap-6 p-6 ${idx !== items.length - 1 ? 'border-b border-gray-50' : ''}`}>
                          <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                            <img
                              src={item.product?.images?.[0]?.url || ''}
                              alt={item.product?.title || ''}
                              className="w-full h-full object-cover mix-blend-multiply"
                            />
                          </div>
                          <div className="flex-1">
                            <p className={`text-[9px] font-black uppercase tracking-widest mb-1 text-slate-400`}>Series Acquisition</p>
                            <h4 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{item.product?.title}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs font-black text-slate-900">₹{discountedPrice.toLocaleString()}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Row Valuation</p>
                            <p className="text-lg font-black text-slate-900">
                              ₹{(discountedPrice * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Place Order CTA */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-white border border-gray-200 text-slate-600 py-5 rounded-[1.8rem] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Revert
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="flex-[2] bg-slate-900 text-white py-5 rounded-[1.8rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 active:scale-95 group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isPlacingOrder ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing Order...
                      </span>
                    ) : (
                      <>
                        Finalize Acquisition
                        <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Executed under statutory regulatory framework and protocols</p>
              </div>
            )}

            {/* Step 4: Order Success */}
            {step === 4 && (
              <div className="flex flex-col items-center justify-center py-16 animate-in fade-in zoom-in duration-700">
                <div className="relative mb-10">
                  <div className="w-32 h-32 rounded-full bg-emerald-50 flex items-center justify-center animate-bounce">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                    <PartyPopper className="w-5 h-5 text-amber-500" />
                  </div>
                </div>

                <h2 className="text-4xl font-display font-black text-slate-900 tracking-tight mb-3 text-center">
                  Order Placed Successfully! 🎉
                </h2>
                <p className="text-slate-500 font-medium text-center max-w-md mb-4">
                  Your order has been confirmed and is being processed. You&apos;ll receive updates on your order status.
                </p>

                {placedOrderNumber && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-8 py-4 mb-10">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Order Number</p>
                    <p className="text-2xl font-black text-emerald-700 tracking-tight">{placedOrderNumber}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <button
                    onClick={() => router.push('/dashboard/orders')}
                    className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-[0.15em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                  >
                    View My Orders
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => router.push('/products')}
                    className="flex-1 bg-white border-2 border-gray-200 text-slate-700 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.15em] hover:border-indigo-300 transition-all"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Price Details Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 sticky top-32 shadow-2xl shadow-slate-200 overflow-hidden text-white">
              {/* Decorative Element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

              <h2 className="text-2xl font-display font-black text-white mb-8 relative z-10">Financial Summary</h2>

              <div className="space-y-6 mb-10 relative z-10">
                <div className="flex justify-between items-center group">
                  <span className="text-xs sm:text-sm font-bold text-slate-400 group-hover:text-indigo-400 transition-colors">Gross Valuation ({totalItems} units)</span>
                  <span className="font-black text-white text-sm sm:text-lg">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-xs sm:text-sm font-bold text-slate-400 group-hover:text-indigo-400 transition-colors">Logistical Allocation</span>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-lg uppercase tracking-widest">Complimentary</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-sm font-bold text-slate-400 group-hover:text-indigo-400 transition-colors">Statutory GST</span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inclusive</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-8 mb-10 relative z-10">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Acquisition</span>
                    <span className="text-2xl sm:text-4xl font-black text-white tracking-tighter">₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {totalPrice > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 relative z-10 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Complimentary Delivery Established</p>
                </div>
              )}

              <div className="flex items-center gap-3 justify-center text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] relative z-10">
                <CheckCircle2 className="w-3 h-3 text-indigo-500" />
                Validated Infrastructure
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
