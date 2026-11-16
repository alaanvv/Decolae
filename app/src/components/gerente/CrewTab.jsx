import SectionHeader from '../common/SectionHeader';
import Table from '../common/Table';
import CrewModal from './CrewModal';
import useCrew from './useCrew';
import { useState } from 'react';

const HEADERS = ['Nome', 'CPF', ''];

export default function CrewTab() {
  const { crew, open, setOpen, remove } = useCrew();
  const [editing, setEditing] = useState(null);
  return (
    <>
      <SectionHeader title="Corpo de Tripulantes & Pilotos" buttonLabel="Novo Tripulante" onClick={() => setOpen(true)} />
      <Table headers={HEADERS} isEmpty={!crew.length} empty="Nenhum tripulante cadastrado.">
        {crew.map((c) => (
          <tr key={c.id} className="hover:bg-slate-700/30 transition">
            <td className="p-4 font-semibold text-white">{c.name}</td>
            <td className="p-4 font-mono text-xs text-slate-400">{c.cpf}</td>
            <td className="p-4 text-right">
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setEditing(c)} aria-label={`Editar tripulante ${c.name}`} title="Editar tripulante" className="w-10 h-10 -m-2 flex items-center justify-center rounded-lg text-slate-400 hover:text-decolae-400 hover:bg-slate-700/40 transition"><i className="fa-solid fa-pen" /></button>
                <button type="button" onClick={() => remove(c)} aria-label={`Excluir tripulante ${c.name}`} title="Excluir tripulante" className="w-10 h-10 -m-2 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/40 transition"><i className="fa-solid fa-trash" /></button>
              </div>
            </td>
          </tr>
        ))}
      </Table>
      {open && <CrewModal onClose={() => setOpen(false)} />}
      {editing && <CrewModal member={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
