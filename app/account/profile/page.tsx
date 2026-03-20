'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { Camera, User, Mail, Phone, Save, Loader2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProfileSettingsPage() {
  const { user, refreshUser } = useAuth();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const [previewImage, setPreviewImage] = useState(user?.avatar || '');

  // Update preview when user changes
  useEffect(() => {
    if (user?.avatar) {
      setPreviewImage(user.avatar);
    }
  }, [user?.avatar]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size should be less than 2MB' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Only JPG, PNG, and WEBP images are allowed' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setMessage(null);
    setIsUploading(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setPreviewImage(base64String);
        
        // Upload to server
        const response = await fetch('/api/auth/upload-avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ avatar: base64String }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
          setTimeout(() => setMessage(null), 3000);
          // Refresh user data to update avatar everywhere
          await refreshUser();
        } else {
          setMessage({ type: 'error', text: data.error || 'Failed to upload avatar' });
          setTimeout(() => setMessage(null), 3000);
          setPreviewImage(user?.avatar || '');
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to upload avatar' });
      setTimeout(() => setMessage(null), 3000);
      setPreviewImage(user?.avatar || '');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove your avatar?')) return;
    
    setIsUploading(true);
    try {
      const response = await fetch('/api/auth/remove-avatar', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Avatar removed successfully!' });
        setTimeout(() => setMessage(null), 3000);
        setPreviewImage('');
        await refreshUser();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to remove avatar' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to remove avatar' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsUpdating(true);

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
        await refreshUser();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-slate-500">Please login to view profile settings</p>
      </div>
    );
  }

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="space-y-10">
      {/* Success/Error Toast Notification */}
      {message && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border-2 font-bold text-sm min-w-[300px] ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-5xl font-display font-black text-slate-900 tracking-tight leading-none mb-4">
          Profile Settings
        </h1>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
          Manage your personal information and password
        </p>
      </div>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10">
            <h2 className="text-2xl font-display font-black text-slate-900 mb-8">Profile Photo</h2>
            
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl">
                  {isUploading ? (
                    <Loader2 className="w-12 h-12 animate-spin" />
                  ) : previewImage ? (
                    <img src={previewImage} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                {!isUploading && (
                  <>
                    <button
                      type="button"
                      onClick={handleImageClick}
                      className="absolute bottom-0 right-0 w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-orange-600 transition-all group-hover:scale-110"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                    {previewImage && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="absolute top-0 right-0 w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-rose-600 transition-all group-hover:scale-110"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-black text-slate-900 text-xl mb-2">{user.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{user.email}</p>
                <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl border border-orange-100">
                  <span className="text-xs font-black uppercase tracking-widest">Cartizo Member</span>
                </div>
                <p className="text-xs text-slate-400 mt-4 font-medium">
                  Click the camera icon to upload a new photo (JPG, PNG, WEBP, max 2MB)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10">
            <h2 className="text-2xl font-display font-black text-slate-900 mb-8">Personal Information</h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-50 focus:border-orange-500 transition-all outline-none font-medium text-slate-900"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-6 py-4 bg-gray-100 border border-gray-100 rounded-2xl font-medium text-slate-500 cursor-not-allowed"
                  placeholder="your@email.com"
                />
                <p className="text-xs text-slate-400 ml-1 font-medium">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-50 focus:border-orange-500 transition-all outline-none font-medium text-slate-900"
                  placeholder="+91 00000 00000"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating Profile...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
