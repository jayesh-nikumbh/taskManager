import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { X, User, Mail, Lock, Shield, Save, Eye, EyeOff } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { updateMeApi } from '../../api/authService';

/**
 * ProfileSidebar Component
 * An animated sidebar that displays and allows users to update their profile information.
 */
export const ProfileSidebar = ({ user, onClose, showToast, onUpdateUser, showConfirm }) => {
  const [username, setUsername] = useState(user.name || user.username);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isChanged = username !== (user.name || user.username) || email !== user.email || password !== '';

    if (!isChanged) {
      showToast('No changes detected.', 'info');
      return;
    }

    showConfirm({
      title: 'Update Profile',
      message: 'Are you sure you want to save these changes to your profile?',
      onConfirm: async () => {
        setIsUpdating(true);
        try {
          const token = localStorage.getItem('tm_token');
          const data = await updateMeApi({ username, email, password }, token);
          
          if (data.success) {
            showToast('Profile updated successfully!', 'success');
            onUpdateUser(data.user);
            setPassword('');
          } else {
            showToast(data.message, 'error');
          }
        } catch {
          showToast('Failed to update profile.', 'error');
        } finally {
          setIsUpdating(false);
        }
      }
    });
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-60"
      />
      
      {/* Sidebar Panel */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-white/5 z-70 shadow-2xl flex flex-col"
      >
        <header className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <User size={20} />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Account Profile</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {/* Identity Section */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4 group">
              <UserAvatar name={user.name || user.username} email={user.email} size={24} />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-indigo-600 border-4 border-slate-900 flex items-center justify-center text-white shadow-xl">
                <Shield size={14} />
              </div>
            </div>
            <h3 className="text-2xl font-black text-white tracking-tighter">{user.name || user.username}</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">
              {user.role === 'admin' ? 'Administrator' : 'Student'} Access
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="profile-username" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Username</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                  <User size={16} />
                </div>
                <input 
                  id="profile-username"
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-white/5 rounded-2xl text-white font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="profile-email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                  <Mail size={16} />
                </div>
                <input 
                  id="profile-email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-white/5 rounded-2xl text-white font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="profile-password" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">New Password (Optional)</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                  <Lock size={16} />
                </div>
                <input 
                  id="profile-password"
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-950/50 border border-white/5 rounded-2xl text-white font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-indigo-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-[9px] text-slate-600 font-medium px-1">Leave blank if you don't want to change your current password.</p>
            </div>

            <button 
              type="submit"
              disabled={isUpdating || (username === (user.name || user.username) && email === user.email && password === '')}
              className="w-full py-4 bg-linear-to-r from-indigo-600 to-violet-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed cursor-pointer"
            >
              {isUpdating ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </form>
        </div>

        <footer className="p-6 border-t border-white/5 bg-white/2">
          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1 text-center">System Metadata</p>
            <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
              <span>Security Tier: RSA-256</span>
              <span>Sync: Real-time</span>
            </div>
          </div>
        </footer>
      </motion.div>
    </>
  );
};

ProfileSidebar.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    username: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  showToast: PropTypes.func.isRequired,
  onUpdateUser: PropTypes.func.isRequired,
  showConfirm: PropTypes.func.isRequired,
};
