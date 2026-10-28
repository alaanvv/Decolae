import Badge from '../common/Badge';

export default function AircraftCard({ aircraft: a, onToggle }) {
  return (
    <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/60 flex flex-col justify-between space-y-4">
      <div>
        <div className="flex justify-between items-start">
          <span className="text-lg font-bold text-white tracking-wider">{a.code}</span>
          <Badge tone={a.status === 'Em Manutenção' ? 'red' : 'green'}>{a.status}</Badge>
        </div>
        <h4 className="text-sm font-semibold text-slate-300 mt-1">{a.model}</h4>
        <p className="text-xs text-slate-400">Fabricante: {a.maker}</p>
      </div>
      <div className="pt-3 border-t border-slate-700/50 flex justify-between items-center text-xs">
        <span className="text-slate-400"><i className="fa-solid fa-users text-decolae-400 mr-1" /> {a.capacity} Assentos</span>
        <button onClick={onToggle} className="text-xs text-decolae-400 hover:underline">Alternar Status</button>
      </div>
    </div>
  );
}
