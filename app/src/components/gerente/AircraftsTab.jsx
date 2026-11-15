import SectionHeader from '../common/SectionHeader';
import AircraftCard from './AircraftCard';
import AircraftModal from './AircraftModal';
import useAircrafts from './useAircrafts';
import { useState } from 'react';

export default function AircraftsTab() {
  const { aircrafts, open, setOpen, remove } = useAircrafts();
  const [editing, setEditing] = useState(null);
  return (
    <>
      <SectionHeader title="Frota de Aeronaves" buttonLabel="Nova Aeronave" onClick={() => setOpen(true)} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {aircrafts.map((a) => <AircraftCard key={a.id} aircraft={a} onDelete={() => remove(a)} onEdit={() => setEditing(a)} />)}
      </div>
      {open && <AircraftModal onClose={() => setOpen(false)} />}
      {editing && <AircraftModal aircraft={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
