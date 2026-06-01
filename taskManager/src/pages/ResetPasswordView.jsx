import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '../components/common/Logo';
import { BackgroundOrbs } from '../components/common/BackgroundOrbs';

export const ResetPasswordView = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/auth/reset-password/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/'), 3000);
      } else {
        setError(data.message || 'Reset failed');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-dvh w-full flex items-center justify-center bg-slate-950 relative selection:bg-indigo-500/30 overflow-hidden">
      <BackgroundOrbs />
      
      <div className="w-full max-w-md p-6 relative z-30">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="glass-card bg-slate-900/60 p-8 md:p-10 border border-white/5 rounded-[36px] shadow-2xl relative overflow-hidden"
        >
          <div className="mb-10 text-center">
            <Logo size={24} className="mb-6 justify-center" />
            <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">Reset Password</h2>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Secure Recovery Protocol</p>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Success!</h3>
              <p className="text-slate-400 text-sm mb-6">Your password has been updated. Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="reset-new-password" className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">New Password</label>
                <div className="relative group/input">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-indigo-400 transition-colors pointer-events-none">
                    <Lock size={16} />
                  </div>
                  <input
                    id="reset-new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-12 py-4 bg-slate-950/50 border border-white/10 rounded-[24px] focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:bg-slate-950/80 transition-all text-white font-semibold text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="reset-confirm-password" className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Confirm New Password</label>
                <div className="relative group/input">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-indigo-400 transition-colors pointer-events-none">
                    <Lock size={16} />
                  </div>
                  <input
                    id="reset-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-14 pr-8 py-4 bg-slate-950/50 border border-white/10 rounded-[24px] focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:bg-slate-950/80 transition-all text-white font-semibold text-sm"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-3 flex items-center gap-3"
                >
                  <AlertCircle size={14} className="text-rose-500" />
                  <p className="text-rose-400 text-[10px] font-bold uppercase tracking-wider">{error}</p>
                </motion.div>
              )}

              <motion.button 
                whileHover={{ scale: 1.01 }} 
                whileTap={{ scale: 0.99 }} 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-14 bg-linear-to-r from-indigo-600 to-violet-600 text-white rounded-[24px] font-black text-sm shadow-xl hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <span className="uppercase tracking-[0.15em]">Update Password</span>
                    <ChevronRight size={18} />
                  </>
                )}
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};
