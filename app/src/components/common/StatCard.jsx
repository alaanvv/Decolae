const TONES = {
  blue: 'bg-blue-500/10 text-blue-400',
  emerald: 'bg-emerald-500/10 text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-400',
  indigo: 'bg-indigo-500/10 text-indigo-400',
};

export default function StatCard({ label, value, icon, tone }) {
  return (
    <div className="bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl flex items-center justify-center text-xl ${TONES[tone]}`}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <div>
        <p className="text-[10px] sm:text-xs text-slate-400 uppercase font-semibold leading-tight">{label}</p>
        <h3 className="text-xl sm:text-2xl font-bold text-white">{value}</h3>
      </div>
    </div>
  );
}
