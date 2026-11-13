import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Lock, KeyRound, Check, ShieldCheck, Calendar } from 'lucide-react';

export const Profile: React.FC = () => {
  const { manager, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(manager?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({
        name: name.trim() || undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      showToast('Profile updated successfully!', 'success');
      setIsSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Manager Profile
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your account credentials and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none mb-4">
            {manager?.name ? manager.name.charAt(0).toUpperCase() : 'M'}
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {manager?.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {manager?.email}
          </p>

          <div className="mt-6 w-full pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3 text-left text-xs">
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Role: <strong>Queue Administrator</strong></span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
              <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                Joined:{' '}
                {manager?.createdAt
                  ? new Date(manager.createdAt).toLocaleDateString()
                  : 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">
            Account Information
          </h3>

          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={manager?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Email address is permanently linked to your manager account.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-500" />
                <span>Change Password (Leave blank to keep current)</span>
              </h4>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Enter current password to verify"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSuccess ? <Check className="w-4 h-4" /> : null}
                <span>{isLoading ? 'Saving...' : 'Update Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

