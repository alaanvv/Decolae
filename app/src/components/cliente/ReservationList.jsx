import useReservations from '../../hooks/useReservations';

export default function ReservationList() {
  const { reservations, cancel } = useReservations();
  return (
    <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 shadow-xl">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <i className="fa-solid fa-ticket text-emerald-400" /> Minhas Reservas Confirmadas
      </h3>
      <div className="space-y-3">
        {!reservations.length && <p className="text-slate-400 text-xs py-4 text-center">Você ainda não possui bilhetes ou reservas ativas.</p>}
        {reservations.map((r) => (
          <div key={r.id} className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg">
                <i className="fa-solid fa-ticket" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{r.flightCode}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Assento {r.seat}</span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">{r.origin} ➔ {r.destination}</p>
                <p className="text-[10px] text-slate-400">Data: {r.departure}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
              <button onClick={() => cancel(r.id)} className="text-xs text-rose-400 hover:text-rose-300 hover:underline">Cancelar Reserva</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
