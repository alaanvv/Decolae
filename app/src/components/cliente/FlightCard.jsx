import { formatDate } from '../../utils/formatDate';
import { statusInfo } from '../../utils/flightStatus';
import useReservations from '../../hooks/useReservations';

export default function FlightCard({ flight: f }) {
  const { book } = useReservations();
  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-lg flex flex-col justify-between space-y-4 hover:border-decolae-500/50 transition">
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-decolae-500/10 text-decolae-400 border border-decolae-500/20">{f.code}</span>
          <span className="text-xs text-slate-400"><i className="fa-solid fa-plane text-slate-500 mr-1" /> {f.aircraft}</span>
        </div>
        <div className="flex items-center justify-between my-2">
          <div>
            <p className="text-base font-bold text-white">{f.origin}</p>
            <p className="text-xs text-slate-400">{formatDate(f.departure)}</p>
          </div>
          <div className="flex flex-col items-center px-4">
            <i className="fa-solid fa-plane text-slate-500 text-sm" />
            <div className="w-16 h-0.5 bg-slate-700 my-1" />
            <span className="text-[10px] text-slate-400">Direto</span>
          </div>
          <div className="text-right">
            <p className="text-base font-bold text-white">{f.destination}</p>
            <p className="text-xs text-slate-400">{formatDate(f.arrival)}</p>
          </div>
        </div>
      </div>
      <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between">
        <span className="text-[10px] uppercase text-slate-400 font-semibold">{statusInfo(f.status).label}</span>
        <button onClick={() => book(f)} className="px-5 py-2.5 bg-decolae-600 hover:bg-decolae-500 text-white font-medium rounded-xl text-xs transition shadow-md shadow-decolae-600/20 flex items-center gap-2">
          <i className="fa-solid fa-chair text-xs" />
          <span>Reservar Assento</span>
        </button>
      </div>
    </div>
  );
}
