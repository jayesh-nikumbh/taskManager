import { useState } from 'react';
import PropTypes from 'prop-types';
import { FileSpreadsheet } from 'lucide-react';

export const TaskForm = ({ onSubmit, defaultValues, date }) => {
  const [noChallenges, setNoChallenges] = useState(!defaultValues?.challenges && !defaultValues?.challenge && !!defaultValues);
  const [formData, setFormData] = useState({
    title: defaultValues?.title || '',
    description: defaultValues?.description || '',
    challenges: defaultValues?.challenges || defaultValues?.challenge || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      challenges: noChallenges ? "" : formData.challenges,
      _id: defaultValues?._id,
      completedAt: date.toISOString()
    });
  };

  const inputClasses = "w-full px-5 md:px-6 py-4 md:py-5 bg-slate-950 border border-white/5 rounded-2xl md:rounded-3xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500/50 transition-all text-white placeholder:text-slate-800 font-medium text-sm md:text-base";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
      <div className="space-y-2">
        <label htmlFor="task-title" className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Daily Log Title</label>
        <input
          id="task-title"
          placeholder="e.g., Finalizing Authentication Module"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          className={inputClasses}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-2">
          <label htmlFor="task-desc" className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">The Work Done</label>
          <textarea id="task-desc" rows="4" placeholder="Step-by-step resolution..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className={inputClasses + " resize-none h-32 md:h-auto"} required />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between ml-1">
            <label htmlFor="task-challenges" className="text-[9px] font-black uppercase tracking-widest text-slate-500">Challenges & Blockers</label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={noChallenges} 
                onChange={e => setNoChallenges(e.target.checked)}
                className="w-3 h-3 rounded border-white/10 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 transition-all"
              />
              <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-400 transition-colors uppercase tracking-tighter">No blockers encountered</span>
            </label>
          </div>
          <textarea 
            id="task-challenges"
            rows="4" 
            placeholder={noChallenges ? "No blockers reported for this session." : "Technical difficulties..."}
            value={noChallenges ? "" : formData.challenges} 
            onChange={e => setFormData({ ...formData, challenges: e.target.value })} 
            className={`${inputClasses} resize-none h-32 md:h-auto transition-all ${noChallenges ? 'opacity-30 pointer-events-none border-dashed' : 'border-amber-500/10'}`} 
            required={!noChallenges}
            disabled={noChallenges}
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full h-16 bg-linear-to-r cursor-pointer from-indigo-600 to-violet-600 text-white rounded-3xl font-black text-lg shadow-2xl flex items-center justify-center gap-3 transition-all"
      >
        <FileSpreadsheet size={20} />
        Finalize Daily Sheet
      </button>
    </form>
  );
};

TaskForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  defaultValues: PropTypes.object,
  date: PropTypes.instanceOf(Date).isRequired,
};
