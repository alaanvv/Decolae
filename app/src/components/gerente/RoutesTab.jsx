import SectionHeader from '../common/SectionHeader';
import Table, { DeleteButton } from '../common/Table';
import RouteModal from './RouteModal';
import useRoutes from './useRoutes';

const HEADERS = ['Origem', 'Destino', 'Distância (km)', 'Tempo Estimado', 'Ação'];

export default function RoutesTab() {
  const { routes, open, setOpen, removeRoute } = useRoutes();
  return (
    <>
      <SectionHeader title="Rotas & Trajetos Cadastrados" buttonLabel="Novo Trajeto" onClick={() => setOpen(true)} />
      <Table headers={HEADERS}>
        {routes.map((r) => (
          <tr key={r.id} className="hover:bg-slate-700/30 transition">
            <td className="p-4 font-semibold text-white">{r.origin}</td>
            <td className="p-4 font-semibold text-white">{r.destination}</td>
            <td className="p-4">{r.distance} km</td>
            <td className="p-4 text-decolae-400 font-medium">{r.time}</td>
            <td className="p-4 text-center"><DeleteButton onClick={() => removeRoute(r.id)} /></td>
          </tr>
        ))}
      </Table>
      {open && <RouteModal onClose={() => setOpen(false)} />}
    </>
  );
}
