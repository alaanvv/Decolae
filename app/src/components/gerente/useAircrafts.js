import { useEffect, useState } from 'react';
import { useData } from '../../context/DataContext';

export default function useAircrafts() {
  const { data, deleteEntity, reload } = useData();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    reload(['aircrafts']);
    const timer = setInterval(() => reload(['aircrafts']), 60_000);
    return () => clearInterval(timer);
  }, [reload]);
  const remove = (aircraft) => {
    if (window.confirm(`Excluir a aeronave ${aircraft.code}?`))
      return deleteEntity('aircrafts', aircraft.id, 'Aeronave excluída.');
  };
  return { aircrafts: data.aircrafts, open, setOpen, remove };
}
