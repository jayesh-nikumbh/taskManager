import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { format, startOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, endOfMonth, isSameDay, isSameMonth, isToday } from 'date-fns';
import { Zap, AlertCircle } from 'lucide-react';

export const CalendarCells = ({ currentMonth, selectedDate, onDateClick, tasks }) => {
  const monthStart = startOfMonth(currentMonth);
  const days = eachDayOfInterval({
    start: startOfWeek(monthStart),
    end: endOfWeek(endOfMonth(monthStart))
  });

  return (
    <div className="grid grid-cols-7 gap-px bg-white/5">
      {days.map((day, i) => {
        const hasLog = tasks.some(t => isSameDay(new Date(t.completedAt || t.date || t.createdAt), day));
        const active = isSameDay(day, selectedDate);
        const current = isSameMonth(day, monthStart);
        const today = isToday(day);
        const isFuture = day > new Date();

        let textColor = 'text-slate-500';
        if (today) textColor = 'text-indigo-400';
        else if (active) textColor = 'text-white';

        return (
          <motion.div
            key={day.toISOString()}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            onClick={() => onDateClick(day)}
            className={`min-h-[70px] sm:min-h-[100px] xl:min-h-[120px] p-2 sm:p-4 xl:p-5 relative transition-all group cursor-pointer
              ${active ? 'bg-indigo-600/10' : 'bg-slate-950/20'}
              ${current ? 'opacity-100' : 'opacity-10 pointer-events-none'}
              ${isFuture ? 'cursor-not-allowed' : ''}
            `}
          >
            <div className="flex justify-between items-start relative z-10">
              <span className={`text-base sm:text-lg xl:text-xl font-black ${textColor}`}>
                {format(day, 'd')}
              </span>
              {hasLog ? (
                <motion.div 
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                    filter: [
                      'drop-shadow(0 0 2px rgba(16, 185, 129, 0.5))',
                      'drop-shadow(0 0 8px rgba(16, 185, 129, 0.8))',
                      'drop-shadow(0 0 2px rgba(16, 185, 129, 0.5))'
                    ]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    scale: { type: "spring", stiffness: 300, damping: 15 }
                  }}
                  className="text-emerald-500 z-10" 
                >
                  <Zap size={14} fill="currentColor" className="opacity-80" />
                </motion.div>
              ) : (
                current && !isFuture && !today && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: [0.6, 0.9, 0.6],
                      filter: [
                        'drop-shadow(0 0 2px rgba(244, 63, 94, 0.2))',
                        'drop-shadow(0 0 6px rgba(244, 63, 94, 0.5))',
                        'drop-shadow(0 0 2px rgba(244, 63, 94, 0.2))'
                      ]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity
                    }}
                    className="text-rose-500 z-10" 
                  >
                    <AlertCircle size={14} fill="currentColor" className="opacity-20" />
                  </motion.div>
                )
              )}
            </div>

            {hasLog && (
              <div className="mt-2 sm:mt-4 hidden xs:block">
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-linear-to-r from-emerald-500 to-indigo-500 w-full" />
                </div>
                <p className="hidden md:block text-[8px] font-black uppercase text-slate-600 mt-2 tracking-widest leading-none">Entry Locked</p>
              </div>
            )}

            {active && <div className="absolute inset-0 border-2 border-indigo-500/30 pointer-events-none" />}
          </motion.div>
        );
      })}
    </div>
  );
};
 
CalendarCells.propTypes = {
  currentMonth: PropTypes.instanceOf(Date).isRequired,
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  onDateClick: PropTypes.func.isRequired,
  tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
};
