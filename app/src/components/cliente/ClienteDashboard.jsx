import SearchHero from './SearchHero';
import FlightCard from './FlightCard';
import ReservationList from './ReservationList';
import useClienteFilters from './useClienteFilters';

export default function ClienteDashboard() {
  const { filters, setFilter, reset, flights } = useClienteFilters();
  return (
    <div className="space-y-8">
      <SearchHero filters={filters} onChange={setFilter} onReset={reset} />
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <i className="fa-solid fa-plane-departure text-decolae-500" /> Voos Disponíveis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flights.length ? (
            flights.map((f) => <FlightCard key={f.id} flight={f} />)
          ) : (
            <div className="col-span-2 bg-slate-800 p-8 rounded-2xl text-center text-slate-400">Nenhum voo disponível para os critérios informados.</div>
          )}
        </div>
      </div>
      <ReservationList />
    </div>
  );
}
