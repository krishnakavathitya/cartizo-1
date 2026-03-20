'use client';

import { useAuth } from '@/lib/context/auth-context';
import { User, Mail, Lock, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useMutation, gql } from '@apollo/client';

const UPDATE_PASSWORD = gql`
  mutation UpdatePassword($currentPassword: String!, $newPassword: String!) {
    updatePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($name: String, $phone: String) {
    updateProfile(name: $name, phone: $phone)
  }
`;

export default function ProfileSettingsPage() {
    const { user, loading: authLoading, refreshUser } = useAuth();
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [saving, setSaving] = useState(false);

    // Form States
    const [name, setName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [updatePassword] = useMutation(UPDATE_PASSWORD);
    const [updateProfile] = useMutation(UPDATE_PROFILE);

    // Sync data when auth context loads
    useEffect(() => {
        if (user) {
            setName(user.name || '');
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setStatus(null);

        try {
            // 1. Password Validation & Update (if provided)
            if (currentPassword || newPassword || confirmPassword) {
                if (!currentPassword) throw new Error('Current password is required to make changes.');
                if (newPassword !== confirmPassword) throw new Error('New passwords do not match.');
                if (newPassword.length < 6) throw new Error('New password must be at least 6 characters.');

                await updatePassword({
                    variables: { currentPassword, newPassword },
                });
            }

            // 2. Profile Details Update (if changed)
            if (name !== user?.name) {
                await updateProfile({
                    variables: { name },
                });
            }

            await refreshUser();
            setStatus({ type: 'success', message: 'Settings updated successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setStatus({
                type: 'error',
                message: err.message?.replace('GraphQL error:', '').trim() || 'Failed to update settings.'
            });
        } finally {
            setSaving(false);
        }
    };

    if (authLoading) return null;

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-900">Settings</h1>
                <p className="text-slate-500 mt-1 text-sm">Manage your account credentials and profile</p>
            </div>

            <div className="max-w-lg">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
                    {/* Personal Information */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your full name"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-slate-400 cursor-not-allowed opacity-70"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 ml-1 font-bold uppercase tracking-widest italic opacity-60">Immutable Access Protocol</p>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Password Section */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Current Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Required to save any changes"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                New Password <span className="text-slate-400 font-normal normal-case">(LEAVE BLANK TO KEEP CURRENT)</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Min. 6 characters"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                                />
                            </div>
                        </div>

                        {newPassword && (
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat new password"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {status && (
                        <div className={`border text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2 ${status.type === 'success'
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : 'bg-red-50 text-red-600 border-red-100'
                            }`}>
                            {status.type === 'success' && <CheckCircle className="w-4 h-4" />}
                            {status.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>

                <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <p className="text-xs text-amber-700 font-medium leading-relaxed">
                        ⚠️ After modifying your email or security credentials, you may be logged out and require re-authentication.
                    </p>
                </div>
            </div>
        </div>
    );
}

