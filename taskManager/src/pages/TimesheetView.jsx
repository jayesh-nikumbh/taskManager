import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { format, subMonths, addMonths, isSameDay, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, FileSpreadsheet, CheckCircle2, Sparkles, Calendar, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCard } from '../components/common/StatCard';
import { CalendarDays } from '../components/calendar/CalendarDays';
import { CalendarCells } from '../components/calendar/CalendarCells';
import { DetailPanel } from '../components/tasks/DetailPanel';
import { TaskForm } from '../components/tasks/TaskForm';

/**
 * TimesheetView Component
 * The main interactive workspace for individual users to log and view their tasks.
 * Includes a calendar, statistical summaries, and task entry forms.
 */
export const TimesheetView = ({
  tasks, selectedDate, setSelectedDate, showModal, setShowModal, addTask, deleteTask, showToast, user, editingTask, setEditingTask
}) => {
  // Navigation state for the calendar month
  const [currentMonth, setCurrentMonth] = useState(new Date());

  /**
   * Logic for when a date is clicked on the calendar.
   * Implements validation to prevent future logging and outdated retrospective logging.
   */
  const onDateClick = (day) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Restriction 1: No future dates
    if (day > new Date()) {
      showToast('Logging for future dates is restricted.', 'error');
      return;
    }
    
    const checkDay = new Date(day);
    checkDay.setHours(0,0,0,0);
    
    // Restriction 2: Only today or yesterday (Enforces daily discipline)
    if (checkDay < yesterday) {
      showToast('You can only log for today or yesterday.', 'error');
      return;
    }

    setSelectedDate(day);
    setEditingTask(null); // Clear any editing state for a fresh log
    setShowModal(true);
  };

  // Filter tasks belonging only to the current user
  const myTasks = useMemo(() => tasks.filter(t => t.userEmail === user.email), [tasks, user.email]);
  
  // Calculate logs for the selected day and current month for statistics
  const dayLogs = myTasks.filter(t => {
    const logDate = new Date(t.completedAt || t.date || t.createdAt);
    return isSameDay(logDate, selectedDate) && isSameMonth(logDate, currentMonth);
  });
  const monthLogs = myTasks.filter(t => isSameMonth(new Date(t.completedAt || t.date || t.createdAt), currentMonth)).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
      {/* Calendar and Stats Section */}
      <div className="lg:col-span-8 flex flex-col gap-6 md:gap-8">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-2">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">{format(currentMonth, 'MMMM yyyy')}</h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="w-6 h-[2px] bg-indigo-500 rounded-full" />
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.25em]">Personal Workspace</p>
            </div>
          </div>
          {/* Month Navigation Controls */}
          <div className="flex gap-3">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-3 md:p-4 glass hover:bg-white/5 flex items-center justify-center cursor-pointer text-slate-400 hover:text-white transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-3 md:p-4 glass hover:bg-white/5 flex items-center justify-center cursor-pointer text-slate-400 hover:text-white transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </header>

        {/* Main Calendar Grid */}
        <div className="glass overflow-hidden shadow-2xl border-white/5 bg-slate-900/20">
          <CalendarDays />
          <CalendarCells
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            onDateClick={onDateClick}
            tasks={myTasks}
          />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <StatCard icon={<FileSpreadsheet size={24} />} label="This Month" value={monthLogs} />
          <StatCard icon={<CheckCircle2 size={24} />} label="Total entries" value={myTasks.length} color="text-emerald-500" />
          <StatCard icon={<Sparkles size={24} />} label="Consistency" value={`${Math.min(100, Math.round((monthLogs / 20) * 100))}%`} />
        </div>
      </div>

      {/* Side Panel: Task Details for the selected day */}
      <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
        <DetailPanel
          selectedDate={selectedDate}
          dayLogs={dayLogs}
          setShowModal={setShowModal}
          setEditingTask={setEditingTask}
          deleteTask={deleteTask}
        />
      </div>

      {/* Task Entry/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-950/95 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.95, y: 100 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 100 }} 
              className="glass p-6 md:p-10 w-full max-w-2xl relative shadow-2xl bg-slate-900 border-white/10 sm:rounded-[40px] rounded-t-[40px] max-h-[90dvh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-8 md:mb-10 sticky top-0 bg-slate-900/10 backdrop-blur-xl py-2 z-10">
                <div>
                  <h3 className="text-2xl md:text-4xl font-black text-white tracking-tighter">Daily Recap</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar size={14} className="text-indigo-400" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{format(selectedDate, 'EEEE, MMM do')}</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 md:w-12 md:h-12 glass flex items-center justify-center text-slate-500 hover:text-white transition-all rounded-full hover:scale-110 active:scale-95">
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
              <div className="pb-4">
                <TaskForm onSubmit={addTask} defaultValues={editingTask} date={selectedDate} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

TimesheetView.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  setSelectedDate: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
  setShowModal: PropTypes.func.isRequired,
  addTask: PropTypes.func.isRequired,
  deleteTask: PropTypes.func.isRequired,
  showToast: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  editingTask: PropTypes.object,
  setEditingTask: PropTypes.func.isRequired,
};
