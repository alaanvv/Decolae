export default function AircraftCard({ aircraft: a }) {
  return (
    <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/60 flex flex-col justify-between space-y-4">
      <div>
        <span className="text-lg font-bold text-white tracking-wider">{a.code}</span>
        <h4 className="text-sm font-semibold text-slate-300 mt-1">{a.model}</h4>
      </div>
      <div className="pt-3 border-t border-slate-700/50 text-xs text-slate-400">
        <i className="fa-solid fa-users text-decolae-400 mr-1" /> {a.capacity} Assentos
      </div>
    </div>
  );
}
