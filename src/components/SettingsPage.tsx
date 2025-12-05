import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Globe, 
  Palette, 
  Shield,
  Save,
  Camera
} from 'lucide-react';
import { authAPI } from '../services/api';

export function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    username: '',
    email: '',
  });

  const [originalProfile, setOriginalProfile] = useState({
    username: '',
    email: '',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success && response.data?.admin) {
        const adminData = {
          username: response.data.admin.username || '',
          email: response.data.admin.email || '',
        };
        setProfile(adminData);
        setOriginalProfile(adminData);
      }
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      setProfileError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setProfileError('');

    if (!profile.username.trim() || !profile.email.trim()) {
      setProfileError('Username and email are required');
      return;
    }

    if (profile.username.length < 3) {
      setProfileError('Username must be at least 3 characters');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email)) {
      setProfileError('Please enter a valid email address');
      return;
    }

    setProfileLoading(true);
    try {
      const response = await authAPI.updateProfile({
        username: profile.username,
        email: profile.email,
      });

      if (response.success) {
        // Update localStorage with new admin data
        if (response.data?.admin) {
          localStorage.setItem('cms_admin', JSON.stringify(response.data.admin));
        }
        setOriginalProfile({ username: profile.username, email: profile.email });
        alert('✅ Profile updated successfully!');
      } else {
        setProfileError(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      setProfileError(error.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await authAPI.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.success) {
        alert('✅ Password updated successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordError(response.message || 'Failed to update password');
      }
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const hasProfileChanges = () => {
    return profile.username !== originalProfile.username || 
           profile.email !== originalProfile.email;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage your account and preferences</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4 sm:space-y-6"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          <h2 className="text-lg sm:text-xl text-gray-900">Profile Information</h2>
        </div>

        {profileError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs sm:text-sm">
            {profileError}
          </div>
        )}

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg text-gray-900 truncate">{profile.username || 'Admin User'}</h3>
            <p className="text-sm sm:text-base text-gray-600 truncate">{profile.email || 'admin@cms.com'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm sm:text-base text-gray-700 mb-1.5 sm:mb-2">Username</label>
            <input
              type="text"
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-sm sm:text-base text-gray-700 mb-1.5 sm:mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
              placeholder="Enter email"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 sm:pt-4 border-t">
          <button 
            onClick={handleProfileUpdate}
            disabled={profileLoading || !hasProfileChanges()}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Save className="w-4 h-4" />
            {profileLoading ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </motion.div>

      {/* Password Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4 sm:space-y-6"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          <h2 className="text-lg sm:text-xl text-gray-900">Change Password</h2>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs sm:text-sm">
              {passwordError}
            </div>
          )}
          <div>
            <label className="block text-sm sm:text-base text-gray-700 mb-1.5 sm:mb-2">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm sm:text-base text-gray-700 mb-1.5 sm:mb-2">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm sm:text-base text-gray-700 mb-1.5 sm:mb-2">Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
            />
          </div>
        </div>

        <button 
          onClick={handlePasswordChange}
          disabled={passwordLoading}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Lock className="w-4 h-4" />
          {passwordLoading ? 'Updating...' : 'Update Password'}
        </button>
      </motion.div>
    </div>
  );
}
