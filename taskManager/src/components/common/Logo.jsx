import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';

/**
 * Enterprise Brand Logo Component
 * Combines 3D perspective, kinetic motion, and refined typography.
 */
export const Logo = memo(({ className = "" }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth haptic-style spring physics
  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["20deg", "-20deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-20deg", "20deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div 
      className={`flex items-center gap-6 cursor-pointer group select-none ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ perspective: 1000 }}
    >
      {/* 3D ICON ENGINE */}
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative">
        {/* Ambient Backglow */}
        <div className="absolute -inset-4 bg-indigo-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl group-hover:border-indigo-500/50 transition-colors">
          <motion.div 
            className="absolute inset-0 bg-linear-to-b from-transparent via-white/5 to-transparent h-[200%] -translate-y-full"
            animate={{ y: ["-50%", "150%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <Clock className="text-white group-hover:text-indigo-400 transition-colors" size={28} strokeWidth={1.5} />
          
          <motion.div 
            className="absolute -top-1 -right-1 text-yellow-400"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap size={10} fill="currentColor" />
          </motion.div>
        </div>
      </motion.div>

      {/* REFINED BRANDING */}
      <div className="flex flex-col -space-y-1.5">
        <div className="flex items-end gap-2">
          <h1 className="text-3xl font-black tracking-tighter text-white">ICT</h1>
          <span className="text-indigo-500 text-4xl font-black leading-[0.5]">.</span>
          <span className="text-xl font-black text-slate-500 italic tracking-tight">CATALYST</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-linear-to-r from-indigo-500 via-violet-500 to-emerald-500"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-600">Portal</span>
        </div>
      </div>
    </motion.div>
  );
});

Logo.propTypes = {
  className: PropTypes.string,
};

Logo.displayName = 'Logo';
