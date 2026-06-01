import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Pencil, Trash2 } from 'lucide-react';

export const DetailPanel = ({ selectedDate, dayLogs, setShowModal, setEditingTask, deleteTask }) => (
  <motion.div
    key={selectedDate.toString()}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass p-1 shadow-2xl relative group overflow-hidden"
  >
    <div className="bg-slate-900 shadow-inner rounded-[22px] p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-white/10 shrink-0">
            <CalendarIcon size={22} />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black text-white leading-none mb-1 md:mb-2">{format(selectedDate, 'MMM do')}</h3>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{format(selectedDate, 'EEEE')}</p>
          </div>
        </div>
        {dayLogs.length > 0 && (
          <button
            onClick={() => { setEditingTask(null); setShowModal(true); }}
            className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 relative group/add"
          >
            <Plus size={20} />
            <span className="absolute -bottom-10 right-0 px-2 py-1 bg-slate-900 text-[9px] font-black text-white rounded-lg border border-white/10 opacity-0 group-hover/add:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">Add new activity</span>
          </button>
        )}
      </div>

      {dayLogs.length > 0 ? (
        <div className="space-y-6 max-h-[580px] overflow-y-auto pr-2 custom-scrollbar">
          {dayLogs.map((log, idx) => (
            <div key={log._id || idx} className="p-6 rounded-3xl bg-white/2 border border-white/5 space-y-4 relative group/item overflow-hidden">
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-[9px] font-black uppercase text-indigo-400 tracking-[0.2em]">Activity {idx + 1}</p>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-950/50 px-2 py-0.5 rounded-lg border border-white/5">
                      {format(new Date(log.createdAt || log.date), 'hh:mm a')}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-white leading-tight tracking-tight wrap-break-word">{log.title}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => { setEditingTask(log); setShowModal(true); }}
                    className="p-2 text-slate-400 hover:text-indigo-400 transition-colors relative group/edit"
                  >
                    <Pencil size={15} />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-[9px] font-black text-white rounded-lg border border-white/10 opacity-0 group-hover/edit:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">Edit activity</span>
                  </button>
                  <button
                    onClick={() => deleteTask(log._id || log.id)}
                    className="p-2 text-rose-500/50 hover:text-rose-500 transition-colors relative group/del"
                  >
                    <Trash2 size={16} />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-rose-900 text-[9px] font-black text-white rounded-lg border border-white/10 opacity-0 group-hover/del:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">Delete activity</span>
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium wrap-break-word">{log.description}</p>
              {(log.challenges || log.challenge) && (
                <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10 overflow-hidden">
                  <p className="text-[8px] font-black uppercase text-amber-500 tracking-[0.2em] mb-1">Blocker</p>
                  <p className="text-10px text-slate-300 leading-relaxed font-medium wrap-break-word">{log.challenges || log.challenge}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 md:py-12">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-800/30 flex items-center justify-center mx-auto mb-6 md:mb-8 text-slate-700 border border-white/5">
            <Plus size={32} />
          </div>
          <p className="text-slate-500 font-medium mb-6 md:mb-8 max-w-[180px] mx-auto text-sm">No activity recorded for this period.</p>
          <button onClick={() => { setEditingTask(null); setShowModal(true); }} className="w-full h-12 md:h-14 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all cursor-pointer">Record Activity</button>
        </div>
      )}
    </div>
  </motion.div>
);

DetailPanel.propTypes = {
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  dayLogs: PropTypes.arrayOf(PropTypes.object).isRequired,
  setShowModal: PropTypes.func.isRequired,
  setEditingTask: PropTypes.func.isRequired,
  deleteTask: PropTypes.func.isRequired,
};
