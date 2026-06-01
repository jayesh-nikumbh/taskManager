import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Search, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subMonths, addMonths, isSameMonth, isSameDay } from 'date-fns';
import { UserAvatar } from '../components/common/UserAvatar';
import { CalendarCells } from '../components/calendar/CalendarCells';

export const TeamView = ({ user, tasks }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);

  const userStats = useMemo(() => {
    const stats = {};
    tasks.forEach(t => {
      const email = t.userEmail;
      if (!stats[email]) {
        stats[email] = {
          monthlyDays: new Set(),
          totalEntries: 0
        };
      }

      stats[email].totalEntries += 1;

      const taskDate = new Date(t.date || t.createdAt);
      if (isSameMonth(taskDate, currentMonth)) {
        stats[email].monthlyDays.add(format(taskDate, 'yyyy-MM-dd'));
      }
    });

    const result = {};
    Object.entries(stats).forEach(([email, data]) => {
      const daysCount = data.monthlyDays.size;
      result[email] = {
        monthlyDays: daysCount,
        totalEntries: data.totalEntries,
        consistency: Math.min(100, Math.round((daysCount / 20) * 100))
      };
    });
    return result;
  }, [tasks, currentMonth]);

  const filteredLogs = tasks.filter(log => {
    const logDate = new Date(log.date || log.createdAt);
    const isDay = isSameDay(logDate, selectedDate);
    const isMonth = isSameMonth(logDate, currentMonth);
    const searchStr = (log.userName || log.userEmail || '').toLowerCase();
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
    return isDay && isMonth && matchesSearch;
  });

  const groupedLogs = useMemo(() => {
    const groups = {};
    filteredLogs.forEach(log => {
      const email = log.userEmail;
      if (!groups[email]) {
        groups[email] = {
          userEmail: email,
          userName: log.userName,
          logs: [],
          stats: userStats[email] || { monthlyDays: 0, totalEntries: 0, consistency: 0 }
        };
      }
      groups[email].logs.push(log);
    });
    return Object.values(groups).sort((a, b) => {
      if (a.userEmail === user.email) return -1;
      if (b.userEmail === user.email) return 1;
      return 0;
    });
  }, [filteredLogs, user.email, userStats]);

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-4">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Team Hub</h2>
            {user.role === 'admin' && (
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-black tracking-widest border border-indigo-500/20">
                {tasks.length} Total Records
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-6 h-[2px] bg-indigo-500 rounded-full" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em]">Collaboration Feed</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Filter email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-12 pr-4 py-3 bg-slate-900/50 border border-white/5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-sm text-white font-medium"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2.5 glass hover:bg-white/5 cursor-pointer text-slate-400 hover:text-white"><ChevronLeft size={16} /></button>
            <span className="text-[10px] font-black text-white uppercase tracking-widest px-2 min-w-[100px] text-center">{format(currentMonth, 'MMM yyyy')}</span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2.5 glass hover:bg-white/5 cursor-pointer text-slate-400 hover:text-white"><ChevronRight size={16} /></button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-6">
          <div className="glass overflow-hidden bg-slate-900/20 border-white/5">
            <div className="p-4 bg-white/2 border-b border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Live Registry</span>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            </div>
            <div className="p-2">
              <div className="grid grid-cols-7 text-[8px] font-black uppercase text-slate-600 text-center py-3">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={`${d}-${i}`}>{d}</div>)}
              </div>
              <CalendarCells
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                onDateClick={setSelectedDate}
                tasks={tasks.map(l => ({ completedAt: l.date || l.completedAt }))}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6 max-h-[825px] overflow-y-auto pr-2 custom-scrollbar scroll-smooth">
          <AnimatePresence initial={false}>
            {groupedLogs.length > 0 ? groupedLogs.map((group, idx) => (
              <motion.div
                key={group.userEmail}
                layout="position"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: idx * 0.05,
                  layout: { duration: 0.3, ease: "easeOut" }
                }}
                className={`glass relative group transition-all duration-500 rounded-[24px] ${group.userEmail === user.email
                    ? 'ring-1 ring-indigo-500/50 bg-indigo-500/5 border-indigo-500/50 shadow-[0_0_40px_rgba(99,102,241,0.15)]'
                    : 'border-white/5 bg-slate-900/40 hover:bg-slate-900/60'
                  }`}
              >
                {group.userEmail === user.email && (
                  <div className="absolute top-0 right-0 px-5 py-2 bg-linear-to-r from-indigo-600 to-violet-600 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-2xl rounded-tr-[23px] shadow-2xl z-10">
                    You
                  </div>
                )}
                <button
                  onClick={() => setExpandedUser(expandedUser === group.userEmail ? null : group.userEmail)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setExpandedUser(expandedUser === group.userEmail ? null : group.userEmail);
                    }
                  }}
                  className={`w-full text-left p-6 md:p-8 cursor-pointer flex flex-col md:flex-row gap-6 items-center justify-between transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-[24px] ${group.userEmail === user.email ? 'bg-indigo-500/5' : ''}`}
                >
                  <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className="relative">
                      <UserAvatar name={group.userName} email={group.userEmail} size={14} />
                      {group.userEmail === user.email && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] text-white">
                          <CheckCircle2 size={12} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-black text-white leading-tight">{group.userName || (group.userEmail || '').split('@')[0]}</p>
                        <div className="flex items-center gap-2">
                          <div className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-widest border border-indigo-500/10">
                            {group.stats.monthlyDays} Days Active
                          </div>
                          <div className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/10">
                            {group.logs.length} Today's Activities
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{group.userEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                    <div className="w-32 md:w-56">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Consistency (Days Active)</span>
                        <span className="text-xs font-black text-white">{group.stats.consistency}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${group.stats.consistency}%` }}
                          className="h-full bg-linear-to-r from-indigo-500 to-violet-500"
                        />
                      </div>
                    </div>
                    <div className={`transition-transform duration-300 ${expandedUser === group.userEmail ? 'rotate-180' : ''}`}>
                      <ChevronDown size={20} className="text-slate-500" />
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {expandedUser === group.userEmail && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="max-h-[380px] overflow-y-auto custom-scrollbar bg-white/2 border-t border-white/5 rounded-b-[24px]"
                    >
                      <div className="p-6 md:p-8 pb-12 space-y-6">
                        {group.logs.map((log, lIdx) => (
                          <div key={log._id || lIdx} className="space-y-4">
                            {lIdx > 0 && <div className="h-px w-full bg-white/5" />}
                            <div className="flex flex-col md:flex-row gap-6 min-w-0">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-base font-bold text-indigo-400 mb-2 wrap-break-word flex items-center gap-3">
                                  Activity {lIdx + 1}: {log.title}
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950/50 px-2 py-0.5 rounded-lg border border-white/5">
                                    {format(new Date(log.createdAt || log.date), 'hh:mm a')}
                                  </span>
                                </h4>
                                <p className="text-sm text-slate-300 leading-relaxed font-medium wrap-break-word">{log.description}</p>
                              </div>
                              {(log.challenges || log.challenge) && (
                                <div className="w-full md:w-64 shrink-0 min-w-0">
                                  <div className="bg-amber-500/5 p-5 rounded-3xl border border-amber-500/10 overflow-hidden">
                                    <p className="text-[9px] font-black uppercase text-amber-500 tracking-widest mb-2">Blocker</p>
                                    <p className="text-xs text-slate-400 leading-relaxed font-medium wrap-break-word">{log.challenges || log.challenge}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 flex flex-col items-center justify-center glass border-dashed bg-white/1">
                <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center text-slate-700 mb-6 border border-white/5">
                  <Search size={28} />
                </div>
                <p className="text-slate-500 font-bold tracking-tight">No activity logs found for this date.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

TeamView.propTypes = {
  user: PropTypes.object.isRequired,
  tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const ChevronDown = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6" /></svg>
);

ChevronDown.propTypes = {
  size: PropTypes.number,
  className: PropTypes.string,
};
