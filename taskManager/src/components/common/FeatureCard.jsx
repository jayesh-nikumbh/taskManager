import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export const FeatureCard = memo(({ icon, title, desc, delay }) => (
  <motion.div 
    initial={{ x: -20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ delay, duration: 0.8 }}
    className="flex items-start gap-4 xl:gap-5 bg-white/1 p-4 xl:p-6 rounded-[28px] xl:rounded-[32px] border border-white/2 hover:ring-indigo-500/40 ring-1 group hover:bg-white/3 transition-all cursor-default will-change-transform"
  >
    <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-2xl bg-indigo-500/5 flex items-center justify-center border border-indigo-500/10 text-indigo-400 shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-sm xl:text-base font-black text-white mb-0.5 tracking-tight">{title}</p>
      <p className="text-[10px] xl:text-xs text-slate-500 font-medium leading-tight max-w-[200px]">{desc}</p>
    </div>
  </motion.div>
));

FeatureCard.propTypes = {
  icon: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
  delay: PropTypes.number.isRequired,
};

FeatureCard.displayName = 'FeatureCard';
