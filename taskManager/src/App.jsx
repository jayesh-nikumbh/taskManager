import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route } from 'react-router-dom';

// Custom Hooks for business logic
import { useAuth } from './hooks/useAuth';

// API Abstraction layer for clean service calls
import { fetchTasksApi, createTaskApi, updateTaskApi, deleteTaskApi } from './api/taskService';

// Main View Components
import { LoginView } from './pages/LoginView';
import { Dashboard } from './pages/Dashboard';
import { ResetPasswordView } from './pages/ResetPasswordView';

/**
 * Main Application Component
 * Handles global state, authentication flow, and overall layout orchestration.
 */
const App = () => {
  // Authentication hook providing user state and auth methods
  const { user, login, logout, loading, updateUser } = useAuth();
  
  // Application State
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const isAdmin = user?.role === 'admin' || user?.name === 'admin';
  const [activeTab, setActiveTab] = useState(isAdmin ? 'team' : 'overview');

  // Track the user ID to detect login/logout and reset tab if needed
  const [prevUserId, setPrevUserId] = useState(user?.id);
  if (user?.id !== prevUserId) {
    setPrevUserId(user?.id);
    setActiveTab(isAdmin ? 'team' : 'overview');
  }

  /**
   * Triggers a temporary toast notification
   * @param {string} message - Content to display
   * @param {string} type - 'success', 'error', or 'info'
   */
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const emailToFilter = activeTab === 'overview' ? user?.email : null;

  // Synchronize tasks whenever user authentication state or required data scope changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      try {
        const data = await fetchTasksApi(emailToFilter);
        
        if (data.success) {
          const formattedTasks = data.tasks.map(t => ({
            ...t,
            completedAt: t.date || t.createdAt,
          }));
          setTasks(formattedTasks);
        }
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      }
    };
    fetchTasks();
  }, [user, emailToFilter]);

  /**
   * Handles both creation and updates of task records
   * @param {Object} task - The task data from the form
   */
  const addTask = async (task) => {
    try {
      const isUpdate = !!task._id;
      const taskData = {
        title: task.title,
        description: task.description,
        challenges: task.challenges,
        userName: user.name,
        userEmail: user.email,
        date: task.completedAt,
      };

      let data;
      if (isUpdate) {
        data = await updateTaskApi(task._id, taskData);
      } else {
        data = await createTaskApi(taskData);
      }
      
      if (data.success) {
        const newTask = { ...data.task, completedAt: data.task.date || data.task.createdAt };
        if (isUpdate) {
          setTasks(prev => prev.map(t => t._id === newTask._id ? newTask : t));
        } else {
          // If we are filtering by email and the new task is ours, OR if we aren't filtering, add it
          const isFiltering = activeTab === 'overview';
          if (!isFiltering || newTask.userEmail === user.email) {
            setTasks(prev => [newTask, ...prev]);
          }
        }
        setShowModal(false);
        setEditingTask(null);
        showToast(isUpdate ? 'Entry updated successfully!' : 'Entry saved successfully!', 'success');
      }
    } catch {
      showToast('Failed to save entry. Please try again.', 'error');
    }
  };

  /**
   * Handles the login process with feedback
   */
  const handleLogin = async (email, password) => {
    const res = await login(email, password);
    if (res.success) {
      showToast(`Welcome back, ${res.user.name}!`, 'success');
    }
    return res;
  };

  /**
   * Initiates the logout confirmation flow
   */
  const handleLogout = () => {
    setConfirmData({
      title: 'Confirm Logout',
      message: 'Are you sure you want to end your current session?',
      onConfirm: () => {
        logout();
        setConfirmData(null);
        showToast('Logged out successfully. See you soon!', 'info');
      }
    });
  };

  /**
   * Initiates the task deletion confirmation flow
   * @param {string} id - Database ID of the task
   */
  const handleDeleteTask = (id) => {
    setConfirmData({
      title: 'Delete Record',
      message: 'Are you sure you want to permanently delete this activity log?',
      onConfirm: async () => {
        try {
          const res = await deleteTaskApi(id);
          if (res.ok) {
            setTasks(tasks.filter(t => t._id !== id && t.id !== id));
            showToast('Record removed.', 'info');
          }
        } catch {
          showToast('Failed to delete the record.', 'error');
        }
        setConfirmData(null);
      }
    });
  };

  /**
   * Triggers a global confirmation modal
   * @param {Object} data - { title, message, onConfirm }
   */
  const showConfirm = (data) => {
    setConfirmData({
      ...data,
      onConfirm: async () => {
        await data.onConfirm();
        setConfirmData(null);
      }
    });
  };

  const getToastStyles = () => {
    switch (toast?.type) {
      case 'success':
        return {
          container: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          iconBg: 'bg-emerald-500/20'
        };
      case 'error':
        return {
          container: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          iconBg: 'bg-rose-500/20'
        };
      default:
        return {
          container: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
          iconBg: 'bg-indigo-500/20'
        };
    }
  };

  const toastStyles = getToastStyles();

  // Prevent rendering before auth state is initialized
  if (loading) return null;

  return (
    <div className="min-h-screen relative font-plus-jakarta overflow-x-hidden selection:bg-indigo-500/30">
      <div className="mesh-bg" />
      
      {/* Dynamic Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, x: '-50%' }}
            className={`fixed bottom-10 left-1/2 z-100 px-6 py-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl border flex items-center gap-4 min-w-[320px] max-w-md ${toastStyles.container}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${toastStyles.iconBg}`}>
              {toast.type === 'success' ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}
            </div>
            <span className="text-sm font-black uppercase tracking-widest leading-none">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Confirmation Modal */}
      <AnimatePresence>
        {confirmData && (
          <div className="fixed inset-0 z-110 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmData(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass p-8 w-full max-w-sm relative shadow-2xl bg-slate-900 border-white/5">
              <h3 className="text-xl font-black text-white mb-2">{confirmData.title}</h3>
              <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed">{confirmData.message}</p>
              <div className="flex gap-4">
                <button onClick={() => setConfirmData(null)} className="flex-1 h-12 glass text-slate-500 font-bold hover:text-white transition-all">Cancel</button>
                <button onClick={confirmData.onConfirm} className="flex-1 h-12 bg-linear-to-r from-rose-600 to-rose-500 text-white font-black rounded-xl shadow-lg shadow-rose-500/20">Confirm</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main View Router Logic */}
      <Routes>
        <Route path="/reset-password/:token" element={<ResetPasswordView />} />
        <Route path="*" element={
          <AnimatePresence mode="wait">
            {user ? (
              <Dashboard
                user={user}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={handleLogout}
                onUpdateUser={updateUser}
                tasks={tasks}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                showModal={showModal}
                setShowModal={(val) => {
                  setShowModal(val);
                  if (!val) setEditingTask(null);
                }}
                editingTask={editingTask}
                setEditingTask={setEditingTask}
                addTask={addTask}
                deleteTask={handleDeleteTask}
                showToast={showToast}
                showConfirm={showConfirm}
              />
            ) : (
              <LoginView key="login" onLogin={handleLogin} />
            )}
          </AnimatePresence>
        } />
      </Routes>
    </div>
  );
};

export default App;
