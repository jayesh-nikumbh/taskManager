export const CalendarDays = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    <div className="grid grid-cols-7 bg-white/2 border-b border-white/5 py-4">
      {days.map(d => (
        <div key={d} className="text-center text-[10px] uppercase font-black tracking-widest text-slate-500">{d}</div>
      ))}
    </div>
  );
};
