import { useState } from 'react';
import { useData } from '../../context/DataContext';

export default function useCrew() {
  const { data, deleteEntity } = useData();
  const [open, setOpen] = useState(false);
  const remove = (member) => {
    if (window.confirm(`Excluir o tripulante ${member.name}?`))
      return deleteEntity('crew', member.id, 'Tripulante excluído.');
  };
  return { crew: data.crew, open, setOpen, remove };
}
