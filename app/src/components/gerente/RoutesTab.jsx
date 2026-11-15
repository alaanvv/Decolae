import SectionHeader from '../common/SectionHeader';
import Table from '../common/Table';
import RouteModal from './RouteModal';
import useRoutes from './useRoutes';
import { useState } from 'react';

const HEADERS = ['Origem', 'Destino', ''];

export default function RoutesTab() {
  const { routes, open, setOpen, remove } = useRoutes();
  const [editing, setEditing] = useState(null);
  return (
    <>
      <SectionHeader title="Rotas & Trajetos Cadastrados" buttonLabel="Novo Trajeto" onClick={() => setOpen(true)} />
      <Table headers={HEADERS} isEmpty={!routes.length} empty="Nenhum trajeto cadastrado.">
        {routes.map((r) => (
          <tr key={r.id} className="hover:bg-slate-700/30 transition">
            <td className="p-4 font-semibold text-white">{r.origin}</td>
            <td className="p-4 font-semibold text-white">{r.destination}</td>
            <td className="p-4 text-right">
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditing(r)} aria-label="Editar trajeto" title="Editar trajeto" className="text-slate-400 hover:text-decolae-400 transition"><i className="fa-solid fa-pen" /></button>
                <button type="button" onClick={() => remove(r)} aria-label={`Excluir trajeto ${r.origin} para ${r.destination}`} title="Excluir trajeto" className="text-slate-400 hover:text-rose-400 transition"><i className="fa-solid fa-trash" /></button>
              </div>
            </td>
          </tr>
        ))}
      </Table>
      {open && <RouteModal onClose={() => setOpen(false)} />}
      {editing && <RouteModal route={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
