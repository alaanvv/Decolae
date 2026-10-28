const TONES = {
  blue: 'bg-blue-500/10 text-blue-400',
  emerald: 'bg-emerald-500/10 text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-400',
  indigo: 'bg-indigo-500/10 text-indigo-400',
};

export default function StatCard({ label, value, icon, tone }) {
  return (
    <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/60 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${TONES[tone]}`}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <div>
        <p className="text-xs text-slate-400 uppercase font-semibold">{label}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
    </div>
  );
}
