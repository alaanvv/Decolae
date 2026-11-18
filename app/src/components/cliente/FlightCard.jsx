import { formatDate } from '../../utils/formatDate';
import { statusInfo } from '../../utils/flightStatus';
import useReservations from '../../hooks/useReservations';
import { useMemo, useState } from 'react';

export default function FlightCard({ flight: f }) {
  const { book, busy } = useReservations();
  const [choosingSeat, setChoosingSeat] = useState(false);
  const [seat, setSeat] = useState(null);
  const canBook = f.canBook && f.seatsAvailable.length > 0;

  const availableSet = useMemo(() => new Set(f.seatsAvailable || []), [f.seatsAvailable]);
  const seatNumbers = useMemo(
    () => Array.from({ length: Number(f.capacity) || 0 }, (_, idx) => idx + 1),
    [f.capacity]
  );

  const handleConfirm = async (event) => {
    event.preventDefault();
    if (!seat) return;
    if (await book(f, seat)) {
      setChoosingSeat(false);
      setSeat(null);
    }
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-lg flex flex-col justify-between space-y-4 hover:border-decolae-500/50 transition">
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-decolae-500/10 text-decolae-400 border border-decolae-500/20">{f.code}</span>
          <span className="text-xs text-slate-400"><i className="fa-solid fa-plane text-slate-500 mr-1" /> {f.aircraftModel || f.aircraft}</span>
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

      <div className="pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase text-slate-400 font-semibold">{statusInfo(f.status).label}</span>
          <p className="text-xs text-slate-400">{f.availableSeats} assentos disponíveis · {f.capacity} lugares</p>
        </div>
        {canBook && !choosingSeat && (
          <button
            onClick={() => setChoosingSeat(true)}
            className="px-5 py-2.5 bg-decolae-600 hover:bg-decolae-500 text-white font-medium rounded-xl text-xs transition shadow-md shadow-decolae-600/20 flex items-center gap-2"
          >
            <i className="fa-solid fa-chair text-xs" />
            <span>Comprar passagem · R$ {f.price.toFixed(2)}</span>
          </button>
        )}
        {!canBook && <span className="text-xs text-slate-500">Compra indisponível</span>}
      </div>

      {choosingSeat && (
        <form onSubmit={handleConfirm} className="pt-4 border-t border-slate-700/60 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
            <span className="font-semibold text-white">Selecione seu assento na cabine:</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-slate-900 border border-slate-600 inline-block" /> Livre
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-decolae-500 inline-block" /> Selecionado
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-red-500/20 border border-red-500/40 inline-block" /> Ocupado
              </span>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto p-3 bg-slate-950/70 rounded-xl border border-slate-800">
            <div className="grid grid-cols-6 gap-1.5">
              {seatNumbers.map((num) => {
                const isFree = availableSet.has(num);
                const isSelected = seat === num;
                return (
                  <button
                    key={num}
                    type="button"
                    disabled={!isFree}
                    onClick={() => setSeat(num)}
                    title={isFree ? `Assento ${num} (Disponível)` : `Assento ${num} (Ocupado)`}
                    className={`py-1.5 rounded text-[11px] font-mono transition ${
                      !isFree
                        ? 'bg-red-500/15 border border-red-500/30 text-red-400/60 cursor-not-allowed line-through'
                        : isSelected
                          ? 'bg-decolae-500 text-white font-bold shadow shadow-decolae-500/40'
                          : 'bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-200'
                    }`}
                  >
                    {String(num).padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-300">
              {seat ? (
                <>Assento escolhido: <strong className="text-decolae-400">#{String(seat).padStart(2, '0')}</strong></>
              ) : (
                'Clique em um assento livre acima'
              )}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setChoosingSeat(false);
                  setSeat(null);
                }}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs transition"
              >
                Cancelar
              </button>
              <button
                disabled={busy || !seat}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg text-xs transition"
              >
                {busy ? 'Reservando...' : 'Confirmar Reserva'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
