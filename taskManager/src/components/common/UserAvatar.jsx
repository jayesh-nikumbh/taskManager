import { memo } from 'react';
import PropTypes from 'prop-types';

export const UserAvatar = memo(({ name, email, size = 10, className = "" }) => {
  const initials = (name || email || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = [
    'from-indigo-600 to-violet-600',
    'from-emerald-600 to-teal-600',
    'from-rose-600 to-orange-600',
    'from-amber-600 to-orange-600',
    'from-sky-600 to-indigo-600'
  ];
  const colorIndex = (email?.length || 0) % colors.length;
  
  return (
    <div className={`rounded-xl bg-linear-to-tr ${colors[colorIndex]} flex items-center justify-center text-white font-black shadow-lg border border-white/10 shrink-0 ${className}`} style={{ width: size * 4, height: size * 4, fontSize: size * 1.5 }}>
      {initials}
    </div>
  );
});

UserAvatar.propTypes = {
  name: PropTypes.string,
  email: PropTypes.string,
  size: PropTypes.number,
  className: PropTypes.string,
};

UserAvatar.displayName = 'UserAvatar';
