import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Lock, Search, Plus, Users, FileSpreadsheet, Activity, Zap, ChevronRight, Trash2, Eye, EyeOff, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import { StatCard } from '../components/common/StatCard';
import { UserAvatar } from '../components/common/UserAvatar';
import { fetchAllUsers, registerUser, deleteUserApi, updateUserApi } from '../api/authService';

export const AdminView = ({ showToast, tasks, user, onUpdateUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [adminTab, setAdminTab] = useState('users');
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' });
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTask, setExpandedTask] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('tm_token');
      const userData = await fetchAllUsers(token);
      if (userData.success) setUsers(userData.users);
    } catch {
      showToast('Failed to fetch admin data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const token = localStorage.getItem('tm_token');
        const userData = await fetchAllUsers(token);
        if (isMounted && userData.success) setUsers(userData.users);
      } catch {
        if (isMounted) showToast('Failed to fetch admin data', 'error');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [showToast]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }
    try {
      const data = await registerUser(formData);
      if (data.success) {
        showToast('User created successfully!', 'success');
        setShowAddModal(false);
        setFormData({ username: '', email: '', password: '', role: 'user' });
        fetchData();
      } else {
        showToast(data.message, 'error');
      }
    } catch {
      showToast('Failed to create user', 'error');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password.trim() !== '' && formData.password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('tm_token');
      const data = await updateUserApi(editingUser._id, formData, token);
      if (data.success) {
        showToast('User updated successfully!', 'success');

        if (user && data.user._id === user.id) {
          onUpdateUser(data.user);
        }

        setShowEditModal(false);
        setEditingUser(null);
        setFormData({ username: '', email: '', password: '', role: 'user' });
        fetchData();
      } else {
        showToast(data.message, 'error');
      }
    } catch {
      showToast('Failed to update user', 'error');
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // Leave empty for no change
      role: user.role || 'user'
    });
    setShowEditModal(true);
  };

  const handleDeleteUser = async (id) => {
    if (!globalThis.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('tm_token');
      const data = await deleteUserApi(id, token);
      if (data.success) {
        showToast('User deleted', 'info');
        fetchData();
      }
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTasks = tasks.filter(t =>
    t.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todayTasks = tasks.filter(t => isToday(new Date(t.date || t.createdAt)));
  const yesterdayTasks = tasks.filter(t => isYesterday(new Date(t.date || t.createdAt)));
  const activeUsersToday = new Set(todayTasks.map(t => t.userEmail)).size;

  const todayCount = todayTasks.length;
  const yesterdayCount = yesterdayTasks.length;

  const calculateGrowth = () => {
    if (yesterdayCount === 0) {
      return todayCount > 0 ? 100 : 0;
    }
    return Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100);
  };

  const growthPercentage = calculateGrowth();
  const growthText = growthPercentage > 0 ? `+${growthPercentage}%` : `${growthPercentage}%`;

  return (
    <div className="flex flex-col gap-8 md:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AdminHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        onAddClick={() => { setFormData({ username: '', email: '', password: '', role: 'user' }); setShowAddModal(true); }} 
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users size={24} />} label="Total Members" value={users.length} color="text-indigo-400" />
        <StatCard icon={<FileSpreadsheet size={24} />} label="Today's Records" value={todayCount} color="text-violet-400" />
        <StatCard icon={<Activity size={24} />} label="Active Users Today" value={activeUsersToday} color="text-emerald-400" />
        <StatCard icon={<Zap size={24} />} label="Daily Growth" value={growthText} color={growthPercentage >= 0 ? "text-emerald-400" : "text-rose-400"} />
      </div>

      <TabSwitcher activeTab={adminTab} setTab={setAdminTab} />

      <AnimatePresence mode="wait">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <motion.div
            key={adminTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            {adminTab === 'users' ? (
              <UserTable users={filteredUsers} onEdit={openEditModal} onDelete={handleDeleteUser} />
            ) : (
              <ActivityList tasks={filteredTasks} expandedTask={expandedTask} setExpandedTask={setExpandedTask} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AdminModal 
        isOpen={showAddModal || showEditModal}
        isEdit={showEditModal}
        formData={formData}
        setFormData={setFormData}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        onClose={() => { setShowAddModal(false); setShowEditModal(false); setEditingUser(null); }}
        onSubmit={showEditModal ? handleUpdateUser : handleAddUser}
      />
    </div>
  );
};

// --- Sub-components to reduce cognitive complexity ---

const AdminHeader = ({ searchTerm, setSearchTerm, onAddClick }) => (
  <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
    <div>
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
          <Lock size={24} />
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Command Center</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-[3px] bg-indigo-500 rounded-full" />
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em]">System Administration & Oversight</p>
      </div>
    </div>
    
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-72 pl-12 pr-6 py-4 bg-slate-900/60 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm text-white font-semibold transition-all backdrop-blur-xl"
        />
      </div>
      <button onClick={onAddClick} className="px-8 py-4 bg-linear-to-r from-indigo-600 to-violet-600 text-white font-black rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-2xl shadow-indigo-500/30">
        <Plus size={20} /> Add User
      </button>
    </div>
  </header>
);

AdminHeader.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  onAddClick: PropTypes.func.isRequired,
};

const TabSwitcher = ({ activeTab, setTab }) => (
  <div className="flex gap-2 p-1.5 glass bg-slate-950/40 rounded-2xl w-fit border-white/5">
    <button 
      onClick={() => setTab('users')}
      className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}
    >
      User Registry
    </button>
    <button 
      onClick={() => setTab('records')}
      className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'records' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}
    >
      All Activity
    </button>
  </div>
);

