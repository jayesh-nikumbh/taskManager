import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { X, LayoutDashboard, Users, Lock, LogOut } from 'lucide-react';
import { Logo } from '../common/Logo';
import { UserAvatar } from '../common/UserAvatar';

export const MobileNavSidebar = ({ 
  user, 
  activeTab, 
  setActiveTab, 
  onLogout, 
  onProfileClick, 
  onClose 
}) => {
  const isAdmin = user.role === 'admin' || user.name === 'admin';

  return (
    <>
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 md:hidden"
      />
      
      {/* Sidebar Panel */}
      <motion.div 
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 h-full w-72 bg-slate-900 border-r border-white/5 z-55 shadow-2xl flex flex-col md:hidden"
      >
        <header className="p-6 border-b border-white/5 flex items-center justify-between">
          <Logo size={20} />
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </header>

        {/* Navigation Items */}
        <div className="flex-1 py-6 px-4 space-y-2">
          {user.role !== 'admin' && (
            <button
              onClick={() => {
                setActiveTab('overview');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'overview' 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Me</span>
            </button>
          )}

          <button
            onClick={() => {
              setActiveTab('team');
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'team' 
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            <Users size={18} />
            <span>Team</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                setActiveTab('admin');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === 'admin' 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <Lock size={18} />
              <span>Admin</span>
            </button>
          )}
        </div>

        {/* User Profile / Logout Section at bottom */}
        <footer className="p-4 border-t border-white/5 bg-slate-950/20 space-y-4">
          <button 
            onClick={() => {
              onProfileClick();
              onClose();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform overflow-hidden">
              <UserAvatar name={user.name || user.username} email={user.email} size={10} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate leading-none mb-1 group-hover:text-indigo-400 transition-colors">
                {user.name || user.username}
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                  {user.role === 'admin' ? 'Admin' : 'Student'}
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full h-11 rounded-xl cursor-pointer bg-slate-900 border border-white/5 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-rose-400 hover:border-rose-500/20 transition-all"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </footer>
      </motion.div>
    </>
  );
};

MobileNavSidebar.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    username: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
  }).isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onProfileClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
