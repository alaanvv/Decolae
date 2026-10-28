import SectionHeader from '../common/SectionHeader';
import Table from '../common/Table';
import CrewModal from './CrewModal';
import useCrew from './useCrew';

const HEADERS = ['Nome', 'CPF'];

export default function CrewTab() {
  const { crew, open, setOpen } = useCrew();
  return (
    <>
      <SectionHeader title="Corpo de Tripulantes & Pilotos" buttonLabel="Novo Tripulante" onClick={() => setOpen(true)} />
      <Table headers={HEADERS} isEmpty={!crew.length} empty="Nenhum tripulante cadastrado.">
        {crew.map((c) => (
          <tr key={c.id} className="hover:bg-slate-700/30 transition">
            <td className="p-4 font-semibold text-white">{c.name}</td>
            <td className="p-4 font-mono text-xs text-slate-400">{c.cpf}</td>
          </tr>
        ))}
      </Table>
      {open && <CrewModal onClose={() => setOpen(false)} />}
    </>
  );
}
