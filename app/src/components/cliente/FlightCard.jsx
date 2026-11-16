import { formatDate } from '../../utils/formatDate';
import { statusInfo } from '../../utils/flightStatus';
import useReservations from '../../hooks/useReservations';
import { useState } from 'react';

export default function FlightCard({ flight: f }) {
  const { book, busy } = useReservations();
  const [choosingSeat, setChoosingSeat] = useState(false);
  const [seat, setSeat] = useState('');
  const canBook = f.canBook && f.seatsAvailable.length > 0;
  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col justify-between space-y-4 hover:border-decolae-500/50 transition">
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-decolae-500/10 text-decolae-400 border border-decolae-500/20">{f.code}</span>
          <span className="text-xs text-slate-400"><i className="fa-solid fa-plane text-slate-500 mr-1" /> {f.aircraftModel || f.aircraft}</span>
        </div>
        <div className="flex items-center justify-between gap-2 my-2">
          <div>
            <p className="text-base font-bold text-white">{f.origin}</p>
            <p className="text-xs text-slate-400">{formatDate(f.departure)}</p>
          </div>
          <div className="flex flex-col items-center px-2 sm:px-4 shrink-0">
            <i className="fa-solid fa-plane text-slate-500 text-sm" />
            <div className="w-10 sm:w-16 h-0.5 bg-slate-700 my-1" />
            <span className="text-[10px] text-slate-400">Direto</span>
          </div>
          <div className="text-right">
            <p className="text-base font-bold text-white">{f.destination}</p>
            <p className="text-xs text-slate-400">{formatDate(f.arrival)}</p>
          </div>
        </div>
      </div>
      <div className="pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase text-slate-400 font-semibold">{statusInfo(f.status).label}</span>
          <p className="text-xs text-slate-400">{f.availableSeats} assentos disponíveis · {f.capacity} lugares</p>
        </div>
        {canBook && !choosingSeat && <button onClick={() => setChoosingSeat(true)} className="w-full sm:w-auto justify-center px-5 py-2.5 bg-decolae-600 hover:bg-decolae-500 text-white font-medium rounded-xl text-xs transition shadow-md shadow-decolae-600/20 flex items-center gap-2">
          <i className="fa-solid fa-chair text-xs" /><span>Comprar passagem · R$ {f.price.toFixed(2)}</span>
        </button>}
        {!canBook && <span className="text-xs text-slate-500">Compra indisponível</span>}
      </div>
      {choosingSeat && <form onSubmit={async (event) => {
        event.preventDefault();
        if (await book(f, seat)) setChoosingSeat(false);
      }} className="flex flex-wrap gap-2">
        <select required value={seat} onChange={(event) => setSeat(event.target.value)} className="w-full sm:w-auto sm:flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white">
          <option value="">Escolha um assento</option>
          {f.seatsAvailable.map((number) => <option key={number} value={number}>{number}</option>)}
        </select>
        <button disabled={busy || !seat} className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs">Confirmar</button>
        <button type="button" onClick={() => setChoosingSeat(false)} className="flex-1 sm:flex-none px-3 py-2.5 bg-slate-700 text-white rounded-lg text-xs">Cancelar</button>
      </form>}
    </div>
  );
}
