import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Lock, LogOut, Menu } from 'lucide-react';
import { Logo } from '../common/Logo';
import { NavBtn } from '../common/NavBtn';
import { UserAvatar } from '../common/UserAvatar';

export const Navbar = ({ user, activeTab, setActiveTab, onLogout, onProfileClick, onMenuClick }) => {
  const isAdmin = user.role === 'admin' || user.name === 'admin';

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 w-full z-40 px-4 py-4 md:px-6 md:py-6"
    >
      <div className="max-w-7xl mx-auto glass px-4 md:px-8 py-3 md:py-4 flex items-center justify-between shadow-2xl bg-slate-950/60 border-white/5 backdrop-blur-2xl">
        <Logo size={22} />
        <div className="flex items-center gap-4 md:gap-8">
          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex items-center gap-4 md:gap-6">
            {user.role !== 'admin' && (
              <NavBtn
                icon={<LayoutDashboard size={16} />}
                label="Me"
                active={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
              />
            )}
            <NavBtn
              icon={<Users size={16} />}
              label="Team"
              active={activeTab === 'team'}
              onClick={() => setActiveTab('team')}
            />
            {isAdmin && (
              <NavBtn
                icon={<Lock size={16} />}
                label="Admin"
                active={activeTab === 'admin'}
                onClick={() => setActiveTab('admin')}
              />
            )}
          </div>
          <div className="h-6 w-px bg-white/10 hidden md:block" />
          
          {/* Desktop User Profile & Logout */}
          <div className="hidden md:flex items-center gap-3 md:gap-4">
            <button 
              onClick={onProfileClick}
              className="flex items-center gap-3 group cursor-pointer hover:bg-white/5 px-3 py-2 rounded-2xl transition-all"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs md:text-sm font-black text-white leading-none mb-1 group-hover:text-indigo-400 transition-colors">{user.name || user.username}</p>
                <div className="flex items-center justify-end gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                    {user.role === 'admin' ? 'Admin' : 'Student'}
                  </p>
                </div>
              </div>
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all overflow-hidden">
                <UserAvatar name={user.name || user.username} email={user.email} size={10} />
              </div>
            </button>
            <button
              onClick={onLogout}
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl cursor-pointer glass flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={onMenuClick}
            className="md:hidden w-10 h-10 rounded-xl cursor-pointer glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            title="Menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

Navbar.propTypes = {
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
  onMenuClick: PropTypes.func.isRequired,
};
