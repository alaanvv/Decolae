import SectionHeader from '../common/SectionHeader';
import Table, { DeleteButton } from '../common/Table';
import Badge from '../common/Badge';
import CrewModal from './CrewModal';
import useCrew from './useCrew';

const HEADERS = ['Nome', 'Cargo / Função', 'Matrícula / Licença ANAC', 'Status Escala', 'Ação'];

export default function CrewTab() {
  const { crew, open, setOpen, removeCrew } = useCrew();
  return (
    <>
      <SectionHeader title="Corpo de Tripulantes & Pilotos" buttonLabel="Novo Tripulante" onClick={() => setOpen(true)} />
      <Table headers={HEADERS}>
        {crew.map((c) => (
          <tr key={c.id} className="hover:bg-slate-700/30 transition">
            <td className="p-4 font-semibold text-white">{c.name}</td>
            <td className="p-4">{c.role}</td>
            <td className="p-4 font-mono text-xs text-slate-400">{c.license}</td>
            <td className="p-4"><Badge>{c.status}</Badge></td>
            <td className="p-4 text-center"><DeleteButton onClick={() => removeCrew(c.id)} /></td>
          </tr>
        ))}
      </Table>
      {open && <CrewModal onClose={() => setOpen(false)} />}
    </>
  );
}
