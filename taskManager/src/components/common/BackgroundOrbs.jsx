import { memo } from 'react';
import { motion } from 'framer-motion';

export const BackgroundOrbs = memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
    <div className="absolute top-[-20%] left-[-10%] w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.15),transparent_50%)]" />
    <div className="absolute bottom-[-20%] right-[-10%] w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.1),transparent_50%)]" />
    
    <motion.div 
      animate={{ opacity: [0.03, 0.06, 0.03] }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)]"
    />
    
    <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[40px_40px]" />
  </div>
));

BackgroundOrbs.displayName = 'BackgroundOrbs';
