import PropTypes from 'prop-types';

export const NavBtn = ({ icon, label, active = false, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 text-xs font-black uppercase cursor-pointer tracking-widest transition-all ${active ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}
  >
    {icon}
    {label}
  </button>
);

NavBtn.propTypes = {
  icon: PropTypes.element.isRequired,
  label: PropTypes.string.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};
