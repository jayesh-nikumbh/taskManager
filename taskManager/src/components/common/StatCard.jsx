import { cloneElement } from 'react';
import PropTypes from 'prop-types';

export const StatCard = ({ icon, label, value, color = "text-indigo-400" }) => (
  <div className="glass p-4 sm:p-6 flex items-center gap-4 sm:gap-5 border-white/5 bg-slate-900/40">
    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/5 flex items-center justify-center ${color} shrink-0`}>
      {cloneElement(icon, { size: 20 })}
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5 truncate">{label}</p>
      <p className="text-lg sm:text-2xl font-black text-white truncate">{value}</p>
    </div>
  </div>
);

StatCard.propTypes = {
  icon: PropTypes.element.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string,
};
