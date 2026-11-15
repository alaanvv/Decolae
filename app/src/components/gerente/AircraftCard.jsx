export default function AircraftCard({ aircraft: a, onDelete, onEdit }) {
  return (
    <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/60 flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-start justify-between gap-3">
          <span className="text-lg font-bold text-white tracking-wider">{a.code}</span>
          <div className="flex gap-3">
            <button type="button" onClick={onEdit} aria-label={`Editar aeronave ${a.code}`} title="Editar aeronave" className="text-slate-400 hover:text-decolae-400 transition"><i className="fa-solid fa-pen" /></button>
            <button type="button" onClick={onDelete} aria-label={`Excluir aeronave ${a.code}`} title="Excluir aeronave" className="text-slate-400 hover:text-rose-400 transition"><i className="fa-solid fa-trash" /></button>
          </div>
        </div>
        <h4 className="text-sm font-semibold text-slate-300 mt-1">{a.model}</h4>
      </div>
      <div className="pt-3 border-t border-slate-700/50 text-xs text-slate-400 flex justify-between">
        <i className="fa-solid fa-users text-decolae-400 mr-1" /> {a.capacity} Assentos
        <span>{a.status === 'OPERANDO' ? 'Em voo' : 'Disponível'}</span>
      </div>
    </div>
  );
}