TabSwitcher.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setTab: PropTypes.func.isRequired,
};

const LoadingSpinner = () => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center py-32"
  >
    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
    <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Synchronizing Core...</p>
  </motion.div>
);

const UserTable = ({ users, onEdit, onDelete }) => (
  <div className="glass-card bg-slate-900/40 border-white/5 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-2xl">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black bg-white/2">
            <th className="py-6 px-8">Identity</th>
            <th className="py-6 px-8 text-center">Status / Role</th>
            <th className="py-6 px-8">Join Date</th>
            <th className="py-6 px-8 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id} className="border-b border-white/5 hover:bg-indigo-500/5 transition-all group/row">
              <td className="py-5 px-8">
                <div className="flex items-center gap-4">
                  <UserAvatar name={u.username} email={u.email} size={12} />
                  <div>
                    <p className="text-base font-black text-white group-hover/row:text-indigo-400 transition-colors">{u.username}</p>
                    <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-5 px-8">
                <div className="flex justify-center">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                    {u.role === 'admin' ? 'ADMIN' : 'USER'}
                  </span>
                </div>
              </td>
              <td className="py-5 px-8 text-slate-400 font-bold text-sm">
                {format(new Date(u.createdAt), 'MMM dd, yyyy')}
              </td>
              <td className="py-5 px-8 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => onEdit(u)} className="p-3 text-slate-600 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-xl transition-all opacity-0 group-hover/row:opacity-100 cursor-pointer" title="Edit User">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => onDelete(u._id)} className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover/row:opacity-100 cursor-pointer" title="Delete User">
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

UserTable.propTypes = {
  users: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const ActivityList = ({ tasks, expandedTask, setExpandedTask }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-h-[65dvh] overflow-y-auto pr-2 scroll-smooth">
    {tasks.map((t, idx) => (
      <motion.div 
        key={t._id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: idx * 0.05 }}
        className="glass-card bg-slate-900/40 p-6 border-white/5 rounded-3xl hover:border-indigo-500/30 transition-all group shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <UserAvatar name={t.userName} email={t.userEmail} size={8} />
            <div>
              <p className="text-xs font-black text-white">{t.userName}</p>
              <p className="text-[10px] text-slate-500">{format(new Date(t.date || t.createdAt), 'MMM d, hh:mm a')}</p>
            </div>
          </div>
        </div>
        <h4 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">{t.title}</h4>
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">{t.description}</p>
        
        <button 
          onClick={() => setExpandedTask(expandedTask === t._id ? null : t._id)}
          className="w-full pt-4 border-t border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-500 cursor-pointer hover:text-indigo-400 transition-colors"
        >
          <span>View Full Details</span>
          <ChevronRight size={14} className={`transition-transform ${expandedTask === t._id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
        </button>
        
        <AnimatePresence>
          {expandedTask === t._id && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-2 border-t border-white/5 space-y-3">
                <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Network IP</span>
                  <span className="text-xs font-mono text-indigo-400">{t.ipAddress || 'Not recorded'}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Timestamp</span>
                  <span className="text-xs font-mono text-emerald-400">{format(new Date(t.createdAt || t.date), 'MMM dd, yyyy HH:mm:ss')}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    ))}
  </div>
);

ActivityList.propTypes = {
  tasks: PropTypes.array.isRequired,
  expandedTask: PropTypes.string,
  setExpandedTask: PropTypes.func.isRequired,
};

const AdminModal = ({ isOpen, isEdit, formData, setFormData, showPassword, setShowPassword, onClose, onSubmit }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-950/90 backdrop-blur-lg" />
        <motion.div 
          initial={{ scale: 0.9, y: 20, opacity: 0 }} 
          animate={{ scale: 1, y: 0, opacity: 1 }} 
          exit={{ scale: 0.9, y: 20, opacity: 0 }} 
          className="glass p-1 w-full max-w-md relative shadow-[0_32px_128px_rgba(0,0,0,0.8)] rounded-[40px] border-white/10"
        >
          <div className="bg-slate-900 rounded-[38px] p-10">
            <div className="mb-8">
              <h3 className="text-3xl font-black text-white mb-2 tracking-tighter">{isEdit ? 'Edit Member' : 'Onboard Member'}</h3>
              <p className="text-xs text-slate-500 font-medium">{isEdit ? 'Update existing user profile.' : 'Provision new credentials for the system.'}</p>
            </div>
            
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="admin-username" className="text-[9px] font-black uppercase tracking-widest text-slate-600 ml-1">Username</label>
                <input id="admin-username" type="text" placeholder="johndoe" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full px-6 py-4 bg-slate-950/80 border border-white/5 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-semibold" required autoComplete="off" />
              </div>
              <div className="space-y-2">
                <label htmlFor="admin-email" className="text-[9px] font-black uppercase tracking-widest text-slate-600 ml-1">Email Protocol</label>
                <input id="admin-email" type="email" placeholder="john@company.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-6 py-4 bg-slate-950/80 border border-white/5 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-semibold" required autoComplete="off" />
              </div>
              <div className="space-y-2">
                <label htmlFor="admin-password" className="text-[9px] font-black uppercase tracking-widest text-slate-600 ml-1">{isEdit ? 'New Passkey (Optional)' : 'Secure Passkey'}</label>
                <div className="relative group/pass">
                  <input 
                    id="admin-password"
                    type={showPassword ? "text" : "password"} 
                    placeholder={isEdit ? "Leave blank to keep same" : "••••••••"}
                    value={formData.password} 
                    onChange={e => setFormData({ ...formData, password: e.target.value })} 
                    className="w-full px-6 py-4 bg-slate-950/80 border border-white/5 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-semibold" 
                    required={!isEdit}
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-indigo-400 transition-colors cursor-pointer">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="admin-role" className="text-[9px] font-black uppercase tracking-widest text-slate-600 ml-1">Access Tier</label>
                <div className="relative">
                  <select id="admin-role" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-6 py-4 bg-slate-950/80 border border-white/5 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-semibold cursor-pointer appearance-none">
                    <option value="user" className="bg-slate-900">Standard User</option>
                    <option value="admin" className="bg-slate-900">Administrator</option>
                  </select>
                  <ChevronRight size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 rotate-90 pointer-events-none" />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={onClose} className="flex-1 py-4 font-bold text-slate-500 hover:text-white glass rounded-2xl cursor-pointer transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 cursor-pointer">{isEdit ? 'Update User' : 'Create Account'}</button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

AdminModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isEdit: PropTypes.bool.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  showPassword: PropTypes.bool.isRequired,
  setShowPassword: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

AdminView.propTypes = {
  showToast: PropTypes.func.isRequired,
  tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
  user: PropTypes.object.isRequired,
  onUpdateUser: PropTypes.func.isRequired,
};
