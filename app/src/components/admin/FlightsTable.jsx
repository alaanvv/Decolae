import Table from '../common/Table';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/formatDate';
import { statusInfo } from '../../utils/flightStatus';
import useFlightsTable from './useFlightsTable';

const HEADERS = ['Código Voo', 'Trajeto (Origem ➔ Destino)', 'Horário Partida / Chegada', 'Aeronave', 'Status'];

export default function FlightsTable() {
  const { flights, search, setSearch } = useFlightsTable();

  const header = (
    <div className="p-5 border-b border-slate-700/80 flex flex-col sm:flex-row justify-between items-center gap-4">
      <h3 className="text-lg font-bold text-white">Lista Geral de Voos</h3>
      <div className="w-full sm:w-72 relative">
        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por voo, origem ou destino..." className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-decolae-500" />
      </div>
    </div>
  );

  return (
    <Table headers={HEADERS} header={header} isEmpty={!flights.length} empty="Nenhum voo encontrado.">
      {flights.map((f) => {
        const s = statusInfo(f.status);
        return (
          <tr key={f.id} className="hover:bg-slate-700/30 transition">
            <td className="p-4 font-bold text-white">{f.code}</td>
            <td className="p-4">{f.origin} <i className="fa-solid fa-arrow-right text-slate-500 mx-1 text-xs" /> {f.destination}</td>
            <td className="p-4">{formatDate(f.departure)} <br /><span className="text-slate-500 text-[10px]">Até {formatDate(f.arrival)}</span></td>
            <td className="p-4 text-slate-400">{f.aircraft}</td>
            <td className="p-4"><Badge tone={s.tone}>{s.label}</Badge></td>
          </tr>
        );
      })}
    </Table>
  );
}
