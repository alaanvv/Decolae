import SectionHeader from '../common/SectionHeader';
import Table from '../common/Table';
import CrewModal from './CrewModal';
import useCrew from './useCrew';

const HEADERS = ['Nome', 'CPF', ''];

export default function CrewTab() {
  const { crew, open, setOpen, remove } = useCrew();
  return (
    <>
      <SectionHeader title="Corpo de Tripulantes & Pilotos" buttonLabel="Novo Tripulante" onClick={() => setOpen(true)} />
      <Table headers={HEADERS} isEmpty={!crew.length} empty="Nenhum tripulante cadastrado.">
        {crew.map((c) => (
          <tr key={c.id} className="hover:bg-slate-700/30 transition">
            <td className="p-4 font-semibold text-white">{c.name}</td>
            <td className="p-4 font-mono text-xs text-slate-400">{c.cpf}</td>
            <td className="p-4 text-right">
              <button type="button" onClick={() => remove(c)} aria-label={`Excluir tripulante ${c.name}`} title="Excluir tripulante" className="text-slate-400 hover:text-rose-400 transition">
                <i className="fa-solid fa-trash" />
              </button>
            </td>
          </tr>
        ))}
      </Table>
      {open && <CrewModal onClose={() => setOpen(false)} />}
    </>
  );
}
