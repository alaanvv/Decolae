import { useState } from 'react';
import { useData } from '../../context/DataContext';

export default function useAircrafts() {
  const { data, deleteEntity } = useData();
  const [open, setOpen] = useState(false);
  const remove = (aircraft) => {
    if (window.confirm(`Excluir a aeronave ${aircraft.code}?`))
      return deleteEntity('aircrafts', aircraft.id, 'Aeronave excluída.');
  };
  return { aircrafts: data.aircrafts, open, setOpen, remove };
}
