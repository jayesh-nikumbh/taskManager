import { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ChevronRight, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '../components/common/Logo';
import { BackgroundOrbs } from '../components/common/BackgroundOrbs';
import { FeatureCard } from '../components/common/FeatureCard';

/**
 * LoginView Component
 * Provides the user interface for authenticating users.
 * Features a split layout with a branding section and a secure login form.
 */
export const LoginView = memo(({ onLogin }) => {
  // Local state for form management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState('login'); // 'login' or 'forgot'
  const [forgotEmail, setForgotEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  /**
   * Handles form submission and triggers the login process
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    if (view === 'login') {
      const result = await onLogin(email, password);
      if (!result.success) {
        setError(result.message);
        setIsSubmitting(false);
      }
    } else {
      // Handle Forgot Password Request
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: forgotEmail }),
        });
        const data = await res.json();
        if (data.success) {
          setSuccessMsg('Reset link sent to your email!');
          setTimeout(() => {
            setView('login');
            setSuccessMsg('');
            setForgotEmail('');
          }, 3000);
        } else {
          setError(data.message || 'Failed to send reset link');
        }
      } catch {
        setError('Connection error. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="h-dvh w-full flex flex-col lg:flex-row bg-slate-950 relative selection:bg-indigo-500/30 overflow-hidden">
      {/* Decorative background elements */}
      <BackgroundOrbs />

      {/* Hero/Branding Section (Hidden on mobile) */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex lg:w-[42%] xl:w-[45%] flex-col justify-between p-10 xl:p-20 bg-slate-950/20 border-r border-white/3 relative z-20 will-change-transform"
      >
        <Logo size={24} className="relative z-10" />
        
        <div className="relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Student Portal</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">v1.0</span>
          </motion.div>

          <motion.h1 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-5xl xl:text-7xl font-black text-white leading-[0.95] mb-6 tracking-tighter"
          >
            Focus <br />
            <span className="bg-linear-to-r from-indigo-500 via-violet-400 to-emerald-400 bg-clip-text text-transparent italic">Better.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-base xl:text-lg text-slate-400/80 font-medium leading-relaxed mb-10 max-w-sm"
          >
            Organize your daily tasks, track your learning progress, and stay ahead of your goals.
          </motion.p>

          <div className="space-y-4">
            <FeatureCard 
              icon={<Zap className="text-amber-400" size={20} />} 
              title="Daily Wins" 
              desc="Log your tasks and celebrate small victories."
              delay={0.6}
            />
            <FeatureCard 
              icon={<Sparkles className="text-violet-400" size={20} />} 
              title="Smart Tracker" 
              desc="Visualize study sessions instantly."
              delay={0.7}
            />
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-8 opacity-30">
          <div className="h-px flex-1 bg-linear-to-r from-slate-800 to-transparent" />
        </div>
      </motion.div>

      {/* Authentication Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-30 overflow-hidden">
        <div className="w-full max-w-md xl:max-w-lg">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ duration: 0.8, ease: "circOut" }}
            className="relative group/panel will-change-transform"
          >
            <div className="absolute -inset-1 bg-linear-to-r from-indigo-500/10 to-violet-500/10 rounded-[40px] blur-xl opacity-0 group-hover/panel:opacity-100 transition-opacity duration-700" />
            
            <div className="glass-card bg-slate-900/60 p-8 md:p-10 xl:p-14 border border-white/5 rounded-[36px] xl:rounded-[40px] shadow-2xl relative overflow-hidden ring-1 ring-white/5">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-600 to-violet-600 opacity-60" />
              
              <div className="mb-6 xl:mb-10">
                <div className="lg:hidden mb-6 flex justify-center"><Logo size={24} /></div>
                <h2 className="text-3xl xl:text-4xl font-black text-white mb-2 tracking-tighter text-center lg:text-left">Login</h2>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <div className="w-3 h-[2px] bg-indigo-500 rounded-full" />
                  <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Student Access Secured</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 xl:space-y-6">
                <div className="space-y-2 xl:space-y-3">
                  <label htmlFor="auth-identifier" className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">
                    {view === 'login' ? 'Email or Username' : 'Registered Email'}
                  </label>
                  <div className="relative group/input">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-indigo-400 transition-colors pointer-events-none">
                      <Mail size={16} />
                    </div>
                    <input
                      id="auth-identifier"
                      type="text"
                      placeholder={view === 'login' ? "email or username" : "enter your email"}
                      value={view === 'login' ? email : forgotEmail}
                      onChange={(e) => view === 'login' ? setEmail(e.target.value) : setForgotEmail(e.target.value)}
                      className="w-full pl-14 pr-8 py-4 xl:py-5 bg-slate-950/50 border border-white/10 rounded-[24px] focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:bg-slate-950/80 transition-all text-white font-semibold placeholder:text-slate-800 text-sm xl:text-base"
                      required
                      autoComplete="off"
                    />
                  </div>
                </div>

                {view === 'login' && (
                  <div className="space-y-2 xl:space-y-3">
                    <label htmlFor="auth-password" title="password" className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Secure Pass</label>
                    <div className="relative group/input">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-indigo-400 transition-colors pointer-events-none">
                        <Lock size={16} />
                      </div>
                      <input
                        id="auth-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-14 pr-12 py-4 xl:py-5 bg-slate-950/50 border border-white/10 rounded-[24px] focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:bg-slate-950/80 transition-all text-white font-semibold placeholder:text-slate-800 text-sm xl:text-base"
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-indigo-400 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <div className="flex justify-end px-1">
                      <button 
                        type="button"
                        onClick={() => {
                          setView('forgot');
                          setError('');
                        }}
                        className="text-[10px] font-bold text-indigo-400/80 hover:text-indigo-300 uppercase tracking-widest transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </div>
                )}

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

                {successMsg && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-3 flex items-center gap-3"
                  >
                    <Sparkles size={14} className="text-emerald-500" />
                    <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">{successMsg}</p>
                  </motion.div>
                )}

                <motion.button 
                  whileHover={{ scale: 1.01 }} 
                  whileTap={{ scale: 0.99 }} 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-14 xl:h-18 bg-linear-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white rounded-[24px] xl:rounded-[28px] font-black text-base shadow-xl hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 relative group"
                >
                  {isSubmitting ? (
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      <span className="uppercase tracking-[0.15em] text-sm">
                        {view === 'login' ? 'Sign In' : 'Send Reset Link'}
                      </span>
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </form>

              {view === 'forgot' && (
                <div className="mt-6 flex justify-center">
                  <button 
                    onClick={() => {
                      setView('login');
                      setError('');
                    }}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              )}

              <div className="mt-8 xl:mt-12 flex items-center justify-center gap-6 opacity-60">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Protocol</span>
                  <span className="text-[10px] font-bold text-slate-500">Secure v1</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Type</span>
                  <span className="text-[10px] font-bold text-slate-500">Student</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
});

LoginView.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

LoginView.displayName = 'LoginView';
