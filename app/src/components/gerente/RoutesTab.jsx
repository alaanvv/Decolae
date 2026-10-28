import SectionHeader from '../common/SectionHeader';
import Table from '../common/Table';
import RouteModal from './RouteModal';
import useRoutes from './useRoutes';

const HEADERS = ['Origem', 'Destino'];

export default function RoutesTab() {
  const { routes, open, setOpen } = useRoutes();
  return (
    <>
      <SectionHeader title="Rotas & Trajetos Cadastrados" buttonLabel="Novo Trajeto" onClick={() => setOpen(true)} />
      <Table headers={HEADERS} isEmpty={!routes.length} empty="Nenhum trajeto cadastrado.">
        {routes.map((r) => (
          <tr key={r.id} className="hover:bg-slate-700/30 transition">
            <td className="p-4 font-semibold text-white">{r.origin}</td>
            <td className="p-4 font-semibold text-white">{r.destination}</td>
          </tr>
        ))}
      </Table>
      {open && <RouteModal onClose={() => setOpen(false)} />}
    </>
  );
}
